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
