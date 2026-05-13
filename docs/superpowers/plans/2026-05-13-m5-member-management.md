# M5 Member Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the M5 member lifecycle MVP with admin member operations, My Page withdrawal, bounded queries, and Player anonymization.

**Architecture:** Keep route files thin. Put member list/detail reads in `src/lib/admin/members.ts` and lifecycle writes in `src/lib/member-lifecycle.ts`. M5 only refactors member-dependent M3/M4 edges and intentionally leaves M2 editor/R2 and M4 target result-table work for later.

**Tech Stack:** Next.js App Router Server Components and Server Actions, TypeScript, Prisma, Supabase Auth SSR, zod, Vitest.

---

## File Structure

- Create `src/lib/member-lifecycle.ts`: pure helpers plus Prisma-backed lifecycle functions for PLAYER conversion, withdrawal request, recovery, and final anonymization.
- Create `src/lib/member-lifecycle.test.ts`: TDD coverage for masking, anonymized player naming, and lifecycle Prisma calls.
- Create `src/lib/admin/members.ts`: bounded admin list/detail read models and query param normalization.
- Create `src/lib/admin/members.test.ts`: TDD coverage for list filters, pagination bounds, and privacy-safe selects.
- Modify `src/app/admin/members/page.tsx`: use the admin read model, search/filter form, pagination, detail links.
- Create `src/app/admin/members/[userId]/page.tsx`: member detail and status operation surface.
- Modify `src/app/admin/members/actions.ts`: thin Server Actions calling lifecycle functions.
- Create `src/app/mypage/actions.ts`: member-facing withdrawal request action.
- Modify `src/app/mypage/page.tsx`: remove eager archive loading, add withdrawal section, keep score-input CTA bounded.
- Update `docs/specs.md`, `docs/spec-changelog.md`, and `docs/context.md`: record M5 behavior and performance contract.

## Task 1: Member Lifecycle Helpers

**Files:**
- Create: `src/lib/member-lifecycle.ts`
- Test: `src/lib/member-lifecycle.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/member-lifecycle.test.ts` with tests for:

```ts
import { describe, expect, it } from "vitest";
import {
  anonymizedPlayerName,
  buildMaskedWithdrawnUserData,
  canMemberRequestWithdrawal
} from "@/lib/member-lifecycle";

describe("member lifecycle helpers", () => {
  it("allows withdrawal only for active members", () => {
    expect(canMemberRequestWithdrawal("ACTIVE")).toBe(true);
    expect(canMemberRequestWithdrawal("DORMANT")).toBe(false);
    expect(canMemberRequestWithdrawal("WITHDRAWN_PENDING")).toBe(false);
    expect(canMemberRequestWithdrawal("WITHDRAWN_DELETED")).toBe(false);
  });

  it("builds stable anonymous player names from a player id", () => {
    expect(anonymizedPlayerName("12345678-aaaa-bbbb-cccc-999999999999")).toBe("player_99999999");
  });

  it("masks personal user fields without changing lifecycle fields", () => {
    const data = buildMaskedWithdrawnUserData("user-123", new Date("2026-05-13T00:00:00.000Z"));

    expect(data.name).toBe("withdrawn_user_123");
    expect(data.phone).toBe("withdrawn-user-123");
    expect(data.email).toBe("withdrawn-user-123@withdrawn.local");
    expect(data.username).toBe("withdrawn_user_123");
    expect(data.address).toBeNull();
    expect(data.status).toBe("WITHDRAWN_DELETED");
    expect(data.withdrawnAt).toEqual(new Date("2026-05-13T00:00:00.000Z"));
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/member-lifecycle.test.ts`

Expected: FAIL because `src/lib/member-lifecycle.ts` does not exist.

- [ ] **Step 3: Implement helpers**

Create `src/lib/member-lifecycle.ts` with exported helper functions:

```ts
import type { Prisma, UserStatus } from "@prisma/client";

function shortSuffix(id: string) {
  return id.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || "anonymous";
}

export function canMemberRequestWithdrawal(status: UserStatus) {
  return status === "ACTIVE";
}

export function anonymizedPlayerName(playerId: string) {
  return `player_${shortSuffix(playerId)}`;
}

export function buildMaskedWithdrawnUserData(userId: string, withdrawnAt: Date): Prisma.UserUpdateInput {
  const suffix = shortSuffix(userId);

  return {
    username: `withdrawn_user_${suffix}`,
    email: `withdrawn-user-${suffix}@withdrawn.local`,
    name: `withdrawn_user_${suffix}`,
    phone: `withdrawn-user-${suffix}`,
    address: null,
    userType: "GENERAL",
    status: "WITHDRAWN_DELETED",
    withdrawnAt
  };
}
```

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/member-lifecycle.test.ts`

Expected: PASS.

## Task 2: Lifecycle Prisma Writes

**Files:**
- Modify: `src/lib/member-lifecycle.ts`
- Modify: `src/lib/member-lifecycle.test.ts`

- [ ] **Step 1: Write failing tests**

Extend the test file by mocking `@/lib/prisma` and covering:

```ts
import { beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    sport: { upsert: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    player: { upsert: vi.fn() },
    $transaction: vi.fn()
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});
```

Add tests that verify:

- `convertMemberToPlayer(userId, affiliation)` reads the user and upserts GOLF Player.
- `requestMemberWithdrawal(userId)` only updates an ACTIVE user to `WITHDRAWN_PENDING`.
- `recoverPendingWithdrawal(userId)` sets status back to `ACTIVE` and clears `withdrawnAt`.
- `finalizeWithdrawnMember(userId)` masks User and anonymizes linked Players inside a transaction.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/member-lifecycle.test.ts`

Expected: FAIL because lifecycle write functions are not implemented.

- [ ] **Step 3: Implement minimal lifecycle functions**

Add functions:

- `convertMemberToPlayer(userId: string, affiliation?: string | null)`
- `requestMemberWithdrawal(userId: string)`
- `recoverPendingWithdrawal(userId: string)`
- `finalizeWithdrawnMember(userId: string, now = new Date())`

Use Prisma `select` fields only. Use transactions for finalization. Throw user-safe `Error` messages for missing users or invalid statuses.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/member-lifecycle.test.ts`

Expected: PASS.

## Task 3: Admin Member Read Model

**Files:**
- Create: `src/lib/admin/members.ts`
- Test: `src/lib/admin/members.test.ts`

- [ ] **Step 1: Write failing tests**

Create tests for:

- `parseMemberListSearchParams` clamps `page` to at least 1 and `pageSize` to 30.
- Invalid `userType` and `status` are ignored.
- `listAdminMembers` calls `prisma.user.findMany` with `skip`, `take`, `select`, and no full `scores` include.
- `getAdminMemberDetail` caps recent scores to 10 rows.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/admin/members.test.ts`

Expected: FAIL because `src/lib/admin/members.ts` does not exist.

- [ ] **Step 3: Implement read model**

Implement:

- `type MemberListFilters`
- `parseMemberListSearchParams(searchParams)`
- `listAdminMembers(filters)`
- `getAdminMemberDetail(userId)`

Use Prisma `select`, `take: 30`, and safe `OR` search over `name`, `username`, `email`, `phone`.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/admin/members.test.ts`

Expected: PASS.

## Task 4: Admin UI And Actions

**Files:**
- Modify: `src/app/admin/members/page.tsx`
- Modify: `src/app/admin/members/actions.ts`
- Create: `src/app/admin/members/[userId]/page.tsx`
- Modify: `src/app/admin/members/member-type-form.tsx` to keep the inline PLAYER conversion form compatible with the refactored action state.

- [ ] **Step 1: Refactor actions**

Replace direct Prisma mutation in `updateMemberTypeAction` with:

- `convertMemberToPlayer` when `userType = PLAYER`.
- `demoteMemberToGeneral` when `userType = GENERAL`.

Add Server Actions:

- `requestAdminStatusChangeAction`
- `recoverMemberAction`
- `finalizeMemberWithdrawalAction`

Each action calls `requireAdminPermission("members", "write", "/admin/members")`.

- [ ] **Step 2: Update list page**

Use `listAdminMembers` and render:

- search field
- user type filter
- status filter
- member rows
- detail link
- pagination links

- [ ] **Step 3: Add detail page**

Create `/admin/members/[userId]` with:

- member identity/status summary
- golf player summary
- recent score summary
- user type form
- lifecycle status controls

- [ ] **Step 4: Verify UI compiles**

Run: `npm run typecheck`

Expected: PASS.

## Task 5: My Page Withdrawal Flow And Performance

**Files:**
- Create: `src/app/mypage/actions.ts`
- Modify: `src/app/mypage/page.tsx`
- Keep: `src/lib/members.ts` unchanged unless TypeScript requires exporting the existing `CurrentMember` status union from that file.

- [ ] **Step 1: Rely on lifecycle TDD boundary**

Use the `requestMemberWithdrawal(userId)` tests from Task 2 as the behavior proof for the status transition. Keep the Server Action thin because cookie deletion, Supabase sign-out, and Next.js redirect are framework side effects that are already covered by compilation and route verification in this plan.

- [ ] **Step 2: Create withdrawal action**

`requestWithdrawalAction` must:

- call `getCurrentMember()`
- reject unauthenticated or non-ACTIVE users
- call `requestMemberWithdrawal(member.id)`
- clear `khu_app_session_started_at`
- call Supabase `signOut`
- redirect to `/login?withdrawal=requested`

- [ ] **Step 3: Lighten My Page**

Remove eager `listMemberScoreArchive(member.id)` from `/mypage`. Keep the score archive CTA linking to `/mypage/score-results`. Keep open score input CTA only for PLAYER users.

- [ ] **Step 4: Add withdrawal UI**

Add a small My Page section for ACTIVE logged-in users with a confirmation checkbox/input and submit button.

- [ ] **Step 5: Verify route compiles**

Run: `npm run typecheck`

Expected: PASS.

## Task 6: Docs And Verification

**Files:**
- Modify: `docs/context.md`
- Modify: `docs/specs.md`
- Modify: `docs/spec-changelog.md`

- [ ] **Step 1: Update specs**

Record:

- M5 member management is active.
- Admin member list/detail use bounded reads.
- Withdrawal request sets `WITHDRAWN_PENDING`.
- Manual admin finalization masks User and anonymizes Player.
- `/mypage` no longer eagerly loads full score archive.

- [ ] **Step 2: Run focused tests**

Run:

```bash
npm test -- src/lib/member-lifecycle.test.ts src/lib/admin/members.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run prisma:validate
npm run build
```

Expected: all PASS.

- [ ] **Step 4: Final git review**

Run:

```bash
git status --short
git diff --stat
```

Expected: M5 files changed; user-owned `.gitignore` and `.playwright-mcp/` remain uncommitted unless the user explicitly asks.
