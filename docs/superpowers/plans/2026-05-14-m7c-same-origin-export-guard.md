# M7-C Same-Origin Export Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block explicit cross-site browser requests to sensitive admin export routes while preserving normal same-origin downloads.

**Architecture:** Add a small request-origin helper in `src/lib/same-origin.ts` and apply it early in the admin tournament export Route Handler before auth and export work.

**Tech Stack:** Next.js Route Handlers, TypeScript, Vitest.

---

## Task 1: Write Same-Origin Helper Tests

**Files:**
- Create: `src/lib/same-origin.test.ts`

- [x] Add tests for same-origin `Origin`, absent browser headers, cross-site Fetch Metadata, and mismatched `Origin`.
- [x] Run focused tests and confirm RED because `src/lib/same-origin.ts` does not exist yet.

Command:

```powershell
npm test -- src/lib/same-origin.test.ts
```

## Task 2: Implement Same-Origin Helper

**Files:**
- Create: `src/lib/same-origin.ts`

- [x] Implement `isSameOriginRequest(request: Request)`.
- [x] Implement `sameOriginForbiddenResponse()`.
- [x] Run focused tests and confirm GREEN.

Command:

```powershell
npm test -- src/lib/same-origin.test.ts
```

## Task 3: Add Export Route Guard Test

**Files:**
- Modify: `src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.test.ts`

- [x] Add a test proving a cross-site export request returns `403`.
- [x] Assert `getCurrentAdmin`, `buildTournamentScoreExport`, and `prisma.exportLog.create` are not called.
- [x] Run route tests and confirm RED because the route is not guarded yet.

Command:

```powershell
npm test -- "src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.test.ts"
```

## Task 4: Apply Guard To Export Route

**Files:**
- Modify: `src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.ts`

- [x] Import `isSameOriginRequest` and `sameOriginForbiddenResponse`.
- [x] After export type validation, return `sameOriginForbiddenResponse()` when `isSameOriginRequest(request)` is false.
- [x] Run focused route/helper tests and confirm GREEN.

Command:

```powershell
npm test -- src/lib/same-origin.test.ts "src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.test.ts"
```

## Task 5: Document And Verify

**Files:**
- Modify: `docs/qa-m7-beta-security.md`
- Modify: `docs/specs.md`
- Modify: `docs/spec-changelog.md`
- Modify: `docs/context.md`

- [x] Document the same-origin export guard.
- [x] Run full verification.
- [x] Stage only M7-C files and commit.

Commands:

```powershell
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
git add docs/superpowers/plans/2026-05-14-m7c-same-origin-export-guard.md docs/qa-m7-beta-security.md docs/specs.md docs/spec-changelog.md docs/context.md src/lib/same-origin.ts src/lib/same-origin.test.ts "src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.ts" "src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.test.ts"
git commit -m "security: guard admin exports by origin"
```
