# M7 Beta Security QA Checklist

## Scope

M7 beta hardening applies the safe-now items from the M0-M4 security/improvement report that reduce private beta risk without introducing new infrastructure dependencies.

## Implemented Controls

- App-level fixed-window rate limiting now protects member login, admin login, signup, password reset, and player score submission Server Actions.
- Rate limit keys are normalized and built from action scope plus stable identifiers such as username/email/IP/member/tournament/round. Passwords and raw form bodies are never used in keys.
- `RATE_LIMIT_ENABLED=false` can bypass app-level limits for local testing or emergency operations.
- `ExportLog.tournamentId` is now a nullable foreign key to `Tournament.id` with `ON DELETE SET NULL`.
- Existing orphan export log tournament IDs are nulled before the FK is added.
- Admin permission tests now cover all `SUPER` permission combinations, full permission-map generation, and the `privacy.export` boundary for `MEMBER` admins.

## Operator Checks Before Private Beta

- Confirm Supabase project is on a supported Postgres version and schedule an upgrade if needed before the Supabase Postgres 14 support window closes.
- Confirm Supabase API key migration/readiness items are tracked before legacy key changes affect deploys.
- Verify Vercel production env vars include `DATABASE_URL`, `DIRECT_URL`, Supabase keys, R2 keys, `NEXT_PUBLIC_SITE_URL`, and `INITIAL_SUPER_ADMIN_EMAIL`.
- Verify a matching Supabase Auth user exists for the seeded `INITIAL_SUPER_ADMIN_EMAIL`.
- Verify R2 public bucket policy exposes only intended notice assets and private bucket objects are not publicly reachable.
- Smoke-test actual accounts: member login, admin login, signup, password reset request, and player score draft/submit.
- For private exports, verify a `MEMBER` without `privacy.export` is denied and a `SUPER` or `privacy.export` member can export only with a reason.

## Deferred Controls

- CAPTCHA or Turnstile on auth forms.
- Distributed rate limit storage across serverless instances.
- Cloudflare WAF/bot rules.
- Admin 2FA.
- Formal RLS/exposed-table audit against the live Supabase project.
- Feedback/reporting workflow for beta users.

## Verification

To complete M7, run:

```powershell
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```
