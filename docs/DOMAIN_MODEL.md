# Domain Model

**Status:** Implemented and applied. Reflects the live Postgres/Supabase schema.

This is the authoritative definition of entities, relationships, and invariants for identity, organizations, and talent profiles. Historical planning context is retained under `docs/archive/`; implementation status belongs in `docs/implementation/IMPLEMENTATION_STATE.md`.

## Business capability derivation (read this first)

**`users` stores platform-level access only. It never stores business identity.** Whether someone is "a talent" or "an organization team member" is never a stored flag — it's derived from whether related rows exist:

- **Talent identity** is derived from the existence of a `talents` row referencing the user (`talents.userId`, enforced unique — 1:1). There is no `is_talent` flag anywhere; the row's existence *is* the fact.
- **Organization membership/capability** is derived from the existence of one or more **active** `organizationMembers` rows referencing the user (`organizationMembers.userId` where `status = 'active'`), each carrying its own org-scoped `orgRole`.
- **A single user may simultaneously be a Talent and an active member of one or more Organizations.** Nothing in the schema forces an exclusive choice — this was a genuine limitation of the earlier design (a single `role` enum value) that this schema does not have.
- `users.accessLevel` (`standard | admin`) answers exactly one question — how much platform-wide access this account has — and nothing about what business role(s) the person plays. `admin` remains never self-assignable (see `docs/archive/AUTHENTICATION_ARCHITECTURE.md`).

Every other section below should be read through this lens: nowhere does a "role" gate access to a business capability. Capability comes from a join, not a column.

## Core entities (in scope for this milestone)

### User

The platform-level identity. One row per person who can log in.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `email` | varchar, unique | **Normalized (lowercased, trimmed) before persistence** — enforced by a `CHECK (email = lower(email))` constraint in addition to application-side normalization on register/login. Uniqueness is on the normalized value. |
| `passwordHash` | text | bcrypt, cost 12 — unchanged from today |
| `name` | varchar | |
| `accessLevel` | enum: `standard`, `admin` | **Platform-level access only** — see "Business capability derivation" above. Does not encode talent identity, organization membership, or Champion status. `admin` is never self-assignable. |
| `deletedAt` | timestamp, nullable | Soft-delete. Normal deactivation sets this rather than hard-deleting the row; a true hard DELETE remains possible (e.g. legal erasure) and cascades per the FK behavior noted on dependent tables. |
| `createdAt` / `updatedAt` | timestamp | |

**Invariant:** `accessLevel` defaults to `standard` at registration and is not user-settable to anything else; `admin` is assigned out-of-band only (see `docs/archive/AUTHENTICATION_ARCHITECTURE.md`). Registration no longer asks a user to "choose" talent or employer-team-member — there is nothing to choose at the platform level. Becoming a talent means creating a `talents` row; becoming an organization member means an `organizationMembers` row is created for them (typically via invitation).

### Talent (profile)

An individual's professional profile. **A user "is a talent" purely because this row exists for them** — not because of any stored flag on `users`.

| Field | Type | Notes | In this milestone? |
|---|---|---|---|
| `id` | uuid PK | | |
| `userId` | FK → User, unique | 1:1 with User — this uniqueness constraint is itself the source of truth for talent identity | |
| `name` | text | | **Included** |
| `bio` | text | | **Included** |
| `category` | text | primary profession/skill area | **Included** |
| `skills` | jsonb | | **Included** |
| `location` | text | | **Included** |
| `portfolio` | jsonb | links to work samples | Excluded — depends on the disabled `upload` router |
| `avatar` | text | image URL | Excluded — same dependency |
| `rate` | numeric | commercial/pricing concept | Excluded — not needed to prove persistence |
| `featured` | boolean | admin curation flag | Excluded — admin-only concept, out of scope |
| `createdAt` / `updatedAt` | timestamp | | |

**Invariant:** a Talent profile row can only be created, read, or updated by the User it belongs to (`userId` match) — or by a platform admin (`accessLevel = 'admin'`) — enforced server-side regardless of client-side display, per `docs/archive/AUTHENTICATION_ARCHITECTURE.md`'s "server-authoritative identity."

### Organization

**An employer is an organization, not a user role.** Represents a company or other entity that can employ or engage talent. Reshapes the old `employers` table away from its 1:1-with-a-single-user link.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `organizationType` | enum: `company`, `church`, `non_profit`, `government`, `school`, `university`, `agency`, `startup`, `other` | **Required at creation, no default.** Deliberately not defaulted to `'other'` — an organization must declare its type explicitly; silently defaulting would hide a real data-quality gap. Reflects that Levav's employer base spans more than conventional companies. |
| `industry` | text | |
| `size` | text/enum | company size band |
| `verificationStatus` | enum: `pending`, `in_review`, `verified`, `rejected` | unchanged concept from the pre-migration `employers.verificationStatus` |
| `businessDocuments` | jsonb | array of document references |
| `archivedAt` | timestamp, nullable | Archival instead of hard delete — an organization in dispute or offboarding shouldn't disappear outright. |
| `createdAt` / `updatedAt` | timestamp | |

**Invariant:** an Organization has zero or more members (via OrganizationMember) and is never itself a `User` row — no login credentials live on Organization directly.

### OrganizationMember

**The join entity that didn't exist in the original design** — the structural gap that made "employer" incorrectly modelable only as a single user. Represents one person's membership in one organization. **The existence of an active row here is what makes a user "an organization team member"** — again, not a stored flag on `users`.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organizationId` | FK → Organization, `ON DELETE CASCADE` | Deleting the organization removes its membership rows. |
| `userId` | FK → User, `ON DELETE CASCADE` | The member. Deleting this user removes their own membership rows. |
| `orgRole` | enum: `owner`, `admin`, `recruiter`, `member` | **Org-scoped** permissions, entirely distinct from `User.accessLevel`. Default vocabulary for this milestone; open to revision, not a blocker. |
| `status` | enum: `invited`, `active`, `removed` | Membership lifecycle uses status, not deletion — removing a member sets `status: 'removed'`, preserving history. |
| `invitedByUserId` | FK → User, nullable, **`ON DELETE SET NULL`** | Invitation provenance: who invited this member. **Null means a founding member** — self-created when the organization was registered, with no inviter. `SET NULL` (not `CASCADE`) is deliberate: this FK references a *different* user than the row's own subject (`userId`) — deleting the *inviter's* account must never delete the *invitee's* membership. Those are independent facts; only the provenance detail is lost. |
| `invitedAt` / `joinedAt` | timestamp, nullable | |
| `createdAt` / `updatedAt` | timestamp | |

**Invariants:**
- A `User` may belong to one or more Organizations simultaneously (multi-org membership is supported by the schema even though this milestone's UI may only exercise one — no schema rewrite needed later).
- **A `User` can simultaneously have a Talent row *and* one or more active OrganizationMember rows.** There is no exclusivity constraint between the two — see "Business capability derivation" above.
- `orgRole` gates what a member can do *within* that organization (e.g., only `owner`/`admin` org-roles manage verification or invite/remove other members) — this authorization logic is **not implemented in this milestone** but the schema shape already supports it so it isn't rewritten later.
- A one-membership-per-user-per-organization uniqueness constraint applies on (`organizationId`, `userId`).

## Adjacent entities (unchanged this milestone, listed for completeness)

These exist in the pre-migration schema and are not modified as part of this milestone. Historical status is retained in `docs/archive/PRODUCT_SYSTEM_MAP.md`.

| Entity | Relationship | Note |
|---|---|---|
| **Job** | belongs to an Organization (pre-migration: incorrectly FK'd to `employers`, i.e. effectively to a single user) | Will need its employer-side FK updated to `organizationId` when the `employer`/`job` routers are addressed in a later milestone — not done now |
| **Application** | belongs to a Job and a Talent | Unchanged |
| **Message** | between two Users | Unchanged |
| **Notification** | belongs to a User | Unchanged |
| **Review** | between two Users, referencing a Booking | Unchanged |

## What is explicitly deferred (not modeled now)

- **Champion status** — not part of the schema. If a Champion concept is added later, it should be modeled as its own additive field or small linked table (e.g., a `championStatus` on `users`, or a separate `champion_applications` table) — **explicitly never** as a value inside `accessLevel` or any business-identity enum, consistent with "Business capability derivation" above. No workflow, field, or column exists for this today.
- **Platform staff** as a tier distinct from `admin` — no evidence this exists as a real requirement yet; not added speculatively. If needed later, prefer a permissions table over expanding `accessLevel` further.
- **Fine-grained org-role permission enforcement** (what exactly `recruiter` vs `member` can do) — the *shape* exists (`orgRole` column) but the *authorization logic* is out of scope until the `employer` router is reviewed and enabled.
- **Job's `organizationId` migration** — noted above as necessary eventually, not part of this milestone's scope.

## Relationship summary

```
User (1) ──── (0..1) Talent                                    [talent identity = row exists]
User (1) ──── (0..*) OrganizationMember ──── (*..1) Organization [org capability = active row exists]
OrganizationMember.invitedByUserId ──── (0..1) User             [provenance; null = founding member]

User.accessLevel: standard | admin                    (platform-level access only, never business identity)
OrganizationMember.orgRole: owner | admin | recruiter | member   (org-scoped)
Organization.organizationType: company | church | non_profit | government | school | university | agency | startup | other
```
