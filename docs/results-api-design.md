# Results API And Query Design

> Scope: M4 Full Leaderboard, public Scorecard, and My Page score archive.
> Status: design-only. No application code is implemented in this step.

## Context

The target M4 result domain uses these logical tables:

- `tournaments`
- `tournament_players`
- `tee_times`
- `score_submissions`
- `tournament_results`

The current repository schema still has the earlier generic `Player` and `Score` models. The design below should be treated as the target read model for the next schema/API slice. If the Prisma models remain PascalCase, map them explicitly with `@@map("...")` or adapt the query names while preserving the same field allowlists and authorization boundaries.

## Read Model Responsibilities

`tournament_results` is the ranking/materialized summary source. It must be recalculated only from `score_submissions.status = ADMIN_CONFIRMED`.

`score_submissions` is the round-level score source. Public APIs may read only confirmed rows and may never select `adminMemo`.

`tournament_players` is the tournament participation snapshot. Public APIs may read public competition identity fields only: display name, school, category, gender, public key, and tournament/player IDs. Public APIs must not select email, phone, guardian phone, birth date, address, player memo, or admin-only fields.

`tee_times` supplies round-level group and start time. It is public only as group number and tee time.

## DTOs

```ts
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

export type PublicScorecard = {
  tournamentName: string;
  playerName: string;
  school: string | null;
  category: string | null;
  gender: "MALE" | "FEMALE" | null;
  rounds: Array<{
    round: number;
    front9: number | null;
    back9: number | null;
    roundTotal: number | null;
    groupNo: string | null;
    teeTime: string | null;
  }>;
  total36: number | null;
  finalRank: number | null;
};

export type MyScoreHistory = {
  tournamentName: string;
  venue: string | null;
  startDate: Date;
  endDate: Date;
  round1Total: number | null;
  round2Total: number | null;
  total36: number | null;
  finalRank: number | null;
  playerMemo: string | null;
  status: string;
};
```

Recommended internal DTOs:

```ts
export type LeaderboardFilters = {
  query?: string;
  name?: string;
  school?: string;
  category?: string;
  gender?: "MALE" | "FEMALE";
  rankFrom?: number;
  rankTo?: number;
  finalRoundEligibleOnly?: boolean;
  page?: number;
  pageSize?: number;
};

export type PlayerSearchFilters = Pick<
  LeaderboardFilters,
  "category" | "gender" | "school"
>;
```

## Sorting Rule

Leaderboard ordering must be:

1. `finalRank` ascending when `finalRank` exists.
2. Otherwise `round1Rank` ascending.
3. Stable tie-breakers: `total36`, player name, `tournamentPlayerId`.

For correct pagination, prefer DB sorting:

```sql
ORDER BY
  COALESCE(tr.final_rank, tr.round1_rank, 999999) ASC,
  tr.total36 ASC NULLS LAST,
  tp.player_name ASC,
  tp.id ASC
```

If final ranks exist only after the full tournament is confirmed, this rule still works because unfinalized rows fall back to `round1Rank`.

## API Boundary

All functions should live behind server-only modules, for example:

- `src/lib/results/public-results.ts`
- `src/lib/results/my-results.ts`
- `src/lib/results/dto.ts`

Public functions:

- `getTournamentLeaderboard(tournamentId, filters)`
- `searchTournamentPlayers(tournamentId, query, filters)`
- `getPublicPlayerScorecard(tournamentId, tournamentPlayerId)`
- `getPublicPlayerScoreHistory(playerPublicKey)`

Authenticated self functions:

- `getMyScoreHistory(userId)`
- `getMyTournamentScoreDetail(userId, tournamentId)`

Do not expose `userId` as a public player history identifier. Use `playerPublicKey` for public history. `playerId` can be used only if it is a sport/player profile ID without private profile fields and the query still projects only public DTO fields.

## Prisma Query Design

### getTournamentLeaderboard

Use a raw SQL read for this function because conditional ordering plus pagination is cleaner and safer at the DB layer than sorting after fetching.

```ts
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getTournamentLeaderboard(
  tournamentId: string,
  filters: LeaderboardFilters = {},
) {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(Math.max(filters.pageSize ?? 50, 1), 100);
  const offset = (page - 1) * pageSize;

  const clauses: Prisma.Sql[] = [
    Prisma.sql`tr.tournament_id = ${tournamentId}::uuid`,
    Prisma.sql`ss.status = 'ADMIN_CONFIRMED'`,
  ];

  if (filters.query) {
    clauses.push(Prisma.sql`(
      tp.player_name ILIKE ${`%${filters.query}%`}
      OR tp.school ILIKE ${`%${filters.query}%`}
    )`);
  }
  if (filters.name) clauses.push(Prisma.sql`tp.player_name ILIKE ${`%${filters.name}%`}`);
  if (filters.school) clauses.push(Prisma.sql`tp.school ILIKE ${`%${filters.school}%`}`);
  if (filters.category) clauses.push(Prisma.sql`tp.category = ${filters.category}`);
  if (filters.gender) clauses.push(Prisma.sql`tp.gender = ${filters.gender}`);
  if (filters.rankFrom) clauses.push(Prisma.sql`COALESCE(tr.final_rank, tr.round1_rank) >= ${filters.rankFrom}`);
  if (filters.rankTo) clauses.push(Prisma.sql`COALESCE(tr.final_rank, tr.round1_rank) <= ${filters.rankTo}`);
  if (filters.finalRoundEligibleOnly) clauses.push(Prisma.sql`tr.final_round_eligible = true`);

  return prisma.$queryRaw<PublicLeaderboardRow[]>(Prisma.sql`
    SELECT
      COALESCE(tr.final_rank, tr.round1_rank) AS "rank",
      tp.id AS "tournamentPlayerId",
      tp.player_name AS "playerName",
      tp.school AS "school",
      tp.category AS "category",
      tp.gender AS "gender",
      tr.round1_total AS "round1Total",
      tr.round2_total AS "round2Total",
      tr.total36 AS "total36",
      tr.final_round_eligible AS "finalRoundEligible",
      tt.group_no AS "groupNo",
      tt.tee_time AS "teeTime"
    FROM tournament_results tr
    JOIN tournament_players tp ON tp.id = tr.tournament_player_id
    JOIN score_submissions ss
      ON ss.tournament_player_id = tp.id
     AND ss.status = 'ADMIN_CONFIRMED'
    LEFT JOIN tee_times tt
      ON tt.tournament_player_id = tp.id
     AND tt.round = 1
    WHERE ${Prisma.join(clauses, " AND ")}
    GROUP BY
      tr.id, tp.id, tt.group_no, tt.tee_time
    ORDER BY
      COALESCE(tr.final_rank, tr.round1_rank, 999999) ASC,
      tr.total36 ASC NULLS LAST,
      tp.player_name ASC,
      tp.id ASC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `);
}
```

Important: this query intentionally does not select `tp.email`, `tp.phone`, `tp.guardian_phone`, `tp.birth_date`, `tp.address`, any memo field, or review-log tables.

### searchTournamentPlayers

This is a lightweight public search for the Scorecard tab. It returns only selectable public identities.

```ts
export async function searchTournamentPlayers(
  tournamentId: string,
  query: string,
  filters: PlayerSearchFilters = {},
) {
  return prisma.tournamentPlayer.findMany({
    where: {
      tournamentId,
      results: {
        some: {
          scoreSubmissions: {
            some: { status: "ADMIN_CONFIRMED" },
          },
        },
      },
      ...(query
        ? {
            OR: [
              { playerName: { contains: query, mode: "insensitive" } },
              { school: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.school
        ? { school: { contains: filters.school, mode: "insensitive" } }
        : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.gender ? { gender: filters.gender } : {}),
    },
    select: {
      id: true,
      playerPublicKey: true,
      playerName: true,
      school: true,
      category: true,
      gender: true,
    },
    orderBy: [{ playerName: "asc" }, { id: "asc" }],
    take: 20,
  });
}
```

If Prisma relation names differ, keep the same `select` shape and confirmed-score condition.

### getPublicPlayerScorecard

This function returns one tournament/player public scorecard. It should 404/null if no confirmed score exists.

```ts
export async function getPublicPlayerScorecard(
  tournamentId: string,
  tournamentPlayerId: string,
): Promise<PublicScorecard | null> {
  const row = await prisma.tournamentPlayer.findFirst({
    where: {
      id: tournamentPlayerId,
      tournamentId,
      scoreSubmissions: { some: { status: "ADMIN_CONFIRMED" } },
    },
    select: {
      playerName: true,
      school: true,
      category: true,
      gender: true,
      tournament: {
        select: {
          name: true,
        },
      },
      tournamentResult: {
        select: {
          total36: true,
          finalRank: true,
        },
      },
      scoreSubmissions: {
        where: { status: "ADMIN_CONFIRMED" },
        select: {
          round: true,
          front9: true,
          back9: true,
          roundTotal: true,
        },
        orderBy: { round: "asc" },
      },
      teeTimes: {
        select: {
          round: true,
          groupNo: true,
          teeTime: true,
        },
        orderBy: { round: "asc" },
      },
    },
  });

  if (!row || !row.tournamentResult) return null;

  const teeTimeByRound = new Map(row.teeTimes.map((tee) => [tee.round, tee]));

  return {
    tournamentName: row.tournament.name,
    playerName: row.playerName,
    school: row.school,
    category: row.category,
    gender: row.gender,
    rounds: row.scoreSubmissions.map((score) => {
      const tee = teeTimeByRound.get(score.round);
      return {
        round: score.round,
        front9: score.front9,
        back9: score.back9,
        roundTotal: score.roundTotal,
        groupNo: tee?.groupNo ?? null,
        teeTime: tee?.teeTime?.toISOString() ?? null,
      };
    }),
    total36: row.tournamentResult.total36,
    finalRank: row.tournamentResult.finalRank,
  };
}
```

Forbidden even for this specific player view: `email`, `phone`, `guardianPhone`, `birthDate`, `address`, `playerMemo`, `adminMemo`, and review logs.

### getPublicPlayerScoreHistory

Prefer `playerPublicKey`, not `userId`, as the public identity key.

```ts
export async function getPublicPlayerScoreHistory(playerPublicKey: string) {
  return prisma.tournamentPlayer.findMany({
    where: {
      playerPublicKey,
      scoreSubmissions: { some: { status: "ADMIN_CONFIRMED" } },
    },
    select: {
      id: true,
      playerName: true,
      school: true,
      category: true,
      gender: true,
      tournament: {
        select: {
          id: true,
          name: true,
          venue: true,
          startDate: true,
          endDate: true,
        },
      },
      tournamentResult: {
        select: {
          round1Total: true,
          round2Total: true,
          total36: true,
          finalRank: true,
        },
      },
    },
    orderBy: {
      tournament: { startDate: "desc" },
    },
  });
}
```

Return this as a public history DTO without private profile fields.

### getMyScoreHistory

This function must be called after reading the server session. Prefer not accepting arbitrary `userId` from a client action; derive it from `session.user.id` inside the server boundary.

```ts
export async function getMyScoreHistory(sessionUserId: string): Promise<MyScoreHistory[]> {
  const rows = await prisma.tournamentPlayer.findMany({
    where: {
      userId: sessionUserId,
    },
    select: {
      playerMemo: true,
      status: true,
      tournament: {
        select: {
          name: true,
          venue: true,
          startDate: true,
          endDate: true,
        },
      },
      tournamentResult: {
        select: {
          round1Total: true,
          round2Total: true,
          total36: true,
          finalRank: true,
        },
      },
    },
    orderBy: {
      tournament: { startDate: "desc" },
    },
  });

  return rows.map((row) => ({
    tournamentName: row.tournament.name,
    venue: row.tournament.venue,
    startDate: row.tournament.startDate,
    endDate: row.tournament.endDate,
    round1Total: row.tournamentResult?.round1Total ?? null,
    round2Total: row.tournamentResult?.round2Total ?? null,
    total36: row.tournamentResult?.total36 ?? null,
    finalRank: row.tournamentResult?.finalRank ?? null,
    playerMemo: row.playerMemo,
    status: row.status,
  }));
}
```

My Page may show `playerMemo` because it belongs to the logged-in player record. It still must not select or return `adminMemo` or review logs.

### getMyTournamentScoreDetail

```ts
export async function getMyTournamentScoreDetail(
  sessionUserId: string,
  tournamentId: string,
) {
  return prisma.tournamentPlayer.findFirst({
    where: {
      userId: sessionUserId,
      tournamentId,
    },
    select: {
      playerName: true,
      school: true,
      category: true,
      gender: true,
      playerMemo: true,
      status: true,
      tournament: {
        select: {
          name: true,
          venue: true,
          startDate: true,
          endDate: true,
        },
      },
      tournamentResult: {
        select: {
          round1Total: true,
          round2Total: true,
          total36: true,
          round1Rank: true,
          finalRank: true,
          finalRoundEligible: true,
        },
      },
      scoreSubmissions: {
        select: {
          round: true,
          front9: true,
          back9: true,
          roundTotal: true,
          status: true,
          submittedAt: true,
          confirmedAt: true,
        },
        orderBy: { round: "asc" },
      },
      teeTimes: {
        select: {
          round: true,
          groupNo: true,
          teeTime: true,
        },
        orderBy: { round: "asc" },
      },
    },
  });
}
```

The authorization predicate is part of the query: `userId = session.user.id`. This prevents a valid logged-in player from reading another player's detail by changing `tournamentId` or `tournamentPlayerId`.

## Supabase Query Alternative

If a direct Supabase client is used instead of Prisma, expose database views or RPCs that already project only public columns. This is safer than repeating long `.select()` strings throughout route handlers.

Recommended public views:

- `public_leaderboard_rows`
- `public_scorecard_rounds`
- `public_player_score_history`

Example:

```ts
const { data, error } = await supabase
  .from("public_leaderboard_rows")
  .select(`
    rank,
    tournamentPlayerId,
    playerName,
    school,
    category,
    gender,
    round1Total,
    round2Total,
    total36,
    finalRoundEligible,
    groupNo,
    teeTime
  `)
  .eq("tournamentId", tournamentId)
  .ilike("playerName", `%${name}%`)
  .range(offset, offset + pageSize - 1);
```

For My Page, do not use a public view. Use an authenticated server client or server action with:

```ts
const sessionUserId = session.user.id;

const { data, error } = await supabase
  .from("tournament_players")
  .select(`
    playerMemo,
    status,
    tournaments!inner(name, venue, startDate, endDate),
    tournament_results(round1Total, round2Total, total36, finalRank)
  `)
  .eq("userId", sessionUserId);
```

The Supabase policy should also enforce `auth.uid() = user_id` for My Page rows if direct browser clients are ever used. Server-only reads should keep the same predicate in code.

## Recommended Indexes

```sql
CREATE INDEX idx_tournament_results_rank
  ON tournament_results (tournament_id, final_rank, round1_rank, total36);

CREATE INDEX idx_tournament_players_filters
  ON tournament_players (tournament_id, category, gender, school);

CREATE INDEX idx_tournament_players_public_key
  ON tournament_players (player_public_key);

CREATE INDEX idx_score_submissions_confirmed
  ON score_submissions (tournament_player_id, status, round);

CREATE INDEX idx_tee_times_player_round
  ON tee_times (tournament_player_id, round);
```

For partial name/school search at tournament scale, enable `pg_trgm` and add trigram indexes:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_tournament_players_name_trgm
  ON tournament_players USING gin (player_name gin_trgm_ops);

CREATE INDEX idx_tournament_players_school_trgm
  ON tournament_players USING gin (school gin_trgm_ops);
```

## Security Checklist

- Public APIs use DTO-specific allowlists. Never use `include: true`.
- Public APIs select only confirmed score rows: `status = ADMIN_CONFIRMED`.
- Public APIs never select contact/profile private fields: email, phone, guardian phone, birth date, address.
- Public APIs never select memo/audit fields: player memo, admin memo, score review logs.
- My Page APIs derive `userId` from the authenticated session and query with `tournament_players.userId = session.user.id`.
- My Page APIs may select `playerMemo` and status, but never `adminMemo`.
- Admin score APIs remain under `scores.read`/`scores.write` and are not part of this public read model.

## Implementation Order

1. Add/align the M4 Prisma schema for `tournament_players`, `tee_times`, `score_submissions`, and `tournament_results`.
2. Add DTOs in a dedicated results DTO module.
3. Implement public results repository functions with allowlisted `select`/raw SQL.
4. Implement My Page repository functions with session-derived authorization.
5. Wire `/results`, `/results/[tournamentId]`, and `/mypage` to these repository functions.
6. Add tests that assert forbidden fields are absent from serialized public responses.
