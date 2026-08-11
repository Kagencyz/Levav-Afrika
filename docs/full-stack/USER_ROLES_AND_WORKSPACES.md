# User Roles and Workspaces

**Status:** Product/architecture design document, conceptual only. No schema or code changed by this document.

## Foundational separation

`main`'s current schema already gets the hardest part of this right, and it must not be re-collapsed: **platform access level, business identity, and organisation membership are three separate concepts, never one global role field.** This was a deliberate, already-approved correction (`docs/DECISIONS.md`'s "Stage B amended" entry) — `users.accessLevel` (`standard | admin`) is platform-level only; "is a talent" is derived from a `talents` row existing; "is on an org's team, in what capacity" is derived from an `organizationMembers` row with its own `orgRole`. A person can be a talent *and* an active organisation member simultaneously — the old exclusive-enum design forbade this and was corrected specifically because it was wrong.

This document extends that same separation across every role implied by the product vision:

- **Platform access level** — how much platform-wide access (`standard`/`admin`, possibly a future `trust_and_safety` tier).
- **Business identity** — talent, or not (derived from a `talents` row).
- **Organisation membership** — which organisation(s), in what `orgRole`, with what `status` (invited/active/removed) — a person can belong to multiple organisations simultaneously, each with its own role.
- **Feature-specific permissions** — e.g. Champion status, Creator status, Coordinator status — each its own record, not a value inside any of the above.
- **Assigned responsibilities** — e.g. "coordinator for volunteer programme X" — scoped to a specific programme/organisation, not global.
- **Public profile identity** — what's shown externally, which can differ from all of the above (a person can be an active recruiter at Org A and choose not to surface that on their public Talent profile).

A single person can hold multiple of these simultaneously and safely — a talent who is also a mentor, a recruiter at one organisation, and a volunteer-programme representative at another. The architecture must support this by construction, not as an edge case handled later.

## Role inventory

| Role | Platform access | Business identity | Org membership | Feature permission | Notes |
|---|---|---|---|---|---|
| Talent | standard | `talents` row | none required | — | Core Phase One population |
| Employer owner | standard | none required | `orgRole = owner` | — | First member of an organisation, full control |
| Employer administrator | standard | none required | `orgRole = admin` | — | Delegated org-level control |
| Recruiter | standard | none required | `orgRole = recruiter` | — | Job posting/applicant review scope, not full org control |
| Hiring manager | standard | none required | `orgRole = member` + role-scoped assignment | — | Reviews/decides on specific roles, not org-wide |
| Organisation representative (generic) | standard | none required | any `orgRole` | — | Umbrella term; specific orgRole determines actual permission |
| School/university representative | standard | none required | membership in an org with `organizationType = school|university` | development-organisation contribution permission | Same membership model, different `organizationType` |
| NGO/charity representative | standard | none required | membership in an org with `organizationType = non_profit` | development-organisation contribution permission | |
| Volunteer programme representative | standard | none required | org membership | coordinator-scoped programme assignment | Distinct from generic org admin — scoped to programme(s), not whole org |
| Mentor | standard | may also be `talents` row | none required | mentor-relationship permission | Explicitly a feature permission, not an org membership — a mentor isn't necessarily affiliated with any organisation |
| Advisor | standard | — | — | advisor-feature permission | If built as a real feature (not the archived template-text version) |
| Champion | standard | typically also `talents` row | none required | Champion-status permission, awarded via application/review | |
| Course creator | standard | — | — | Creator-status permission, awarded via application/review | |
| Trainer | standard | — | membership in a training-institution org, or independent | development-organisation contribution permission | |
| Platform administrator | `accessLevel = admin` | — | — | — | Global platform access |
| Trust and safety administrator | `accessLevel = admin` (or a future dedicated tier) | — | — | dispute/evidence-review permission | Worth a dedicated tier rather than folding into generic `admin` once verification disputes are real — flagged as a Phase One design decision, see `PRODUCT_COHERENCE_REVIEW.md`'s product-owner decisions list |
| QuickWork client | standard | none required | org membership optional (individuals can post QuickWork too) | — | Only relevant if QuickWork is in scope — see `INTEGRATION_ROADMAP.md` Slice 20 |
| QuickWork worker | standard | `talents` row | none required | — | Same deferral note applies |

## Workspace/dashboard map

A **workspace** is a UI surface scoped to one of the identities above, not one giant role-branched dashboard component (the failure mode in both audited codebases — `main`'s `Dashboard.tsx` role-branches internally via `user?.role`, an approach that will not scale once a person can hold multiple simultaneous identities).

| Workspace | Who sees it | Primary data scope | Should not see |
|---|---|---|---|
| Talent workspace | Anyone with a `talents` row | Own profile, own evidence, own applications, own WRI (all dimensions/scopes) | Other talents' private evidence, employer-side Talent DNA/criteria |
| Organisation workspace | Active `organizationMembers` of that org | That org's Talent DNA, jobs, applicants, shortlist, analytics — scoped strictly to that `organizationId` | Other organisations' data, even for a platform admin's org membership (admin access is a separate, audited path, not implicit via org role) |
| Development-organisation workspace | Active members of a school/university/NGO/church-type org | Their own programmes, participants, milestone/evidence contributions, evidence-submission tools scoped to consented relationships only | Should **not** be forced into the generic employer dashboard — a school submitting a milestone attestation has fundamentally different needs than a company reviewing job applicants, and conflating the two dashboards is exactly the "collapse into one role field" mistake this document exists to prevent |
| Coordinator workspace | Users with a coordinator assignment for a specific programme | Validation queue scoped to that programme only | Other programmes' submissions |
| Mentor workspace | Users with an active mentor relationship | Their mentee relationships and associated structured feedback tools | General talent search/browse (unless also separately a recruiter) |
| Admin workspace | `accessLevel = admin` | Platform-wide: users, organisations, verification queue, disputes, WRI integrity, audit log, configuration | — |
| Trust & safety workspace | Trust & safety tier (or admin, if not split out) | Evidence disputes, verification review, audit trail | General user PII beyond what's needed for a specific case |

## Design rule this implies for every future dashboard

Before building any new dashboard, ask: which of the six roles/workspaces above does this belong to, and does the data query it needs naturally scope to one `organizationId`/`userId`/programme, or does it require special-casing to avoid leaking across scopes? If a feature needs a person's multiple simultaneous identities merged into one view (e.g. "everything I'm involved in" as a landing page), that's a legitimate aggregation layer *on top of* the scoped workspaces — it must never become the reason permission logic gets embedded ad hoc inside a single mega-component, which is what happened in both audited codebases' Admin panels.
