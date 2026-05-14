# M7-C Same-Origin Export Guard Design

## Goal

Reduce CSRF-style risk on sensitive admin download routes before merging M7. The main target is `/admin/tournaments/[tournamentId]/exports/[exportType]`, especially the private export that can return personal information and writes an `ExportLog`.

## Scope

This slice adds a small same-origin request helper and applies it to the admin tournament export Route Handler.

Included:

- A tested helper that accepts same-origin requests and normal browser downloads.
- Rejection for explicit cross-site browser requests using `Origin` and Fetch Metadata headers.
- Focused route test proving cross-site export requests are blocked before auth, workbook generation, or export logging.
- M7 documentation updates.

Not included:

- Converting export downloads from `GET` to `POST`.
- Adding a synchronizer CSRF token system.
- Blocking requests with no `Origin` or Fetch Metadata header, because that could break ordinary link/download navigation and local tooling.

## Approach

Create `src/lib/same-origin.ts` with:

- `isSameOriginRequest(request: Request): boolean`
- `sameOriginForbiddenResponse(): Response`

The helper blocks when:

- `Sec-Fetch-Site: cross-site`
- `Origin` exists and does not match `request.url` origin

The helper allows:

- same-origin `Origin`
- no `Origin` and no Fetch Metadata header
- `Sec-Fetch-Site` values `same-origin`, `same-site`, and `none`

Apply the guard early in the export route after validating `exportType`, before `getCurrentAdmin()` and before workbook generation. This avoids doing auth/database/export work for cross-site requests.

## Testing

Use TDD:

1. Add failing tests for `src/lib/same-origin.ts`.
2. Add a route test that cross-site export attempts return `403`.
3. Implement the helper.
4. Wire it into the export route.
5. Run focused and full verification.

## Verification

```powershell
npm test -- src/lib/same-origin.test.ts "src/app/admin/tournaments/[tournamentId]/exports/[exportType]/route.test.ts"
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```
