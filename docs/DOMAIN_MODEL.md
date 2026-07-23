# Domain Model

**Status:** Accepted, planning-stage. Defines the target entity/relationship shape for the milestone in `docs/NEXT_MILESTONE.md`. No schema file has been edited and no migration has been generated to implement this — see `docs/DECISIONS.md` for what's actually been executed versus documented.

This is the authoritative definition of entities, relationships, and invariants for the current milestone's scope (identity, organizations, talent profiles). It is not a restatement of `docs/PRODUCT_SYSTEM_MAP.md` (which tracks concept-to-code *status*) — this document defines the *shape* those concepts should take once built. Entities outside this milestone's scope (Job, Application, Message, Notification, Review, WRIScore) are listed for completeness and left otherwise unchanged from today's schema; see `docs/PRODUCT_SYSTEM_MAP.md` for their current status.

## Core entities (in scope for this milestone)

### User

The platform-level identity. One row per person who can log in.

| Field | Type | Notes |
|---|---|---|
| `id` | serial/uuid PK | |
| `email` | text, unique | |
| `passwordHash` | text | bcrypt, cost 12 — unchanged from today |
| `name` | text | |
| `role` | enum: `talent`, `employer_member`, `admin` | Platform-level only. Does **not** encode organization membership or org-scoped permissions — see OrganizationMember. Does **not** encode Champion status — see below. Replaces today's `['talent','client','admin']`; `'client'` is retired as an ambiguous legacy value. |
| `championStatus` | enum: `none`, `applied`, `approved` (nullable, default `none`) | Additive to a `talent`; never a replacement for `role`. A user can be `role: 'talent'` AND `championStatus: 'approved'` simultaneously. Not a valid status for `employer_member` or `admin`. |
| `createdAt` | timestamp | |

**Invariant:** `role` is set once at registration (`talent` or `employer_member` only — `admin` is never self-assignable, see `docs/AUTHENTICATION_ARCHITECTURE.md`) and is not intended to change via normal product flows in this milestone (no self-service role-switching).

### Talent (profile)

An individual's professional profile. Exists only for users with `role = 'talent'`.

| Field | Type | Notes | In this milestone? |
|---|---|---|---|
| `id` | serial/uuid PK | | |
| `userId` | FK → User, unique | 1:1 with User | |
| `name` | text | | **Included** |
| `bio` | text | | **Included** |
| `category` | text | primary profession/skill area | **Included** |
| `skills` | text[] / jsonb | | **Included** |
| `location` | text | | **Included** |
| `portfolio` | text[] / jsonb | links to work samples | Excluded — depends on the disabled `upload` router |
| `avatar` | text | image URL | Excluded — same dependency |
| `rate` | numeric | commercial/pricing concept | Excluded — not needed to prove persistence |
| `featured` | boolean | admin curation flag | Excluded — admin-only concept, out of scope |
| `createdAt` | timestamp | | |

**Invariant:** a Talent profile row can only be created, read, or updated by the User it belongs to (`userId` match), enforced server-side regardless of client-side role display — see `docs/AUTHENTICATION_ARCHITECTURE.md`'s "server-authoritative identity."

### Organization

**An employer is an organization, not a user role.** Represents a company/business. Reshapes today's `employers` table away from its current 1:1-with-a-single-user link.

| Field | Type | Notes |
|---|---|---|
| `id` | serial/uuid PK | |
| `name` | text | |
| `industry` | text | |
| `size` | text/enum | company size band |
| `verificationStatus` | enum: `pending`, `in_review`, `verified`, `rejected` | unchanged concept from today's `employers.verificationStatus` |
| `businessDocuments` | jsonb | array of document references |
| `createdAt` / `updatedAt` | timestamp | |

**Invariant:** an Organization has zero or more members (via OrganizationMember) and is never itself a `User` row — no login credentials live on Organization directly.

### OrganizationMember

**The join entity that doesn't exist today** — this is the structural gap that made "employer" incorrectly modelable only as a single user. Represents one person's membership in one organization.

| Field | Type | Notes |
|---|---|---|
| `id` | serial/uuid PK | |
| `organizationId` | FK → Organization | |
| `userId` | FK → User, where `User.role = 'employer_member'` | |
| `orgRole` | enum: `owner`, `admin`, `recruiter`, `member` | **Org-scoped** permissions, distinct from `User.role`. Adopted as the default vocabulary for this milestone; open to revision if the team wants different names, but not a blocker. |
| `status` | enum: `invited`, `active`, `removed` | |
| `invitedAt` / `joinedAt` | timestamp, nullable | |

**Invariants:**
- A `User` with `role = 'employer_member'` may belong to one or more Organizations (the model supports multiple memberships even though this milestone's UI may only exercise one — no schema rewrite needed later to support multi-org membership).
- `orgRole` gates what a member can do *within* that organization (e.g., only `owner`/`admin` org-roles manage verification or invite/remove other members) — this authorization logic is **not implemented in this milestone** (the `employer` router stays unregistered per `docs/NEXT_MILESTONE.md` §4) but the schema shape must already support it so it isn't rewritten when that router is enabled later.
- A `User` with `role = 'talent'` or `role = 'admin'` never has an OrganizationMember row.

## Adjacent entities (unchanged this milestone, listed for completeness)

These exist in today's schema and are not modified as part of this milestone. Full status in `docs/PRODUCT_SYSTEM_MAP.md`.

| Entity | Relationship | Note |
|---|---|---|
| **Job** | belongs to an Organization (today: incorrectly FK'd to `employers`, i.e. effectively to a single user) | Will need its employer-side FK updated to `organizationId` when the `employer`/`job` routers are addressed in a later milestone — not done now |
| **Application** | belongs to a Job and a Talent | Unchanged |
| **Message** | between two Users | Unchanged |
| **Notification** | belongs to a User | Unchanged |
| **Review** | between two Users, referencing a Booking | Unchanged |
| **WRIScore** | belongs to a Talent | Backend stub (`wri.ts`), unchanged |

## What is explicitly deferred (not modeled now)

- **Platform staff** as a tier distinct from `admin` — no evidence this exists as a real requirement yet; not added speculatively. If needed later, prefer a permissions table over expanding the `role` enum further.
- **Fine-grained org-role permission enforcement** (what exactly `recruiter` vs `member` can do) — the *shape* exists (`orgRole` column) but the *authorization logic* is out of scope until the `employer` router is reviewed and enabled.
- **Champion application workflow details** (the approval process behind `championStatus` transitioning from `applied` → `approved`) — the field exists to avoid a later migration, but the workflow itself is not built in this milestone.
- **Job's `organizationId` migration** — noted above as necessary eventually, not part of this milestone's scope.

## Relationship summary

```
User (1) ──── (0..1) Talent
User (1) ──── (0..*) OrganizationMember ──── (*..1) Organization
User.role: talent | employer_member | admin        (platform-level)
OrganizationMember.orgRole: owner | admin | recruiter | member   (org-scoped)
User.championStatus: none | applied | approved      (additive to talent, independent axis)
```
