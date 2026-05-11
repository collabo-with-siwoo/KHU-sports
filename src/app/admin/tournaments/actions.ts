"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { buildCourseData, parseHoleParsFromFormData } from "@/lib/golf-scoring";
import { prisma } from "@/lib/prisma";

export type TournamentActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const tournamentSchema = z
  .object({
    name: z.string().trim().min(2, "대회명을 입력해주세요."),
    startDate: z.string().min(1, "시작일을 입력해주세요."),
    endDate: z.string().min(1, "종료일을 입력해주세요."),
    venue: z.string().trim().optional(),
    rounds: z.coerce.number().int().min(1).max(4)
  })
  .refine((value) => new Date(value.startDate) <= new Date(value.endDate), {
    message: "종료일은 시작일 이후여야 합니다.",
    path: ["endDate"]
  });

export async function createTournamentAction(
  _previousState: TournamentActionState,
  formData: FormData
): Promise<TournamentActionState> {
  await requireAdminPermission("tournaments", "write", "/admin/tournaments");

  const parsed = tournamentSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    venue: String(formData.get("venue") ?? ""),
    rounds: String(formData.get("rounds") ?? "1")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "대회 정보를 확인해주세요."
    };
  }

  const sport = await prisma.sport.upsert({
    where: { code: "GOLF" },
    update: { active: true },
    create: { code: "GOLF", name: "골프", active: true }
  });

  await prisma.tournament.create({
    data: {
      sportId: sport.id,
      name: parsed.data.name,
      startDate: new Date(`${parsed.data.startDate}T00:00:00.000Z`),
      endDate: new Date(`${parsed.data.endDate}T00:00:00.000Z`),
      venue: parsed.data.venue || null,
      rounds: parsed.data.rounds,
      courseData: buildCourseData(parseHoleParsFromFormData(formData))
    }
  });

  revalidatePath("/admin/tournaments");
  revalidatePath("/results");

  return {
    status: "success",
    message: "대회를 등록했습니다."
  };
}

export async function updateTournamentCourseAction(formData: FormData) {
  await requireAdminPermission("tournaments", "write", "/admin/tournaments");

  const parsed = z.string().uuid().safeParse(String(formData.get("tournamentId") ?? ""));

  if (!parsed.success) {
    return;
  }

  await prisma.tournament.update({
    where: { id: parsed.data },
    data: {
      courseData: buildCourseData(parseHoleParsFromFormData(formData))
    }
  });

  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/scores");
  revalidatePath("/results");
  revalidatePath(`/results/${parsed.data}`);
  revalidatePath("/mypage/scores");
  revalidatePath("/mypage/score-results");
}
