"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { getScoreSubmissionStatus } from "@/lib/results";

export type ScoreActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const scoreSchema = z
  .object({
    tournamentId: z.string().uuid("대회를 선택해 주세요."),
    playerEmail: z.string().trim().email("회원 이메일을 입력해 주세요."),
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

function scoreDataObject(scoreData: Prisma.JsonValue): Prisma.JsonObject {
  if (scoreData && typeof scoreData === "object" && !Array.isArray(scoreData)) {
    return { ...scoreData } as Prisma.JsonObject;
  }

  return {};
}

function confirmedScoreData(scoreData: Prisma.JsonValue, patch: Prisma.JsonObject = {}): Prisma.JsonObject {
  const base = scoreDataObject(scoreData);

  return {
    ...base,
    ...patch,
    status: "ADMIN_CONFIRMED",
    adminConfirmed: true,
    adminConfirmedAt:
      typeof base.adminConfirmedAt === "string" && base.adminConfirmedAt.trim()
        ? base.adminConfirmedAt
        : new Date().toISOString(),
    rejectionReason: null,
    adminMemo: null
  };
}

function rejectedScoreData(scoreData: Prisma.JsonValue, reason: string): Prisma.JsonObject {
  return {
    ...scoreDataObject(scoreData),
    status: "ADMIN_REJECTED",
    adminConfirmed: false,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
    adminMemo: reason
  };
}

async function revalidateScoreSurfaces(tournamentId: string) {
  revalidatePath("/admin/scores");
  revalidatePath("/admin/tournaments");
  revalidatePath("/results");
  revalidatePath(`/results/${tournamentId}`);
  revalidatePath("/mypage/scores");
}

async function recalculateTournamentRanks(tournamentId: string) {
  const scores = await prisma.score.findMany({
    where: { tournamentId },
    select: {
      id: true,
      playerId: true,
      round: true,
      scoreData: true
    },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }]
  });

  const playerTotals = new Map<string, { total36: number; scoreIds: string[] }>();

  for (const score of scores) {
    if (getScoreSubmissionStatus(score.scoreData) !== "ADMIN_CONFIRMED") {
      continue;
    }

    const data = scoreDataObject(score.scoreData);
    const total = typeof data.total === "number" ? data.total : Number(data.total);

    if (!Number.isFinite(total)) {
      continue;
    }

    const current = playerTotals.get(score.playerId) ?? { total36: 0, scoreIds: [] };
    current.total36 += total;
    current.scoreIds.push(score.id);
    playerTotals.set(score.playerId, current);
  }

  const ranked = [...playerTotals.entries()].sort(([, a], [, b]) => a.total36 - b.total36);
  let lastTotal: number | null = null;
  let lastRank = 0;

  for (const [index, [, entry]] of ranked.entries()) {
    const rank = lastTotal === entry.total36 ? lastRank : index + 1;
    lastTotal = entry.total36;
    lastRank = rank;

    for (const scoreId of entry.scoreIds) {
      const score = scores.find((item) => item.id === scoreId);

      if (!score) {
        continue;
      }

      await prisma.score.update({
        where: { id: scoreId },
        data: {
          rank,
          scoreData: confirmedScoreData(score.scoreData, {
            total36: entry.total36,
            finalRank: rank
          })
        }
      });
    }
  }
}

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
      message: parsed.error.issues[0]?.message ?? "스코어 정보를 확인해 주세요."
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
      message: "선수로 전환할 회원 이메일을 먼저 등록해 주세요."
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
      scoreData: confirmedScoreData({}, {
        front9: parsed.data.front9,
        back9: parsed.data.back9,
        total: parsed.data.total,
        par: 72
      })
    },
    create: {
      tournamentId: tournament.id,
      playerId: player.id,
      round: parsed.data.round,
      rank: parsed.data.rank ?? null,
      scoreData: confirmedScoreData({}, {
        front9: parsed.data.front9,
        back9: parsed.data.back9,
        total: parsed.data.total,
        par: 72
      })
    }
  });

  await recalculateTournamentRanks(tournament.id);
  await revalidateScoreSurfaces(tournament.id);

  return {
    status: "success",
    message: "스코어를 관리자 확정 상태로 저장했습니다."
  };
}

export async function confirmScoreAction(formData: FormData) {
  await requireAdminPermission("scores", "write", "/admin/scores");

  const scoreId = String(formData.get("scoreId") ?? "");
  const score = await prisma.score.findUnique({
    where: { id: scoreId },
    select: {
      id: true,
      tournamentId: true,
      scoreData: true
    }
  });

  if (!score) {
    return;
  }

  await prisma.score.update({
    where: { id: score.id },
    data: {
      scoreData: confirmedScoreData(score.scoreData)
    }
  });

  await recalculateTournamentRanks(score.tournamentId);
  await revalidateScoreSurfaces(score.tournamentId);
}

export async function rejectScoreAction(formData: FormData) {
  await requireAdminPermission("scores", "write", "/admin/scores");

  const scoreId = String(formData.get("scoreId") ?? "");
  const reason = String(formData.get("rejectionReason") ?? "").trim();
  const score = await prisma.score.findUnique({
    where: { id: scoreId },
    select: {
      id: true,
      tournamentId: true,
      scoreData: true
    }
  });

  if (!score) {
    return;
  }

  await prisma.score.update({
    where: { id: score.id },
    data: {
      rank: null,
      scoreData: rejectedScoreData(score.scoreData, reason || "관리자 반려")
    }
  });

  await recalculateTournamentRanks(score.tournamentId);
  await revalidateScoreSurfaces(score.tournamentId);
}
