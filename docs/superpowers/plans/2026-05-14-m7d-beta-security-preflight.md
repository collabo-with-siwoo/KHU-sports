# M7-D Beta Security Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe npm preflight command that checks beta security environment readiness without printing secret values.

**Architecture:** Implement a pure evaluator in `scripts/beta-security-check.js`, cover it with Vitest, then expose it as `npm run qa:beta-security`.

**Tech Stack:** Node.js CommonJS script, npm scripts, Vitest.

---

## Task 1: Add Failing Preflight Tests

**Files:**
- Create: `scripts/beta-security-check.test.js`

- [x] Add tests for missing env errors, clean env pass, disabled rate-limit warning, duplicate R2 bucket error, and secret-value redaction.
- [x] Run focused tests and confirm RED because the script does not exist yet.

Command:

```powershell
npm test -- scripts/beta-security-check.test.js
```

## Task 2: Implement Preflight Script

**Files:**
- Create: `scripts/beta-security-check.js`

- [x] Implement `evaluateBetaSecurityConfig(env)`.
- [x] Implement CLI output that prints names and messages only, never values.
- [x] Run focused tests and confirm GREEN.

Command:

```powershell
npm test -- scripts/beta-security-check.test.js
```

## Task 3: Add npm Command And Docs

**Files:**
- Modify: `package.json`
- Modify: `docs/qa-m7-beta-security.md`
- Modify: `docs/specs.md`
- Modify: `docs/spec-changelog.md`
- Modify: `docs/context.md`

- [x] Add `qa:beta-security`.
- [x] Document the command in M7 QA/spec/changelog/context.
- [x] Run full verification and commit M7-D files.

Commands:

```powershell
npm run qa:beta-security
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
git add package.json scripts/beta-security-check.js scripts/beta-security-check.test.js docs/superpowers/plans/2026-05-14-m7d-beta-security-preflight.md docs/qa-m7-beta-security.md docs/specs.md docs/spec-changelog.md docs/context.md
git commit -m "chore: add beta security preflight"
```
