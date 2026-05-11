"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export type ScoreActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const scoreSchema = z
  .object({
    tournamentId: z.string().uuid("대회를 선택해주세요."),
    playerEmail: z.string().trim().email("회원 이메일을 입력해주세요."),
    affiliation: z.string().trim().optional(),
    round: z.coerce.number().int().min(1).max(4),
    front9: z.coerce.number().int().min(0).max(90),
    back9: z.coerce.number().int().min(0).max(90),
    total: z.coerce.number().int().min(0).max(180),
    rank: z.coerce.number().int().min(1).max(999).optional()
  })
  .refine((value) => value.front9 + value.back9 === value.total, {
    message: "총타수는 전반 9홀과 후반 9홀 합계와 같아야 합니다.",
    path: ["total"]
  });

export async function createScoreAction(
  _previousState: ScoreActionState,
  formData: FormData
): Promise<ScoreActionState> {
  await requireAdminPermission("scores", "write", "/admin/scores");

  const parsed = scoreSchema.safeParse({
    tournamentId: String(formData.get("tournamentId") ?? ""),
    playerEmail: String(formData.get("playerEmail") ?? ""),
    affiliation: String(formData.get("affiliation") ?? ""),
    round: String(formData.get("round") ?? "1"),
    front9: String(formData.get("front9") ?? "0"),
    back9: String(formData.get("back9") ?? "0"),
    total: String(formData.get("total") ?? "0"),
    rank: String(formData.get("rank") || "0") === "0" ? undefined : String(formData.get("rank"))
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "스코어 정보를 확인해주세요."
    };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: parsed.data.tournamentId },
    select: { id: true, sportId: true }
  });

  if (!tournament) {
    return {
      status: "error",
      message: "등록된 대회를 찾을 수 없습니다."
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.playerEmail.toLowerCase() },
    select: { id: true, name: true, birthDate: true }
  });

  if (!user) {
    return {
      status: "error",
      message: "선수로 전환할 회원 이메일을 먼저 등록해주세요."
    };
  }

  const birthYear = user.birthDate.getUTCFullYear();
  const player = await prisma.player.upsert({
    where: {
      sportId_userId: {
        sportId: tournament.sportId,
        userId: user.id
      }
    },
    update: {
      name: user.name,
      birthYear,
      affiliation: parsed.data.affiliation || null
    },
    create: {
      sportId: tournament.sportId,
      userId: user.id,
      name: user.name,
      birthYear,
      affiliation: parsed.data.affiliation || null
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { userType: "PLAYER" }
  });

  await prisma.score.upsert({
    where: {
      tournamentId_playerId_round: {
        tournamentId: tournament.id,
        playerId: player.id,
        round: parsed.data.round
      }
    },
    update: {
      rank: parsed.data.rank ?? null,
      scoreData: {
        front9: parsed.data.front9,
        back9: parsed.data.back9,
        total: parsed.data.total,
        par: 72
      }
    },
    create: {
      tournamentId: tournament.id,
      playerId: player.id,
      round: parsed.data.round,
      rank: parsed.data.rank ?? null,
      scoreData: {
        front9: parsed.data.front9,
        back9: parsed.data.back9,
        total: parsed.data.total,
        par: 72
      }
    }
  });

  revalidatePath("/admin/scores");
  revalidatePath("/admin/tournaments");
  revalidatePath("/results");

  return {
    status: "success",
    message: "스코어를 저장했습니다."
  };
}

