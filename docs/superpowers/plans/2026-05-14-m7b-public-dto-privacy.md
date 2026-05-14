# M7-B Public DTO Privacy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add regression coverage and minimal DTO hardening so public result read models cannot leak private score, user, or review fields.

**Architecture:** Keep `src/lib/results.ts` as the public read-model boundary. Strengthen `src/lib/results.test.ts` with recursive public-leak assertions and only change production mapping if a test proves a public DTO still exposes forbidden data.

**Tech Stack:** Next.js App Router server read models, Prisma mock-based Vitest unit tests, TypeScript.

---

## File Structure

- Modify: `src/lib/results.test.ts`
  Adds a recursive public DTO assertion helper and explicit public-surface tests for leaderboard, scorecard search, scorecard detail, and tournament result index.
- Modify if tests require it: `src/lib/results.ts`
  Keeps public DTOs mapped through explicit fields only.
- Modify: `docs/qa-m7-beta-security.md`
  Records M7-B public DTO privacy regression coverage.
- Modify: `docs/specs.md`
  Adds the M7-B public DTO privacy contract.
- Modify: `docs/spec-changelog.md`
  Adds the M7-B changelog entry.
- Modify: `docs/context.md`
  Updates current M7 progress and verification.

---

## Task 1: Add Failing Public DTO Leak Tests

**Files:**
- Modify: `src/lib/results.test.ts`

- [x] **Step 1: Add a recursive leak collector near the existing public privacy helpers**

Add this helper below `expectNoPublicLeakage`:

```ts
function collectPublicLeakPaths(value: unknown, path = "$"): string[] {
  const leaks: string[] = [];

  if (!value || typeof value !== "object") {
    return leaks;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      leaks.push(...collectPublicLeakPaths(item, `${path}[${index}]`));
    });
    return leaks;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;

    if (PUBLIC_FORBIDDEN_KEYS.includes(key)) {
      leaks.push(childPath);
    }

    leaks.push(...collectPublicLeakPaths(child, childPath));
  }

  return leaks;
}

function expectPublicDtoAllowlist(value: unknown) {
  expect(collectPublicLeakPaths(value)).toEqual([]);
  expectNoPublicLeakage(value);
}
```

- [x] **Step 2: Add a test that proves the helper catches raw scoreData leaks**

Add this test near the helper tests or before `describe("Full Leaderboard public DTO", ...)`:

```ts
describe("public DTO privacy assertion", () => {
  it("detects forbidden nested keys when raw score data is exposed", () => {
    expect(collectPublicLeakPaths({ row: { scoreData: { adminMemo: "private admin memo" } } })).toEqual([
      "$.row.scoreData.adminMemo"
    ]);
  });
});
```

- [x] **Step 3: Replace public test helper calls on public DTOs**

In public-only tests, replace `expectNoPublicLeakage(...)` with `expectPublicDtoAllowlist(...)`:

```ts
expectPublicDtoAllowlist(result);
expectPublicDtoAllowlist(scorecard);
expectPublicDtoAllowlist(results);
```

Do not replace My Page tests because owner-visible `playerMemo` and `rejectionReason` are allowed there.

- [x] **Step 4: Run focused tests and confirm RED if any public DTO leaks forbidden fields**

Run:

```powershell
npm test -- src/lib/results.test.ts
```

Expected: If current public DTOs are already clean, the new helper self-test still proves the detector catches raw leaks and the suite may pass. If a public DTO leaks, the failure should list leak paths such as `$.rows[0].status` or `$.rounds[0].adminMemo`.

---

## Task 2: Harden Public DTO Mapping If Needed

**Files:**
- Modify if failing: `src/lib/results.ts`

- [x] **Step 1: Inspect any leak path from Task 1**

If the focused test fails, map the leak path to the specific public DTO builder:

```text
getTournamentLeaderboard -> leaderboard rows
searchTournamentPlayers -> scorecard search rows
getPublicPlayerScorecard -> scorecard detail and rounds
listPublicTournamentResults -> result index rows
```

- [x] **Step 2: Remove raw object pass-through**

If a public DTO includes a raw nested object, replace it with explicit fields. For example, change this pattern:

```ts
return {
  ...score.scoreData,
  player: score.player
};
```

to this pattern:

```ts
return {
  playerName: score.player.name,
  school: score.player.affiliation,
  roundTotal: getRoundTotal(score.scoreData)
};
```

- [x] **Step 3: Re-run focused tests and confirm GREEN**

Run:

```powershell
npm test -- src/lib/results.test.ts
```

Expected: all `src/lib/results.test.ts` tests pass.

---

## Task 3: Document M7-B Coverage

**Files:**
- Modify: `docs/qa-m7-beta-security.md`
- Modify: `docs/specs.md`
- Modify: `docs/spec-changelog.md`
- Modify: `docs/context.md`

- [x] **Step 1: Update the QA checklist implemented controls**

Add this bullet to `docs/qa-m7-beta-security.md` under `Implemented Controls`:

```md
- Public result DTO regression tests now recursively reject private score, user, and review keys in leaderboard, scorecard search, scorecard detail, and tournament result index responses.
```

- [x] **Step 2: Update specs**

Add this bullet near the M7/M4 QA coverage notes in `docs/specs.md`:

```md
- Public result DTO tests recursively assert that public leaderboard, scorecard search, scorecard detail, and tournament result index responses do not contain private score JSON keys, user profile fields, memo fields, review metadata, or workflow-only state keys.
```

- [x] **Step 3: Update changelog**

Add this bullet under the `2026-05-14 - M7 Beta Security Hardening` section in `docs/spec-changelog.md`:

```md
- Added M7-B public DTO privacy regression tests to catch accidental raw `scoreData`, `Player`, or `User` exposure in public result responses.
```

- [x] **Step 4: Update context**

Add a recent-change bullet and verification note in `docs/context.md`:

```md
- M7-B public DTO privacy regression coverage now recursively checks public result responses for private score, user, memo, and review keys.
```

---

## Task 4: Verify And Commit M7-B

- [x] **Step 1: Run focused verification**

Run:

```powershell
npm test -- src/lib/results.test.ts
```

Expected: results tests pass.

- [x] **Step 2: Run required full verification**

Run:

```powershell
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```

Expected: all commands pass.

- [x] **Step 3: Stage only M7-B files**

Run:

```powershell
git add docs/superpowers/plans/2026-05-14-m7b-public-dto-privacy.md docs/qa-m7-beta-security.md docs/specs.md docs/spec-changelog.md docs/context.md src/lib/results.test.ts src/lib/results.ts
```

If `src/lib/results.ts` did not change, omit it from staging.

- [x] **Step 4: Commit**

Run:

```powershell
git commit -m "test: harden public result privacy regressions"
```
