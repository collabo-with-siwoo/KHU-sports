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
