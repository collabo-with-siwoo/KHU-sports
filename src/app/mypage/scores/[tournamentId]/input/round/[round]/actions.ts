"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { getCurrentMember } from "@/lib/members";
import { prisma } from "@/lib/prisma";
import { getScoreSubmissionStatus, isPlayerEditableScoreStatus, isTournamentScoreInputOpen } from "@/lib/results";

export type PlayerScoreInputState = {
  status: "idle" | "success" | "error";
  message: string;
};

const inputSchema = z
  .object({
    tournamentId: z.string().uuid("대회 정보가 올바르지 않습니다."),
    round: z.coerce.number().int().min(1).max(4),
    front9: z.coerce.number().int().min(0).max(90),
    back9: z.coerce.number().int().min(0).max(90),
    total: z.coerce.number().int().min(0).max(180),
    playerMemo: z.string().trim().max(500, "메모는 500자 이내로 입력해 주세요.").optional(),
    intent: z.enum(["draft", "submit"])
  })
  .refine((value) => value.front9 + value.back9 === value.total, {
    message: "총타수는 front9와 back9의 합계와 같아야 합니다.",
    path: ["total"]
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
    front9: number;
    back9: number;
    total: number;
    playerMemo?: string;
    status: "DRAFT" | "SUBMITTED";
  }
): Prisma.JsonObject {
  return {
    ...scoreDataObject(existing),
    front9: values.front9,
    back9: values.back9,
    total: values.total,
    par: 72,
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
    front9: String(formData.get("front9") ?? "0"),
    back9: String(formData.get("back9") ?? "0"),
    total: String(formData.get("total") ?? "0"),
    playerMemo: String(formData.get("playerMemo") ?? ""),
    intent: String(formData.get("intent") ?? "draft")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "스코어 정보를 확인해 주세요."
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
      rounds: true
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
      message: "제출 완료 또는 관리자 확정된 스코어는 선수 페이지에서 수정할 수 없습니다."
    };
  }

  const nextStatus = parsed.data.intent === "submit" ? "SUBMITTED" : "DRAFT";
  const scoreData = buildPlayerScoreData(existing?.scoreData ?? {}, {
    front9: parsed.data.front9,
    back9: parsed.data.back9,
    total: parsed.data.total,
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
        ? "제출 완료되었습니다. 관리자 확인 대기 중입니다."
        : "임시저장 상태입니다. 제출을 완료해 주세요."
  };
}
