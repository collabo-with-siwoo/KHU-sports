# Deployment

## GitHub Pages + Cloudflare Domain

The static preview deployment uses GitHub Pages with the custom domain `khu-sports.com`.

### Repository Setup

1. In GitHub, go to **Settings > Pages**.
2. Set **Build and deployment** to **GitHub Actions**.
3. Ensure the workflow `.github/workflows/deploy-github-pages.yml` is enabled.
4. In **Custom domain**, enter `khu-sports.com` and save.
5. `public/CNAME` is kept in the exported artifact as an explicit domain marker, but GitHub Pages custom-workflow deployments still require the repository Pages setting above.

### Cloudflare DNS

For the apex domain, create A records pointing to GitHub Pages:

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

For `www`, create a CNAME:

```text
www  CNAME  <github-username>.github.io
```

Use DNS-only mode first while GitHub verifies the domain and issues HTTPS. After verification, Cloudflare proxying can be evaluated.

Avoid wildcard DNS records such as `*.khu-sports.com` for GitHub Pages because they increase subdomain takeover risk.

### Static Export Constraint

GitHub Pages only serves static files. Until the project moves to Vercel/Cloudflare Pages Functions or another server runtime, Supabase-backed signup/login persistence will not run on GitHub Pages. The current GitHub Pages deployment is a public preview and marketing/user-view build.

### Local Static Export Check

PowerShell:

```powershell
$env:GITHUB_PAGES='true'
npm run build:pages
Remove-Item Env:\GITHUB_PAGES
```

## Vercel + Supabase Runtime

Use Vercel as the runtime deployment once signup/login persistence is enabled.

### Required Vercel Environment Variables

```text
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
INITIAL_SUPER_ADMIN_EMAIL
```

R2 and Resend variables are still required before the upload and email milestones are fully active.

### Supabase Schema Setup

After `DATABASE_URL` points to the Supabase pooled connection string, apply the Prisma schema and seed the base records:

```powershell
npm run db:push
npm run db:seed
```

`db:seed` creates the `GOLF` sport row and the initial active agreement versions used by signup. Vercel builds run `prisma generate` through `postinstall`, but schema changes are not automatically pushed to Supabase during deploy.
