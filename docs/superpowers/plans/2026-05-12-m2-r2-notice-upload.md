# M2 R2 Notice Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable RBAC-protected admin notice creation with Cloudflare R2-backed thumbnails and attachments.

**Architecture:** Keep notice creation server-side through a Next.js Server Action. A focused storage module validates upload targets and writes objects to R2; a notice action stores `Notice` and `NoticeAttachment` rows after upload. Public notice reads continue to derive URLs from `R2_PUBLIC_BASE_URL` and stored object keys.

**Tech Stack:** Next.js App Router, Server Actions, TypeScript, Prisma, Cloudflare R2 S3-compatible API, Vitest.

---

### Task 1: Notice Upload Storage Boundary

**Files:**
- Create: `src/lib/r2-storage.ts`
- Test: `src/lib/r2-storage.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import {
  buildPublicR2Url,
  createNoticeObjectKey,
  validateNoticeUpload
} from "./r2-storage";

describe("notice R2 storage helpers", () => {
  it("builds stable notice object keys with sanitized filenames", () => {
    expect(createNoticeObjectKey("notice-id", "제27회 경희대학교 총장배 전국 골프대회.png")).toMatch(
      /^notices\/notice-id\/[a-f0-9-]+-27\.png$/
    );
  });

  it("rejects unsupported notice upload types", () => {
    const result = validateNoticeUpload({
      name: "script.exe",
      size: 100,
      type: "application/x-msdownload"
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("지원하지 않는 파일 형식");
  });

  it("builds public R2 URLs without duplicate slashes", () => {
    expect(buildPublicR2Url("https://pub.example.r2.dev/", "/notices/a/file.pdf")).toBe(
      "https://pub.example.r2.dev/notices/a/file.pdf"
    );
  });
});
```

- [ ] **Step 2: Run RED**

Run: `npm test -- src/lib/r2-storage.test.ts`

Expected: FAIL because `src/lib/r2-storage.ts` does not exist.

- [ ] **Step 3: Implement minimal storage helpers**

Add validation for public notice images and documents, key generation under `notices/{noticeId}/`, URL building, and an R2 upload function using the S3-compatible client.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/lib/r2-storage.test.ts`

Expected: PASS.

### Task 2: Admin Notice Create Action

**Files:**
- Create: `src/app/admin/notices/actions.ts`
- Modify: `src/app/admin/notices/new/page.tsx`
- Test: `src/app/admin/notices/actions.test.ts`

- [ ] **Step 1: Write failing action tests**

Test validation rejects blank title/content and maps uploaded files into Prisma create payloads through an injectable implementation helper.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/app/admin/notices/actions.test.ts`

Expected: FAIL because action module does not exist.

- [ ] **Step 3: Implement action and form**

Create `createNoticeAction`, validate input with zod, upload thumbnail and attachments to R2, persist the notice, revalidate `/`, `/notices`, `/admin/notices`, and redirect to the new detail page.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/app/admin/notices/actions.test.ts`

Expected: PASS.

### Task 3: Public/Admin Notice UI Polish And Docs

**Files:**
- Modify: `src/app/admin/notices/page.tsx`
- Modify: `src/app/notices/[id]/page.tsx`
- Modify: `docs/specs.md`
- Modify: `docs/context.md`

- [ ] **Step 1: Update UI copy and attachment rendering**

Ensure admin list points to the active creation flow, and public details render uploaded attachments through the existing read model.

- [ ] **Step 2: Run verification**

Run:

```powershell
npm test
npm run typecheck
npm run lint
npm run prisma:validate
npm run build
```

Expected: all commands exit 0.
