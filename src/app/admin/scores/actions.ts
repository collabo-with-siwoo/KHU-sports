"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { buildRoundSummary, parseHoleScoresFromFormData } from "@/lib/golf-scoring";
import { prisma } from "@/lib/prisma";
import { getScoreSubmissionStatus } from "@/lib/results";

export type ScoreActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const scoreSchema = z.object({
  tournamentId: z.string().uuid("대회를 선택해주세요."),
  playerEmail: z.string().trim().email("선수 회원 이메일을 입력해주세요."),
  affiliation: z.string().trim().optional(),
  round: z.coerce.number().int().min(1).max(4),
  rank: z.coerce.number().int().min(1).max(999).optional()
});

function scoreDataObject(scoreData: Prisma.JsonValue): Prisma.JsonObject {
  if (scoreData && typeof scoreData === "object" && !Array.isArray(scoreData)) {
    return { ...scoreData } as Prisma.JsonObject;
  }

  return {};
}

function confirmedScoreData(
  scoreData: Prisma.JsonValue,
  patch: Prisma.JsonObject = {},
  now = new Date()
): Prisma.JsonObject {
  const base = scoreDataObject(scoreData);
  const adminConfirmedAt =
    typeof base.adminConfirmedAt === "string" && base.adminConfirmedAt.trim()
      ? base.adminConfirmedAt
      : now.toISOString();

  return {
    ...base,
    ...patch,
    status: "ADMIN_CONFIRMED",
    adminConfirmed: true,
    adminConfirmedAt,
    rejectionReason: null,
    adminMemo: null
  };
}

function rejectedScoreData(scoreData: Prisma.JsonValue, reason: string, now = new Date()): Prisma.JsonObject {
  return {
    ...scoreDataObject(scoreData),
    status: "ADMIN_REJECTED",
    adminConfirmed: false,
    rejectedAt: now.toISOString(),
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
  revalidatePath("/mypage/score-results");
}

async function recalculateTournamentRanks(tournamentId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${tournamentId}))`;

    const scores = await tx.score.findMany({
      where: { tournamentId },
      select: {
        id: true,
        playerId: true,
        round: true,
        rank: true,
        scoreData: true
      },
      orderBy: [{ round: "asc" }, { createdAt: "asc" }]
    });

    const playerTotals = new Map<string, { total36: number; totalToPar: number; scoreIds: string[] }>();

    for (const score of scores) {
      if (getScoreSubmissionStatus(score.scoreData) !== "ADMIN_CONFIRMED") {
        continue;
      }

      const data = scoreDataObject(score.scoreData);
      const total = typeof data.total === "number" ? data.total : Number(data.total);
      const toPar = typeof data.toPar === "number" ? data.toPar : total - Number(data.par ?? 72);

      if (!Number.isFinite(total)) {
        continue;
      }

      const current = playerTotals.get(score.playerId) ?? { total36: 0, totalToPar: 0, scoreIds: [] };
      current.total36 += total;
      current.totalToPar += Number.isFinite(toPar) ? toPar : 0;
      current.scoreIds.push(score.id);
      playerTotals.set(score.playerId, current);
    }

    const ranked = [...playerTotals.entries()].sort(([, a], [, b]) => a.total36 - b.total36);
    const scoreById = new Map(scores.map((score) => [score.id, score]));
    const updates: Promise<unknown>[] = [];
    let lastTotal: number | null = null;
    let lastRank = 0;

    for (const [index, [, entry]] of ranked.entries()) {
      const rank = lastTotal === entry.total36 ? lastRank : index + 1;
      lastTotal = entry.total36;
      lastRank = rank;

      for (const scoreId of entry.scoreIds) {
        const score = scoreById.get(scoreId);

        if (!score) {
          continue;
        }

        const data = scoreDataObject(score.scoreData);

        if (
          score.rank === rank &&
          data.total36 === entry.total36 &&
          data.totalToPar === entry.totalToPar &&
          data.finalRank === rank
        ) {
          continue;
        }

        updates.push(
          tx.score.update({
            where: { id: scoreId },
            data: {
              rank,
              scoreData: confirmedScoreData(score.scoreData, {
                total36: entry.total36,
                totalToPar: entry.totalToPar,
                finalRank: rank
              })
            }
          })
        );
      }
    }

    if (updates.length) {
      await Promise.all(updates);
    }
  });
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
    rank: String(formData.get("rank") || "0") === "0" ? undefined : String(formData.get("rank"))
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "스코어 정보를 확인해주세요."
    };
  }

  const holeScores = parseHoleScoresFromFormData(formData);

  if (!holeScores) {
    return {
      status: "error",
      message: "1번부터 18번 홀까지 타수를 모두 입력해주세요."
    };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: parsed.data.tournamentId },
    select: { id: true, sportId: true, courseData: true }
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

  const summary = buildRoundSummary(holeScores, tournament.courseData);
  const scorePatch = {
    holePars: summary.holeScores.map((hole) => hole.par),
    holeScores: summary.holeScores,
    front9: summary.front9,
    back9: summary.back9,
    total: summary.total,
    frontPar: summary.frontPar,
    backPar: summary.backPar,
    par: summary.par,
    toPar: summary.toPar
  };
  const now = new Date();

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
      scoreData: confirmedScoreData({}, scorePatch, now),
      status: "ADMIN_CONFIRMED",
      playerMemo: null,
      adminMemo: null,
      rejectionReason: null,
      submittedAt: null,
      adminConfirmedAt: now,
      rejectedAt: null
    },
    create: {
      tournamentId: tournament.id,
      playerId: player.id,
      round: parsed.data.round,
      rank: parsed.data.rank ?? null,
      scoreData: confirmedScoreData({}, scorePatch, now),
      status: "ADMIN_CONFIRMED",
      playerMemo: null,
      adminMemo: null,
      rejectionReason: null,
      submittedAt: null,
      adminConfirmedAt: now,
      rejectedAt: null
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

  const now = new Date();

  await prisma.score.update({
    where: { id: score.id },
    data: {
      scoreData: confirmedScoreData(score.scoreData, {}, now),
      status: "ADMIN_CONFIRMED",
      adminConfirmedAt: now,
      rejectedAt: null,
      rejectionReason: null,
      adminMemo: null
    }
  });

  await recalculateTournamentRanks(score.tournamentId);
  await revalidateScoreSurfaces(score.tournamentId);
}

export async function rejectScoreAction(formData: FormData) {
  await requireAdminPermission("scores", "write", "/admin/scores");

  const scoreId = String(formData.get("scoreId") ?? "");
  const reason = String(formData.get("rejectionReason") ?? "").trim();
  const rejectionReason = reason || "관리자 반려";
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

  const now = new Date();

  await prisma.score.update({
    where: { id: score.id },
    data: {
      rank: null,
      status: "ADMIN_REJECTED",
      adminMemo: rejectionReason,
      rejectionReason,
      rejectedAt: now,
      adminConfirmedAt: null,
      scoreData: rejectedScoreData(score.scoreData, rejectionReason, now)
    }
  });

  await recalculateTournamentRanks(score.tournamentId);
  await revalidateScoreSurfaces(score.tournamentId);
}
