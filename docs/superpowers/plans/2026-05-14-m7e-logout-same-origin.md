# M7-E Logout Same-Origin Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent explicit cross-site `POST /logout` requests from signing users out.

**Architecture:** Reuse `src/lib/same-origin.ts` in `src/app/logout/route.ts` before Supabase sign-out and cookie clearing.

**Tech Stack:** Next.js Route Handler, Supabase SSR helper mock, Vitest.

---

## Task 1: Add Logout Route Tests

**Files:**
- Create: `src/app/logout/route.test.ts`

- [x] Add a failing test that cross-site `POST /logout` returns `403` without sign-out or cookie clearing.
- [x] Add a same-origin test that preserves current sign-out + redirect behavior.
- [x] Run focused tests and confirm RED for the cross-site case.

## Task 2: Apply Guard

**Files:**
- Modify: `src/app/logout/route.ts`

- [x] Accept `request: Request` in `POST`.
- [x] Return `sameOriginForbiddenResponse()` before sign-out when `isSameOriginRequest(request)` is false.
- [x] Run focused tests and confirm GREEN.

## Task 3: Document, Verify, Commit

**Files:**
- Modify: `docs/qa-m7-beta-security.md`
- Modify: `docs/specs.md`
- Modify: `docs/spec-changelog.md`
- Modify: `docs/context.md`

- [x] Document M7-E logout origin guard.
- [x] Run full verification.
- [x] Commit M7-E files.
