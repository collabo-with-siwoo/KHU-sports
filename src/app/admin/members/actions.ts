"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import {
  convertMemberToPlayer,
  demoteMemberToGeneral,
  finalizeWithdrawnMember,
  recoverPendingWithdrawal,
  setMemberOperationalStatus
} from "@/lib/member-lifecycle";

export type MemberActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const memberTypeSchema = z.object({
  userId: z.string().uuid("회원을 선택해주세요."),
  userType: z.enum(["GENERAL", "PLAYER"]),
  affiliation: z.string().trim().optional()
});

const memberStatusSchema = z.object({
  userId: z.string().uuid("회원을 선택해주세요."),
  status: z.enum(["ACTIVE", "DORMANT", "WITHDRAWN_PENDING"])
});

const memberIdSchema = z.object({
  userId: z.string().uuid("회원을 선택해주세요.")
});

function revalidateMemberPaths(userId: string) {
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${userId}`);
  revalidatePath("/admin/scores");
  revalidatePath("/mypage");
  revalidatePath("/mypage/scores");
  revalidatePath("/mypage/score-results");
}

function actionError(error: unknown, fallback: string): MemberActionState {
  return {
    status: "error",
    message: error instanceof Error ? error.message : fallback
  };
}

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

  try {
    if (parsed.data.userType === "PLAYER") {
      await convertMemberToPlayer(parsed.data.userId, parsed.data.affiliation);
    } else {
      await demoteMemberToGeneral(parsed.data.userId);
    }
  } catch (error) {
    return actionError(error, "회원 유형을 변경하지 못했습니다.");
  }

  revalidateMemberPaths(parsed.data.userId);

  return {
    status: "success",
    message:
      parsed.data.userType === "PLAYER"
        ? "PLAYER 전환과 선수 프로필 저장을 완료했습니다."
        : "GENERAL 회원으로 변경했습니다. 기존 경기 기록은 보존됩니다."
  };
}

export async function requestAdminStatusChangeAction(formData: FormData) {
  await requireAdminPermission("members", "write", "/admin/members");
  const parsed = memberStatusSchema.parse({
    userId: String(formData.get("userId") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE")
  });

  await setMemberOperationalStatus(parsed.userId, parsed.status);
  revalidateMemberPaths(parsed.userId);
}

export async function recoverMemberAction(formData: FormData) {
  await requireAdminPermission("members", "write", "/admin/members");
  const parsed = memberIdSchema.parse({
    userId: String(formData.get("userId") ?? "")
  });

  await recoverPendingWithdrawal(parsed.userId);
  revalidateMemberPaths(parsed.userId);
}

export async function finalizeMemberWithdrawalAction(formData: FormData) {
  await requireAdminPermission("members", "write", "/admin/members");
  const parsed = memberIdSchema.parse({
    userId: String(formData.get("userId") ?? "")
  });

  await finalizeWithdrawnMember(parsed.userId);
  revalidateMemberPaths(parsed.userId);
}
