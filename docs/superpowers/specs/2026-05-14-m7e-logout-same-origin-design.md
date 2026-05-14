# M7-E Logout Same-Origin Guard Design

## Goal

Close the remaining lightweight CSRF surface on logout. A cross-site form POST should not be able to sign a user out of KHU Sports.

## Scope

Apply the existing `src/lib/same-origin.ts` helper to `POST /logout`.

Included:

- Cross-site `POST /logout` returns `403`.
- Cross-site logout attempts do not call Supabase `signOut` and do not clear the app session marker cookie.
- Same-origin logout behavior stays unchanged.

Not included:

- Removing the existing `GET /logout` redirect, because it does not sign out.
- Adding a full CSRF token system.

## Testing

Use TDD with a new route test:

```powershell
npm test -- src/app/logout/route.test.ts
```

Then run full verification before commit.
