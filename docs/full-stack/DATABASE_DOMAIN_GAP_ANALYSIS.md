# Database and Domain Gap Analysis

**Status:** Conceptual comparison. No schema modified. The current migration (`0000_round_jetstream.sql`, checksum `759350427944739f1c60be4661752e8bbd9d21be85591c5a9a150805178b06fb`) remains unapplied and untouched.

## Current foundation (`main`, Postgres, `db/schema.ts`)

Four tables, deliberately scoped ("Stage B: only the four approved foundational entities are modeled here" — explicit header comment in `schema.ts`):

| Table | Purpose | Key relations |
|---|---|---|
| `users` | Platform identity + `accessLevel` (standard/admin) only | — |
| `talents` | Talent business identity, 1:1 with `users` via unique index | FK → `users`, CASCADE |
| `organizations` | Employer/institution identity, `organizationType` enum (company/church/non_profit/government/school/university/agency/startup/other), `verificationStatus` | — |
| `organizationMembers` | Org membership, `orgRole` enum, `status` lifecycle, `invitedByUserId` (SET NULL, not CASCADE, deliberately) | FK → `organizations` CASCADE, → `users` CASCADE, → inviter `users` SET NULL |

This foundation is correctly designed for what it covers — the accessLevel/business-identity separation matches `USER_ROLES_AND_WORKSPACES.md` exactly, and the `organizationType` enum already anticipates schools/NGOs/churches per `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`. The gap is not quality, it's coverage: everything past "who exists and who belongs to what org" is unbuilt.

## What the six product layers require, domain by domain

Cross-referencing `PRODUCT_VISION_AND_HEART.md`'s six layers against what exists (✅ = exists in `main`'s schema, ⚠️ = written in `main`'s route files but no backing table, 🆕 = doesn't exist in either codebase's schema):

### Layer 1 — Levav Identity
✅ users, talents, organizations, organizationMembers. 🆕 authority attestations (proof an "employer owner" claim is legitimate), consent records (needed once evidence-sharing/verification exists), verification-status history (org verification is a single enum field today with no audit trail of who verified what, when).

### Layer 2 — Levav Development
🆕 entirely: Levav 28 programme/day/task definitions, per-user Levav 28 sessions and responses, readiness-dimension definitions, course/lesson/enrollment/progress tables. `backup-old-site`'s `db/relations.ts` has a real, consistent reference shape for most of this (levav28Sessions/Responses, courses/lessons/enrollments/progress) — worth reviewing as a starting point, not copying verbatim (different dialect, different auth model tied into it).

### Layer 3 — Levav Evidence
🆕 entirely, and the least precedented domain in either codebase. Needs: an `evidence` table (polymorphic or per-type — a real design decision, not just a name) with an explicit confidence/verification-state field (`WRI_CONCEPTUAL_MODEL.md`), skills, projects, experience, education, endorsements, volunteer records, assessments, certificates, badges, workplace/interview feedback. `backup-old-site` has real tables for several of these pieces individually (skills/experience/education, certificates, achievementBadges/userBadges) but no unifying evidence-confidence concept across them — that's genuinely new design work, not something to port.

### Layer 4 — Levav Opportunity
⚠️ `jobs`/`applications` tables referenced by `main`'s written-but-unregistered route files don't exist yet. 🆕 opportunities beyond jobs (graduate programmes, internships, fellowships, mentoring slots), QuickWork shifts if in scope (`INTEGRATION_ROADMAP.md` Slice 20).

### Layer 5 — Levav Matching
🆕 entirely: Employer Talent DNA storage (`EMPLOYER_TALENT_DNA.md`'s captured fields — mission/values/culture/behavioural expectations/criteria with type tags), workforce goals, role criteria, matching-result records (so a match can be explained/audited after the fact, not recomputed and forgotten).

### Layer 6 — Levav Outcomes
🆕 entirely: interview records, placement/hiring records, retention/performance feedback, outcome-history linkage back into WRI (`WRI_CONCEPTUAL_MODEL.md` component 10). No precedent in either codebase.

### Cross-cutting, needed regardless of layer
🆕 notifications (table referenced by `main`'s unregistered route, doesn't exist), messages (same), audit events (needed the moment evidence/verification/disputes/payments are real), consent records, disputes.

## Domain-by-domain design notes (per the audit's requested checklist)

For each domain group below: owning aggregate, tenancy boundary, lifecycle, sensitive fields, and notable requirements.

| Domain | Owning aggregate | Tenancy boundary | Lifecycle | Sensitive fields | Notes |
|---|---|---|---|---|---|
| Users / auth identities | `users` | Global (platform) | Soft-delete already modeled (`deletedAt`) | `passwordHash`, email | Already built correctly |
| Recovery mechanisms | `users` | Global | Token-based, time-bound | Reset tokens | 🆕 — not present in `main`; `backup-old-site`'s `ResetPasswordPage`/`VerifyEmailPage` flows are a reasonable UX reference, not a schema reference (different auth stack) |
| Talent profiles | `talents` | Owned by one `user` | Long-lived, rarely deleted | Bio/location (PII-adjacent) | Built |
| Organisations / membership / invitations | `organizations`, `organizationMembers` | Org-scoped | Soft-archive (`archivedAt`) for org, status lifecycle for membership | Business documents (jsonb) | Built |
| Authority attestation / org verification | 🆕 | Org-scoped | Needs an audit trail (who verified, when, on what evidence), not just a status enum | Verification documents | New domain — directly serves the qualification-fraud/trust principle |
| Employer Talent DNA / workforce goals / role criteria | 🆕 | Org-scoped | Editable, versioned (criteria should be periodically re-surfaced per `EMPLOYER_TALENT_DNA.md`'s bias-review requirement) | Culture/behavioural free-text — needs the bias-flagging path from `EMPLOYER_TALENT_DNA.md` applied at write time | New domain, Phase One critical path |
| Jobs / opportunities / applications | 🆕 (route files exist, tables don't) | Job → org-scoped; application → talent + org scoped | Jobs archivable, applications status-lifecycle | — | Fix ownership-check bugs (see `FRONTEND_BACKEND_CONNECTION_MATRIX.md`) when building real tables, don't just port the buggy route logic as-is |
| Interviews / matching results | 🆕 | Application-scoped | — | — | Matching results should be persisted/explainable, not recomputed silently |
| Levav 28 / readiness dimensions / WRI observations / snapshots | 🆕 | User-scoped, role/org-context-scoped for the alignment dimensions | Append-only history preferred over overwrite (growth trajectory needs it — `WRI_CONCEPTUAL_MODEL.md`) | — | Highest-value new domain; `backup-old-site`'s `wri-calculator.ts` + `wriComponentScores` audit-log pattern is a strong structural reference |
| Skills / projects / experience / education / evidence / endorsements | 🆕 | User-scoped, with per-item verification state | — | Endorser identity (who vouched) | Every item needs the confidence/verification-state field from day one, not bolted on later |
| Volunteer records / assessments / courses / enrolments / certificates / badges | 🆕 | User-scoped, some org-attested | — | — | Development-organisation domain depends on this existing with consent/attestation fields |
| Feedback / mentor relationships | 🆕 | Relationship-scoped (two parties, not a single owner) | — | Feedback content is sensitive — needs its own access rule, not inherited from either party's general profile visibility | |
| Notifications / messages | 🆕 (route files exist, tables don't) | User-scoped (both sides for messages) | — | Message content | |
| Referrals / outcome records | 🆕 | Deferred until real users/orgs exist to reference | — | — | Sequenced late (`INTEGRATION_ROADMAP.md`) |
| Consent / disputes / verification / audit events | 🆕 | Cross-cutting | Append-only for audit events | By definition, sensitive | Needed the moment any evidence/verification/dispute domain goes live — cannot be deferred once Layer 3 (Evidence) ships, since evidence without an audit trail undermines the trust story |
| Subscriptions / payments / future wallet or ledger | 🆕 | Org-scoped (subscriptions) / user-scoped (wallet, if QuickWork ships) | — | Payment method details | Sequenced last (`INTEGRATION_ROADMAP.md` Slice 18); `backup-old-site`'s payment router is honestly mocked and not a real-integration reference |

## Sequencing recommendation

Do not build one giant schema. Sequence domains by what the user journeys in `USER_JOURNEY_MAPS.md` actually need next, which is also causally required (you cannot evidence something before Development exists to produce it; you cannot match before Evidence and Talent DNA both exist). This is precisely the logic behind `INTEGRATION_ROADMAP.md`'s slice order — that document is where domain sequencing becomes concrete deliverables; this document is the map of what those deliverables need to contain.

## What not to inherit from `backup-old-site`'s schema

Its 42-table MySQL/PlanetScale schema (`db/relations.ts`) is internally consistent and a legitimate reference for table shapes, but it is not a migration source: different dialect (MySQL vs Postgres), tied to a different, disconnected auth model (Kimi OAuth), and — per `SECURITY_AND_PRIVACY_REVIEW.md` and `ARCHIVED_IMPLEMENTATION_REVIEW.md` — includes fields/patterns designed around a payment/WhatsApp integration that was mocked, not real. Treat it as a checklist of "domains someone already thought through," not as SQL to adapt directly.
