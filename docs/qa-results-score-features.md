# QA Checklist - Full Leaderboard, Scorecard, My Page Score

Date: 2026-05-11

Scope: M4 current-schema MVP using `Tournament`, `Player`, `Score.scoreData`, and `ExportLog`.

## Automated Test Coverage

Run:

```bash
npm test
```

Covered by `src/lib/results.test.ts`:

- Full Leaderboard sorts by `finalRank` and falls back to round 1 rank.
- Full Leaderboard name, school, category, gender, and final-day filters work at DTO level.
- Full Leaderboard and Scorecard search include only `ADMIN_CONFIRMED` rows.
- Public DTO payloads do not include private contact fields or player/admin memo fields.
- Public Scorecard returns selected player rounds, 1R/2R totals, 36-hole total, and optional `holeScores`.
- Public Scorecard falls back to front9/back9/roundTotal when `holeScores` is absent.
- My Page score history is queried by authenticated `userId`.
- My Page score detail returns `null` for non-owned tournament scores, which page code turns into 403.
- My Page exposes player memo and rejection reason to the owner only.
- My Page does not expose `adminMemo` as a fallback rejection reason.

Covered by `src/lib/admin/score-exports.test.ts`:

- Full Leaderboard Excel includes confirmed rows only.
- Public Excel exports do not contain email, phone, birth date, or memo values.
- Admin score-status Excel includes operational memo fields but excludes contact PII.
- Private operations Excel includes contact PII as expected.

Covered by `src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.test.ts`:

- Unauthenticated export requests redirect to admin login.
- Private export is forbidden without `SUPER` or `privacy.export`.
- Private export requires a reason.
- Authorized private export writes `ExportLog`.

## Manual QA Checklist

### Full Leaderboard

- [ ] `/results/[tournamentId]` opens Full Leaderboard by default.
- [ ] Overall order follows final rank when available.
- [ ] Rows without final rank fall back to round 1 rank.
- [ ] Name search updates URL query params and filters results.
- [ ] School search updates URL query params and filters results.
- [ ] Category filter works.
- [ ] Gender filter works.
- [ ] Final-day-only filter works.
- [ ] Pagination works and preserves filters.
- [ ] Mobile layout is readable and does not overlap.
- [ ] DRAFT, SUBMITTED, and ADMIN_REJECTED scores do not appear.
- [ ] ADMIN_CONFIRMED scores appear.
- [ ] Phone, email, birth date, address, guardian contact, player memo, admin memo, and review logs are absent from screen and network response.

### Scorecard

- [ ] `/results/[tournamentId]?tab=scorecard` shows the default prompt.
- [ ] Player search works by partial name.
- [ ] School/category/gender filters work.
- [ ] Selecting a player writes `playerId` to the URL.
- [ ] Direct `/results/[tournamentId]?tab=scorecard&playerId=...` renders the same scorecard.
- [ ] 1R, 2R, and 36-hole total are correct.
- [ ] `holeScores` renders a hole-by-hole table when present.
- [ ] Without `holeScores`, only front9/back9/roundTotal summary appears.
- [ ] Private contact fields and memo fields are absent from screen and network response.

### My Page Score

- [ ] PLAYER user can open `/mypage/scores`.
- [ ] PLAYER user sees only their own tournament history.
- [ ] GENERAL user sees player-registration guidance.
- [ ] Unauthenticated user is redirected to login with `next`.
- [ ] Direct access to another player's tournament detail returns 403.
- [ ] Status labels render for DRAFT, SUBMITTED, ADMIN_CONFIRMED, and ADMIN_REJECTED.
- [ ] Owner can see `playerMemo`.
- [ ] Owner can see `rejectionReason`.
- [ ] Owner cannot see `adminMemo`.
- [ ] Rejected round exposes a reinput action.

### Admin Export

- [ ] Admin with `scores.read` can download Full Leaderboard Excel.
- [ ] Full Leaderboard Excel has no contact PII or memo values.
- [ ] Admin score-status Excel includes status, submitted/confirmed dates, admin memo, and player memo.
- [ ] Admin score-status Excel has no contact PII.
- [ ] Scorecard Excel includes confirmed round details only.
- [ ] Private operations Excel is blocked for ordinary admins.
- [ ] Private operations Excel succeeds for `SUPER`.
- [ ] Private operations Excel succeeds for a member with `privacy.export`.
- [ ] Private operations Excel requires a reason.
- [ ] Private operations Excel creates an `ExportLog` row with admin, export type, tournament, row count, and reason.

## Security Notes

- Public result functions select only `Player.name`, `Player.affiliation`, `User.gender`, score rank, and score JSON fields needed for competition display.
- Public result DTOs must not add contact/profile/memo fields.
- My Page score queries must always include the authenticated `userId` ownership predicate.
- `adminMemo` must remain admin-only. It must not be used as a player-visible rejection-reason fallback.
- Private export is the only export type that may select contact PII, and it must always log the export.
