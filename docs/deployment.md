# Deployment

## Vercel Preview Runtime

Until the official production domain is connected, use the Vercel project URL:

```text
https://khu-sports.vercel.app/
```

Do not configure a custom domain or commit a `public/CNAME` file before the official deployment decision. The app uses Vercel because Supabase-backed Server Actions, Prisma reads, and admin/player workflows require a server runtime.

## Vercel + Supabase Runtime

Use Vercel as the runtime deployment once signup/login persistence is enabled.

### Required Vercel Environment Variables

```text
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
INITIAL_SUPER_ADMIN_EMAIL
```

R2 variables are required for admin notice thumbnail and attachment uploads. Resend variables are
still required before the email milestones are fully active.

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_PUBLIC
R2_BUCKET_PRIVATE
R2_PUBLIC_BASE_URL
```

For the current M2 notice workflow, `R2_BUCKET_PUBLIC` should point to the public bucket used for
promotional images and public application attachments, for example `khusports-media`.
`R2_PUBLIC_BASE_URL` should be the bucket's public `r2.dev` URL or the configured custom media
domain without a trailing slash.

### Supabase Schema Setup

After `DATABASE_URL` points to the Supabase transaction pooler and `DIRECT_URL` points to the migration/session connection, apply the Prisma schema and seed the base records:

```powershell
npm run db:push
npm run db:seed
```

`db:seed` creates the `GOLF` sport row and the initial active agreement versions used by signup. Vercel builds run `prisma generate` through `postinstall`, but schema changes are not automatically pushed to Supabase during deploy.
