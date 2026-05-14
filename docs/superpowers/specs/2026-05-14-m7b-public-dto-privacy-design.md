# M7-B Public DTO Privacy Regression Design

## Goal

Strengthen the public results privacy boundary so future changes cannot accidentally expose private score JSON, user profile fields, player/admin memo fields, or review metadata through `/results` read models.

## Scope

This slice covers public result read functions in `src/lib/results.ts`:

- `getTournamentLeaderboard`
- `searchTournamentPlayers`
- `getPublicPlayerScorecard`
- `listPublicTournamentResults`

It focuses on regression tests and small DTO hardening only. Public UI layout, My Page owner-visible fields, admin score views, and private exports are not changed.

## Approach

Add a reusable test helper in `src/lib/results.test.ts` that recursively checks public response objects for forbidden keys and marker values. The test should fail if a future DTO accidentally spreads a `Player`, `User`, `Score`, raw `scoreData`, or internal review object into public responses.

The forbidden public keys include:

- user/contact fields: `userId`, `username`, `phone`, `email`, `birthDate`, `address`
- lifecycle fields: `userType`, `lastLoginAt`, `dormantAt`, `withdrawnAt`
- private score/review fields: `playerMemo`, `adminMemo`, `rejectionReason`, `reviewLog`, `reviewLogs`, `reviewedBy`, `reviewedAt`, `internalNotes`
- workflow-only state fields: `status`, `submissionStatus`, `reviewStatus`, `adminConfirmed`

The public allowlist remains the documented competition fields: player name, school/affiliation, category, gender, rank, round totals, par-relative totals, group, tee time, final-day eligibility, tournament metadata, and hole scores.

If the new tests reveal that a public DTO still returns a workflow-only key, update `results.ts` to map only the public field names needed by the UI rather than passing through raw nested data.

## Testing

Use TDD:

1. Add failing public privacy tests that inject sensitive keys and marker values into mocked `scoreData`, `Player`, and `User`.
2. Confirm the focused tests fail before implementation if a public DTO leaks a forbidden key.
3. Harden DTO mapping if needed.
4. Run focused and full verification.

Focused command:

```powershell
npm test -- src/lib/results.test.ts
```

Full commands:

```powershell
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```

## Documentation

Update:

- `docs/qa-m7-beta-security.md`
- `docs/specs.md`
- `docs/spec-changelog.md`
- `docs/context.md`

## Risks

Some strings such as `status` are generic enough to appear in non-public contexts. The recursive public helper is intentionally scoped to public result DTO tests only so My Page and admin DTOs can continue to expose owner/admin fields where allowed.
