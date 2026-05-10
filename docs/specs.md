# KHU Sports Service Specs

> Source of truth derived from `PRD/04_golf_PRD.md` v0.3. Keep this file synchronized with code changes.

## Milestone Status

- Current milestone: M2, notice system.
- M0 scope in this repository: Next.js App Router scaffold, TypeScript strict mode, Prisma schema validation, environment variable template, and documentation baseline.
- External M0 tasks still require human/account work: Cloudflare R2 buckets, Resend domain, production domain DNS verification.
- Visual foundation: public user view follows the Stitch "Majestic Green" direction with a hero image, sticky desktop navigation, mobile bottom navigation, bento-style quick links, notice modules, and result summary modules. `/admin` presents a polished login-like shell until real authentication is implemented.
- M1 runtime foundation: login, signup, reset-password, and terms pages exist with Supabase Auth and Prisma-backed profile/agreement persistence. Static GitHub Pages remains preview-only and cannot run these Server Actions.
- M2 notice foundation: public notice reads use Supabase `Notice` rows when available and fall back to PRD-aligned seed notices for empty or not-yet-migrated environments. Homepage latest notices, `/notices`, and `/notices/[id]` share the same read model.
- Static preview deployment: GitHub Pages custom workflow exports the Next.js app to static files and publishes `khu-sports.com` via `public/CNAME`.

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

- Public users can read home, notices, and tournament result summaries.
- Logged-in users can access mypage and only their own detailed scorecards.
- Admin members can access only permitted admin menus.
- Super admins bypass menu permission JSON and can manage other admins.
- Public tournament results must return only rank, player name, and total score.

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
```

## M1 Implementation Notes

- Sign-up must validate username, password, Korean name, birth date, gender, phone, email, address, and age 14+ check.
- Sign-up must dynamically load active agreement templates and latest effective versions.
- Login must accept username/password, look up the email server-side, then authenticate with Supabase Auth.
- Error messages should not reveal whether a username exists.

## M1 Implemented Runtime Contracts

- `/login`: accepts `username` and `password`, validates with `loginSchema`, looks up the local `User.email`, signs in through Supabase Auth, sets Supabase session cookies, updates `lastLoginAt`, and redirects to `/mypage`.
- `/signup`: accepts username, password, confirmation, Korean name, birth date, gender, phone, email, address, active agreement version IDs, and age confirmation. It creates a Supabase Auth user, persists the local `User` profile with `id = auth.users.id`, and records `UserAgreement` rows.
- `/reset-password`: accepts email and calls Supabase Auth password reset. The response stays generic so account existence is not disclosed.
- `/terms`: renders active agreement versions from Prisma when available, falling back to UUID seed agreements.
- `/mypage`: reads the Supabase session and displays the linked local `User` profile when logged in.
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
- `/admin/notices/new`: create screen is intentionally disabled until M3 admin authentication/RBAC protects write actions.
- Notice content stored as HTML must be sanitized before persistence. The current detail route assumes persisted admin-authored HTML has already passed that sanitization boundary.
- R2 upload integration is not active yet. `NoticeAttachment` public URLs are derived from `R2_PUBLIC_BASE_URL` only for public attachments.

## GitHub Pages Static Preview

- Domain: `khu-sports.com`.
- Workflow: `.github/workflows/deploy-github-pages.yml`.
- Build mode: `GITHUB_PAGES=true npm run build:pages`, which enables Next.js static export.
- Custom domain: configure `khu-sports.com` in GitHub repository Pages settings. `public/CNAME` is kept as an exported marker but is not a substitute for the GitHub Pages custom-domain setting when using a custom workflow.
- GitHub Pages is static only; real signup/login persistence requires the future Supabase-backed runtime deployment.

## Visual Interaction Notes

- Stitch baseline screens use an app-style top bar, mobile bottom navigation, compact page headers, dense cards/lists, and light gray canvas backgrounds for `/`, `/results`, and `/notices`.
- The homepage uses a tournament hero with a golf course image, a next-tournament summary card, bento quick links, a notice panel, and a public mini leaderboard.
- The public leaderboard page presents only public-safe fields: rank, player name, affiliation, relative score, and total score. Detailed scorecard access remains excluded from public result screens.
- The notices page uses category tabs and a feed layout; desktop screens add a left sidebar while mobile screens rely on the bottom navigation.
- Public navigation uses hover lift/color transitions.
- Homepage quick-link cards, notice rows, result rows, subpage cards, and admin preview modules provide hover feedback.
- Public result views must avoid detailed scorecards and expose only rank, player name, and total score.
- Player registration copy points users toward email submission and admin approval instead of implementing a direct public player-registration workflow.
- `/admin` login shell is visual-only until M3; submit behavior and Supabase-backed RBAC belong to M3.
- Admin notice write controls remain disabled until M3 protects mutations with admin authentication and menu permissions.

## Verification Commands

```bash
npm run typecheck
npm run lint
npm run prisma:validate
```
