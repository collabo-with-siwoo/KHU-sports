# Results IA And Screen Design

> Scope: `/results` and `/results/[tournamentId]`
> Status: M4 design spec, before implementation
> Policy baseline: Public score pages may show competition records, but must never expose private personal/contact/admin data.

## Policy Baseline

The public results area now has two public views: Full Leaderboard and Scorecard. Full Leaderboard is the full standings view. Scorecard is the public player competition-record view for a selected player. This Scorecard view is not a private member profile; it may only render public competition fields.

Public fields are rank, player name, school, participation type, gender, round scores, 36-hole total, final rank, group, and start time.

Private fields must never appear in public result pages or public result payloads: phone number, email, birth date, address, guardian contact, player memo, admin memo, and admin review/audit logs.

## Routes

### `/results`

Purpose: tournament result index.

The page lists tournaments grouped by status so users can quickly enter the correct result page. It must support:

- Completed tournament list
- Ongoing tournament list
- Tournament name
- Venue
- Period
- Status
- Result-view button linking to `/results/[tournamentId]`

Recommended layout:

- Page title: `경기결과`
- Status sections:
  - `진행 중 대회`
  - `종료된 대회`
- Tournament cards:
  - status badge
  - tournament name
  - venue
  - period
  - result-view action

Empty states:

- No ongoing tournament: `현재 진행 중인 대회가 없습니다.`
- No completed tournament: `아직 종료된 대회 결과가 없습니다.`

### `/results/[tournamentId]`

Purpose: tournament result detail.

The page uses tabs:

1. Full Leaderboard
2. Scorecard

Default tab: Full Leaderboard.

Header area:

- Tournament name
- Venue
- Period
- Status
- Last updated label when available
- Back link to `/results`

## Full Leaderboard Tab

Purpose: show full standings for all public participants.

Columns:

- Rank
- Player name
- School
- Participation type
- Gender
- 1R
- 2R
- 36-hole total
- Final-day qualification
- Group
- Start time
- Scorecard view button

Filters:

- Name search
- School search
- Participation type filter
- Gender filter
- Rank range filter
- Final-day qualifiers only

Interaction:

- Search must match partial player names.
- School search must match partial school names.
- Scorecard view button switches to the Scorecard tab and selects that player.
- Large datasets should use pagination first. Infinite scroll can be considered later if the list feels too long after real data entry.
- Mobile switches from table to card list.

Mobile card fields:

- Rank and player name at top
- School, participation type, gender
- 1R, 2R, 36-hole total
- Final-day qualification
- Group and start time
- Scorecard view action

Empty state:

- `검색 결과가 없습니다.`

## Scorecard Tab

Purpose: show public competition-record details for one selected player.

Initial state:

- Large search box at the top
- Message: `선수명을 검색해 스코어카드를 확인하세요.`

Search:

- Search by player name
- Search by school
- Partial input must work
- Results list shows only public player identity fields:
  - player name
  - school
  - participation type
  - gender
  - group
  - start time

Selection behavior:

- Selecting a player displays the public scorecard panel.
- Coming from the Full Leaderboard scorecard button preselects that player.
- If no matching players exist, show `검색 결과가 없습니다.`

Scorecard display fields:

- Player name
- School
- Participation type
- Gender
- Tournament name
- Round
- front9
- back9
- roundTotal
- 36-hole total
- Final rank
- Group
- Start time
- Participation history for public tournament records, when available

Private fields must not render:

- Phone number
- Email
- Birth date
- Address
- Guardian contact
- Player memo
- Admin memo
- Admin review logs

## Component List

Recommended components for implementation:

- `ResultsIndexPage`
- `TournamentStatusSection`
- `TournamentResultCard`
- `TournamentResultDetailPage`
- `TournamentResultHeader`
- `ResultsTabs`
- `LeaderboardFilters`
- `LeaderboardTable`
- `LeaderboardMobileCards`
- `LeaderboardPagination`
- `ScorecardSearchPanel`
- `ScorecardSearchResults`
- `PublicScorecardPanel`
- `ScoreRoundRows`
- `ResultsEmptyState`

Shared read-model types:

- `PublicTournamentSummary`
- `PublicLeaderboardFilters`
- `PublicLeaderboardRow`
- `PublicScorecardSearchResult`
- `PublicScorecardDetail`
- `PublicRoundScore`

## Data Flow

### `/results`

1. Server reads public tournament summaries.
2. Server groups tournaments by status.
3. UI renders ongoing and completed sections.
4. Result-view button navigates to `/results/[tournamentId]`.

### `/results/[tournamentId]` Full Leaderboard

1. Server reads the tournament header and public leaderboard seed/page.
2. Client controls filters, tab state, and pagination state.
3. Filter changes request or derive leaderboard rows using only public fields.
4. Scorecard button stores the selected player entry ID and switches to Scorecard tab.

### `/results/[tournamentId]` Scorecard

1. Initial state renders only the search prompt.
2. Search input queries public player entries by name or school.
3. Selecting a result fetches or reveals that player's public scorecard detail.
4. Scorecard detail renders public score fields only.

## Data Contract

Public result read-models must read from public-safe tournament entry snapshots, not directly from private `User` fields.

Recommended public leaderboard row:

```ts
type PublicLeaderboardRow = {
  entryId: string;
  rank: number | null;
  playerName: string;
  school: string;
  participationType: string;
  gender: "MALE" | "FEMALE";
  round1: number | null;
  round2: number | null;
  total36: number | null;
  finalQualified: boolean;
  finalRank: number | null;
  groupName: string | null;
  startTime: string | null;
};
```

Recommended public scorecard detail:

```ts
type PublicScorecardDetail = {
  entryId: string;
  playerName: string;
  school: string;
  participationType: string;
  gender: "MALE" | "FEMALE";
  tournamentName: string;
  groupName: string | null;
  startTime: string | null;
  rounds: Array<{
    round: number;
    front9: number | null;
    back9: number | null;
    roundTotal: number | null;
  }>;
  total36: number | null;
  finalRank: number | null;
};
```

## Implementation Notes

- The public UI should avoid wording such as `개인정보` or `프로필 상세` for Scorecard. Use `경기 스코어` or `공개 스코어카드`.
- Filtering should be deterministic and bookmarkable later, preferably through query params after the first implementation pass.
- The first implementation can use pagination. Infinite scroll is optional after real row counts are known.
- My Page remains a separate personal archive and should not be treated as the public Scorecard source.
