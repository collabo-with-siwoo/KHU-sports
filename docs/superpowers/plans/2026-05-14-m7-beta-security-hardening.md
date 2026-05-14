# M7 Beta Security Hardening Plan

> This plan is for `superpowers:executing-plans`. Keep tasks small, verify each security boundary, and avoid staging unrelated local files.

**Goal:** Apply the approved M7 beta hardening scope: app-level rate limiting, `ExportLog` tournament referential integrity, admin permission regression coverage, and a beta security QA checklist.

**Branch:** `feature/m7-beta-security-hardening`

**Out of scope:** CAPTCHA, distributed rate limit storage, WAF rules, 2FA, feedback tooling, and broad score legacy cleanup.

---

## Task 1: Add Rate Limit Tests First

**Files:**
- Create `src/lib/rate-limit.test.ts`
- Create `src/lib/action-rate-limit.test.ts`

- [x] Step 1: Add tests proving a fixed-window limiter allows N requests and blocks N+1 within the same window.
- [x] Step 2: Add a test proving the same key is allowed again after the window resets.
- [x] Step 3: Add a test proving key parts are normalized to a stable, non-sensitive key string.
- [x] Step 4: Add a test proving `RATE_LIMIT_ENABLED=false` bypasses blocking for local/emergency use.
- [x] Step 5: Add action profile tests for member login, admin login, signup, password reset, and player score submission.
- [x] Step 6: Run the new tests and confirm they fail because the modules do not exist yet.

Verification:

```powershell
npm test -- src/lib/rate-limit.test.ts src/lib/action-rate-limit.test.ts
```

---

## Task 2: Implement Shared Rate Limit Helpers

**Files:**
- Create `src/lib/rate-limit.ts`
- Create `src/lib/action-rate-limit.ts`
- Create `src/lib/request-ip.ts`

- [x] Step 1: Implement an in-memory fixed-window limiter with `checkRateLimit`, `getRateLimitKey`, and `resetRateLimitForTests`.
- [x] Step 2: Implement action-specific profiles and `checkActionRateLimit`.
- [x] Step 3: Implement `getRequestIp` using `x-forwarded-for`, `x-real-ip`, and a safe fallback.
- [x] Step 4: Re-run the focused rate limit tests and confirm they pass.

Verification:

```powershell
npm test -- src/lib/rate-limit.test.ts src/lib/action-rate-limit.test.ts
```

---

## Task 3: Enforce Rate Limits In High-Risk Actions

**Files:**
- Modify `src/app/(auth)/actions.ts`
- Modify `src/app/admin/actions.ts`
- Modify `src/app/mypage/scores/[tournamentId]/input/round/[round]/actions.ts`

- [x] Step 1: Apply member login rate limiting after input validation and before account lookup/Supabase auth.
- [x] Step 2: Apply signup and password reset rate limiting after validation and before external auth calls.
- [x] Step 3: Apply admin login rate limiting after validation and before Supabase auth.
- [x] Step 4: Apply player score submission rate limiting after member resolution and before score writes.
- [x] Step 5: Keep all returned errors generic and avoid including passwords, raw form bodies, or private values in keys.

Verification:

```powershell
npm run typecheck
npm test -- src/lib/rate-limit.test.ts src/lib/action-rate-limit.test.ts
```

---

## Task 4: Add ExportLog Tournament FK

**Files:**
- Modify `prisma/schema.prisma`
- Create `prisma/migrations/2026-05-14-export-log-tournament-fk/migration.sql`

- [x] Step 1: Add `Tournament.exportLogs ExportLog[]`.
- [x] Step 2: Add `ExportLog.tournament` relation on `tournamentId` with `onDelete: SetNull`.
- [x] Step 3: Add migration SQL that nulls orphan `tournamentId` values before adding the FK.

Verification:

```powershell
npm run prisma:validate
```

---

## Task 5: Expand Admin Permission Regression Tests

**Files:**
- Modify `src/lib/admin/auth.test.ts`

- [x] Step 1: Add a matrix test proving `SUPER` can access every permission key/action combination.
- [x] Step 2: Add a test proving `fullAdminPermissions` grants every key/action combination.
- [x] Step 3: Add explicit privacy export tests for `MEMBER` with and without `privacy.export`.

Verification:

```powershell
npm test -- src/lib/admin/auth.test.ts
```

---

## Task 6: Document Beta Security QA

**Files:**
- Create `docs/qa-m7-beta-security.md`
- Modify `docs/specs.md`
- Modify `docs/spec-changelog.md`
- Modify `docs/context.md`

- [x] Step 1: Record implemented controls, operator checks, and deferred controls in the QA checklist.
- [x] Step 2: Update specs with the M7 rate limit, export log FK, and permission regression notes.
- [x] Step 3: Update changelog and context with M7 progress.

---

## Task 7: Full Verification And Commit

- [x] Step 1: Run the required verification commands.
- [x] Step 2: Inspect `git diff` and `git status --short`.
- [x] Step 3: Stage only M7 files and commit.

Verification:

```powershell
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```

Commit:

```powershell
git add docs/superpowers/plans/2026-05-14-m7-beta-security-hardening.md docs/qa-m7-beta-security.md docs/specs.md docs/spec-changelog.md docs/context.md src/lib/rate-limit.ts src/lib/rate-limit.test.ts src/lib/action-rate-limit.ts src/lib/action-rate-limit.test.ts src/lib/request-ip.ts src/lib/admin/auth.test.ts "src/app/(auth)/actions.ts" src/app/admin/actions.ts "src/app/mypage/scores/[tournamentId]/input/round/[round]/actions.ts" prisma/schema.prisma prisma/migrations/2026-05-14-export-log-tournament-fk/migration.sql
git commit -m "security: harden beta access controls"
```
