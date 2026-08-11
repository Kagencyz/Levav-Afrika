# Organization Domain Model and Slice 1 Authorization Architecture

**Status:** Accepted design, documented before implementation per the Slice 1 approval. Covers the `organizations`/`organization_members` domain and the `levav_app` role's precise, bounded purpose. Nothing in this document has been implemented yet beyond the service-only RLS policies it describes — see `git diff -- db/schema.ts` for what's actually landed.

## 1. What `levav_app` is, precisely — and what it is not

`levav_app` is a restricted Postgres login role that exists for exactly one reason: **to let the Hono/tRPC server's direct database connection operate under Row-Level Security instead of bypassing it**, the way `service_role`/`postgres` would. Its grants (SELECT/INSERT/UPDATE only, never DELETE, per table) and its permissive RLS policies define the outer boundary of what the running application process can touch at the database layer.

**`levav_app` is never an authorization mechanism.** It does not know who a request's caller is, does not vary its behavior per caller, and its permissive (`USING (true)`) policies grant it no row-level discrimination at all. Authorization — deciding whether *this specific caller* may perform *this specific action* on *this specific row* — is entirely Hono/tRPC's responsibility, enforced in application code on every request. `levav_app`'s policies exist only because Postgres denies all access by default once RLS is enabled on a table with no matching policy for a role; without them, the application couldn't function at all, real authorization or not. Treat every `levav_app` policy as infrastructure plumbing, never as evidence that a given action is safe.

## 2. Organization domain API (tRPC procedures, contract only — not implemented)

All procedures are `authedProcedure` at minimum; specific permission requirements noted per procedure (see §5 for how permissions are derived).

| Procedure | Input | Requires | Behavior |
|---|---|---|---|
| `organization.create` | `{name, organizationType, industry?, size?}` | Any authenticated user | Atomic (§4 below): creates the org and its founding-owner membership together, one transaction, one audit event. |
| `organization.update` | `{organizationId, ...fields}` | `canUpdateOrgDetails` on that org | Updates org-level fields (name, industry, size, etc.) — never `verificationStatus`, which is admin/platform-controlled, not org-self-service. |
| `organization.inviteMember` | `{organizationId, email, orgRole}` | `canInviteMembers` on that org | Creates a `status: 'invited'` row, `invitedByUserId` = caller, `invitedAt` = now. Fails if a row for that org+user pair already exists (see reinvitation, below). |
| `organization.acceptInvitation` | `{organizationId}` | Caller is the invited user | `invited → active`, `joinedAt` = now. |
| `organization.removeMember` | `{organizationId, userId}` | `canRemoveMembers` on that org, **and** the "at least one active owner" invariant (§4) is checked before the removal is allowed to proceed | `active → removed`. |
| `organization.leave` | `{organizationId}` | Caller is the member leaving; same invariant check as removal | `active → removed`, self-initiated. |
| `organization.transferOwnership` | `{organizationId, newOwnerUserId}` | Caller is the current active owner | Dedicated transactional operation — see §7. |

Reinvitation of a `removed` member reuses their existing row (an `UPDATE` back to `invited`, fresh `invitedByUserId`/`invitedAt`) rather than a new `INSERT` — the `org_member_unique(organization_id, user_id)` constraint makes a second row for the same pair impossible by construction, so `inviteMember` must detect this case and update rather than insert.

## 3. `AuditPort` — mandatory from Slice 1, even as a no-op

Every privileged operation above (`create`, `update`, `inviteMember`, `removeMember`, `transferOwnership` at minimum) calls a single audit abstraction rather than writing to an audit table directly:

```ts
interface AuditPort {
  record(event: {
    actorUserId: string;
    action: string;        // e.g. 'organization.created', 'organization.ownership_transferred'
    organizationId?: string;
    targetUserId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}
```

Until the real audit-event domain/table exists (`DATABASE_DOMAIN_GAP_ANALYSIS.md`'s cross-cutting audit-events note), the injected implementation is `NoOpAuditPort` (records nothing, resolves immediately). **The point of requiring the call site now is that no domain procedure ever needs to be revisited to "remember" to add auditing later** — swapping `NoOpAuditPort` for a real, persisting implementation is the only change required once that domain ships.

## 4. Permanent architectural invariant: an organization always has at least one active owner

Promoted from an open question to a standing rule. No operation — `removeMember`, `leave`, `transferOwnership`, or any future one — may ever leave an organization with zero members in `orgRole: 'owner', status: 'active'`. Concretely: `removeMember`/`leave` must check, before executing, whether the target is the organization's sole active owner, and reject the operation if so (with a clear error directing the caller to transfer ownership first). This check lives in the domain layer (tRPC procedure code), not in a database constraint, because expressing "at least one row matching X exists among this row's siblings" as a `CHECK` constraint isn't possible in standard Postgres — it must be enforced procedurally, inside the same transaction as the mutation.

## 5. Permissions, documented independently from role names

Role names (`owner`/`admin`/`recruiter`/`member`) are labels; **permissions are the actual authorization unit**, derived from role via one explicit, reviewable mapping — never scattered `if (orgRole === 'admin')` checks across procedure bodies:

| Permission | Meaning |
|---|---|
| `canUpdateOrgDetails` | May edit organization-level fields |
| `canInviteMembers` | May create new `invited` rows |
| `canChangeRoles` | May change another member's `orgRole` |
| `canRemoveMembers` | May transition another member to `removed` |
| `canTransferOwnership` | May initiate `transferOwnership` |

The specific role→permission mapping (does `admin` get `canChangeRoles`? does `admin` get `canInviteMembers` at the `admin` role, or only `owner`?) is **still an open product decision** (`PRODUCT_COHERENCE_REVIEW.md`-style call, not inferred here) — what's decided now is the *shape*: one mapping table/function every procedure consults, so answering those open questions later means editing one place, not auditing every procedure for a missed `if`.

## 6. Invitation revocation: a domain event, not a new enum value

The `orgMemberStatusEnum` (`invited | active | removed`) is **not extended**. "Revoked before acceptance" and "removed after joining" both land on `status: 'removed'` at the data level — the distinction that matters (why/when the removal happened) lives in the `AuditPort` event's `action` field (`organization.invitation_revoked` vs `organization.member_removed`), not in a fourth database status. This keeps the state machine small and keeps the historically-interesting distinction in the audit trail, where "why did this happen" belongs, rather than in a column every future query has to account for.

## 7. Ownership transfer as a dedicated transactional operation

Not a generic role update. `transferOwnership(organizationId, newOwnerUserId)`, one transaction: (1) verify caller is the current active owner, (2) verify `newOwnerUserId` is an active member of the org, (3) update the new owner's row to `orgRole: 'owner'`, (4) update the previous owner's row to `orgRole: 'admin'` (they remain a member, not removed, unless they separately choose to leave afterward), (5) record one `organization.ownership_transferred` audit event via `AuditPort`. The §4 invariant is trivially maintained here (it's a swap, never a gap), but the procedure's contract still asserts it rather than assuming it.

## 8. Test categories: authorization tests and invariant tests, both required

Two distinct categories, not one:

- **Authorization tests** — does the right actor succeed and the wrong actor fail: cross-organisation isolation, privilege escalation (a `member` cannot self-promote or invite), the full negative-test list already specified in the prior review round.
- **Invariant tests** — does *system state* stay valid regardless of which authorized actor acted or in what order: an organization never ends up with zero active owners (tested by attempting removal/leave of a sole owner and asserting rejection); a `createOrganisation` mid-transaction failure never leaves an orphaned `organizations` row without its founding membership; a reinvitation always updates the existing row rather than producing a constraint violation or a duplicate.

Invariant tests belong alongside authorization tests in the same suite, not as an afterthought — they're what catch a *correctly authorized* sequence of operations that still corrupts domain state, which authorization tests alone can't detect.

## 9. Standing rule: no `SECURITY DEFINER` helper without a separate security review

The `is_active_org_member()`-style helper function proposed earlier in this design process is **not created in Slice 1**, and no future `SECURITY DEFINER` function is created as an incidental part of a feature implementation. Each one requires its own dedicated review pass covering, at minimum: recursion avoidance, definer ownership, a fixed `search_path`, fully-qualified table references, explicit execution grants, revoked `PUBLIC` execute access, no dynamic SQL, and its own negative tests — the same bar already applied to the `handle_new_user()` trigger design. This is a standing constraint on future work, not a one-time note.
