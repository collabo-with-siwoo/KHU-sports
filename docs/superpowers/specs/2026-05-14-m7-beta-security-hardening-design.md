# M7 Beta Security Hardening Design

## Goal

M7 prepares the site for a private beta by reducing the most practical abuse and audit risks left after M6. This slice focuses on small, testable hardening work from the M0-M4 security report: rate limiting sensitive form actions, strengthening private export audit integrity, expanding admin permission regression coverage, and documenting beta security checks.

## Scope

This work includes:

- App-level rate limit helpers for sensitive Server Actions.
- Initial rate limit enforcement for member login, admin login, signup, password reset, and player score submission.
- Prisma schema and migration updates so `ExportLog.tournamentId` has an optional relation to `Tournament` with `onDelete: SetNull`.
- Permission regression tests for admin read/write boundaries and private export access.
- A beta security checklist document that records what was already fixed from the report and what remains for later milestones.

This work does not include:

- Full bot protection, CAPTCHA, WAF rules, or IP intelligence.
- A production distributed rate-limit backend such as Upstash or Vercel KV.
- Removing every legacy private key from `Score.scoreData`.
- Tiptap, email automation, 2FA, or public beta feedback tooling.

## Approach

### Rate Limiting

Create a small `src/lib/rate-limit.ts` module with a deterministic API:

- `checkRateLimit(key, options, now?)`
- `resetRateLimitForTests()`
- `getRateLimitKey(parts)`

The first implementation uses an in-memory store with a fixed window. This is enough to prevent accidental rapid repeats in a single runtime and, more importantly, creates one well-tested interface that can later be backed by Upstash or Vercel KV without rewriting Server Actions. If `RATE_LIMIT_ENABLED=false`, the helper allows requests so local development and emergency operation can proceed.

Apply the helper to:

- `loginAction`
- `adminSignInAction`
- `signupAction`
- `resetPasswordAction`
- `savePlayerScoreAction`

The keys must avoid storing raw passwords or sensitive body values. Email and username are normalized to lowercase, while IP can be included when available through `headers()`. User-facing messages should stay generic and not reveal account existence.

### ExportLog Relation

Update Prisma so `ExportLog` has:

- `tournamentId String? @db.Uuid`
- `tournament Tournament? @relation(fields: [tournamentId], references: [id], onDelete: SetNull)`

This keeps private export audit logs even if a tournament is deleted later. Add a migration SQL file for the foreign key. Existing route behavior stays the same; only referential integrity improves.

### Permission Regression Tests

Add focused tests around the existing authorization helpers and route/action boundaries rather than adding a new permission system. Tests should cover:

- `SUPER` can access all menus and private export.
- `MEMBER` needs explicit `read`, `write`, or `export` grant.
- Missing write grants are denied for protected write paths.
- Private export remains restricted to `SUPER` or `privacy.export`.

The current private export route tests already cover part of this. M7 should add helper-level matrix tests so future menus cannot accidentally loosen RBAC semantics.

### Beta Security Checklist

Create `docs/qa-m7-beta-security.md` with:

- Items from the security report that are already fixed.
- Items implemented in this M7 slice.
- Operator checks before private beta: Supabase Postgres version, API key migration readiness, exposed table/RLS review, Vercel env variables, R2 bucket visibility, and actual account smoke tests.
- Deferred items and why they are not part of this slice.

## Verification

Run:

```powershell
npm test
npm run typecheck
npm run lint
npm run prisma:validate
npm run build
```

Focused tests should include:

- Rate limit helper red/green coverage.
- Server Action rate-limit behavior where practical.
- Admin permission matrix.
- Export route audit behavior remains intact.

## Risks

The in-memory rate limit is not a complete distributed production control on Vercel. It is an MVP guard and a stable interface for a later external backend. The beta checklist must explicitly say that production-grade abuse protection still needs a distributed store or platform-level WAF before broad public launch.
