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
