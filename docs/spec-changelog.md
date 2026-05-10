# Spec Changelog

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
- Added `public/CNAME` for `khu-sports.com`.
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
