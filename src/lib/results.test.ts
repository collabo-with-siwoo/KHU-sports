import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMyScoreHistory,
  getMyTournamentScoreDetail,
  getPublicPlayerScorecard,
  getTournamentLeaderboard,
  listPublicTournamentResults,
  searchTournamentPlayers
} from "@/lib/results";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tournament: {
      findFirst: vi.fn(),
      findMany: vi.fn()
    },
    player: {
      findMany: vi.fn(),
      findFirst: vi.fn()
    }
  }
}));

const tournamentFindFirst = vi.mocked(prisma.tournament.findFirst);
const tournamentFindMany = vi.mocked(prisma.tournament.findMany);
const playerFindMany = vi.mocked(prisma.player.findMany);
const playerFindFirst = vi.mocked(prisma.player.findFirst);

const SENSITIVE_SCORE_DATA_KEYS = [
  "adminMemo",
  "reviewLog",
  "reviewedBy",
  "reviewedAt",
  "internalNotes",
  "phone",
  "email",
  "birthDate",
  "address"
];

const SENSITIVE_VALUE_MARKERS = [
  "010-0000-0000",
  "private@example.com",
  "private admin memo",
  "private address"
];

const PUBLIC_FORBIDDEN_KEYS = [
  ...SENSITIVE_SCORE_DATA_KEYS,
  "playerMemo",
  "rejectionReason",
  "adminConfirmed",
  "submissionStatus",
  "reviewStatus",
  "reviewLogs",
  "userType",
  "lastLoginAt",
  "dormantAt",
  "withdrawnAt",
  "username",
  "userId"
];

const PUBLIC_FORBIDDEN_VALUES = [
  ...SENSITIVE_VALUE_MARKERS,
  "private player memo",
  "private rejection reason",
  "private dormant marker",
  "private withdrawn marker",
  "ADMIN_CONFIRMED",
  "ADMIN_REJECTED",
  "SUBMITTED",
  "DRAFT",
  "WITHDRAWN_PENDING",
  "WITHDRAWN_DELETED"
];

function expectNoSensitiveLeakage(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const key of SENSITIVE_SCORE_DATA_KEYS) {
    expect(serialized).not.toContain(`"${key}"`);
  }
  for (const marker of SENSITIVE_VALUE_MARKERS) {
    expect(serialized).not.toContain(marker);
  }
}

function expectNoPublicLeakage(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const key of PUBLIC_FORBIDDEN_KEYS) {
    expect(serialized, `public response must not contain key "${key}"`).not.toContain(`"${key}"`);
  }
  for (const marker of PUBLIC_FORBIDDEN_VALUES) {
    expect(serialized, `public response must not contain value "${marker}"`).not.toContain(marker);
  }
}

function collectPublicLeakPaths(value: unknown, path = "$"): string[] {
  const leaks: string[] = [];

  if (!value || typeof value !== "object") {
    return leaks;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      leaks.push(...collectPublicLeakPaths(item, `${path}[${index}]`));
    });
    return leaks;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;

    if (PUBLIC_FORBIDDEN_KEYS.includes(key)) {
      leaks.push(childPath);
    }

    leaks.push(...collectPublicLeakPaths(child, childPath));
  }

  return leaks;
}

function expectPublicDtoAllowlist(value: unknown) {
  expect(collectPublicLeakPaths(value)).toEqual([]);
  expectNoPublicLeakage(value);
}

const startDate = new Date("2026-05-01T00:00:00.000Z");
const endDate = new Date("2026-05-02T00:00:00.000Z");

function score({
  playerId,
  playerName,
  school,
  gender,
  round,
  rank,
  total,
  status = "ADMIN_CONFIRMED",
  scoreData = {}
}: {
  playerId: string;
  playerName: string;
  school: string;
  gender: "MALE" | "FEMALE";
  round: number;
  rank: number | null;
  total: number;
  status?: string;
  scoreData?: Record<string, unknown>;
}) {
  return {
    playerId,
    round,
    rank,
    scoreData: {
      front9: Math.floor(total / 2),
      back9: total - Math.floor(total / 2),
      total,
      category: "고등부",
      groupNo: `G${round}`,
      teeTime: `08:0${round}`,
      status,
      adminConfirmed: status === "ADMIN_CONFIRMED",
      phone: "010-0000-0000",
      email: "private@example.com",
      birthDate: "2008-01-01",
      address: "private address",
      playerMemo: "private player memo",
      rejectionReason: "private rejection reason",
      adminMemo: "private admin memo",
      reviewLog: [{ at: "2026-05-01T00:00:00Z", by: "admin@example.com", action: "REJECT" }],
      reviewedBy: "admin@example.com",
      reviewedAt: "2026-05-01T00:00:00Z",
      internalNotes: "internal review notes",
      ...scoreData
    },
    player: {
      id: playerId,
      name: playerName,
      affiliation: school,
      userId: "00000000-0000-0000-0000-000000000099",
      user: {
        gender,
        username: "leaky_user",
        phone: "010-0000-0000",
        email: "private@example.com",
        birthDate: new Date("2008-01-01T00:00:00.000Z"),
        address: "private address",
        userType: "PLAYER",
        status: "ACTIVE",
        lastLoginAt: new Date("2026-05-10T12:34:56.000Z"),
        dormantAt: "private dormant marker",
        withdrawnAt: "private withdrawn marker"
      }
    }
  };
}

function tournament(scores: ReturnType<typeof score>[]) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "KHU Test Open",
    venue: "Test Course",
    startDate,
    endDate,
    rounds: 2,
    scores
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("public DTO privacy assertion", () => {
  it("detects forbidden nested keys when raw score data is exposed", () => {
    expect(collectPublicLeakPaths({ row: { scoreData: { adminMemo: "private admin memo" } } })).toEqual([
      "$.row.scoreData.adminMemo"
    ]);
  });
});

describe("Full Leaderboard public DTO", () => {
  it("sorts by finalRank and falls back to round1Rank", async () => {
    tournamentFindFirst.mockResolvedValue(
      tournament([
        score({ playerId: "p1", playerName: "김파이널", school: "경희고", gender: "MALE", round: 1, rank: 9, total: 74 }),
        score({
          playerId: "p1",
          playerName: "김파이널",
          school: "경희고",
          gender: "MALE",
          round: 2,
          rank: 1,
          total: 70,
          scoreData: { finalRank: 1, total36: 144 }
        }),
        score({ playerId: "p2", playerName: "박라운드", school: "서울고", gender: "FEMALE", round: 1, rank: 2, total: 71 }),
        score({ playerId: "p3", playerName: "이비공개", school: "부산고", gender: "MALE", round: 1, rank: 1, total: 69, status: "SUBMITTED" })
      ]) as never
    );

    const result = await getTournamentLeaderboard("11111111-1111-4111-8111-111111111111", { pageSize: 10 });

    expect(result.rows.map((row) => row.playerName)).toEqual(["김파이널", "박라운드"]);
    expect(result.rows.map((row) => row.rank)).toEqual([1, 2]);
    expectNoSensitiveLeakage(result);
    expectPublicDtoAllowlist(result);
  });

  it("filters by name, school, category, gender, and final-round eligibility", async () => {
    tournamentFindFirst.mockResolvedValue(
      tournament([
        score({
          playerId: "p1",
          playerName: "김경희",
          school: "경희고",
          gender: "FEMALE",
          round: 1,
          rank: 1,
          total: 70,
          scoreData: { finalRoundEligible: true }
        }),
        score({
          playerId: "p2",
          playerName: "박서울",
          school: "서울고",
          gender: "MALE",
          round: 1,
          rank: 2,
          total: 71,
          scoreData: { category: "중등부", finalRoundEligible: false }
        })
      ]) as never
    );

    const result = await getTournamentLeaderboard("11111111-1111-4111-8111-111111111111", {
      name: "김",
      school: "경희",
      category: "고등부",
      gender: "FEMALE",
      finalOnly: true,
      pageSize: 10
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].playerName).toBe("김경희");
    expectPublicDtoAllowlist(result);
  });

  it("uses only ADMIN_CONFIRMED rows for Scorecard search", async () => {
    tournamentFindFirst.mockResolvedValue(
      tournament([
        score({ playerId: "p1", playerName: "김확정", school: "경희고", gender: "MALE", round: 1, rank: 1, total: 70 }),
        score({ playerId: "p2", playerName: "박임시", school: "서울고", gender: "FEMALE", round: 1, rank: 2, total: 71, status: "DRAFT" }),
        score({ playerId: "p3", playerName: "이반려", school: "부산고", gender: "MALE", round: 1, rank: 3, total: 72, status: "ADMIN_REJECTED" })
      ]) as never
    );

    const result = await searchTournamentPlayers("11111111-1111-4111-8111-111111111111", { pageSize: 10 });

    expect(result.rows.map((row) => row.playerName)).toEqual(["김확정"]);
    expectPublicDtoAllowlist(result);
  });
});

describe("Public Scorecard", () => {
  it("returns selected player rounds, total36, hole scores, and no private fields", async () => {
    tournamentFindFirst.mockResolvedValue({
      name: "KHU Test Open",
      scores: [
        score({
          playerId: "p1",
          playerName: "김스코어",
          school: "경희고",
          gender: "MALE",
          round: 1,
          rank: 1,
          total: 70,
          scoreData: {
            holeScores: [
              { hole: 1, par: 4, score: 4 },
              { hole: 2, par: 5, score: 4 }
            ]
          }
        }),
        score({ playerId: "p1", playerName: "김스코어", school: "경희고", gender: "MALE", round: 2, rank: 1, total: 71, scoreData: { finalRank: 1 } })
      ]
    } as never);

    const scorecard = await getPublicPlayerScorecard("11111111-1111-4111-8111-111111111111", "p1");

    expect(scorecard?.playerName).toBe("김스코어");
    expect(scorecard?.rounds.map((round) => round.roundTotal)).toEqual([70, 71]);
    expect(scorecard?.total36).toBe(141);
    expect(scorecard?.rounds[0].holeScores).toHaveLength(2);
    expect(scorecard?.rounds[1].holeScores).toBeNull();
    expectNoSensitiveLeakage(scorecard);
    expectPublicDtoAllowlist(scorecard);
  });
});

describe("Public Tournament Results", () => {
  it("returns only ADMIN_CONFIRMED scores and exposes no private fields", async () => {
    tournamentFindMany.mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        name: "KHU Test Open",
        venue: "Test Course",
        startDate,
        endDate,
        rounds: 2,
        courseData: null,
        scores: [
          score({ playerId: "p1", playerName: "김확정", school: "경희고", gender: "MALE", round: 1, rank: 1, total: 70 }),
          score({ playerId: "p1", playerName: "김확정", school: "경희고", gender: "MALE", round: 2, rank: 1, total: 71 }),
          score({ playerId: "p2", playerName: "박임시", school: "서울고", gender: "FEMALE", round: 1, rank: 2, total: 72, status: "SUBMITTED" }),
          score({ playerId: "p3", playerName: "이반려", school: "부산고", gender: "MALE", round: 1, rank: 3, total: 73, status: "ADMIN_REJECTED" })
        ]
      }
    ] as never);

    const results = await listPublicTournamentResults();

    expect(results).toHaveLength(1);
    expect(results[0].rows.map((row) => row.name)).toEqual(["김확정"]);
    expectNoSensitiveLeakage(results);
    expectPublicDtoAllowlist(results);
  });
});

describe("My Page Score", () => {
  it("returns only scores owned by the session user and includes player-visible state", async () => {
    playerFindMany.mockResolvedValue([
      {
        scores: [
          {
            tournamentId: "t1",
            round: 1,
            rank: null,
            scoreData: {
              front9: 36,
              back9: 37,
              total: 73,
              status: "ADMIN_REJECTED",
              playerMemo: "내 메모",
              rejectionReason: "스코어 확인 필요",
              adminMemo: "관리자 내부 메모"
            },
            tournament: {
              id: "t1",
              name: "KHU Test Open",
              venue: "Test Course",
              startDate,
              endDate,
              rounds: 1
            }
          }
        ]
      }
    ] as never);

    const history = await getMyScoreHistory("user-1");

    expect(playerFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: "user-1" }) }));
    expect(history[0].status).toBe("ADMIN_REJECTED");
    expect(history[0].playerMemo).toBe("내 메모");
    expect(history[0].rejectionReason).toBe("스코어 확인 필요");
    expect(JSON.stringify(history)).not.toContain("관리자 내부 메모");
    expectNoSensitiveLeakage(history);
  });

  it("returns null for a tournament score detail not owned by the user", async () => {
    playerFindFirst.mockResolvedValue(null);

    const detail = await getMyTournamentScoreDetail("other-user", "t1");

    expect(detail).toBeNull();
    expect(playerFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "other-user"
        })
      })
    );
  });

  it("does not expose adminMemo as rejectionReason", async () => {
    playerFindFirst.mockResolvedValue({
      id: "p1",
      name: "김본인",
      affiliation: "경희고",
      user: { gender: "MALE" },
      scores: [
        {
          id: "s1",
          round: 1,
          rank: null,
          scoreData: {
            front9: 36,
            back9: 37,
            total: 73,
            status: "ADMIN_REJECTED",
            adminMemo: "관리자만 보는 메모"
          }
        }
      ]
    } as never);
    tournamentFindFirst.mockResolvedValue({
      id: "t1",
      name: "KHU Test Open",
      venue: "Test Course",
      startDate,
      endDate,
      rounds: 1
    } as never);

    const detail = await getMyTournamentScoreDetail("user-1", "t1");

    expect(detail?.rejectionReason).toBeNull();
    expect(JSON.stringify(detail)).not.toContain("관리자만 보는 메모");
    expectNoSensitiveLeakage(detail);
  });
});
