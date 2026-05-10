# Project Context

## Current Status

- Date: 2026-05-10
- Active milestone: M1 authentication and agreements.
- M0 progress: local project foundation complete; external account setup remains.
- Latest action: Replaced the public home, leaderboard, and notices baselines with the Stitch app-style screen structure.
- Required docs note: `docs/specs.md` now exists and should be kept synchronized with code changes.

## Recent Changes

- Created `docs/agent_session_log.md` and `docs/agent_discussion.md` to satisfy the required agent session workflow.
- Created this context file because AGENTS.md requires current project state tracking.
- PRD analysis indicates the next planning artifact should be `docs/specs.md`.
- Added M0 app scaffold: Next.js 15.5.18, TypeScript strict mode, Prisma schema, environment template, and basic public/admin route placeholders.
- Updated dormant-account policy language: automatic 1-year dormant conversion is not implemented as a statutory MVP workflow.
- Local dev server: running at `http://127.0.0.1:3000`.
- New branch: `feat/m0-user-view-layout`.
- Public homepage now includes a large tournament hero, quick-link feature cards, latest notices, and recent result leaderboard.
- `/admin` now presents a polished login-like view; it is visual-only until real auth/RBAC is implemented.
- New branch: `feat/m1-auth-agreements`.
- M1 local foundation now validates login/signup/reset forms in the browser for GitHub Pages static preview and dynamically renders active agreement seed data.
- Actual Supabase Auth, username-to-email lookup, and User/UserAgreement persistence remain blocked on external Supabase project configuration.
- GitHub Pages workflow added at `.github/workflows/deploy-github-pages.yml`.
- Custom domain file added at `public/CNAME` with `khu-sports.com`.
- Deployment instructions added in `docs/deployment.md`.
- DNS check on 2026-05-10 returned no A records for `khu-sports.com`; Cloudflare DNS still needs GitHub Pages records.
- Adjusted hero heading styles so desktop Korean titles remain on one line.
- New branch: `feat/stitch-next-ui`.
- Integrated the Stitch "Majestic Green" visual direction into the actual Next.js pages instead of relying on the root static `index.html`.
- Reworked the homepage with a sticky desktop nav, mobile bottom nav, hero image, bento-style quick links, latest notices, and recent results.
- Reworked `/notices`, `/results`, `/mypage`, `/terms`, M1 auth pages, and `/admin` with corrected Korean text and PRD-aligned placeholder content.
- Kept future functionality visual-only where external Supabase/R2 work is not ready.
- Corrected the Stitch baseline pass so `/`, `/results`, and `/notices` now use the Stitch-style fixed top app bar, mobile bottom navigation, dense content cards, leaderboard rows, and notices feed instead of the previous site-shell layout.

## Remaining M0 External Tasks

- Create/link Vercel project.
- Create Supabase project and set `DATABASE_URL`.
- Create Cloudflare R2 public/private buckets.
- Configure Resend sending domain.
- Connect production domain/DNS.
- Confirm `INITIAL_SUPER_ADMIN_EMAIL`.

## Verification

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run prisma:validate`: passed
- `npm run build`: passed
- `http://localhost:3000`: 200
- `http://localhost:3000/admin`: 200
- `http://localhost:3000/login`: 200
- `http://localhost:3000/signup`: 200
- `http://localhost:3000/terms`: 200
- `http://localhost:3000/reset-password`: 200
- `GITHUB_PAGES=true npm run build:pages`: passed, generated `out/` with `CNAME`
- `Resolve-DnsName khu-sports.com -Type A`: no A records returned yet
- 2026-05-10 Stitch integration verification: `npm run typecheck`, `npm run lint`, `npm run prisma:validate`, `npm run build`, and `GITHUB_PAGES=true npm run build:pages` passed.
- Local checks returned expected Korean content for `/`, `/admin`, and `/results`.
- Playwright screenshot checks passed for desktop/mobile home and desktop admin after title wrapping adjustments.
- 2026-05-10 Stitch baseline correction verification: `npm run typecheck`, `npm run lint`, `npm run prisma:validate`, `npm run build`, and `GITHUB_PAGES=true npm run build:pages` passed.
- Playwright screenshot checks passed for desktop/mobile `/`, `/results`, and `/notices`.
