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
  tournamentName: string;
  playerName: string;
  affiliation: string;
  round: number;
  front9: number;
  back9: number;
  total: number;
  rank: number | null;
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

function getRoundTotal(data: Prisma.JsonValue) {
  return (
    numberFromScoreData(data, "total") ??
    (numberFromScoreData(data, "front9") ?? 0) + (numberFromScoreData(data, "back9") ?? 0)
  );
}

function tournamentStatus(startDate: Date, endDate: Date) {
  const today = new Date();

  if (today < startDate) {
    return "예정";
  }

  if (today > endDate) {
    return "종료";
  }

  return "진행 중";
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
    tournamentName: score.tournament.name,
    playerName: score.player.name,
    affiliation: score.player.affiliation ?? "-",
    round: score.round,
    front9: numberFromScoreData(score.scoreData, "front9") ?? 0,
    back9: numberFromScoreData(score.scoreData, "back9") ?? 0,
    total: getRoundTotal(score.scoreData),
    rank: score.rank
  }));
}

