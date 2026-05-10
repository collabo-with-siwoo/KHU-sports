# KHU Sports Service Specs

> Source of truth derived from `PRD/04_golf_PRD.md` v0.3. Keep this file synchronized with code changes.

## Milestone Status

- Current milestone: M1, authentication and agreements.
- M0 scope in this repository: Next.js App Router scaffold, TypeScript strict mode, Prisma schema validation, environment variable template, and documentation baseline.
- External M0 tasks still require human/account work: Vercel project, Supabase project, Cloudflare R2 buckets, Resend domain, production domain DNS.
- Visual foundation: public user view has a sports-site style homepage with hero, notice, result, and quick-link modules. `/admin` currently presents a polished login-like shell until real authentication is implemented.
- M1 local foundation: login, signup, reset-password, and terms pages exist with zod-backed client validation for GitHub Pages static preview compatibility. Actual Supabase Auth/Prisma persistence will be wired after external Supabase project setup.
- Static preview deployment: GitHub Pages custom workflow exports the Next.js app to static files and publishes `khu-sports.com` via `public/CNAME`.

## Technology Decisions

- Frontend/backend: Next.js App Router, TypeScript.
- ORM: Prisma.
- Database: Supabase PostgreSQL.
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

## M1 Implemented Local Contracts

- `/login`: accepts `username` and `password`, validates with `loginSchema`, and returns a generic success/error state in the browser for static preview.
- `/signup`: accepts username, password, confirmation, Korean name, birth date, gender, phone, email, address, active agreement version IDs, and age confirmation.
- `/reset-password`: accepts email and validates reset request shape.
- `/terms`: renders active agreement seed data in display order.
- `src/lib/agreements.ts`: temporary seed source until agreement templates are persisted in Supabase/PostgreSQL.
- `src/lib/auth/schemas.ts`: zod schemas for M1 inputs.
- `src/lib/auth/client-validation.ts`: static-preview validation layer used until Supabase Auth and Prisma persistence are available.

## GitHub Pages Static Preview

- Domain: `khu-sports.com`.
- Workflow: `.github/workflows/deploy-github-pages.yml`.
- Build mode: `GITHUB_PAGES=true npm run build:pages`, which enables Next.js static export.
- Custom domain: configure `khu-sports.com` in GitHub repository Pages settings. `public/CNAME` is kept as an exported marker but is not a substitute for the GitHub Pages custom-domain setting when using a custom workflow.
- GitHub Pages is static only; real signup/login persistence requires the future Supabase-backed runtime deployment.

## Visual Interaction Notes

- Public navigation uses hover lift/color transitions.
- Homepage feature cards, notice rows, and ranking rows provide hover feedback for a more finished client preview.
- `/admin` login shell is visual-only in M0; submit behavior and Supabase-backed RBAC belong to M3.

## Verification Commands

```bash
npm run typecheck
npm run lint
npm run prisma:validate
```
