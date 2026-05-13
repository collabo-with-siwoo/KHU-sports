# Score normalization (additive only)

This migration is the first step of a multi-phase rollout that moves
score lifecycle data out of `Score.scoreData` (JSON) into typed
columns and a dedicated audit table, without breaking existing rows or
in-flight branches.

## What this migration changes

- Adds `Score.status` (`ScoreStatus?`), `Score.playerMemo`,
  `Score.adminMemo`, `Score.rejectionReason`, `Score.submittedAt`,
  `Score.adminConfirmedAt`, `Score.rejectedAt` — all nullable
- Adds `ScoreReviewLog` table with a Cascade FK to `Score` and a
  `SetNull` FK to `AdminUser`
- Adds enums `ScoreStatus` and `ScoreReviewAction`
- Adds index on `Score.status`
- Enables RLS on `Score` and `ScoreReviewLog`, then revokes direct
  `anon`/`authenticated` table access so Supabase Data API clients
  cannot read score lifecycle columns or review logs directly

There are no `NOT NULL` columns, no defaults that rewrite existing
rows, no dropped columns, and no renamed fields. Existing reads and
writes continue to work because nothing in the app reads the new
columns yet.

## Why additive first

Other branches are actively touching the same DB. A breaking change
(making `status` `NOT NULL`, or removing `scoreData.status`) would
force every branch to rebase. By keeping this step purely additive we
can ship it independently and rebase later branches at their own pace.

## How to apply

This project uses `prisma db push` (no migration history table). Two
options:

1. Run `prisma db push` against each environment after merging. Prisma
   will reconcile the additive columns automatically.
2. Run the SQL in `migration.sql` directly inside a single
   transaction. Provided for environments where db push is disabled.

Either path is safe to retry — every statement is `ADD COLUMN`,
`CREATE TABLE`, `CREATE INDEX`, or `ADD CONSTRAINT`.

The RLS/REVOKE statements are included because both tables are in the
Supabase `public` schema, which can be exposed through the Data API.
The application currently uses server-side Prisma for these records, so
no direct `anon` or `authenticated` Data API access is required.

## Read-path compatibility layer

`src/lib/score-normalization.ts` exposes
`resolveScoreStatus`, `resolvePlayerMemo`, `resolveAdminMemo`,
`resolveRejectionReason`, `resolveSubmittedAt`,
`resolveAdminConfirmedAt`, and `resolveRejectedAt`. Each helper
prefers the column and falls back to the matching key in
`scoreData`. New read sites should call these helpers instead of
reading either source directly, so the eventual cutover only has to
remove the JSON fallback.

## Follow-up phases (not in this PR)

1. Update write paths to write column **and** `scoreData` (dual
   write) for `status`, memos, and timestamps. Insert
   `ScoreReviewLog` rows on every admin review action.
2. Backfill columns from `scoreData` for historical rows. Idempotent
   `UPDATE Score SET status = ... WHERE status IS NULL`.
3. Switch read sites to `resolve*` helpers across `src/lib/results.ts`
   and admin pages.
4. Once dual writes have been live for at least one production cycle,
   stop writing the JSON keys and remove them from new payloads.
5. Optionally tighten `Score.status` to `NOT NULL` with a default of
   `DRAFT` once every row has a value.

Skip any step that conflicts with another in-flight branch; each
phase is independently shippable.
