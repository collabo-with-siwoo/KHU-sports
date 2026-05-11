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
- The previous custom domain was represented in `public/CNAME`; Cloudflare DNS would have needed apex records pointing to GitHub Pages IPs and `www` to the GitHub Pages default domain.

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

## 2026-05-11 10:25 KST - M4 readiness review

- M4 depends on the M3 admin RBAC boundary for protected admin write screens, but public-safe read pages and Prisma data-model checks can be evaluated independently.
- Because earlier M3 work is reportedly uncommitted on another machine, starting from `develop` must avoid touching the same admin-auth/RBAC files unless the M3 branch is recovered or merged first.
- Branching directly from current `origin/develop` is unsafe because `origin/develop` is behind `origin/main`; the latest runtime foundation is only on `main`.
- The safest next base is a synced `develop` that fast-forwards to `origin/main`, followed by recovery/merge of the uncommitted M3 work before any admin-write M4 implementation.
- New-direction work is isolated on `feature/results-scorecard-archive` from current `main`, so it can proceed without publishing to `main` until policy/IA/API changes are reviewed.

## 2026-05-11 11:25 KST - M3/M4 continuation

- The pulled M3/M4 baseline covers admin login, permission guards, protected tournament/score pages, and public-safe results.
- Remaining useful M3 completion work is admin profile management and member approval because those are direct prerequisites for score entry and PLAYER access.
- Remaining useful M4 completion work is the logged-in player's My Page score archive because public `/results` intentionally cannot expose detailed personal score data.
- Admin invite email delivery is still not implemented; `/admin/admins` stores the local admin profile/permissions and requires a matching Supabase Auth user to log in.

## 2026-05-11 12:15 KST - Public scorecard policy shift

- The product direction now treats public Scorecard as a competition-record view, not as a private player profile.
- Public result pages may show score fields such as round scores, 36-hole total, final rank, group, and start time.
- Public result pages still must not read or render `User` private fields or admin-only metadata such as phone, email, birth date, address, guardian contact, player memo, admin memo, or review logs.
- `/results` should become the tournament index, while `/results/[tournamentId]` should own the tabbed Full Leaderboard and Scorecard experience.

## 2026-05-11 12:40 KST - Results API query boundary

- The public read model and My Page read model should be implemented as separate repository functions and DTOs, not as a shared broad query with response filtering afterward.
- Full Leaderboard must use `ADMIN_CONFIRMED` scores only. `tournament_results` can be the materialized ranking source, but it must be recalculated from confirmed submissions and guarded by confirmed-score predicates in public reads.
- The conditional sort rule, `finalRank` first and fallback to `round1Rank`, should happen in SQL so pagination remains deterministic.
- Public player history should use `playerPublicKey` as the stable public identifier. `userId` remains private and belongs only to authenticated My Page queries.
- My Page can expose `playerMemo` because the query is constrained by `tournament_players.userId = session.user.id`; `adminMemo` and review logs stay admin-only.

## 2026-05-11 13:10 KST - Current-schema leaderboard implementation

- The target M4 result tables are not in the Prisma schema yet, so the first `/results/[tournamentId]` implementation maps from the current `Tournament`/`Player`/`Score` schema.
- Public DTO safety is still enforced through explicit selection: player name, affiliation as school, gender only, and score JSON/rank fields. User contact/profile fields are not selected.
- Category, group, tee time, final eligibility, and final rank are read from score JSON if present; otherwise category defaults to `일반부`, group/tee time stay empty, and final eligibility is inferred from a second-round score.
- The Scorecard tab is wired as route state now so Leaderboard buttons can navigate to the future implementation without changing the URL contract later.

## 2026-05-11 - Public Scorecard Runtime Mapping

- Decision: implement public Scorecard search/detail against the current `Tournament`/`Player`/`Score` Prisma schema until the future tournament-player/result tables are introduced.
- Public reads select only competition-safe fields (`Player.name`, `Player.affiliation`, `User.gender`, score rank, score JSON, and tournament metadata). Contact fields, profile birth/address fields, player notes, admin notes, and review logs are not selected or returned.
- Completion: Scorecard search and detail now use separate public DTOs and URL state. Direct `?tab=scorecard&playerId=...` entry renders the public scorecard without exposing private profile or admin-only fields.

## 2026-05-11 - My Page Score Ownership Boundary

- Decision: implement My Page score reads through `User.id -> Player.userId -> Score` while the target `tournament_players` table is not yet available.
- Detail pages must return a 403-style forbidden interrupt when the logged-in user has no linked player score for the requested tournament. My Page DTOs may include `playerMemo` and submission/admin-confirmation state, but must not expose admin memo or review logs.
- Completion: `/mypage/scores` and `/mypage/scores/[tournamentId]` now use owner-only read functions. Current admin-entered `Score` rows default to `관리자 확정`, while future score JSON status fields can represent draft, submitted, rejected, and player memo states.
- Completion: `/mypage/scores` and `/mypage/scores/[tournamentId]` now use owner-only read functions. Current admin-entered `Score` rows default to `愿由ъ옄 ?뺤젙`, while future score JSON status fields can represent draft, submitted, rejected, and player memo states.

## 2026-05-11 - Score Publication State Boundary

- Decision: use `Score.scoreData.status` as the runtime submission-state bridge until dedicated score-submission/result tables are introduced.
- Public reads must pass the confirmed-score predicate before mapping DTOs. `DRAFT`, `SUBMITTED`, and `ADMIN_REJECTED` rows remain visible only to the owner/admin.
- Admin confirmation is the publication event: it writes `ADMIN_CONFIRMED`, clears rejection fields, recalculates tournament ranks from confirmed rows, and revalidates public result and My Page surfaces.
- Admin rejection writes `ADMIN_REJECTED` plus `rejectionReason`; the reason is visible to the owner and admin but is not returned by public leaderboard or Scorecard DTOs.

## 2026-05-11 - Result Search Contract

- Decision: use one shared filter vocabulary for Full Leaderboard, public Scorecard search, and tournament-level admin score search: name, school, category, gender, group number, rank range, final-day-only, sort key, sort direction, and page.
- MVP search normalizes whitespace and letter case for player names and schools. Korean initial-consonant search is deliberately deferred.
- Current schema does not yet have materialized `tournament_results`, so filtering/sorting is performed server-side after minimal Prisma selects. When the target tables are introduced, the same contract should move closer to SQL with indexes/materialized rank fields.

## 2026-05-11 - Admin Score Export Boundary

- Decision: implement four separate tournament export types behind one route family so each export type can enforce its own data boundary.
- Public leaderboard and scorecard exports use confirmed-score rows and do not select contact/profile PII.
- Admin score-status export can include admin memo and player memo for operations, but still excludes contact/profile PII.
- Personal-info export is intentionally separate, requires `SUPER` or `privacy.export`, requires a human-entered reason, and writes `ExportLog`.
- Current schema has no guardian contact field, so that export column stays blank until the user/profile model adds a source field.

## 2026-05-11 - M4 QA Privacy Fix

- Decision: player-visible rejection reason must come only from `scoreData.rejectionReason`.
- `scoreData.adminMemo` remains admin-only and must not be used as a My Page fallback even when a score is rejected.
- Added Vitest coverage for the My Page DTO boundary so this does not regress silently.

## 2026-05-11 - Pre-Merge Deployment URL

- Decision: stop using the custom-domain marker before this branch is pushed.
- Pre-production review should use the Vercel URL, `https://khu-sports.vercel.app/`, because the current app depends on Vercel/Supabase runtime behavior rather than static hosting.
- The official production domain can be connected later after the final deployment decision.
