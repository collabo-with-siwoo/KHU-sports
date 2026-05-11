# Agent Discussion

## 2026-05-10 19:05 KST - git pull

- The local repository was missing the required `docs/` tracking files referenced by AGENTS.md.
- Created minimal session/discussion documents so the required workflow can be recorded before running `git pull`.
- Completion: `git pull` succeeded with no incoming changes.

## 2026-05-10 19:10 KST - PRD analysis

- PRD v0.3 is readable in UTF-8 and contains the main implementation source of truth.
- The project remains in M0/spec review. `docs/specs.md` is absent, so detailed executable specs should be created before implementation begins.
- Key risk: The PRD's dormant-account language should be rechecked against current Korean privacy-law practice before it is implemented as a mandatory legal workflow.
- Implementation posture: Treat the PRD as product policy, then convert it into `docs/specs.md` with data model, API routes/server actions, authorization rules, and lifecycle jobs.

## 2026-05-10 19:18 KST - M0 project foundation

- Updated dormant account policy to reflect current interpretation: automatic 1-year dormancy is not a statutory MVP requirement after 개인정보 유효기간제 removal.
- Created backlog entries for missing specs and final legal review of the dormant-account policy.
- Chose Prisma as the ORM for the initial schema because it aligns with the repository verification protocol and PRD data model.
- Chose Next.js 15.5.18 instead of latest Next 16 because the project's required verification still uses `next lint`, which Next 15 supports.

## 2026-05-10 19:35 KST - User view visual layout

- The KPGA site was used as a high-level reference for sports-site information hierarchy, not as a source for copied branding or assets.
- The public homepage should feel like a tournament hub: hero, notice stream, result/leaderboard, and quick access to key user tasks.
- The admin entry can look like a login screen now, while remaining non-functional until the M3 Supabase Auth/RBAC work.

## 2026-05-10 19:50 KST - M1 auth and agreements

- Because the external Supabase project is not configured yet, M1 starts with local validation and pages.
- Agreement templates are represented as seed data for now; the same display-order/required/version concepts will move to Prisma-backed reads.
- Auth forms deliberately return generic states so username existence is not exposed before the real Supabase lookup is added.

## 2026-05-10 20:05 KST - GitHub Pages and Cloudflare domain

- GitHub Pages can host the current site only as a static preview. Real Supabase-backed login/signup persistence needs a server runtime later.
- To make the Pages export work, M1 forms now use client-side zod validation instead of Server Actions.
- `khu-sports.com` is represented in `public/CNAME`; Cloudflare DNS must point the apex records to GitHub Pages IPs and `www` to the GitHub Pages default domain.

## 2026-05-10 22:07 KST - Stitch design integration

- The Stitch commit added static HTML and design references, but the GitHub Pages workflow deploys the Next.js `out/` directory, so the design must be ported into `src/app`.
- Use Stitch's Majestic Green direction, bento-style sections, sticky desktop navigation, and mobile bottom navigation as the visual source.
- Keep MVP copy aligned with the PRD: no real-time scoring claims, no payment flow, public result summaries only, and player registration via email/admin approval.

## 2026-05-10 22:45 KST - Stitch baseline redesign correction

- The first integration preserved too much of the earlier homepage composition.
- The corrected direction should treat the Stitch HTML files as the baseline screen architecture: fixed TopAppBar, app-like mobile bottom navigation, surface-container cards, leaderboard table/list, and notice-card feed.
- Completion: `/`, `/results`, and `/notices` now use the Stitch screen architecture and passed desktop/mobile screenshot checks. Public leaderboard copy remains summary-only until M4 data and update flows exist.
- Any Stitch copy that implies true real-time scoring should be softened to "공개 리더보드" until M4 data and update flows exist.

## 2026-05-11 00:17 KST - M2 notice system foundation

- Vercel/Supabase setup is now available, but the repository has no Prisma migration files yet; the application should tolerate an empty or not-yet-migrated database while the schema rollout is prepared.
- M2 public reads can safely connect to Supabase first and fall back to PRD-aligned seed notices when no rows exist or the database is unavailable.
- Admin notice write actions should not be exposed publicly before real admin authentication and RBAC are wired. The M2 admin screens therefore establish layout and data contracts while keeping submit controls disabled until M3.
- Tiptap/R2 integration remains the next notice-system slice: sanitized rich text should populate `Notice.content`, while uploaded assets should create `NoticeAttachment` records backed by Cloudflare R2 keys.

## 2026-05-11 00:35 KST - M1 Supabase auth persistence

- Username login should remain an app-level feature: the app looks up `User.username` in Prisma, then signs into Supabase Auth with the mapped email.
- `User.id` is stored as the Supabase Auth user UUID so local profile rows and auth users remain 1:1 without an extra mapping table.
- Signup needs two writes: Supabase Auth user creation and Prisma profile/agreement persistence. If Prisma persistence fails after auth creation, the service-role client deletes the new auth user to avoid orphans.
- Agreement seed IDs were converted to UUIDs because `UserAgreement.agreementVersionId` references `AgreementVersion.id`.
- `db:push` and `db:seed` are explicit operator steps. Vercel `postinstall` generates Prisma Client, but it must not silently mutate the production database during deploy.
- Local `.env` currently points `DATABASE_URL` at `localhost`, so production Supabase schema push was not executed in this session.

## 2026-05-11 00:50 KST - Supabase schema application

- The updated `.env` points to the Supabase pooler and the runtime connection succeeds.
- Prisma `db push` reported an empty schema engine error, even though the runtime connection could query successfully. To avoid blocking setup, Prisma's generated SQL diff from an empty database was executed directly through the Prisma connection.
- The schema was verified by checking the expected core tables and the seeded `Sport`/`AgreementVersion` counts.
- Future schema changes should ideally move to tracked Prisma migrations before production data exists in volume. For this first empty-database setup, direct execution of the generated SQL is acceptable and recorded here.

## 2026-05-11 08:26 KST - Signup email verification UX

- Successful signup should not leave users on the same page with an ambiguous status message.
- The app redirects to login and opens a modal that explicitly tells users to verify the email address they entered before attempting normal login.

## 2026-05-11 08:33 KST - M3 verification and M4 direction

- M3 was not actually complete at the start of this branch. The schema had `AdminUser`, but admin routes did not check Supabase sessions or menu permissions.
- The minimum M3 completion bar is now: Supabase Auth session, active `AdminUser` profile, `SUPER` bypass, and `MEMBER` permission JSON checks before every admin subpage.
- `INITIAL_SUPER_ADMIN_EMAIL` seeds the local admin profile, but a matching Supabase Auth user must exist because login is still performed through Supabase Auth.
- M4 public results must stay privacy-safe. The public page can show leaderboard and round totals, but hole-by-hole scorecards remain limited to the logged-in player or admin.
- M4 starts with manual score entry for existing members. Excel upload, Tiptap notice persistence, and R2 attachments remain separate follow-up slices.
