# KHU Sports Service Specs

> Source of truth derived from `PRD/04_golf_PRD.md` v0.3. Keep this file synchronized with code changes.

## Milestone Status

- Current milestone: M4, tournaments and scores foundation.
- M0 scope in this repository: Next.js App Router scaffold, TypeScript strict mode, Prisma schema validation, environment variable template, and documentation baseline.
- External M0 tasks still require human/account work: Cloudflare R2 buckets, Resend domain, production domain DNS verification.
- Visual foundation: public user view follows the Stitch "Majestic Green" direction with a hero image, sticky desktop navigation, mobile bottom navigation, bento-style quick links, notice modules, and result summary modules.
- M1 runtime foundation: login, signup, reset-password, and terms pages exist with Supabase Auth and Prisma-backed profile/agreement persistence. Vercel is the active review runtime because these Server Actions require server execution.
- M2 notice foundation: public notice reads use Supabase `Notice` rows when available and fall back to PRD-aligned seed notices for empty or not-yet-migrated environments. Homepage latest notices, `/notices`, and `/notices/[id]` share the same read model.
- M3 admin foundation: `/admin` signs administrators in through Supabase Auth and authorizes access through local `AdminUser` rows. `SUPER` admins bypass menu permissions; `MEMBER` admins require `permissions` JSON grants. Admin/member management screens are available behind RBAC.
- M4 result foundation: `/results` reads Prisma `Tournament`, `Player`, and `Score` rows when available and falls back to seed summaries. Admin tournament/score screens provide protected create/update foundations, `/results/[tournamentId]` now supports Full Leaderboard plus public Scorecard lookup, and `/mypage/scores` reads the logged-in player's personal score archive.
- Review deployment: use `https://khu-sports.vercel.app/` until the official production domain is connected.

## Technology Decisions

- Frontend/backend: Next.js App Router, TypeScript.
- ORM: Prisma.
- Database: Supabase PostgreSQL.
- Deployment build: `postinstall` runs `prisma generate` so Vercel can build server-rendered Prisma pages reliably.
- Auth: Supabase Auth with app-level `User.username` mapped to `User.email` for login.
- File storage: Cloudflare R2 via presigned URLs.
- Forms: zod validation.
- Rich text: Tiptap content stored as sanitized HTML or JSON.

## Legal/Privacy Policy

- 주민등록번호 is not collected. Birth date is used instead.
- Dormant account policy: 1-year automatic dormant conversion is not treated as a statutory duty. `DORMANT` remains a reserved optional state until final policy review.
- MVP default: no automatic 335-day notice or 365-day dormant transition.
- Withdrawal policy: user enters `WITHDRAWN_PENDING`, login is blocked, recovery is possible within 30 days, and personal data is deleted or masked after the grace period.
- Player records may be anonymized and preserved for official school sports record purposes.

## Roles And Access

- Public users can read home, notices, tournament result indexes, full leaderboards, and public scorecards.
- Logged-in users can access mypage and only their own detailed scorecards.
- Admin members can access only permitted admin menus.
- Super admins bypass menu permission JSON and can manage other admins.
- Public tournament result payloads may return only public competition fields: rank, player name, school, participation type, gender, round scores, 36-hole total, final rank, group, and start time.
- Public tournament result payloads must never return phone, email, birth date, address, guardian contact, player memo, admin memo, or admin review/audit logs.
- Admin login requires both a Supabase Auth user and a matching active `AdminUser.email`.

## Core Models

- `User`: app profile linked 1:1 to Supabase Auth ID.
- `AdminUser`: admin authorization profile, also linked to a Supabase Auth account by email.
- `AgreementTemplate`: editable agreement slot such as terms, privacy, or marketing.
- `AgreementVersion`: immutable published agreement body/version.
- `UserAgreement`: evidence of user agreement by version ID, timestamp, and IP.
- `Sport`: sport dimension, seeded with `GOLF`.
- `Player`: sport-specific player profile. Active players have `userId`; anonymized players may not.
- `Tournament`: event metadata.
- `Score`: tournament/player/round score with sport-specific JSON data.
- `Notice` and `NoticeAttachment`: public/admin notice system with R2-backed assets.

## Environment Variables

Required for full deployment:

```bash
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_PUBLIC
R2_BUCKET_PRIVATE
R2_PUBLIC_BASE_URL
RESEND_API_KEY
NEXT_PUBLIC_SITE_URL
INITIAL_SUPER_ADMIN_EMAIL
SESSION_MAX_AGE_HOURS
```

## M1 Implementation Notes

- Sign-up must validate username, password, Korean name, birth date, gender, phone, email, address, and age 14+ check.
- Sign-up must dynamically load active agreement templates and latest effective versions.
- Login must accept username/password, look up the email server-side, then authenticate with Supabase Auth.
- Error messages should not reveal whether a username exists.

## M1 Implemented Runtime Contracts

- `/login`: accepts `username` and `password`, validates with `loginSchema`, looks up the local `User.email`, signs in through Supabase Auth, sets Supabase session cookies, updates `lastLoginAt`, and redirects to `/mypage`.
- `/signup`: accepts username, password, confirmation, Korean name, birth date, gender, phone, email, address, active agreement version IDs, and age confirmation. It creates a Supabase Auth user, persists the local `User` profile with `id = auth.users.id`, records `UserAgreement` rows, and redirects to `/login?signup=success`.
- `/login?signup=success`: shows a modal explaining that signup is complete, a verification email was sent, and normal login is available after email verification.
- `/reset-password`: accepts email and calls Supabase Auth password reset. The response stays generic so account existence is not disclosed.
- `/terms`: renders active agreement versions from Prisma when available, falling back to UUID seed agreements.
- `/mypage`: reads the Supabase session and displays the linked local `User` profile when logged in.
- Session persistence: middleware refreshes Supabase SSR cookies on navigation so login persists across pages. The app also writes an HTTP-only `khu_app_session_started_at` cookie on member login and expires the Supabase session when that app session exceeds `SESSION_MAX_AGE_HOURS`, defaulting to 12 when unset.
- `src/lib/agreements.ts`: UUID seed source for first-run agreement fallback.
- `src/lib/agreement-service.ts`: Prisma-backed active agreement loader and default agreement seeder.
- `src/lib/auth/schemas.ts`: zod schemas for M1 inputs; signup schema can be created with dynamic required agreement version IDs.
- `src/app/(auth)/actions.ts`: Server Actions for signup, login, and reset-password.
- `src/lib/supabase/server.ts`: Supabase SSR client and service-role admin client helpers.
- `npm run db:push`: applies the Prisma schema to the configured Supabase PostgreSQL database.
- `npm run db:seed`: creates the `GOLF` sport row and initial active agreement templates/versions.

## M2 Notice System Contracts

- `src/lib/prisma.ts`: shared Prisma client singleton for server-side data access.
- `src/lib/notices.ts`: notice read model and seed fallback. It exposes published notice list/detail reads, admin list reads, category labels, and static params for seed detail pages.
- `/`: latest notice module reads the first three published notices from the shared notice source.
- `/notices`: public notice list shows category tabs, search/filter controls, and published notice cards.
- `/notices/[id]`: public detail route renders sanitized notice HTML and public attachment links when available.
- `/admin/notices`: admin management list reads all notice rows when available and otherwise shows seed notices for layout validation.
- `/admin/notices`: requires `notices.read`.
- `/admin/notices/new`: requires `notices.write`; rich-text persistence and R2 upload remain future notice-write work.
- Notice content stored as HTML must be sanitized before persistence. The current detail route assumes persisted admin-authored HTML has already passed that sanitization boundary.
- R2 upload integration is not active yet. `NoticeAttachment` public URLs are derived from `R2_PUBLIC_BASE_URL` only for public attachments.

## M3 Admin RBAC Contracts

- `/admin`: shows the login form when no active admin is signed in; shows an authorized admin dashboard when a Supabase session maps to an `AdminUser` with `status = ACTIVE`.
- Admin login accepts email/password directly through Supabase Auth, then verifies the local `AdminUser` profile.
- `src/lib/admin/auth.ts` exposes `getCurrentAdmin`, `requireAdmin`, `requireAdminPermission`, and `canAccessAdmin`.
- `SUPER` administrators can access all admin modules. `MEMBER` administrators require permission JSON such as `{ "scores": { "read": true, "write": false } }`.
- `/admin/admins`: requires `admins.read`; the upsert form requires `admins.write` and stores admin role, status, and menu permission JSON.
- `/admin/members`: requires `members.read`; the approval form requires `members.write` and can switch users between `GENERAL` and `PLAYER`. Switching to `PLAYER` creates or updates the golf `Player` profile.
- `npm run db:seed` seeds `INITIAL_SUPER_ADMIN_EMAIL` as `SUPER/ACTIVE` when the environment variable is present. A matching Supabase Auth user must also exist for login.

## M4 Tournament And Score Contracts

- `src/lib/results.ts` is the shared read model for public result summaries and admin tournament/score lists.
- `/results`: tournament index route. It lists ongoing and completed tournaments with name, venue, period, status, and a result-view action.
- `/results/[tournamentId]`: tournament result detail route. It defaults to the Full Leaderboard tab and also provides a public Scorecard tab.
- Full Leaderboard columns: rank, player name, school, participation type, gender, 1R, 2R, 36-hole total, final-day qualification, group, start time, and a Scorecard view action.
- Full Leaderboard filters: player name, school, participation type, gender, rank range, and final-day qualifiers only. Mobile uses card-style rows.
- Implemented `/results/[tournamentId]` Full Leaderboard reads through `getTournamentLeaderboard(tournamentId, filters)`. Search filters are synchronized with URL query params: `name`, `school`, `category`, `gender`, `finalOnly`, and `page`.
- The current runtime schema maps the public DTO from existing `Tournament`/`Player`/`Score` rows until the target `tournament_players`/`score_submissions`/`tournament_results` tables are added. It selects only `Player.name`, `Player.affiliation`, `User.gender`, and score JSON/rank fields; it does not select private user contact/profile fields.
- Implemented `/results/[tournamentId]` Scorecard reads through `searchTournamentPlayers(tournamentId, filters)` and `getPublicPlayerScorecard(tournamentId, tournamentPlayerId)`. Search filters are synchronized with URL query params: `tab=scorecard`, `name`, `school`, `category`, `gender`, and `playerId`.
- Scorecard tab starts with the empty prompt `선수명을 검색해 스코어카드를 확인하세요.`, supports player/school/category/gender search, shows `검색 결과가 없습니다.` when empty, and displays the selected player's public competition scorecard.
- Scorecard public fields: player name, school, participation type, gender, tournament name, round, front9, back9, roundTotal, 36-hole total, final rank, group, and start time.
- `/admin/tournaments`: requires `tournaments.read`; the create action requires `tournaments.write` and creates `GOLF` tournaments.
- `/admin/scores`: requires `scores.read`; the score action requires `scores.write`, finds an existing member by email, creates or updates that member's `Player` profile, promotes the member to `PLAYER`, and upserts the round score.
- `/mypage`: PLAYER users see a summary entry point for their own tournament archive. GENERAL users see a player-approval notice.
- `/mypage/scores`: requires a logged-in member. GENERAL users see `선수 등록이 필요합니다`; PLAYER users see their own tournament list with tournament name, venue, period, rank, 1R, 2R, 36-hole total, status, and detail links.
- `/mypage/scores/[tournamentId]`: requires a logged-in member. GENERAL users see `선수 등록이 필요합니다`; PLAYER users can view only scores linked through `Player.userId = session.user.id`. Missing ownership calls `forbidden()` and renders the app-level 403 page.
- Implemented My Page score reads through `getMyScoreHistory(userId)` and `getMyTournamentScoreDetail(userId, tournamentId)`. The current runtime schema maps these DTOs from `User -> Player -> Score` until the target `tournament_players` and `score_submissions` tables are added.
- My Page score detail fields: tournament name, venue, period, player name, school, participation type, gender, group/start time, rank, front9/back9/roundTotal by round, 36-hole total, playerMemo, submission status, and admin confirmation state.
- My Page status labels support `아직 스코어 미입력`, `임시저장`, `제출 완료`, `관리자 확정`, and `반려됨`. Current admin-entered `Score` rows default to `관리자 확정`; future `scoreData.status`, `scoreData.submissionStatus`, `scoreData.adminConfirmed`, and `scoreData.playerMemo` values override that compatibility default.
- My Page score DTOs may expose `playerMemo` from score JSON to the owner only. They do not expose admin memo or review logs.
- Current manual score entry stores golf score data as `{ front9, back9, total, par }`. Excel upload and hole-by-hole scorecards remain future M4/M5 slices.
- Detailed IA and data-flow notes live in `docs/results-ia.md`.
- Full Leaderboard and public Scorecard query/API design lives in `docs/results-api-design.md`.
- Public leaderboard reads must use confirmed score data only: `score_submissions.status = ADMIN_CONFIRMED`.
- Public leaderboard sorting uses `finalRank` first when present and falls back to `round1Rank`; DB-level conditional ordering is preferred so pagination remains stable.
- Public results DTOs are separated from My Page DTOs. Public DTOs include only `PublicLeaderboardRow` and `PublicScorecard` fields; My Page uses `MyScoreHistory` and self-only detail DTOs.
- Public scorecard/player-history APIs must use `playerPublicKey` or tournament-player IDs rather than exposing private `userId`.
- My Page score APIs must derive the player from `session.user.id` and require `tournament_players.userId = session.user.id`; they may return `playerMemo` but never `adminMemo`.

### M4 Score Submission State Integration

- `/mypage/scores/[tournamentId]/input/round/[round]`: logged-in `PLAYER` users may create/update their own round score against the current `User -> Player -> Score` schema. Save writes `scoreData.status = DRAFT`; submit writes `scoreData.status = SUBMITTED`. `ADMIN_CONFIRMED` scores are locked against player edits.
- `/mypage` and `/mypage/scores` surface primary score-input CTAs for currently ongoing golf tournaments so approved PLAYER users can start from My Page without knowing the deep input URL.
- Player input actions are available for `NOT_STARTED`, `DRAFT`, and `ADMIN_REJECTED` rounds only. `SUBMITTED` and `ADMIN_CONFIRMED` rounds are read-only to players.
- Score input is limited to the tournament date window using `Tournament.startDate` through `Tournament.endDate` until a dedicated score-input window model is introduced.
- The score input form automatically calculates `roundTotal` from `front9 + back9`; the server action still validates the same sum before writing.
- Score submission states are normalized to `DRAFT`, `SUBMITTED`, `ADMIN_CONFIRMED`, and `ADMIN_REJECTED`. My Page renders the required user-facing status messages for every state.
- Public `/results`, Full Leaderboard, and public Scorecard filter runtime rows through the confirmed-score predicate; only `ADMIN_CONFIRMED` compatible score data is exposed publicly.
- `/admin/scores` can confirm or reject existing score rows. Confirmation writes `scoreData.status = ADMIN_CONFIRMED`, clears rejection fields, recalculates tournament ranks from confirmed scores, and revalidates result/My Page surfaces. Rejection writes `scoreData.status = ADMIN_REJECTED`, clears public rank, and stores `scoreData.rejectionReason`/`scoreData.adminMemo` for owner/admin views.
- Player-facing DTOs may expose rejection reason to the owner. Public DTOs never return `playerMemo`, `adminMemo`, `rejectionReason`, or review logs.

### M4 Result Search And Sorting

- Full Leaderboard and public Scorecard search support URL query params for `name`, `school`, `category`, `gender`, `groupNo`, `rankMin`, `rankMax`, `finalOnly`, `sortBy`, `sortDir`, and `page`.
- Name and school searches are partial-match, whitespace-insensitive, and case-insensitive. Korean initial-consonant search remains outside MVP scope.
- Supported sort keys are `rank`, `name`, `school`, `round1`, and `total36`; supported directions are `asc` and `desc`.
- Search/filter/sort work is performed in server read functions before pagination. Current runtime filtering is in the server process over explicitly selected `Tournament`/`Player`/`Score` fields; future table work should add indexes on tournament/player lookup columns and JSON-derived result fields or materialized result rows.
- `/admin/tournaments/[tournamentId]/scores` provides the admin tournament-level score search view with the same search/filter/sort contract.

### M4 Admin Score Export Contracts

- `exceljs` is used for server-side `.xlsx` workbook generation. SheetJS was avoided because the current npm package reports high-severity advisories with no available fix.
- `/admin/tournaments/[tournamentId]/exports/leaderboard` requires `scores.read` and exports the public Full Leaderboard columns only: rank, player name, school, category, gender, 1R, 2R, 36-hole total, final rank, final-day eligibility, group, and start time.
- `/admin/tournaments/[tournamentId]/exports/admin-scores` requires `scores.read` and exports the administrator score-status view: player identity by competition fields, round totals, round statuses, 36-hole total, final rank, player submitted date, admin confirmed date, rejection flag, admin memo, and player memo. It does not select or include private contact fields.
- `/admin/tournaments/[tournamentId]/exports/scorecards` requires `scores.read` and exports confirmed public scorecard round details: player name, school, category, gender, round, front9, back9, roundTotal, group, and start time.
- `/admin/tournaments/[tournamentId]/exports/private` is restricted to `SUPER` admins or `privacy.export` members. It requires a `reason` query parameter, may include phone, email, and birth date, and records an `ExportLog` row with `adminUserId`, `exportType`, `tournamentId`, `exportedAt`, `rowCount`, and `reason`.
- The current `User` model does not store guardian contact, so the private export keeps the guardian contact column present but blank until a source field is introduced.
- Player self-submission now writes `scoreData.submittedAt` on submit. Admin confirmation writes `scoreData.adminConfirmedAt` and rejection writes `scoreData.rejectedAt` so exports can display operational timestamps.
- `AdminUser.permissions` now supports the `privacy` permission key and `export` action in addition to existing read/write menu grants.

### M4 QA And Test Coverage

- `npm test` runs Vitest unit tests for Full Leaderboard, public Scorecard, My Page score ownership/privacy, and admin export authorization/logging boundaries.
- QA checklist for Full Leaderboard, Scorecard, My Page Score, and Admin Export lives in `docs/qa-results-score-features.md`.
- Player-visible rejection reason must come only from `scoreData.rejectionReason`; `scoreData.adminMemo` is admin-only and must not be used as a fallback in My Page DTOs.

## Vercel Review Deployment

- Review URL: `https://khu-sports.vercel.app/`.
- Vercel is the active pre-production runtime for signup/login persistence, Prisma-backed result pages, admin workflows, and My Page score features.
- Do not commit `public/CNAME` or configure a custom production domain before the official deployment decision.

## Visual Interaction Notes

- Stitch baseline screens use an app-style top bar, mobile bottom navigation, compact page headers, dense cards/lists, and light gray canvas backgrounds for `/`, `/results`, and `/notices`.
- The homepage uses a tournament hero with a golf course image, a next-tournament summary card, bento quick links, a notice panel, and a public mini leaderboard.
- The public leaderboard page presents public competition fields and supports filtering/searching by name, school, participation type, gender, rank range, and final-day qualification.
- Public Scorecard is a competition-record view, not a private profile view. It must not render phone, email, birth date, address, guardian contact, player memo, admin memo, or admin review logs.
- The notices page uses category tabs and a feed layout; desktop screens add a left sidebar while mobile screens rely on the bottom navigation.
- Public navigation uses hover lift/color transitions.
- Homepage quick-link cards, notice rows, result rows, subpage cards, and admin preview modules provide hover feedback.
- Public result views may show public scorecards, but only with approved public competition fields.
- Player registration copy points users toward email submission and admin approval instead of implementing a direct public player-registration workflow.
- `/admin` is Supabase/RBAC backed; admin subpages must call `requireAdminPermission`.
- Admin notice rich-text write controls remain disabled until Tiptap/R2 persistence is implemented, even though M3 access checks are active.

## Verification Commands

```bash
npm run typecheck
npm run lint
npm run prisma:validate
npm test
```
