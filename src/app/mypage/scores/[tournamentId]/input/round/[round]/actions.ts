"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { buildRoundSummary, parseHoleScoresFromFormData } from "@/lib/golf-scoring";
import { getCurrentMember } from "@/lib/members";
import { prisma } from "@/lib/prisma";
import { getScoreSubmissionStatus, isPlayerEditableScoreStatus, isTournamentScoreInputOpen } from "@/lib/results";

export type PlayerScoreInputState = {
  status: "idle" | "success" | "error";
  message: string;
};

const inputSchema = z.object({
  tournamentId: z.string().uuid("대회 정보가 올바르지 않습니다."),
  round: z.coerce.number().int().min(1).max(4),
  playerMemo: z.string().trim().max(500, "메모는 500자 이내로 입력해주세요.").optional(),
  intent: z.enum(["draft", "submit"])
});

function scoreDataObject(scoreData: Prisma.JsonValue): Prisma.JsonObject {
  if (scoreData && typeof scoreData === "object" && !Array.isArray(scoreData)) {
    return { ...scoreData } as Prisma.JsonObject;
  }

  return {};
}

function buildPlayerScoreData(
  existing: Prisma.JsonValue,
  values: {
    holeScores: number[];
    holePars: unknown;
    playerMemo?: string;
    status: "DRAFT" | "SUBMITTED";
  }
): Prisma.JsonObject {
  const summary = buildRoundSummary(values.holeScores, values.holePars);

  return {
    ...scoreDataObject(existing),
    holePars: summary.holeScores.map((hole) => hole.par),
    holeScores: summary.holeScores,
    front9: summary.front9,
    back9: summary.back9,
    total: summary.total,
    frontPar: summary.frontPar,
    backPar: summary.backPar,
    par: summary.par,
    toPar: summary.toPar,
    playerMemo: values.playerMemo?.trim() || null,
    status: values.status,
    adminConfirmed: false,
    submittedAt: values.status === "SUBMITTED" ? new Date().toISOString() : null,
    rejectionReason: null,
    adminMemo: null
  };
}

async function revalidatePlayerScoreSurfaces(tournamentId: string) {
  revalidatePath("/mypage/scores");
  revalidatePath("/mypage/score-results");
  revalidatePath(`/mypage/scores/${tournamentId}`);
  revalidatePath(`/results/${tournamentId}`);
  revalidatePath("/admin/scores");
}

export async function savePlayerScoreAction(
  _previousState: PlayerScoreInputState,
  formData: FormData
): Promise<PlayerScoreInputState> {
  const member = await getCurrentMember();

  if (!member) {
    return {
      status: "error",
      message: "로그인이 필요합니다."
    };
  }

  if (member.userType !== "PLAYER") {
    return {
      status: "error",
      message: "선수 등록이 필요합니다."
    };
  }

  const parsed = inputSchema.safeParse({
    tournamentId: String(formData.get("tournamentId") ?? ""),
    round: String(formData.get("round") ?? "1"),
    playerMemo: String(formData.get("playerMemo") ?? ""),
    intent: String(formData.get("intent") ?? "draft")
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

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: parsed.data.tournamentId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      id: true,
      sportId: true,
      startDate: true,
      endDate: true,
      rounds: true,
      courseData: true
    }
  });

  if (!tournament) {
    return {
      status: "error",
      message: "대회를 찾을 수 없습니다."
    };
  }

  if (parsed.data.round > Math.max(tournament.rounds, 1)) {
    return {
      status: "error",
      message: "입력할 수 없는 라운드입니다."
    };
  }

  if (!isTournamentScoreInputOpen(tournament.startDate, tournament.endDate)) {
    return {
      status: "error",
      message: "현재는 이 대회의 스코어 입력 기간이 아닙니다."
    };
  }

  const player = await prisma.player.findFirst({
    where: {
      sportId: tournament.sportId,
      userId: member.id
    },
    select: { id: true }
  });

  if (!player) {
    return {
      status: "error",
      message: "선수 등록이 필요합니다."
    };
  }

  const existing = await prisma.score.findUnique({
    where: {
      tournamentId_playerId_round: {
        tournamentId: tournament.id,
        playerId: player.id,
        round: parsed.data.round
      }
    },
    select: {
      id: true,
      scoreData: true
    }
  });

  if (existing && !isPlayerEditableScoreStatus(getScoreSubmissionStatus(existing.scoreData))) {
    return {
      status: "error",
      message: "제출 완료 또는 관리자 확정 스코어는 선수 페이지에서 수정할 수 없습니다."
    };
  }

  const nextStatus = parsed.data.intent === "submit" ? "SUBMITTED" : "DRAFT";
  const scoreData = buildPlayerScoreData(existing?.scoreData ?? {}, {
    holeScores,
    holePars: tournament.courseData,
    playerMemo: parsed.data.playerMemo,
    status: nextStatus
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
      rank: null,
      scoreData
    },
    create: {
      tournamentId: tournament.id,
      playerId: player.id,
      round: parsed.data.round,
      rank: null,
      scoreData
    }
  });

  await revalidatePlayerScoreSurfaces(tournament.id);

  return {
    status: "success",
    message:
      nextStatus === "SUBMITTED"
        ? "제출 완료했습니다. 관리자 확인 대기 중입니다."
        : "임시저장했습니다. 제출 완료까지 진행해주세요."
  };
}
