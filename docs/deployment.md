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
