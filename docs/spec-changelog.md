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
