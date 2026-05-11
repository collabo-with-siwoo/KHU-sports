import type { Prisma } from "@prisma/client";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getScoreStatusLabel, getScoreSubmissionStatus, type MyScoreStatus } from "@/lib/results";

export const scoreExportTypes = ["leaderboard", "admin-scores", "scorecards", "private"] as const;

export type ScoreExportType = (typeof scoreExportTypes)[number];

type ExportCell = string | number | null;
type ExportRow = Record<string, ExportCell>;

type RoundSummary = {
  round: number;
  front9: number | null;
  back9: number | null;
  total: number | null;
  status: MyScoreStatus;
  rank: number | null;
  groupNo: string | null;
  teeTime: string | null;
  finalRoundEligible: boolean | null;
  submittedAt: string | null;
  adminConfirmedAt: string | null;
  adminMemo: string | null;
  playerMemo: string | null;
};

type PlayerSummary = {
  playerId: string;
  playerName: string;
  school: string | null;
  category: string | null;
  gender: "MALE" | "FEMALE" | null;
  rank: number | null;
  rounds: Map<number, RoundSummary>;
};

type PrivatePlayerSummary = PlayerSummary & {
  phone: string | null;
  email: string | null;
  birthDate: Date | null;
};

type WorkbookExport = {
  body: Uint8Array;
  filename: string;
  rowCount: number;
};

export function isScoreExportType(value: string): value is ScoreExportType {
  return scoreExportTypes.includes(value as ScoreExportType);
}

function scoreObject(scoreData: Prisma.JsonValue): Record<string, unknown> {
  if (!scoreData || typeof scoreData !== "object" || Array.isArray(scoreData)) {
    return {};
  }

  return scoreData as Record<string, unknown>;
}

function numberFromScoreData(scoreData: Prisma.JsonValue, key: string) {
  const value = scoreObject(scoreData)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringFromScoreData(scoreData: Prisma.JsonValue, key: string) {
  const value = scoreObject(scoreData)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function booleanFromScoreData(scoreData: Prisma.JsonValue, key: string) {
  const value = scoreObject(scoreData)[key];
  return typeof value === "boolean" ? value : null;
}

function roundTotal(scoreData: Prisma.JsonValue) {
  return (
    numberFromScoreData(scoreData, "total") ??
    numberFromScoreData(scoreData, "roundTotal") ??
    nullableSum(numberFromScoreData(scoreData, "front9"), numberFromScoreData(scoreData, "back9"))
  );
}

function nullableSum(a: number | null, b: number | null) {
  return typeof a === "number" || typeof b === "number" ? (a ?? 0) + (b ?? 0) : null;
}

function categoryFromScoreData(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "category") ?? "일반부";
}

function groupNoFromScoreData(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "groupNo") ?? stringFromScoreData(scoreData, "group");
}

function teeTimeFromScoreData(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "teeTime") ?? stringFromScoreData(scoreData, "startTime");
}

function adminMemoFromScoreData(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "adminMemo") ?? stringFromScoreData(scoreData, "rejectionReason");
}

function playerMemoFromScoreData(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "playerMemo");
}

function submittedAtFromScoreData(scoreData: Prisma.JsonValue, fallback: Date, status: MyScoreStatus) {
  return stringFromScoreData(scoreData, "submittedAt") ?? (status === "DRAFT" || status === "NOT_STARTED" ? null : fallback.toISOString());
}

function adminConfirmedAtFromScoreData(scoreData: Prisma.JsonValue, fallback: Date, status: MyScoreStatus) {
  return stringFromScoreData(scoreData, "adminConfirmedAt") ?? (status === "ADMIN_CONFIRMED" ? fallback.toISOString() : null);
}

function formatGender(gender: "MALE" | "FEMALE" | null) {
  if (gender === "MALE") {
    return "남";
  }

  if (gender === "FEMALE") {
    return "여";
  }

  return "";
}

function formatBoolean(value: boolean | null) {
  if (value === true) {
    return "Y";
  }

  if (value === false) {
    return "N";
  }

  return "";
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().replace("T", " ").slice(0, 16);
}

function total36ForPlayer(player: PlayerSummary) {
  return nullableSum(player.rounds.get(1)?.total ?? null, player.rounds.get(2)?.total ?? null);
}

function finalRoundEligibleForPlayer(player: PlayerSummary) {
  const explicit = [...player.rounds.values()]
    .map((round) => round.finalRoundEligible)
    .find((value) => value !== null);

  return explicit ?? typeof player.rounds.get(2)?.total === "number";
}

function finalRankForPlayer(player: PlayerSummary) {
  return player.rank;
}

function getPrimaryRound(player: PlayerSummary) {
  return player.rounds.get(1) ?? [...player.rounds.values()][0] ?? null;
}

function normalizeRank(player: PlayerSummary, roundRank: number | null, scoreData: Prisma.JsonValue) {
  return numberFromScoreData(scoreData, "finalRank") ?? numberFromScoreData(scoreData, "round1Rank") ?? roundRank ?? player.rank;
}

function createRoundSummary(score: {
  round: number;
  rank: number | null;
  scoreData: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): RoundSummary {
  const status = getScoreSubmissionStatus(score.scoreData);

  return {
    round: score.round,
    front9: numberFromScoreData(score.scoreData, "front9"),
    back9: numberFromScoreData(score.scoreData, "back9"),
    total: roundTotal(score.scoreData),
    status,
    rank: score.rank,
    groupNo: groupNoFromScoreData(score.scoreData),
    teeTime: teeTimeFromScoreData(score.scoreData),
    finalRoundEligible: booleanFromScoreData(score.scoreData, "finalRoundEligible"),
    submittedAt: submittedAtFromScoreData(score.scoreData, score.createdAt, status),
    adminConfirmedAt: adminConfirmedAtFromScoreData(score.scoreData, score.updatedAt, status),
    adminMemo: adminMemoFromScoreData(score.scoreData),
    playerMemo: playerMemoFromScoreData(score.scoreData)
  };
}

function appendRound(player: PlayerSummary, score: {
  round: number;
  rank: number | null;
  scoreData: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}) {
  const round = createRoundSummary(score);

  player.rounds.set(score.round, round);
  player.category = player.category ?? categoryFromScoreData(score.scoreData);
  player.rank = normalizeRank(player, score.rank, score.scoreData);
}

function sortPlayers<T extends PlayerSummary>(players: T[]): T[] {
  return players.sort((a, b) => {
    const rankA = finalRankForPlayer(a) ?? Number.MAX_SAFE_INTEGER;
    const rankB = finalRankForPlayer(b) ?? Number.MAX_SAFE_INTEGER;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return a.playerName.localeCompare(b.playerName, "ko");
  });
}

async function createWorkbook(rows: ExportRow[], sheetName: string, headers: string[]): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KHU Sports";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.max(header.length + 6, 14)
  }));
  worksheet.addRows(rows);
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle" };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

async function getTournamentPublicScoreGroups(tournamentId: string, confirmedOnly: boolean): Promise<PlayerSummary[] | null> {
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      scores: {
        select: {
          playerId: true,
          round: true,
          rank: true,
          scoreData: true,
          createdAt: true,
          updatedAt: true,
          player: {
            select: {
              id: true,
              name: true,
              affiliation: true,
              user: {
                select: { gender: true }
              }
            }
          }
        },
        orderBy: [{ player: { name: "asc" } }, { round: "asc" }]
      }
    }
  });

  if (!tournament) {
    return null;
  }

  const players = new Map<string, PlayerSummary>();

  for (const score of tournament.scores) {
    if (confirmedOnly && getScoreSubmissionStatus(score.scoreData) !== "ADMIN_CONFIRMED") {
      continue;
    }

    const player = players.get(score.playerId) ?? {
      playerId: score.playerId,
      playerName: score.player.name,
      school: score.player.affiliation,
      category: null,
      gender: score.player.user?.gender ?? null,
      rank: null,
      rounds: new Map<number, RoundSummary>()
    };

    appendRound(player, score);
    players.set(score.playerId, player);
  }

  return sortPlayers([...players.values()]);
}

async function getTournamentPrivateScoreGroups(tournamentId: string): Promise<PrivatePlayerSummary[] | null> {
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      scores: {
        select: {
          playerId: true,
          round: true,
          rank: true,
          scoreData: true,
          createdAt: true,
          updatedAt: true,
          player: {
            select: {
              id: true,
              name: true,
              affiliation: true,
              user: {
                select: {
                  email: true,
                  phone: true,
                  birthDate: true,
                  gender: true
                }
              }
            }
          }
        },
        orderBy: [{ player: { name: "asc" } }, { round: "asc" }]
      }
    }
  });

  if (!tournament) {
    return null;
  }

  const players = new Map<string, PrivatePlayerSummary>();

  for (const score of tournament.scores) {
    const player = players.get(score.playerId) ?? {
      playerId: score.playerId,
      playerName: score.player.name,
      school: score.player.affiliation,
      category: null,
      gender: score.player.user?.gender ?? null,
      phone: score.player.user?.phone ?? null,
      email: score.player.user?.email ?? null,
      birthDate: score.player.user?.birthDate ?? null,
      rank: null,
      rounds: new Map<number, RoundSummary>()
    };

    appendRound(player, score);
    players.set(score.playerId, player);
  }

  return sortPlayers([...players.values()]);
}

function leaderboardRows(players: PlayerSummary[]) {
  return players.map((player) => {
    const round1 = player.rounds.get(1) ?? null;
    const round2 = player.rounds.get(2) ?? null;
    const primaryRound = getPrimaryRound(player);

    return {
      순위: finalRankForPlayer(player),
      선수명: player.playerName,
      학교: player.school ?? "",
      참가구분: player.category ?? "",
      성별: formatGender(player.gender),
      "1R": round1?.total ?? null,
      "2R": round2?.total ?? null,
      "36홀 합계": total36ForPlayer(player),
      최종순위: finalRankForPlayer(player),
      "최종일 진출 여부": formatBoolean(finalRoundEligibleForPlayer(player)),
      조: primaryRound?.groupNo ?? "",
      출발시간: primaryRound?.teeTime ?? ""
    };
  });
}

function adminScoreRows(players: PlayerSummary[]) {
  return players.map((player, index) => {
    const round1 = player.rounds.get(1) ?? null;
    const round2 = player.rounds.get(2) ?? null;
    const rounds = [...player.rounds.values()];
    const submittedAt = rounds.map((round) => round.submittedAt).find(Boolean) ?? null;
    const confirmedAt = rounds.map((round) => round.adminConfirmedAt).find(Boolean) ?? null;
    const rejected = rounds.some((round) => round.status === "ADMIN_REJECTED");
    const adminMemo = rounds.map((round) => round.adminMemo).find(Boolean) ?? "";
    const playerMemo = rounds.map((round) => round.playerMemo).find(Boolean) ?? "";

    return {
      번호: index + 1,
      선수명: player.playerName,
      학교: player.school ?? "",
      참가구분: player.category ?? "",
      성별: formatGender(player.gender),
      "1R": round1?.total ?? null,
      "1R 상태": round1 ? getScoreStatusLabel(round1.status) : "",
      "2R": round2?.total ?? null,
      "2R 상태": round2 ? getScoreStatusLabel(round2.status) : "",
      "36홀 합계": total36ForPlayer(player),
      최종순위: finalRankForPlayer(player),
      "선수 제출일": formatDateTime(submittedAt),
      "관리자 확정일": formatDateTime(confirmedAt),
      "반려 여부": rejected ? "Y" : "N",
      "관리자 메모": adminMemo,
      "선수 메모": playerMemo
    };
  });
}

function scorecardRows(players: PlayerSummary[]) {
  return players.flatMap((player) =>
    [...player.rounds.values()].map((round) => ({
      선수명: player.playerName,
      학교: player.school ?? "",
      참가구분: player.category ?? "",
      성별: formatGender(player.gender),
      라운드: round.round,
      front9: round.front9,
      back9: round.back9,
      roundTotal: round.total,
      조: round.groupNo ?? "",
      출발시간: round.teeTime ?? ""
    }))
  );
}

function privateRows(players: PrivatePlayerSummary[]) {
  return players.map((player, index) => {
    const round1 = player.rounds.get(1) ?? null;
    const round2 = player.rounds.get(2) ?? null;
    const statuses = [...player.rounds.values()].map((round) => getScoreStatusLabel(round.status)).join(", ");
    const adminMemo = [...player.rounds.values()].map((round) => round.adminMemo).find(Boolean) ?? "";
    const playerMemo = [...player.rounds.values()].map((round) => round.playerMemo).find(Boolean) ?? "";

    return {
      번호: index + 1,
      선수명: player.playerName,
      학교: player.school ?? "",
      참가구분: player.category ?? "",
      성별: formatGender(player.gender),
      전화번호: player.phone ?? "",
      이메일: player.email ?? "",
      생년월일: formatDate(player.birthDate),
      "보호자 연락처": "",
      "1R": round1?.total ?? null,
      "2R": round2?.total ?? null,
      "36홀 합계": total36ForPlayer(player),
      최종순위: finalRankForPlayer(player),
      상태: statuses,
      "관리자 메모": adminMemo,
      "선수 메모": playerMemo
    };
  });
}

export async function buildTournamentScoreExport(
  tournamentId: string,
  exportType: ScoreExportType
): Promise<WorkbookExport | null> {
  if (exportType === "leaderboard") {
    const players = await getTournamentPublicScoreGroups(tournamentId, true);

    if (!players) {
      return null;
    }

    const rows = leaderboardRows(players);
    const headers = [
      "순위",
      "선수명",
      "학교",
      "참가구분",
      "성별",
      "1R",
      "2R",
      "36홀 합계",
      "최종순위",
      "최종일 진출 여부",
      "조",
      "출발시간"
    ];

    return {
      body: await createWorkbook(rows, "Full Leaderboard", headers),
      filename: `leaderboard-${tournamentId}.xlsx`,
      rowCount: rows.length
    };
  }

  if (exportType === "admin-scores") {
    const players = await getTournamentPublicScoreGroups(tournamentId, false);

    if (!players) {
      return null;
    }

    const rows = adminScoreRows(players);
    const headers = [
      "번호",
      "선수명",
      "학교",
      "참가구분",
      "성별",
      "1R",
      "1R 상태",
      "2R",
      "2R 상태",
      "36홀 합계",
      "최종순위",
      "선수 제출일",
      "관리자 확정일",
      "반려 여부",
      "관리자 메모",
      "선수 메모"
    ];

    return {
      body: await createWorkbook(rows, "Admin Scores", headers),
      filename: `admin-scores-${tournamentId}.xlsx`,
      rowCount: rows.length
    };
  }

  if (exportType === "scorecards") {
    const players = await getTournamentPublicScoreGroups(tournamentId, true);

    if (!players) {
      return null;
    }

    const rows = scorecardRows(players);
    const headers = ["선수명", "학교", "참가구분", "성별", "라운드", "front9", "back9", "roundTotal", "조", "출발시간"];

    return {
      body: await createWorkbook(rows, "Scorecards", headers),
      filename: `scorecards-${tournamentId}.xlsx`,
      rowCount: rows.length
    };
  }

  const players = await getTournamentPrivateScoreGroups(tournamentId);

  if (!players) {
    return null;
  }

  const rows = privateRows(players);
  const headers = [
    "번호",
    "선수명",
    "학교",
    "참가구분",
    "성별",
    "전화번호",
    "이메일",
    "생년월일",
    "보호자 연락처",
    "1R",
    "2R",
    "36홀 합계",
    "최종순위",
    "상태",
    "관리자 메모",
    "선수 메모"
  ];

  return {
    body: await createWorkbook(rows, "Private Operations", headers),
    filename: `private-operations-${tournamentId}.xlsx`,
    rowCount: rows.length
  };
}
