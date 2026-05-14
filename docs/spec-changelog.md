# Spec Changelog

## 2026-05-14 - M7 Beta Security Hardening

- Created `feature/m7-beta-security-hardening`.
- Added M7 design and implementation plan documents under `docs/superpowers/`.
- Added app-level fixed-window rate limiting for member login, admin login, signup, password reset, and player score submission.
- Added regression coverage for the shared limiter, action-specific rate limit profiles, and admin permission boundaries.
- Added a nullable `ExportLog.tournamentId -> Tournament.id` FK with `ON DELETE SET NULL`.
- Added `docs/qa-m7-beta-security.md` for beta security controls, operator checks, and deferred hardening items.
- Added M7-B public DTO privacy regression tests to catch accidental raw `scoreData`, `Player`, or `User` exposure in public result responses.
- Added M7-C same-origin guard coverage for admin tournament export routes.
- Added M7-D `npm run qa:beta-security` preflight checks for beta env readiness without secret-value output.

## 2026-05-13 - M6 UI QA Polish

- Created `feature/m6-ui-qa-polish`.
- Added Korean M6 design, implementation plan, and QA scan documents under `docs/superpowers/` and `docs/qa-m6-ui-polish.md`.
- Added bounded public query timeouts for public notice and result reads so seed fallback can render quickly when Supabase is slow or unreachable.
- Polished mobile `/notices` category tabs and mobile `/results` overview table to avoid awkward viewport overflow.
- Updated CSP to allow the Pretendard CDN stylesheet and font files already used by the app UI.
- Synchronized milestone tracking so M5 is marked closed in the implementation plan and `docs/specs.md` now points to M6 as the active milestone.
- Raised the default public query timeout from 1.5s to 4.5s so uploaded notice data is less likely to fall back to seed examples on slower public requests while staying under the 5-second loading target.
- Updated the notice seed fallback to keep the 27th KHU tournament application notice as the first public notice instead of the old initial example notice.
- Closed M6 after production mobile verification confirmed `/notices` renders the 27th tournament notice from the deployed build.

## 2026-05-13 - Security Report Follow-Up Hardening

- Reviewed the M0-M4 security and improvement report and split follow-up items into safe-now fixes and later backlog items.
- Added global Next.js security headers and a CSP, and restricted optimized remote images to Google profile images plus Cloudflare R2 hosts.
- Added regression coverage for the security header/image host configuration.
- Added a session-owned player lookup helper for score input actions and covered its Prisma query boundary with a unit test.
- Added normalized `Score` column dual writes for player submission and admin confirmation/rejection while keeping JSON `scoreData` compatibility.
- Serialized tournament rank recalculation with a tournament-scoped PostgreSQL advisory transaction lock.
- Added public result fallback logging so database read failures are visible in server logs instead of silently falling back.

## 2026-05-10 - M0 Foundation

- Created the initial executable specs document from PRD v0.3.
- Updated dormant-account policy to reflect current legal interpretation: automatic 1-year dormant conversion is not treated as a statutory duty.
- Added backlog records for missing specs and dormant-account legal review.
- Added initial Next.js/Prisma M0 project foundation.
- Verified M0 foundation with typecheck, lint, Prisma schema validation, and production build.

## 2026-05-10 - User View Visual Layout

- Created `feat/m0-user-view-layout` branch for the public visual pass.
- Reworked the public homepage into a client-review-ready sports site layout inspired by KPGA-level content patterns without copying branded assets.
- Added hover interactions for navigation, quick links, notice rows, rankings, and admin preview modules.
- Reworked `/admin` into a polished login-like shell that will later connect to Supabase Auth/RBAC.
- Verified with typecheck, lint, Prisma validation, production build, and local 200 checks for `/` and `/admin`.

## 2026-05-10 - M1 Auth And Agreements Foundation

- Created `feat/m1-auth-agreements` branch.
- Added login, signup, reset-password, and terms pages.
- Added zod schemas for username login, signup, age confirmation, required agreement checks, and password reset email.
- Added static-preview client validation for GitHub Pages compatibility.
- Added temporary active agreement seed data until AgreementTemplate/AgreementVersion persistence is wired.
- Verified with typecheck, lint, Prisma validation, production build, and local 200 checks for `/login`, `/signup`, `/terms`, and `/reset-password`.

## 2026-05-10 - GitHub Pages And Cloudflare Domain

- Added GitHub Pages deployment workflow for static Next.js export.
- Added a custom-domain marker for the earlier GitHub Pages preview plan.
- Added `.nojekyll` for GitHub Pages static asset serving.
- Added `docs/deployment.md` with Cloudflare DNS records and GitHub Pages setup steps.
- Added conditional Next.js export mode via `GITHUB_PAGES=true`.
- Reworked M1 forms from Server Action usage to client validation so the static GitHub Pages export succeeds.
- Verified `GITHUB_PAGES=true npm run build:pages` exports to `out/` and includes `out/CNAME`.

## 2026-05-10 - Hero Title Wrapping

- Adjusted public and admin hero title sizing so desktop Korean headings stay on one line.
- Preserved normal wrapping on small mobile screens.

## 2026-05-10 - Stitch Next.js UI Integration

- Created `feat/stitch-next-ui` branch.
- Ported the Stitch "Majestic Green" design direction into the Next.js App Router pages.
- Replaced corrupted Korean UI copy across public, auth, terms, mypage, results, and admin pages.
- Kept non-MVP functionality visual-only: no live scoring claims, no payment flow, no direct public player approval, and no public detailed scorecard.
- Updated visual interaction specs for quick-link cards, notice rows, result rows, subpage cards, and admin modules.
- Verified with typecheck, lint, Prisma validation, production build, static GitHub Pages export build, and local content checks.

## 2026-05-10 - Stitch Baseline Correction

- Replaced the previous public page shell on `/`, `/results`, and `/notices` with the Stitch app-style baseline.
- Added fixed top app bars, mobile bottom navigation, compact headers, dense cards/lists, leaderboard rows, notice tabs, and desktop notice sidebar behavior.
- Kept PRD privacy constraints in the leaderboard: public screens show result summaries only, not detailed scorecards.
- Verified with typecheck, lint, Prisma validation, production build, static GitHub Pages export build, and Playwright desktop/mobile screenshots for the three public screens.

## 2026-05-11 - M2 Notice System Foundation

- Created `feature/m2-notices-system` from `develop`.
- Added a shared Prisma client helper for server-side data access.
- Added `src/lib/notices.ts` as the M2 notice read model with Supabase-first reads and PRD-aligned seed fallback.
- Connected homepage latest notices and `/notices` to the shared published-notice source.
- Added `/notices/[id]` detail pages with sanitized HTML rendering and public attachment display support.
- Added `/admin/notices` and `/admin/notices/new` screens for the admin notice workflow.
- Documented that admin notice write actions stay disabled until M3 authentication/RBAC is wired.
- Updated shared header/footer Korean copy and refreshed `/admin` module navigation.
- Added `postinstall: prisma generate` for Vercel/Prisma build reliability.
- Removed a stale unused variable in `src/app/results/page.tsx` so lint passes cleanly.

## 2026-05-11 - M1 Supabase Auth Persistence

- Added Supabase SSR server client and service-role admin client helpers.
- Replaced static-preview login/signup/reset-password form handlers with Server Actions.
- Implemented username-to-email login through local Prisma `User` lookup followed by Supabase Auth sign-in.
- Implemented signup persistence: Supabase Auth user creation, local `User` row creation, and `UserAgreement` evidence rows.
- Added cleanup for partially failed signups by deleting the Supabase Auth user when Prisma persistence fails.
- Converted agreement seed version IDs to UUIDs so they can be referenced by `UserAgreement`.
- Added Prisma-backed active agreement loading with seed fallback.
- Added `db:push` and `db:seed` scripts plus `prisma/seed.js` for Supabase schema setup and initial agreement/sport records.
- Updated `/mypage` to read the Supabase session and display the linked local profile.
- Updated deployment documentation with Vercel/Supabase runtime variables and DB setup commands.

## 2026-05-11 - Supabase Schema Applied

- Applied the Prisma schema to Supabase by executing the Prisma-generated SQL diff directly after `prisma db push` returned an empty schema engine error.
- Seeded the `GOLF` sport row and the initial agreement templates/versions.
- Verified the runtime database connection, expected core tables, and seed row counts.

## 2026-05-11 - Signup Completion Redirect

- Changed successful signup to redirect to `/login?signup=success` after Supabase Auth, local `User`, and `UserAgreement` persistence completes.
- Added a login-page success message for completed signup.
- Removed the obsolete static-preview client validation helper so the old "입력값 검증" success path cannot be bundled again.

## 2026-05-11 - Signup Server Exception Hardening

- Wrapped M1 auth Server Action database and Supabase calls so production runtime failures return form-level errors instead of uncaught application errors.
- Made signup cleanup resilient when service-role cleanup cannot run, while still surfacing a clear environment/configuration error to the user.

## 2026-05-11 - Prisma Direct URL Configuration

- Added `directUrl = env("DIRECT_URL")` to the Prisma datasource for Supabase migration/schema operations.
- Updated environment examples and deployment docs to include both pooled `DATABASE_URL` and migration/session `DIRECT_URL`.

## 2026-05-11 - Signup Email Verification Modal

- Added a signup-completion modal on `/login?signup=success`.
- The modal tells users that signup is complete, a verification email was sent, and login works after email verification.

## 2026-05-11 - M3 Admin RBAC And M4 Result Foundation

- Verified that M3 was not complete: admin pages were still visual-only and unprotected.
- Added Supabase-backed admin login and `AdminUser` permission checks through `src/lib/admin/auth.ts`.
- Protected `/admin/notices` and `/admin/notices/new` with `notices.read` and `notices.write`.
- Updated seed logic so `INITIAL_SUPER_ADMIN_EMAIL` creates an active `SUPER` `AdminUser`.
- Added protected `/admin/tournaments` with tournament creation.
- Added protected `/admin/scores` with manual score upsert by existing member email.
- Reworked `/results` to read Prisma tournament/score data with seed fallback and removed public hole-by-hole scorecard exposure.

## 2026-05-11 - M3/M4 Admin And Personal Archive Expansion

- Added `/admin/admins` for RBAC-protected admin profile and permission management.
- Added `/admin/members` for RBAC-protected member approval and GENERAL/PLAYER switching.
- PLAYER conversion now creates or updates the golf `Player` profile from the approved user.
- Added member-specific score archive reads in `src/lib/results.ts`.
- Updated `/mypage` so logged-in PLAYER users can see their own tournament and round score archive.
- Kept public `/results` privacy-safe; detailed personal score data remains in My Page.

## 2026-05-11 - Results IA And Public Scorecard Policy

- Updated PRD policy language so public results now support Full Leaderboard and public Scorecard tabs.
- Defined `/results` as the tournament index for ongoing and completed tournaments.
- Defined `/results/[tournamentId]` as the tabbed tournament detail page with Full Leaderboard and Scorecard.
- Added `docs/results-ia.md` with screen structure, component list, data flow, public fields, private fields, filters, empty states, and mobile behavior.
- Updated `docs/specs.md` with the new public scorecard data contract and privacy boundaries.

## 2026-05-11 - Results API Query Design

- Added `docs/results-api-design.md` for Full Leaderboard, public Scorecard, public player history, and My Page score archive read models.
- Defined separate public and My Page DTO boundaries: `PublicLeaderboardRow`, `PublicScorecard`, and `MyScoreHistory`.
- Specified that public result APIs must read only `ADMIN_CONFIRMED` scores and never select private contact fields, player/admin memo fields, or review logs.
- Specified leaderboard sorting by `finalRank` with fallback to `round1Rank`, preferably at the DB layer for stable pagination.
- Documented Prisma/raw SQL and Supabase-view query patterns plus recommended indexes for search/filter performance.

## 2026-05-11 - Results Detail Full Leaderboard

- Added `/results/[tournamentId]` with the Full Leaderboard tab as the default view.
- Added URL-synchronized filters for name, school, participation category, gender, final-day-only, and pagination.
- Added `getTournamentLeaderboard(tournamentId, filters)` and public `PublicLeaderboardRow` mapping in `src/lib/results.ts`.
- Added Scorecard tab URL state and Scorecard buttons that navigate to `?tab=scorecard&playerId=...`.
- Kept public reads on an allowlisted DTO boundary using current `Tournament`/`Player`/`Score` fields until the target M4 result tables are added.

## 2026-05-11 - Results Detail Public Scorecard

- Implemented the `/results/[tournamentId]` Scorecard tab with URL-synchronized player/school/category/gender search.
- Added `searchTournamentPlayers(tournamentId, filters)` and `getPublicPlayerScorecard(tournamentId, tournamentPlayerId)` with DTOs that return only public competition fields.
- Added Scorecard search result table/mobile cards, selection links that preserve query params, direct `playerId` detail loading, and round cards for Round 1/2 data.
- Added optional hole-score table rendering when public `scoreData` contains `holeScores`, `holes`, or `hbh`.
- Public Scorecard reads continue to avoid selecting or returning phone, email, birth date, address, guardian contact, player memo, admin memo, or review logs.

## 2026-05-11 - My Page Personal Score Archive

- Added `/mypage/scores` for the logged-in PLAYER's tournament score archive.
- Added `/mypage/scores/[tournamentId]` for owner-only tournament score detail.
- Added `src/lib/members.ts` as a shared current-member helper for Supabase session to local `User` lookup.
- Added `getMyScoreHistory(userId)` and `getMyTournamentScoreDetail(userId, tournamentId)` with owner-only DTOs that may include `playerMemo` and submission/admin-confirmation state.
- Enabled Next.js `experimental.authInterrupts` and added `src/app/forbidden.tsx` so non-owned score detail access can render a 403 forbidden page.
- Added UI states for login-required redirects, GENERAL player-registration guidance, empty score archive, draft/submitted/admin-confirmed/rejected status badges, and rejected-score reinput buttons.
- My Page score reads do not expose admin memo or review logs.

## 2026-05-11 - Score Input To Result Publication Integration

- Added `/mypage/scores/[tournamentId]/input/round/[round]` for PLAYER self-entry of round scores.
- Added player save/submit state writes: `DRAFT` for temporary save and `SUBMITTED` for admin review.
- Updated public results reads so Full Leaderboard, public Scorecard, and result summaries use confirmed score rows only.
- Added admin confirm/reject actions on `/admin/scores`; confirmation recalculates tournament ranks from confirmed rows, while rejection stores a rejection reason for owner/admin views.
- Added My Page state messages and owner-visible rejection reasons without exposing rejection/admin memo fields in public DTOs.

## 2026-05-11 - Advanced Result Search And Sorting

- Expanded Full Leaderboard and Scorecard query params with group number, rank range, final-day-only, sort key, sort direction, and pagination.
- Normalized player-name and school-name search to ignore whitespace and letter case.
- Added server-side sorting by rank, player name, school, 1R score, and 36-hole total.
- Added collapsible filter panels for mobile-friendly result searching.
- Added `/admin/tournaments/[tournamentId]/scores` for tournament-level admin score search with the same filter/sort contract.

## 2026-05-11 - Admin Score Excel Exports

- Added `exceljs` `.xlsx` generation for tournament-level admin downloads.
- Added `ExportLog` to record restricted personal-info downloads with admin, export type, tournament, exported timestamp, row count, and reason.
- Added `privacy.export` as an admin permission action; `SUPER` admins still bypass permission JSON.
- Added download routes for public leaderboard, admin score status, public scorecards, and private operations exports.
- Kept public leaderboard and scorecard exports on confirmed-score and no-PII boundaries.
- Added submission/confirmation/rejection timestamps into score JSON for operational export columns.

## 2026-05-11 - M4 QA Tests

- Added Vitest and `npm test`.
- Added unit tests for Full Leaderboard sorting/filtering/privacy, public Scorecard detail/hole-score behavior, My Page owner-only score reads, and admin export privacy/authorization/logging.
- Added `docs/qa-results-score-features.md` as the manual QA checklist.
- Hardened My Page rejection reason handling so `adminMemo` is never exposed as a player-visible fallback.

## 2026-05-11 - Pre-Merge Deployment URL Cleanup

- Removed the committed custom-domain marker.
- Updated deployment/spec/context notes so pre-production review uses `https://khu-sports.vercel.app/`.
- Left official production-domain connection as a later deployment decision.

## 2026-05-11 - Session Persistence

- Added Supabase SSR middleware to refresh auth cookies across page navigation.
- Added `SESSION_MAX_AGE_HOURS` for the app session marker, now defaulting to Supabase's long-lived 400-day cookie window when unset.
- Updated the public header to show My Page and logout actions while a member session is active.
- Switched app-level expiry from relying on Supabase `last_sign_in_at` to an HTTP-only `khu_app_session_started_at` marker cookie so PLAYER member sessions remain stable across home, My Page, and score-input navigation.
- Hardened member and admin sessions so middleware never force-signs out a valid Supabase session; explicit member/admin logout is the only app-level sign-out path.
- Preserved login `next` redirects so score-input deep links return to their original page after member login.

## 2026-05-11 - Player Score Input Discovery

- Added visible My Page and `/mypage/scores` score-input CTAs for ongoing tournaments so PLAYER users can start score entry without knowing `/mypage/scores/[tournamentId]/input/round/[round]`.
- Added `getMyOpenScoreInputs(userId)` for ongoing tournament input cards and round-level status/action mapping.
- Allowed player edit actions only for `NOT_STARTED`, `DRAFT`, and `ADMIN_REJECTED`; `SUBMITTED` and `ADMIN_CONFIRMED` now stay read-only to players in both UI and server action.
- Limited player self-input to the tournament date window and added input-period messaging.
- Changed the input form to auto-calculate `roundTotal` from `front9 + back9` while keeping server-side sum validation.
- Split `/mypage/scores` into a dedicated score-input hub and added `/mypage/score-results` as the separate personal score result list page.

## 2026-05-11 - Hole-By-Hole Golf Scoring

- Added `Tournament.courseData` to store per-tournament 18-hole par setup.
- Added shared golf scoring helpers for hole pars, hole scores, front/back totals, round total, and par-relative formatting.
- Changed admin tournament creation and update flows so admins can configure each hole as par 3/4/5/6.
- Changed admin score entry and player score self-entry from front9/back9 totals to 18 gross hole scores.
- Public leaderboard, public Scorecard, My Page results, and admin score views now display aggregate scores relative to par as `E`, `+1`, or `-1`.

## 2026-05-12 - Auth And Score Save Performance

- Limited Supabase SSR middleware to auth-sensitive routes so public pages do not pay per-request auth verification latency.
- Switched member/admin session identity checks from `getUser()` to verified `getClaims()` where only stable JWT identity claims are needed.
- Moved member `lastLoginAt` persistence after the login response so successful authentication redirects faster.
- Reduced player score save DB round trips by loading the player and existing round score together, and skipped public result revalidation for non-public draft/submitted saves.
- Reduced admin rank recalculation writes by batching updates and skipping score rows whose stored rank totals are already current.

## 2026-05-12 - M2 R2 Notice Upload

- Created `feature/m2-r2-notice-upload`.
- Added Cloudflare R2 S3-compatible upload helpers and validation for notice images/documents.
- Enabled `/admin/notices/new` as a real notice creation form with RBAC-protected Server Action persistence.
- Notice thumbnails upload to the public R2 bucket and store their public URL on `Notice.thumbnailUrl`.
- Notice attachments upload to the public R2 bucket and store file metadata plus `r2Key` in `NoticeAttachment`.
- Designed the flow to accept the existing `asset` tournament promotion image as the notice thumbnail and `reference` application PDFs as public attachments.
- Raised the Next.js Server Action body limit for the notice form to 8MB so the current promotion image and application PDF packet can be submitted on Vercel without a pre-action 400 response.
- Changed public notice detail thumbnails to render at natural image height instead of cropping to 16:9.
- Added admin notice upload usage feedback for promotion image size, document attachment totals, per-document size, and aggregate upload request size.

## 2026-05-13 - M5 Member Management MVP

- Created `feature/m5-member-management`.
- Added M5 design and implementation plan documents.
- Added `src/lib/member-lifecycle.ts` for PLAYER conversion, member withdrawal request, admin recovery, operational status changes, User masking, and Player anonymization.
- Added `src/lib/admin/members.ts` for bounded admin member list/detail reads with search, filters, pagination, and capped recent scores.
- Reworked `/admin/members` to use server-side search/filter/pagination instead of loading the full member table.
- Added `/admin/members/[userId]` for single-member operations, lifecycle controls, Player profile summary, and recent score summary.
- Added `/mypage` withdrawal request flow for ACTIVE users and removed eager full score archive loading from the My Page landing surface.
