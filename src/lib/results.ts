import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicResultRow = {
  rank: string;
  name: string;
  affiliation: string;
  total: number;
  topar: number;
  progress: string;
  roundTotals: number[];
};

export type PublicTournamentResult = {
  id: string;
  name: string;
  venue: string;
  status: string;
  rounds: number;
  rows: PublicResultRow[];
};

export type PublicLeaderboardRow = {
  rank: number | null;
  tournamentPlayerId: string;
  playerName: string;
  school: string | null;
  category: string | null;
  gender: "MALE" | "FEMALE" | null;
  round1Total: number | null;
  round2Total: number | null;
  total36: number | null;
  finalRoundEligible: boolean;
  groupNo: string | null;
  teeTime: string | null;
};

export type LeaderboardFilters = {
  name?: string;
  school?: string;
  category?: string;
  gender?: "MALE" | "FEMALE";
  groupNo?: string;
  rankMin?: number;
  rankMax?: number;
  finalOnly?: boolean;
  sortBy?: ResultScoreSortKey;
  sortDir?: ResultScoreSortDirection;
  page?: number;
  pageSize?: number;
};

export type PlayerSearchFilters = {
  name?: string;
  school?: string;
  category?: string;
  gender?: "MALE" | "FEMALE";
  groupNo?: string;
  rankMin?: number;
  rankMax?: number;
  finalOnly?: boolean;
  sortBy?: ResultScoreSortKey;
  sortDir?: ResultScoreSortDirection;
  page?: number;
  pageSize?: number;
};

export type ResultScoreSortKey = "rank" | "name" | "school" | "round1" | "total36";
export type ResultScoreSortDirection = "asc" | "desc";

export type PublicScorecardSearchRow = {
  tournamentPlayerId: string;
  playerName: string;
  school: string | null;
  category: string | null;
  gender: "MALE" | "FEMALE" | null;
  round1Total: number | null;
  round2Total: number | null;
  total36: number | null;
  rank: number | null;
  groupNo: string | null;
  finalRoundEligible: boolean;
};

export type PublicScorecardSearchResult = {
  rows: PublicScorecardSearchRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type PublicHoleScore = {
  hole: number;
  par: number | null;
  score: number | null;
};

export type PublicScorecardRound = {
  round: number;
  groupNo: string | null;
  teeTime: string | null;
  front9: number | null;
  back9: number | null;
  roundTotal: number | null;
  holeScores: PublicHoleScore[] | null;
};

export type PublicScorecard = {
  tournamentName: string;
  playerName: string;
  school: string | null;
  category: string | null;
  gender: "MALE" | "FEMALE" | null;
  rounds: PublicScorecardRound[];
  total36: number | null;
  finalRank: number | null;
};

export type TournamentDetail = {
  id: string;
  name: string;
  venue: string;
  startDate: string;
  endDate: string;
  period: string;
  status: string;
  rounds: number;
};

export type TournamentLeaderboardResult = {
  tournament: TournamentDetail | null;
  rows: PublicLeaderboardRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminTournamentRow = {
  id: string;
  name: string;
  sportName: string;
  startDate: string;
  endDate: string;
  venue: string;
  rounds: number;
  scoreCount: number;
};

export type AdminScoreRow = {
  id: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  affiliation: string;
  round: number;
  front9: number;
  back9: number;
  total: number;
  rank: number | null;
  status: MyScoreStatus;
  statusLabel: string;
  statusMessage: string;
  playerMemo: string | null;
  rejectionReason: string | null;
};

export type AdminTournamentScoreFilters = LeaderboardFilters & {
  status?: MyScoreStatus;
};

export type AdminTournamentScoreResult = {
  tournament: TournamentDetail | null;
  rows: AdminTournamentScoreRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminTournamentScoreRow = {
  tournamentPlayerId: string;
  playerName: string;
  school: string | null;
  category: string | null;
  gender: "MALE" | "FEMALE" | null;
  rank: number | null;
  round1Total: number | null;
  round2Total: number | null;
  total36: number | null;
  groupNo: string | null;
  teeTime: string | null;
  finalRoundEligible: boolean;
  statuses: MyScoreStatus[];
  statusLabel: string;
};

export type MemberScoreRound = {
  id: string;
  round: number;
  front9: number;
  back9: number;
  total: number;
  rank: number | null;
  notes: string | null;
};

export type MemberScoreArchive = {
  tournamentId: string;
  tournamentName: string;
  venue: string;
  period: string;
  status: string;
  playerName: string;
  affiliation: string;
  total: number;
  topar: number;
  rounds: MemberScoreRound[];
};

export type MyScoreStatus = "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "ADMIN_CONFIRMED" | "ADMIN_REJECTED";

export type MyScoreHistory = {
  tournamentId: string;
  tournamentName: string;
  venue: string;
  startDate: string;
  endDate: string;
  period: string;
  round1Total: number | null;
  round2Total: number | null;
  total36: number | null;
  finalRank: number | null;
  playerMemo: string | null;
  rejectionReason: string | null;
  status: MyScoreStatus;
  statusLabel: string;
  statusMessage: string;
};

export type MyTournamentScoreRound = {
  id: string;
  round: number;
  front9: number | null;
  back9: number | null;
  roundTotal: number | null;
  groupNo: string | null;
  teeTime: string | null;
  playerMemo: string | null;
  rejectionReason: string | null;
  status: MyScoreStatus;
  statusLabel: string;
  statusMessage: string;
  adminConfirmed: boolean;
};

export type MyTournamentScoreDetail = {
  tournamentId: string;
  tournamentName: string;
  venue: string;
  startDate: string;
  endDate: string;
  period: string;
  playerName: string;
  school: string | null;
  category: string | null;
  gender: "MALE" | "FEMALE" | null;
  groupNo: string | null;
  teeTime: string | null;
  finalRank: number | null;
  rounds: MyTournamentScoreRound[];
  total36: number | null;
  playerMemo: string | null;
  rejectionReason: string | null;
  status: MyScoreStatus;
  statusLabel: string;
  statusMessage: string;
  adminConfirmed: boolean;
};

export type MyScoreInputContext = {
  tournamentId: string;
  tournamentName: string;
  venue: string;
  period: string;
  round: number;
  playerName: string;
  school: string | null;
  gender: "MALE" | "FEMALE" | null;
  existingScoreId: string | null;
  front9: number | null;
  back9: number | null;
  roundTotal: number | null;
  playerMemo: string | null;
  rejectionReason: string | null;
  status: MyScoreStatus;
  statusLabel: string;
  statusMessage: string;
  adminConfirmed: boolean;
  inputOpen: boolean;
  inputOpenMessage: string | null;
  canEdit: boolean;
};

export type MyOpenScoreInputRound = {
  round: number;
  status: MyScoreStatus;
  statusLabel: string;
  actionLabel: string | null;
  href: string;
  canEdit: boolean;
};

export type MyOpenScoreInput = {
  tournamentId: string;
  tournamentName: string;
  venue: string;
  period: string;
  status: string;
  primaryHref: string | null;
  primaryActionLabel: string | null;
  rounds: MyOpenScoreInputRound[];
};

const fallbackTournaments: PublicTournamentResult[] = [
  {
    id: "seed-2026",
    name: "제27회 경희대학교 총장배",
    venue: "경희대 지정 코스",
    status: "진행 중",
    rounds: 3,
    rows: [
      {
        rank: "1",
        name: "김서준",
        affiliation: "경희대",
        total: 202,
        topar: -14,
        progress: "F",
        roundTotals: [65, 68, 69]
      },
      {
        rank: "2",
        name: "박도윤",
        affiliation: "연세대",
        total: 204,
        topar: -12,
        progress: "F",
        roundTotals: [70, 70, 64]
      },
      {
        rank: "T3",
        name: "이하린",
        affiliation: "고려대",
        total: 205,
        topar: -11,
        progress: "F",
        roundTotals: [72, 68, 65]
      }
    ]
  }
];

function toDateLabel(value: Date) {
  return value.toISOString().slice(0, 10);
}

function numberFromScoreData(data: Prisma.JsonValue, key: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const value = data[key];

  return typeof value === "number" ? value : null;
}

function stringFromScoreData(data: Prisma.JsonValue, key: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const value = data[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function booleanFromScoreData(data: Prisma.JsonValue, key: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const value = data[key];

  return typeof value === "boolean" ? value : null;
}

function holeScoresFromScoreData(data: Prisma.JsonValue): PublicHoleScore[] | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const rawScores = data.holeScores ?? data.holes ?? data.hbh;

  if (!Array.isArray(rawScores)) {
    return null;
  }

  const holeScores = rawScores
    .map((item, index) => {
      if (typeof item === "number") {
        return {
          hole: index + 1,
          par: null,
          score: item
        };
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const hole = item as Record<string, Prisma.JsonValue>;

      return {
        hole: typeof hole.hole === "number" ? hole.hole : index + 1,
        par: typeof hole.par === "number" ? hole.par : null,
        score: typeof hole.score === "number" ? hole.score : null
      };
    })
    .filter((item): item is PublicHoleScore => Boolean(item));

  return holeScores.length ? holeScores : null;
}

function getRoundTotal(data: Prisma.JsonValue) {
  return (
    numberFromScoreData(data, "total") ??
    (numberFromScoreData(data, "front9") ?? 0) + (numberFromScoreData(data, "back9") ?? 0)
  );
}

function dateOnly(value: Date) {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function isTournamentScoreInputOpen(startDate: Date, endDate: Date, today = new Date()) {
  const current = dateOnly(today);
  return current >= dateOnly(startDate) && current <= dateOnly(endDate);
}

function getInputOpenMessage(startDate: Date, endDate: Date) {
  const today = dateOnly(new Date());

  if (today < dateOnly(startDate)) {
    return "대회 입력 기간 전입니다. 대회 시작일 이후 입력할 수 있습니다.";
  }

  if (today > dateOnly(endDate)) {
    return "대회 입력 기간이 종료되었습니다. 관리자에게 문의해 주세요.";
  }

  return null;
}

export function isPlayerEditableScoreStatus(status: MyScoreStatus) {
  return status === "NOT_STARTED" || status === "DRAFT" || status === "ADMIN_REJECTED";
}

export function getPlayerScoreInputActionLabel(status: MyScoreStatus, round: number) {
  if (!isPlayerEditableScoreStatus(status)) {
    return null;
  }

  if (status === "DRAFT") {
    return `${round}R 이어쓰기`;
  }

  if (status === "ADMIN_REJECTED") {
    return `${round}R 다시 입력`;
  }

  return `${round}R 스코어 입력`;
}

function tournamentStatus(startDate: Date, endDate: Date) {
  const today = dateOnly(new Date());

  if (today < dateOnly(startDate)) {
    return "예정";
  }

  if (today > dateOnly(endDate)) {
    return "종료";
  }

  return "진행 중";
}

function toTournamentDetail(tournament: {
  id: string;
  name: string;
  venue: string | null;
  startDate: Date;
  endDate: Date;
  rounds: number;
}): TournamentDetail {
  return {
    id: tournament.id,
    name: tournament.name,
    venue: tournament.venue ?? "-",
    startDate: toDateLabel(tournament.startDate),
    endDate: toDateLabel(tournament.endDate),
    period: `${toDateLabel(tournament.startDate)} ~ ${toDateLabel(tournament.endDate)}`,
    status: tournamentStatus(tournament.startDate, tournament.endDate),
    rounds: tournament.rounds
  };
}

function fallbackLeaderboardResult(
  tournamentId: string,
  page: number,
  pageSize: number,
  filters: LeaderboardFilters = {}
): TournamentLeaderboardResult | null {
  const tournament = fallbackTournaments.find((item) => item.id === tournamentId);

  if (!tournament) {
    return null;
  }

  let rows = tournament.rows.map((row, index) => {
    const round1Total = row.roundTotals[0] ?? null;
    const round2Total = row.roundTotals[1] ?? null;
    const total36 =
      typeof round1Total === "number" || typeof round2Total === "number"
        ? (round1Total ?? 0) + (round2Total ?? 0)
        : null;
    const rank = Number.parseInt(row.rank, 10);

    return {
      rank: Number.isFinite(rank) ? rank : index + 1,
      tournamentPlayerId: `${tournament.id}-${index + 1}`,
      playerName: row.name,
      school: row.affiliation,
      category: "일반부",
      gender: null,
      round1Total,
      round2Total,
      total36,
      finalRoundEligible: true,
      groupNo: null,
      teeTime: null
    };
  });

  if (filters.name) {
    rows = rows.filter((row) => textIncludes(row.playerName, filters.name));
  }

  if (filters.school) {
    rows = rows.filter((row) => textIncludes(row.school, filters.school));
  }

  if (filters.category) {
    rows = rows.filter((row) => row.category === filters.category);
  }

  if (filters.gender) {
    rows = rows.filter((row) => row.gender === filters.gender);
  }

  if (filters.groupNo) {
    rows = rows.filter((row) => textIncludes(row.groupNo, filters.groupNo));
  }

  if (filters.rankMin) {
    rows = rows.filter((row) => typeof row.rank === "number" && row.rank >= filters.rankMin!);
  }

  if (filters.rankMax) {
    rows = rows.filter((row) => typeof row.rank === "number" && row.rank <= filters.rankMax!);
  }

  if (filters.finalOnly) {
    rows = rows.filter((row) => row.finalRoundEligible);
  }

  const sortBy = filters.sortBy ?? "rank";
  const sortDir = filters.sortDir ?? "asc";

  rows.sort((a, b) => {
    if (sortBy === "name") {
      return compareNullableText(a.playerName, b.playerName, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    if (sortBy === "school") {
      return compareNullableText(a.school, b.school, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    if (sortBy === "round1") {
      return compareNullableNumber(a.round1Total, b.round1Total, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    if (sortBy === "total36") {
      return compareNullableNumber(a.total36, b.total36, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    return compareNullableNumber(a.rank, b.rank, sortDir) || a.playerName.localeCompare(b.playerName, "ko");
  });

  const total = rows.length;
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const safePage = Math.min(page, pageCount);
  const offset = (safePage - 1) * pageSize;

  return {
    tournament: {
      id: tournament.id,
      name: tournament.name,
      venue: tournament.venue,
      startDate: "2026-10-14",
      endDate: "2026-10-16",
      period: "2026-10-14 ~ 2026-10-16",
      status: tournament.status,
      rounds: tournament.rounds
    },
    rows: rows.slice(offset, offset + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount
  };
}

function normalizeLeaderboardPage(value?: number) {
  if (!value || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(Math.trunc(value), 1);
}

function normalizeLeaderboardPageSize(value?: number) {
  if (!value || !Number.isFinite(value)) {
    return 25;
  }

  return Math.min(Math.max(Math.trunc(value), 1), 100);
}

function normalizeSearchText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, "").toLocaleLowerCase("ko-KR");
}

function textIncludes(source: string | null | undefined, query: string | undefined) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearchText(source).includes(normalizedQuery);
}

function sortDirectionMultiplier(sortDir?: ResultScoreSortDirection) {
  return sortDir === "desc" ? -1 : 1;
}

function compareNullableNumber(a: number | null, b: number | null, sortDir?: ResultScoreSortDirection) {
  const direction = sortDirectionMultiplier(sortDir);
  const valueA = a ?? Number.MAX_SAFE_INTEGER;
  const valueB = b ?? Number.MAX_SAFE_INTEGER;

  return (valueA - valueB) * direction;
}

function compareNullableText(a: string | null, b: string | null, sortDir?: ResultScoreSortDirection) {
  const direction = sortDirectionMultiplier(sortDir);
  return (a ?? "").localeCompare(b ?? "", "ko") * direction;
}

function getScoreCategory(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "category") ?? "일반부";
}

function getScoreGroupNo(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "groupNo") ?? stringFromScoreData(scoreData, "group");
}

function getScoreTeeTime(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "teeTime") ?? stringFromScoreData(scoreData, "startTime");
}

function getPlayerMemo(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "playerMemo");
}

function getRejectionReason(scoreData: Prisma.JsonValue) {
  return stringFromScoreData(scoreData, "rejectionReason");
}

export function getScoreSubmissionStatus(scoreData: Prisma.JsonValue, hasScore = true): MyScoreStatus {
  const rawStatus = (
    stringFromScoreData(scoreData, "status") ??
    stringFromScoreData(scoreData, "submissionStatus") ??
    stringFromScoreData(scoreData, "reviewStatus")
  )?.toUpperCase();

  if (rawStatus) {
    if (["DRAFT", "TEMP", "TEMP_SAVED", "TEMPORARY"].includes(rawStatus)) {
      return "DRAFT";
    }

    if (["SUBMITTED", "PENDING", "PENDING_REVIEW"].includes(rawStatus)) {
      return "SUBMITTED";
    }

    if (["ADMIN_CONFIRMED", "CONFIRMED", "APPROVED", "FINAL"].includes(rawStatus)) {
      return "ADMIN_CONFIRMED";
    }

    if (["ADMIN_REJECTED", "REJECTED", "RETURNED", "REVISION_REQUIRED"].includes(rawStatus)) {
      return "ADMIN_REJECTED";
    }

    if (rawStatus === "NOT_STARTED") {
      return "NOT_STARTED";
    }
  }

  const adminConfirmed = booleanFromScoreData(scoreData, "adminConfirmed");

  if (adminConfirmed === true) {
    return "ADMIN_CONFIRMED";
  }

  if (adminConfirmed === false) {
    return "SUBMITTED";
  }

  return hasScore ? "ADMIN_CONFIRMED" : "NOT_STARTED";
}

function isPubliclyConfirmedScore(scoreData: Prisma.JsonValue) {
  return getScoreSubmissionStatus(scoreData) === "ADMIN_CONFIRMED";
}

export function getScoreStatusLabel(status: MyScoreStatus) {
  switch (status) {
    case "DRAFT":
      return "임시저장";
    case "SUBMITTED":
      return "제출 완료";
    case "ADMIN_CONFIRMED":
      return "관리자 확정";
    case "ADMIN_REJECTED":
      return "반려됨";
    case "NOT_STARTED":
    default:
      return "아직 스코어 미입력";
  }
}

export function getScoreStatusMessage(status: MyScoreStatus) {
  switch (status) {
    case "DRAFT":
      return "임시저장 상태입니다. 제출을 완료해 주세요.";
    case "SUBMITTED":
      return "제출 완료되었습니다. 관리자 확인 대기 중입니다.";
    case "ADMIN_CONFIRMED":
      return "관리자 확정 완료되었습니다.";
    case "ADMIN_REJECTED":
      return "관리자가 반려했습니다. 내용을 수정해 다시 제출해 주세요.";
    case "NOT_STARTED":
    default:
      return "아직 스코어가 입력되지 않았습니다.";
  }
}

function mergeScoreStatus(statuses: MyScoreStatus[]): MyScoreStatus {
  if (!statuses.length) {
    return "NOT_STARTED";
  }

  if (statuses.includes("ADMIN_REJECTED")) {
    return "ADMIN_REJECTED";
  }

  if (statuses.includes("DRAFT")) {
    return "DRAFT";
  }

  if (statuses.includes("SUBMITTED")) {
    return "SUBMITTED";
  }

  if (statuses.includes("NOT_STARTED")) {
    return "NOT_STARTED";
  }

  if (statuses.every((status) => status === "ADMIN_CONFIRMED")) {
    return "ADMIN_CONFIRMED";
  }

  return statuses[0] ?? "NOT_STARTED";
}

export async function getTournamentDetail(tournamentId: string): Promise<TournamentDetail | null> {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        sport: { code: "GOLF", active: true }
      },
      select: {
        id: true,
        name: true,
        venue: true,
        startDate: true,
        endDate: true,
        rounds: true
      }
    });

    return tournament ? toTournamentDetail(tournament) : null;
  } catch {
    return null;
  }
}

export async function getTournamentLeaderboard(
  tournamentId: string,
  filters: LeaderboardFilters = {}
): Promise<TournamentLeaderboardResult> {
  const page = normalizeLeaderboardPage(filters.page);
  const pageSize = normalizeLeaderboardPageSize(filters.pageSize);

  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        sport: { code: "GOLF", active: true }
      },
      select: {
        id: true,
        name: true,
        venue: true,
        startDate: true,
        endDate: true,
        rounds: true,
        scores: {
          select: {
            playerId: true,
            round: true,
            rank: true,
            scoreData: true,
            player: {
              select: {
                id: true,
                name: true,
                affiliation: true,
                user: {
                  select: {
                    gender: true
                  }
                }
              }
            }
          },
          orderBy: [{ round: "asc" }, { rank: "asc" }, { createdAt: "asc" }]
        }
      }
    });

    if (!tournament) {
      return fallbackLeaderboardResult(tournamentId, page, pageSize, filters) ?? {
        tournament: null,
        rows: [],
        total: 0,
        page,
        pageSize,
        pageCount: 0
      };
    }

    const grouped = new Map<
      string,
      {
        playerId: string;
        playerName: string;
        school: string | null;
        gender: "MALE" | "FEMALE" | null;
        category: string | null;
        groupNo: string | null;
        teeTime: string | null;
        finalRoundEligible: boolean | null;
        finalRank: number | null;
        round1Rank: number | null;
        roundTotals: Record<number, number>;
      }
    >();

    for (const score of tournament.scores) {
      if (!isPubliclyConfirmedScore(score.scoreData)) {
        continue;
      }

      const current = grouped.get(score.playerId) ?? {
        playerId: score.playerId,
        playerName: score.player.name,
        school: score.player.affiliation,
        gender: score.player.user?.gender ?? null,
        category: null,
        groupNo: null,
        teeTime: null,
        finalRoundEligible: null,
        finalRank: null,
        round1Rank: null,
        roundTotals: {}
      };

      current.roundTotals[score.round] = getRoundTotal(score.scoreData);
      current.category = current.category ?? getScoreCategory(score.scoreData);
      current.groupNo = current.groupNo ?? getScoreGroupNo(score.scoreData);
      current.teeTime = current.teeTime ?? getScoreTeeTime(score.scoreData);
      current.finalRoundEligible =
        current.finalRoundEligible ?? booleanFromScoreData(score.scoreData, "finalRoundEligible");
      current.finalRank = current.finalRank ?? numberFromScoreData(score.scoreData, "finalRank");

      if (score.round === 1) {
        current.round1Rank = score.rank ?? current.round1Rank;
      }

      if (score.round >= 2) {
        current.finalRank = current.finalRank ?? score.rank;
      }

      grouped.set(score.playerId, current);
    }

    let rows = [...grouped.values()].map((player) => {
      const round1Total = player.roundTotals[1] ?? null;
      const round2Total = player.roundTotals[2] ?? null;
      const total36 =
        typeof round1Total === "number" || typeof round2Total === "number"
          ? (round1Total ?? 0) + (round2Total ?? 0)
          : null;

      return {
        rank: player.finalRank ?? player.round1Rank,
        tournamentPlayerId: player.playerId,
        playerName: player.playerName,
        school: player.school,
        category: player.category ?? "일반부",
        gender: player.gender,
        round1Total,
        round2Total,
        total36,
        finalRoundEligible: player.finalRoundEligible ?? typeof round2Total === "number",
        groupNo: player.groupNo,
        teeTime: player.teeTime
      };
    });

    rows.sort((a, b) => {
      const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      const totalA = a.total36 ?? Number.MAX_SAFE_INTEGER;
      const totalB = b.total36 ?? Number.MAX_SAFE_INTEGER;

      if (totalA !== totalB) {
        return totalA - totalB;
      }

      return a.playerName.localeCompare(b.playerName, "ko");
    });

    rows = rows.map((row, index) => ({
      ...row,
      rank: row.rank ?? index + 1
    }));

    if (filters.name) {
      rows = rows.filter((row) => textIncludes(row.playerName, filters.name));
    }

    if (filters.school) {
      rows = rows.filter((row) => textIncludes(row.school, filters.school));
    }

    if (filters.category) {
      rows = rows.filter((row) => row.category === filters.category);
    }

    if (filters.gender) {
      rows = rows.filter((row) => row.gender === filters.gender);
    }

    if (filters.groupNo) {
      rows = rows.filter((row) => textIncludes(row.groupNo, filters.groupNo));
    }

    if (filters.rankMin) {
      rows = rows.filter((row) => typeof row.rank === "number" && row.rank >= filters.rankMin!);
    }

    if (filters.rankMax) {
      rows = rows.filter((row) => typeof row.rank === "number" && row.rank <= filters.rankMax!);
    }

    if (filters.finalOnly) {
      rows = rows.filter((row) => row.finalRoundEligible);
    }

    const sortBy = filters.sortBy ?? "rank";
    const sortDir = filters.sortDir ?? "asc";

    rows.sort((a, b) => {
      if (sortBy === "name") {
        return compareNullableText(a.playerName, b.playerName, sortDir) || compareNullableNumber(a.rank, b.rank);
      }

      if (sortBy === "school") {
        return compareNullableText(a.school, b.school, sortDir) || compareNullableNumber(a.rank, b.rank);
      }

      if (sortBy === "round1") {
        return compareNullableNumber(a.round1Total, b.round1Total, sortDir) || compareNullableNumber(a.rank, b.rank);
      }

      if (sortBy === "total36") {
        return compareNullableNumber(a.total36, b.total36, sortDir) || compareNullableNumber(a.rank, b.rank);
      }

      return compareNullableNumber(a.rank, b.rank, sortDir) || a.playerName.localeCompare(b.playerName, "ko");
    });

    const total = rows.length;
    const pageCount = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(page, pageCount);
    const offset = (safePage - 1) * pageSize;

    return {
      tournament: toTournamentDetail(tournament),
      rows: rows.slice(offset, offset + pageSize),
      total,
      page: safePage,
      pageSize,
      pageCount
    };
  } catch {
    return fallbackLeaderboardResult(tournamentId, page, pageSize, filters) ?? {
      tournament: null,
      rows: [],
      total: 0,
      page,
      pageSize,
      pageCount: 0
    };
  }
}

export async function searchTournamentPlayers(
  tournamentId: string,
  filters: PlayerSearchFilters = {}
): Promise<PublicScorecardSearchResult> {
  const leaderboard = await getTournamentLeaderboard(tournamentId, {
    ...filters,
    page: filters.page,
    pageSize: filters.pageSize ?? 25
  });

  return {
    rows: leaderboard.rows.map((row) => ({
      tournamentPlayerId: row.tournamentPlayerId,
      playerName: row.playerName,
      school: row.school,
      category: row.category,
      gender: row.gender,
      round1Total: row.round1Total,
      round2Total: row.round2Total,
      total36: row.total36,
      rank: row.rank,
      groupNo: row.groupNo,
      finalRoundEligible: row.finalRoundEligible
    })),
    total: leaderboard.total,
    page: leaderboard.page,
    pageSize: leaderboard.pageSize,
    pageCount: leaderboard.pageCount
  };
}

function fallbackScorecard(tournamentId: string, tournamentPlayerId: string): PublicScorecard | null {
  const leaderboard = fallbackLeaderboardResult(tournamentId, 1, 100);
  const tournament = fallbackTournaments.find((item) => item.id === tournamentId);

  if (!leaderboard?.tournament || !tournament) {
    return null;
  }

  const row = leaderboard.rows.find((item) => item.tournamentPlayerId === tournamentPlayerId);

  if (!row) {
    return null;
  }

  return {
    tournamentName: tournament.name,
    playerName: row.playerName,
    school: row.school,
    category: row.category,
    gender: row.gender,
    rounds: [
      {
        round: 1,
        groupNo: row.groupNo,
        teeTime: row.teeTime,
        front9: null,
        back9: null,
        roundTotal: row.round1Total,
        holeScores: null
      },
      {
        round: 2,
        groupNo: row.groupNo,
        teeTime: row.teeTime,
        front9: null,
        back9: null,
        roundTotal: row.round2Total,
        holeScores: null
      }
    ].filter((round) => typeof round.roundTotal === "number"),
    total36: row.total36,
    finalRank: row.rank
  };
}

export async function getPublicPlayerScorecard(
  tournamentId: string,
  tournamentPlayerId: string
): Promise<PublicScorecard | null> {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        sport: { code: "GOLF", active: true }
      },
      select: {
        name: true,
        scores: {
          where: {
            playerId: tournamentPlayerId
          },
          select: {
            round: true,
            rank: true,
            scoreData: true,
            player: {
              select: {
                name: true,
                affiliation: true,
                user: {
                  select: {
                    gender: true
                  }
                }
              }
            }
          },
          orderBy: [{ round: "asc" }, { createdAt: "asc" }]
        }
      }
    });

    if (!tournament) {
      return fallbackScorecard(tournamentId, tournamentPlayerId);
    }

    const publicScores = tournament.scores.filter((score) => isPubliclyConfirmedScore(score.scoreData));

    if (!publicScores.length) {
      return null;
    }

    const firstScore = publicScores[0];
    const rounds = publicScores.map((score) => ({
      round: score.round,
      groupNo: getScoreGroupNo(score.scoreData),
      teeTime: getScoreTeeTime(score.scoreData),
      front9: numberFromScoreData(score.scoreData, "front9"),
      back9: numberFromScoreData(score.scoreData, "back9"),
      roundTotal: getRoundTotal(score.scoreData),
      holeScores: holeScoresFromScoreData(score.scoreData)
    }));
    const round1Total = rounds.find((round) => round.round === 1)?.roundTotal ?? null;
    const round2Total = rounds.find((round) => round.round === 2)?.roundTotal ?? null;
    const total36 =
      typeof round1Total === "number" || typeof round2Total === "number"
        ? (round1Total ?? 0) + (round2Total ?? 0)
        : null;
    const finalScore = [...publicScores].reverse().find((score) => score.round >= 2) ?? firstScore;

    return {
      tournamentName: tournament.name,
      playerName: firstScore.player.name,
      school: firstScore.player.affiliation,
      category: getScoreCategory(firstScore.scoreData),
      gender: firstScore.player.user?.gender ?? null,
      rounds,
      total36,
      finalRank: numberFromScoreData(finalScore.scoreData, "finalRank") ?? finalScore.rank
    };
  } catch {
    return fallbackScorecard(tournamentId, tournamentPlayerId);
  }
}

export async function listPublicTournamentResults(): Promise<PublicTournamentResult[]> {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        sport: { code: "GOLF", active: true }
      },
      include: {
        scores: {
          include: {
            player: true
          },
          orderBy: [{ round: "asc" }, { rank: "asc" }, { createdAt: "asc" }]
        }
      },
      orderBy: { startDate: "desc" }
    });

    if (!tournaments.length) {
      return fallbackTournaments;
    }

    return tournaments.map((tournament) => {
      const grouped = new Map<
        string,
        {
          name: string;
          affiliation: string;
          rank: number | null;
          roundTotals: number[];
        }
      >();

      for (const score of tournament.scores) {
        if (!isPubliclyConfirmedScore(score.scoreData)) {
          continue;
        }

        const current = grouped.get(score.playerId) ?? {
          name: score.player.name,
          affiliation: score.player.affiliation ?? "-",
          rank: score.rank,
          roundTotals: []
        };

        current.roundTotals[score.round - 1] = getRoundTotal(score.scoreData);
        current.rank = score.rank ?? current.rank;
        grouped.set(score.playerId, current);
      }

      const rows = [...grouped.values()]
        .map((player) => {
          const total = player.roundTotals.reduce((sum, value) => sum + (value ?? 0), 0);
          const playedRounds = player.roundTotals.filter((value) => typeof value === "number").length;
          const parTotal = 72 * Math.max(playedRounds, 1);

          return {
            rank: player.rank ? String(player.rank) : "",
            name: player.name,
            affiliation: player.affiliation,
            total,
            topar: total - parTotal,
            progress: "F",
            roundTotals: player.roundTotals
          };
        })
        .sort((a, b) => {
          const rankA = Number(a.rank);
          const rankB = Number(b.rank);

          if (Number.isFinite(rankA) && Number.isFinite(rankB)) {
            return rankA - rankB;
          }

          return a.total - b.total;
        })
        .map((row, index) => ({
          ...row,
          rank: row.rank || String(index + 1)
        }));

      return {
        id: tournament.id,
        name: tournament.name,
        venue: tournament.venue ?? "-",
        status: tournamentStatus(tournament.startDate, tournament.endDate),
        rounds: tournament.rounds,
        rows
      };
    });
  } catch {
    return fallbackTournaments;
  }
}

export async function listAdminTournaments(): Promise<AdminTournamentRow[]> {
  const tournaments = await prisma.tournament.findMany({
    include: {
      sport: true,
      _count: {
        select: { scores: true }
      }
    },
    orderBy: { startDate: "desc" }
  });

  return tournaments.map((tournament) => ({
    id: tournament.id,
    name: tournament.name,
    sportName: tournament.sport.name,
    startDate: toDateLabel(tournament.startDate),
    endDate: toDateLabel(tournament.endDate),
    venue: tournament.venue ?? "-",
    rounds: tournament.rounds,
    scoreCount: tournament._count.scores
  }));
}

export async function listAdminScoreRows(): Promise<AdminScoreRow[]> {
  const scores = await prisma.score.findMany({
    include: {
      tournament: true,
      player: true
    },
    orderBy: [{ tournament: { startDate: "desc" } }, { rank: "asc" }, { createdAt: "desc" }]
  });

  return scores.map((score) => ({
    id: score.id,
    tournamentId: score.tournamentId,
    tournamentName: score.tournament.name,
    playerName: score.player.name,
    affiliation: score.player.affiliation ?? "-",
    round: score.round,
    front9: numberFromScoreData(score.scoreData, "front9") ?? 0,
    back9: numberFromScoreData(score.scoreData, "back9") ?? 0,
    total: getRoundTotal(score.scoreData),
    rank: score.rank,
    status: getScoreSubmissionStatus(score.scoreData),
    statusLabel: getScoreStatusLabel(getScoreSubmissionStatus(score.scoreData)),
    statusMessage: getScoreStatusMessage(getScoreSubmissionStatus(score.scoreData)),
    playerMemo: getPlayerMemo(score.scoreData),
    rejectionReason: getRejectionReason(score.scoreData)
  }));
}

export async function getAdminTournamentScores(
  tournamentId: string,
  filters: AdminTournamentScoreFilters = {}
): Promise<AdminTournamentScoreResult> {
  const page = normalizeLeaderboardPage(filters.page);
  const pageSize = normalizeLeaderboardPageSize(filters.pageSize);

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      id: true,
      name: true,
      venue: true,
      startDate: true,
      endDate: true,
      rounds: true,
      scores: {
        select: {
          playerId: true,
          round: true,
          rank: true,
          scoreData: true,
          player: {
            select: {
              name: true,
              affiliation: true,
              user: {
                select: { gender: true }
              }
            }
          }
        },
        orderBy: [{ round: "asc" }, { rank: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!tournament) {
    return {
      tournament: null,
      rows: [],
      total: 0,
      page,
      pageSize,
      pageCount: 0
    };
  }

  const grouped = new Map<
    string,
    {
      playerId: string;
      playerName: string;
      school: string | null;
      category: string | null;
      gender: "MALE" | "FEMALE" | null;
      rank: number | null;
      roundTotals: Record<number, number>;
      groupNo: string | null;
      teeTime: string | null;
      finalRoundEligible: boolean | null;
      statuses: MyScoreStatus[];
    }
  >();

  for (const score of tournament.scores) {
    const status = getScoreSubmissionStatus(score.scoreData);

    if (filters.status && status !== filters.status) {
      continue;
    }

    const current = grouped.get(score.playerId) ?? {
      playerId: score.playerId,
      playerName: score.player.name,
      school: score.player.affiliation,
      category: null,
      gender: score.player.user?.gender ?? null,
      rank: null,
      roundTotals: {},
      groupNo: null,
      teeTime: null,
      finalRoundEligible: null,
      statuses: []
    };

    current.roundTotals[score.round] = getRoundTotal(score.scoreData);
    current.category = current.category ?? getScoreCategory(score.scoreData);
    current.groupNo = current.groupNo ?? getScoreGroupNo(score.scoreData);
    current.teeTime = current.teeTime ?? getScoreTeeTime(score.scoreData);
    current.finalRoundEligible =
      current.finalRoundEligible ?? booleanFromScoreData(score.scoreData, "finalRoundEligible");
    current.rank = current.rank ?? numberFromScoreData(score.scoreData, "finalRank") ?? score.rank;
    current.statuses.push(status);
    grouped.set(score.playerId, current);
  }

  let rows: AdminTournamentScoreRow[] = [...grouped.values()].map((player) => {
    const round1Total = player.roundTotals[1] ?? null;
    const round2Total = player.roundTotals[2] ?? null;
    const total36 =
      typeof round1Total === "number" || typeof round2Total === "number"
        ? (round1Total ?? 0) + (round2Total ?? 0)
        : null;
    const mergedStatus = mergeScoreStatus(player.statuses);

    return {
      tournamentPlayerId: player.playerId,
      playerName: player.playerName,
      school: player.school,
      category: player.category ?? "?쇰컲遺",
      gender: player.gender,
      rank: player.rank,
      round1Total,
      round2Total,
      total36,
      groupNo: player.groupNo,
      teeTime: player.teeTime,
      finalRoundEligible: player.finalRoundEligible ?? typeof round2Total === "number",
      statuses: player.statuses,
      statusLabel: getScoreStatusLabel(mergedStatus)
    };
  });

  rows = rows.filter((row) => textIncludes(row.playerName, filters.name));
  rows = rows.filter((row) => textIncludes(row.school, filters.school));

  if (filters.category) {
    rows = rows.filter((row) => row.category === filters.category);
  }

  if (filters.gender) {
    rows = rows.filter((row) => row.gender === filters.gender);
  }

  if (filters.groupNo) {
    rows = rows.filter((row) => textIncludes(row.groupNo, filters.groupNo));
  }

  if (filters.rankMin) {
    rows = rows.filter((row) => typeof row.rank === "number" && row.rank >= filters.rankMin!);
  }

  if (filters.rankMax) {
    rows = rows.filter((row) => typeof row.rank === "number" && row.rank <= filters.rankMax!);
  }

  if (filters.finalOnly) {
    rows = rows.filter((row) => row.finalRoundEligible);
  }

  const sortBy = filters.sortBy ?? "rank";
  const sortDir = filters.sortDir ?? "asc";

  rows.sort((a, b) => {
    if (sortBy === "name") {
      return compareNullableText(a.playerName, b.playerName, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    if (sortBy === "school") {
      return compareNullableText(a.school, b.school, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    if (sortBy === "round1") {
      return compareNullableNumber(a.round1Total, b.round1Total, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    if (sortBy === "total36") {
      return compareNullableNumber(a.total36, b.total36, sortDir) || compareNullableNumber(a.rank, b.rank);
    }

    return compareNullableNumber(a.rank, b.rank, sortDir) || a.playerName.localeCompare(b.playerName, "ko");
  });

  const total = rows.length;
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const safePage = Math.min(page, pageCount);
  const offset = (safePage - 1) * pageSize;

  return {
    tournament: toTournamentDetail(tournament),
    rows: rows.slice(offset, offset + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount
  };
}

export async function listMemberScoreArchive(userId: string): Promise<MemberScoreArchive[]> {
  const players = await prisma.player.findMany({
    where: { userId },
    include: {
      scores: {
        include: {
          tournament: true
        },
        orderBy: [{ tournament: { startDate: "desc" } }, { round: "asc" }]
      }
    }
  });

  const grouped = new Map<
    string,
    {
      tournament: (typeof players)[number]["scores"][number]["tournament"];
      playerName: string;
      affiliation: string;
      rounds: MemberScoreRound[];
    }
  >();

  for (const player of players) {
    for (const score of player.scores) {
      const current = grouped.get(score.tournamentId) ?? {
        tournament: score.tournament,
        playerName: player.name,
        affiliation: player.affiliation ?? "-",
        rounds: []
      };

      current.rounds.push({
        id: score.id,
        round: score.round,
        front9: numberFromScoreData(score.scoreData, "front9") ?? 0,
        back9: numberFromScoreData(score.scoreData, "back9") ?? 0,
        total: getRoundTotal(score.scoreData),
        rank: score.rank,
        notes: score.notes
      });
      grouped.set(score.tournamentId, current);
    }
  }

  return [...grouped.values()]
    .map((entry) => {
      const total = entry.rounds.reduce((sum, round) => sum + round.total, 0);
      const parTotal = 72 * Math.max(entry.rounds.length, 1);

      return {
        tournamentId: entry.tournament.id,
        tournamentName: entry.tournament.name,
        venue: entry.tournament.venue ?? "-",
        period: `${toDateLabel(entry.tournament.startDate)} ~ ${toDateLabel(entry.tournament.endDate)}`,
        status: tournamentStatus(entry.tournament.startDate, entry.tournament.endDate),
        playerName: entry.playerName,
        affiliation: entry.affiliation,
        total,
        topar: total - parTotal,
        rounds: entry.rounds
      };
    })
    .sort((a, b) => b.period.localeCompare(a.period));
}

export async function getMyOpenScoreInputs(userId: string): Promise<MyOpenScoreInput[]> {
  const player = await prisma.player.findFirst({
    where: {
      userId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      id: true,
      sportId: true
    }
  });

  if (!player) {
    return [];
  }

  const today = dateOnly(new Date());
  const tournaments = await prisma.tournament.findMany({
    where: {
      sportId: player.sportId,
      startDate: { lte: today },
      endDate: { gte: today }
    },
    select: {
      id: true,
      name: true,
      venue: true,
      startDate: true,
      endDate: true,
      rounds: true,
      scores: {
        where: { playerId: player.id },
        select: {
          round: true,
          scoreData: true
        }
      }
    },
    orderBy: [{ startDate: "asc" }, { name: "asc" }]
  });

  return tournaments.map((tournament) => {
    const existingByRound = new Map(tournament.scores.map((score) => [score.round, score.scoreData]));
    const rounds = Array.from({ length: Math.max(tournament.rounds, 1) }, (_, index) => {
      const round = index + 1;
      const scoreData = existingByRound.get(round);
      const status = scoreData ? getScoreSubmissionStatus(scoreData) : "NOT_STARTED";
      const canEdit = isPlayerEditableScoreStatus(status);

      return {
        round,
        status,
        statusLabel: getScoreStatusLabel(status),
        actionLabel: getPlayerScoreInputActionLabel(status, round),
        href: `/mypage/scores/${tournament.id}/input/round/${round}`,
        canEdit
      };
    });
    const primaryRound = rounds.find((round) => round.canEdit) ?? null;

    return {
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      venue: tournament.venue ?? "-",
      period: `${toDateLabel(tournament.startDate)} ~ ${toDateLabel(tournament.endDate)}`,
      status: tournamentStatus(tournament.startDate, tournament.endDate),
      primaryHref: primaryRound?.href ?? null,
      primaryActionLabel: primaryRound?.actionLabel ?? null,
      rounds
    };
  });
}

export async function getMyScoreHistory(userId: string): Promise<MyScoreHistory[]> {
  const players = await prisma.player.findMany({
    where: {
      userId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      scores: {
        select: {
          tournamentId: true,
          round: true,
          rank: true,
          scoreData: true,
          tournament: {
            select: {
              id: true,
              name: true,
              venue: true,
              startDate: true,
              endDate: true,
              rounds: true
            }
          }
        },
        orderBy: [{ tournament: { startDate: "desc" } }, { round: "asc" }]
      }
    }
  });

  const grouped = new Map<
    string,
    {
      tournament: (typeof players)[number]["scores"][number]["tournament"];
      rounds: Array<{
        round: number;
        rank: number | null;
        scoreData: Prisma.JsonValue;
      }>;
    }
  >();

  for (const player of players) {
    for (const score of player.scores) {
      const current = grouped.get(score.tournamentId) ?? {
        tournament: score.tournament,
        rounds: []
      };

      current.rounds.push({
        round: score.round,
        rank: score.rank,
        scoreData: score.scoreData
      });
      grouped.set(score.tournamentId, current);
    }
  }

  return [...grouped.values()]
    .map((entry) => {
      const round1 = entry.rounds.find((round) => round.round === 1);
      const round2 = entry.rounds.find((round) => round.round === 2);
      const maxScoredRound = Math.max(0, ...entry.rounds.map((round) => round.round));
      const configuredRounds = entry.tournament.rounds ?? entry.rounds.length;
      const roundCount = Math.max(configuredRounds, maxScoredRound, 1);
      const round1Total = round1 ? getRoundTotal(round1.scoreData) : null;
      const round2Total = round2 ? getRoundTotal(round2.scoreData) : null;
      const total36 =
        typeof round1Total === "number" || typeof round2Total === "number"
          ? (round1Total ?? 0) + (round2Total ?? 0)
          : null;
      const finalRound = [...entry.rounds].reverse().find((round) => round.round >= 2) ?? round1;
      const statuses = Array.from({ length: roundCount }, (_, index) => {
        const round = entry.rounds.find((item) => item.round === index + 1);
        return round ? getScoreSubmissionStatus(round.scoreData) : "NOT_STARTED";
      });
      const status = mergeScoreStatus(statuses);
      const memoRound = entry.rounds.find((round) => getPlayerMemo(round.scoreData));
      const rejectionRound = entry.rounds.find((round) => getRejectionReason(round.scoreData));

      return {
        tournamentId: entry.tournament.id,
        tournamentName: entry.tournament.name,
        venue: entry.tournament.venue ?? "-",
        startDate: toDateLabel(entry.tournament.startDate),
        endDate: toDateLabel(entry.tournament.endDate),
        period: `${toDateLabel(entry.tournament.startDate)} ~ ${toDateLabel(entry.tournament.endDate)}`,
        round1Total,
        round2Total,
        total36,
        finalRank: finalRound
          ? numberFromScoreData(finalRound.scoreData, "finalRank") ?? finalRound.rank
          : null,
        playerMemo: memoRound ? getPlayerMemo(memoRound.scoreData) : null,
        rejectionReason: rejectionRound ? getRejectionReason(rejectionRound.scoreData) : null,
        status,
        statusLabel: getScoreStatusLabel(status),
        statusMessage: getScoreStatusMessage(status)
      };
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getMyTournamentScoreDetail(
  userId: string,
  tournamentId: string
): Promise<MyTournamentScoreDetail | null> {
  const player = await prisma.player.findFirst({
    where: {
      userId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      id: true,
      name: true,
      affiliation: true,
      user: {
        select: {
          gender: true
        }
      },
      scores: {
        where: { tournamentId },
        select: {
          id: true,
          round: true,
          rank: true,
          scoreData: true
        },
        orderBy: [{ round: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!player) {
    return null;
  }

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      id: true,
      name: true,
      venue: true,
      startDate: true,
      endDate: true,
      rounds: true
    }
  });

  if (!tournament) {
    return null;
  }

  const scoreByRound = new Map(player.scores.map((score) => [score.round, score]));
  const maxScoredRound = Math.max(0, ...player.scores.map((score) => score.round));
  const configuredRounds = tournament.rounds ?? player.scores.length;
  const roundCount = Math.max(configuredRounds, maxScoredRound, 1);
  const rounds = Array.from({ length: roundCount }, (_, index) => {
    const roundNumber = index + 1;
    const score = scoreByRound.get(roundNumber);
    const status = score ? getScoreSubmissionStatus(score.scoreData) : "NOT_STARTED";

    return {
      id: score?.id ?? `${tournament.id}-round-${roundNumber}-not-started`,
      round: roundNumber,
      front9: score ? numberFromScoreData(score.scoreData, "front9") : null,
      back9: score ? numberFromScoreData(score.scoreData, "back9") : null,
      roundTotal: score ? getRoundTotal(score.scoreData) : null,
      groupNo: score ? getScoreGroupNo(score.scoreData) : null,
      teeTime: score ? getScoreTeeTime(score.scoreData) : null,
      playerMemo: score ? getPlayerMemo(score.scoreData) : null,
      rejectionReason: score ? getRejectionReason(score.scoreData) : null,
      status,
      statusLabel: getScoreStatusLabel(status),
      statusMessage: getScoreStatusMessage(status),
      adminConfirmed: status === "ADMIN_CONFIRMED"
    };
  });
  const round1Total = rounds.find((round) => round.round === 1)?.roundTotal ?? null;
  const round2Total = rounds.find((round) => round.round === 2)?.roundTotal ?? null;
  const total36 =
    typeof round1Total === "number" || typeof round2Total === "number"
      ? (round1Total ?? 0) + (round2Total ?? 0)
      : null;
  const finalScore = [...player.scores].reverse().find((score) => score.round >= 2) ?? player.scores[0] ?? null;
  const status = mergeScoreStatus(rounds.map((round) => round.status));
  const memo = rounds.find((round) => round.playerMemo)?.playerMemo ?? null;
  const rejectionReason = rounds.find((round) => round.rejectionReason)?.rejectionReason ?? null;
  const categoryScore = player.scores[0] ?? null;

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    venue: tournament.venue ?? "-",
    startDate: toDateLabel(tournament.startDate),
    endDate: toDateLabel(tournament.endDate),
    period: `${toDateLabel(tournament.startDate)} ~ ${toDateLabel(tournament.endDate)}`,
    playerName: player.name,
    school: player.affiliation,
    category: categoryScore ? getScoreCategory(categoryScore.scoreData) : null,
    gender: player.user?.gender ?? null,
    groupNo: rounds.find((round) => round.groupNo)?.groupNo ?? null,
    teeTime: rounds.find((round) => round.teeTime)?.teeTime ?? null,
    finalRank: finalScore ? numberFromScoreData(finalScore.scoreData, "finalRank") ?? finalScore.rank : null,
    rounds,
    total36,
    playerMemo: memo,
    rejectionReason,
    status,
    statusLabel: getScoreStatusLabel(status),
    statusMessage: getScoreStatusMessage(status),
    adminConfirmed: rounds.length > 0 && rounds.every((round) => round.adminConfirmed)
  };
}

export async function getMyScoreInputContext(
  userId: string,
  tournamentId: string,
  round: number
): Promise<MyScoreInputContext | null> {
  const player = await prisma.player.findFirst({
    where: {
      userId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      id: true,
      name: true,
      affiliation: true,
      user: {
        select: { gender: true }
      }
    }
  });

  if (!player) {
    return null;
  }

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      sport: { code: "GOLF", active: true }
    },
    select: {
      id: true,
      name: true,
      venue: true,
      startDate: true,
      endDate: true,
      rounds: true,
      scores: {
        where: {
          playerId: player.id,
          round
        },
        select: {
          id: true,
          scoreData: true
        },
        take: 1
      }
    }
  });

  if (!tournament) {
    return null;
  }

  if (round < 1 || round > Math.max(tournament.rounds, 1)) {
    return null;
  }

  const score = tournament.scores[0] ?? null;
  const status = score ? getScoreSubmissionStatus(score.scoreData) : "NOT_STARTED";
  const inputOpenMessage = getInputOpenMessage(tournament.startDate, tournament.endDate);
  const inputOpen = !inputOpenMessage;
  const canEdit = inputOpen && isPlayerEditableScoreStatus(status);

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    venue: tournament.venue ?? "-",
    period: `${toDateLabel(tournament.startDate)} ~ ${toDateLabel(tournament.endDate)}`,
    round,
    playerName: player.name,
    school: player.affiliation,
    gender: player.user?.gender ?? null,
    existingScoreId: score?.id ?? null,
    front9: score ? numberFromScoreData(score.scoreData, "front9") : null,
    back9: score ? numberFromScoreData(score.scoreData, "back9") : null,
    roundTotal: score ? getRoundTotal(score.scoreData) : null,
    playerMemo: score ? getPlayerMemo(score.scoreData) : null,
    rejectionReason: score ? getRejectionReason(score.scoreData) : null,
    status,
    statusLabel: getScoreStatusLabel(status),
    statusMessage: getScoreStatusMessage(status),
    adminConfirmed: status === "ADMIN_CONFIRMED",
    inputOpen,
    inputOpenMessage,
    canEdit
  };
}

