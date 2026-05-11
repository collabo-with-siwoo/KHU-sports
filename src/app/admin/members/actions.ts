"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export type MemberActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const memberTypeSchema = z.object({
  userId: z.string().uuid("회원을 선택해주세요."),
  userType: z.enum(["GENERAL", "PLAYER"]),
  affiliation: z.string().trim().optional()
});

export async function updateMemberTypeAction(
  _previousState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  await requireAdminPermission("members", "write", "/admin/members");
  const parsed = memberTypeSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    userType: String(formData.get("userType") ?? "GENERAL"),
    affiliation: String(formData.get("affiliation") ?? "")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "회원 정보를 확인해주세요."
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, name: true, birthDate: true }
  });

  if (!user) {
    return {
      status: "error",
      message: "회원을 찾을 수 없습니다."
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { userType: parsed.data.userType }
  });

  if (parsed.data.userType === "PLAYER") {
    const sport = await prisma.sport.upsert({
      where: { code: "GOLF" },
      update: { active: true },
      create: { code: "GOLF", name: "골프", active: true }
    });

    await prisma.player.upsert({
      where: {
        sportId_userId: {
          sportId: sport.id,
          userId: user.id
        }
      },
      update: {
        name: user.name,
        birthYear: user.birthDate.getUTCFullYear(),
        affiliation: parsed.data.affiliation || null,
        anonymized: false
      },
      create: {
        sportId: sport.id,
        userId: user.id,
        name: user.name,
        birthYear: user.birthDate.getUTCFullYear(),
        affiliation: parsed.data.affiliation || null
      }
    });
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin/scores");
  revalidatePath("/mypage");

  return {
    status: "success",
    message:
      parsed.data.userType === "PLAYER"
        ? "PLAYER 전환 및 선수 프로필 저장을 완료했습니다."
        : "GENERAL 회원으로 변경했습니다. 기존 경기 기록은 보존됩니다."
  };
}
