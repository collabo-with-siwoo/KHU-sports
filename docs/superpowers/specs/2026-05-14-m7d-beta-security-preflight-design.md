# M7-D Beta Security Preflight Design

## Goal

Give the operator a safe local command that checks private-beta security configuration before deployment without printing secret values.

## Scope

Add a small Node script and npm command:

- `scripts/beta-security-check.js`
- `npm run qa:beta-security`

The script checks only local environment/configuration presence and obvious contradictions. It does not connect to Supabase, Vercel, R2, or Resend.

## Checks

Errors:

- Missing required runtime env vars used by auth, database, R2, site URL, and initial admin setup.
- Public and private R2 bucket names are identical.

Warnings:

- `RATE_LIMIT_ENABLED=false`.
- `NEXT_PUBLIC_SITE_URL` points to localhost or `127.0.0.1`.
- `INITIAL_SUPER_ADMIN_EMAIL` is present but does not look like an email.

## Safety

The script must never print actual env values. Output should show variable names, pass/fail/warn status, and operator guidance only.

## Verification

Use Vitest for the pure evaluator and run the script command:

```powershell
npm test -- scripts/beta-security-check.test.js
npm run qa:beta-security
```
