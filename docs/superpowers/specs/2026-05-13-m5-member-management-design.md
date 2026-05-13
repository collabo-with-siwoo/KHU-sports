# M5 Member Management Design

Date: 2026-05-13
Branch: `feature/m5-member-management`

## Goal

M5 completes the member lifecycle MVP. It expands the existing admin member approval screen into an operational member management flow and adds a member-facing withdrawal request flow in My Page.

The work should avoid a broad M2, M3, or M4 rewrite. It should only refactor the member-facing parts that M5 directly depends on: admin member queries/actions, user status transitions, PLAYER conversion, withdrawal request handling, and Player anonymization.

## Scope

M5 includes:

- Admin member list with server-side search, filters, and pagination.
- Admin member detail page for a single user.
- Admin actions for user type and lifecycle status changes.
- User My Page withdrawal request flow.
- Withdrawal login blocking through the existing `ACTIVE`-only login policy.
- Player record preservation by anonymizing `Player` rows while removing the user link.
- My Page first-load performance cleanup so the page does not eagerly load heavy score archive data.
- Focused tests for member search, status transitions, withdrawal request, and anonymization.

M5 does not include:

- Full M2 notice/Tiptap refactor.
- Full M4 result-table migration to `tournament_players`, `score_submissions`, or `tournament_results`.
- Automated 30-day deletion batch job.
- Resend email notifications.
- Separate audit-log table unless the current implementation needs it for correctness.

## Architecture

Create a small member lifecycle boundary instead of continuing to grow page-level Prisma code.

Recommended modules:

- `src/lib/admin/members.ts`: admin read models for member list/detail.
- `src/lib/member-lifecycle.ts`: status transitions, PLAYER conversion, withdrawal request, withdrawal deletion/anonymization.
- `src/app/admin/members/actions.ts`: thin Server Actions that validate form data, call lifecycle functions, and revalidate paths.
- `src/app/mypage/actions.ts` or `src/app/mypage/withdrawal/actions.ts`: member-facing withdrawal request action.

This keeps auth/RBAC in route actions, domain rules in library functions, and display DTOs small enough to reason about.

## Admin Member List

`/admin/members` remains protected by `members.read`; mutating controls require `members.write`.

The list reads a bounded page of members, not the entire table. It supports query params:

- `q`: partial search over name, username, email, and phone.
- `userType`: `GENERAL` or `PLAYER`.
- `status`: `ACTIVE`, `DORMANT`, `WITHDRAWN_PENDING`, or `WITHDRAWN_DELETED`.
- `page`: 1-based page number.

Default page size is 30. The query selects only list fields plus the golf Player summary and score count. It must not include full scores, score JSON, agreements, or notice data.

## Admin Member Detail

`/admin/members/[userId]` shows one member with:

- Account fields: name, username, email, phone, birth date, gender, address, status, user type, created date, last login, withdrawal timestamp.
- Golf Player profile summary: affiliation, birth year, anonymized flag, score count.
- Recent score summary only, capped to a small number such as 10 rows.
- Operational actions for user type and status.

The detail page should use one or a small number of explicit `select` queries. It should avoid loading all Score rows.

## Lifecycle Rules

### PLAYER Conversion

Changing a member to `PLAYER` creates or updates the GOLF Player profile using existing behavior:

- `User.userType = PLAYER`
- Upsert GOLF `Player`
- `Player.userId = User.id`
- `Player.name = User.name`
- `Player.birthYear = User.birthDate` year
- Optional affiliation
- `Player.anonymized = false`

Changing back to `GENERAL` preserves existing Player and Score rows. This avoids losing official competition records.

### Withdrawal Request

The member-facing withdrawal request is available from My Page for logged-in `ACTIVE` users.

On submit:

- Validate the member from the current Supabase session.
- Set `User.status = WITHDRAWN_PENDING`.
- Set `User.withdrawnAt = now()`.
- Clear the app-owned session marker cookie if available and sign out via Supabase server client.
- Redirect to login or a confirmation page.

Existing login logic already rejects non-`ACTIVE` users, so `WITHDRAWN_PENDING` cannot log in again through the standard login action.

### Withdrawal Recovery

M5 exposes admin recovery by setting a `WITHDRAWN_PENDING` member back to `ACTIVE` and clearing `withdrawnAt`. This is admin-only and requires `members.write`.

### Withdrawal Deletion And Anonymization

M5 provides a manual admin action to finalize a withdrawal as `WITHDRAWN_DELETED`.

On finalize:

- Set `User.status = WITHDRAWN_DELETED`.
- Keep `withdrawnAt` if present, otherwise set it to now.
- Mask personal fields in `User` so the account is no longer personally identifying.
- For every linked `Player`, set `userId = null`, `anonymized = true`, and replace `name` with a stable anonymous display value such as `player_` plus a short ID suffix.
- Preserve Score rows through the Player record so official sports results remain intact.

The action should run in a Prisma transaction.

## My Page Performance

The current My Page reads score archive data on the landing page. M5 should make `/mypage` lightweight:

- Keep current member lookup.
- Keep the open score-input CTA, but fetch it with bounded tournament/player queries only.
- Move full score archive display to `/mypage/score-results`.
- Add a withdrawal section that does not require extra database joins.

Target: normal My Page and Admin Members first response should stay comfortably below 5 seconds on Vercel with expected MVP data volume. The implementation should enforce this structurally through bounded queries rather than relying on cache alone.

## Security And Privacy

- All admin pages and actions must use `requireAdminPermission`.
- Member-facing withdrawal must derive the user from the current session; it must not accept a user ID from the browser.
- Public results must remain unchanged and must not expose masked or private user fields.
- `WITHDRAWN_DELETED` should not retain direct personal identifiers in User fields.
- Player anonymization must preserve public competition records without linking back to the withdrawn user.

## Testing

Add focused tests around pure/member lifecycle functions where possible:

- Admin list filters produce bounded, allowlisted query shapes.
- PLAYER conversion creates or updates a GOLF Player.
- Member withdrawal request sets `WITHDRAWN_PENDING` and `withdrawnAt`.
- Finalize withdrawal masks User fields and anonymizes Player rows.
- Login remains blocked for non-`ACTIVE` users through the existing login action behavior or a helper-level status predicate.

Run at least:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run prisma:validate`
- `npm run build`

## Rollout Notes

This M5 branch intentionally leaves M2 notice editor refinements and M4 target result table migration for later. After M5, M6 can focus on UI/QA/accessibility/performance polish across pages, and M7 can handle beta release hardening.
