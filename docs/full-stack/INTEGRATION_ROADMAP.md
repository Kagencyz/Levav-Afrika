# Integration Roadmap — Vertical Slice Plan

**Status:** Planning document. No implementation has begun. Every slice below is scoped, not built — this is what "approved" would authorize, not what has happened.

## Why vertical slices, not technical layers

Every slice delivers a complete user outcome (frontend + backend + data + permissions + validation + audit + tests together), not "do all the frontend work" then "do all the backend work." This is both a product requirement (a half-built layer delivers nothing to a real user) and a direct lesson from the audit: both codebases' worst failures (`main`'s silently-mock Admin panel, `backup-old-site`'s hardcoded `JobMatchingPage.tsx`) are exactly what happens when a layer ships without its counterpart.

## Definition of Done (applies to every slice, not restated per-slice below)

Interface works → data validated → permissions enforced → data stored → the right user can retrieve it → the wrong user cannot → loading/empty/error/success states all designed and built → errors handled without leaking internals → evidence-adjacent actions are auditable → mobile-usable on a mid-range device on a weak connection → accessible (keyboard nav, contrast, ARIA where applicable) → tests exist for the business logic and the permission boundary → the slice answers at least one of the two questions in `PRODUCT_VISION_AND_HEART.md`'s primary product principle.

## Phase One sequence

### Slice 1 — Identity, authentication and recovery
**Outcome:** a person can create a real, durable account and get back into it.
**User story:** "As a new user, I register with a real password and can log back in on another device."
**Frontend:** rewire `Auth.tsx` to call real `auth.register`/`auth.login`; new forgot/reset-password flow (no equivalent exists in `main`; `backup-old-site`'s `ResetPasswordPage.tsx`/`VerifyEmailPage.tsx` are a UX reference only).
**Backend:** `auth.register`/`login`/`me` already registered and correct; add `logout`, password-reset token issuance/consumption.
**DB:** `users` (exists); new password-reset-token table.
**Permissions:** public (register/login/reset-request), token-scoped (reset-consume).
**Validation:** existing Zod schemas on register/login; add reset-token expiry/single-use validation.
**Audit:** login success/failure, password reset events.
**Notifications:** password-reset email/notification.
**Tests:** register/login/reset happy path + wrong-password + expired-token + reused-token.
**Migration:** apply `0000_round_jetstream.sql` for the first time as part of this slice (currently unapplied — this is the first slice that requires a live database at all).
**Definition of done, slice-specific:** the frontend tRPC client is typed against a real `AppRouter` import before this slice ships (closes the untyped-client gap in `FRONTEND_BACKEND_CONNECTION_MATRIX.md`).

### Slice 2 — Talent identity and foundational profile
**Outcome:** a registered person has a real, persisted talent profile.
**Frontend:** wire `ProfileCreate.tsx`/`TalentProfile.tsx` to real `talent.createOwnProfile`/`updateOwnProfile`/`getOwnProfile`.
**Backend:** already written and registered; fix the real S3 upload wiring (`FileUpload.tsx` exists, unused — connect it, close the "coming soon" gap).
**DB:** `talents` (exists).
**Permissions:** owner-only read/write, already correctly enforced in `update`.
**Validation:** existing Zod schemas.
**Audit:** profile creation/update events.
**Tests:** ownership-check boundary (can't edit another user's profile).
**Definition of done, slice-specific:** the `talents_user_id_unique` constraint violation on double-create returns a clean `CONFLICT`, not a raw DB error (currently unhandled per `FRONTEND_BACKEND_CONNECTION_MATRIX.md`).

### Slice 3 — Talent discovery and onboarding
**Outcome:** a new talent completes a real, persisted onboarding/self-discovery flow.
**Frontend:** rebuild `Onboarding.tsx` against real persistence; design (don't literally port) a discovery/reflection step informed by `backup-old-site`'s `DiscoveryJourney.tsx` UX pattern, honestly labelled (no "AI" claim over deterministic scoring).
**Backend:** new onboarding-response endpoints.
**DB:** new onboarding-session/response tables.
**Permissions:** owner-only.
**Tests:** completion state persists across sessions/devices (the concrete thing `localStorage`-only onboarding cannot do today).
**Definition of done, slice-specific:** onboarding data feeds Slice 5's evidence/WRI model as real input, not a dead-end record.

### Slice 4 — Levav 28 and development journey
**Outcome:** a talent works through real, persisted, profession-relevant daily development content.
**Frontend:** rebuild `Levav28.tsx` against real content/persistence; real certificate generation replacing the `alert()` placeholder.
**Content:** review and adapt the archived `crucible-data.ts`/`crucible-packs.ts` profession packs (224 scenarios, 8 professions) as a starting library, expanding profession coverage as needed.
**Backend:** Levav 28 session/response endpoints; accountability-scored reflection using an adapted version of `backup-old-site`'s `ai-evaluation.ts` pattern (real regex-based scoring, optional LLM enhancement — not LLM-dependent).
**DB:** Levav 28 programme/day/task definitions, per-user sessions/responses.
**Permissions:** owner-only for responses; content is public/read-only.
**Audit:** completion events (they feed WRI).
**Definition of done, slice-specific:** every completed task produces a real evidence record (Slice 5), not just a checkbox.

### Slice 5 — Evidence and Workforce Readiness Intelligence
**Outcome:** real evidence accumulates and produces an explainable, contextual WRI.
**Frontend:** new WRI dashboard (talent-facing) built against real persisted history, not `backup-old-site`'s demo-data-only `WriHistoryPage.tsx` pattern — every score must be clickable into its supporting evidence.
**Backend:** adapt `backup-old-site`'s `wri-calculator.ts` weighted-component engine and `wriComponentScores` audit-log pattern; re-derive weights against the 15-dimension list in `WRI_CONCEPTUAL_MODEL.md` rather than copying its 7-component set verbatim.
**DB:** evidence table(s) with explicit confidence/verification-state field, readiness-dimension definitions, WRI snapshots (append-only, not overwrite — growth trajectory depends on history).
**Permissions:** owner sees own full detail; downstream viewers (employers, once Slice 10 exists) see contextual/summary views only, never raw evidence without the confidence framing.
**Audit:** every score computation logged with its inputs (the "why" requirement).
**Definition of done, slice-specific:** no score is ever displayed without a reachable explanation — this is a hard UI contract, not a nice-to-have, per `WRI_CONCEPTUAL_MODEL.md`.

### Slice 6 — Levav ID and trusted talent profile
**Outcome:** a talent has one portable, explainable, shareable identity artifact.
**Frontend:** new Levav ID view; PDF export adapted from `backup-old-site`'s working `LevavIdExportPage.tsx` (html2canvas + jsPDF) pattern.
**Backend:** aggregation endpoint pulling profile + WRI + evidence summary.
**Permissions:** owner controls what's included/shared; public share links are opt-in, not default.
**Definition of done, slice-specific:** a shared Levav ID link shows evidence-confidence framing to the viewer, same as any other WRI display surface.

### Slice 7 — Organisation identity and verification
**Outcome:** an organisation (employer or development-organisation type) can be created and verified.
**Frontend:** entirely new — no org-creation UI exists in `main` today despite the schema supporting it (`USER_JOURNEY_MAPS.md`'s largest confirmed gap).
**Backend:** org CRUD, membership invite/accept, verification-state transition with an audit trail (not just the current single enum field).
**DB:** `organizations`/`organizationMembers` (exist); new verification-audit table.
**Permissions:** org creation is any authenticated user (becomes `owner`); verification transitions are admin-only.
**Definition of done, slice-specific:** every `organizationType` (company/church/non_profit/government/school/university/agency/startup/other) has a working creation path — this is where the SME/NGO/church-usability principle either holds or fails.

### Slice 8 — Employer onboarding and Talent DNA
**Outcome:** an organisation captures a structured Talent DNA, not a flat "about us" field.
**Frontend:** new multi-step Talent DNA capture flow (reuse the multi-step-flow pattern proven in Slices 3–4), including the real-time bias-flagging prompts from `EMPLOYER_TALENT_DNA.md`'s translation table.
**Backend:** Talent DNA CRUD with criteria type-tagging (essential/trainable/preference-flagged).
**DB:** new Talent DNA domain tables (net-new — no equivalent in either audited codebase).
**Permissions:** org-scoped, `owner`/`admin` orgRole only.
**Definition of done, slice-specific:** free-text culture/behavioural fields cannot be saved without passing through the bias-guardrail translation prompt at least once.

### Slice 9 — Workforce goals and role criteria
**Outcome:** an organisation defines what success looks like for a specific role, not just "a job."
**Frontend:** role-criteria builder attached to job creation.
**Backend/DB:** role-criteria tables, linked to Talent DNA and to jobs (Slice 10).
**Definition of done, slice-specific:** criteria are explicitly tagged essential vs. trainable, feeding Slice 11's matching explanation.

### Slice 10 — Jobs, opportunities and matching
**Outcome:** real jobs exist, and matching runs against real evidence, not mock data.
**Frontend:** rebuild `EmployerJobs.tsx`/`Opportunities.tsx` against a real backend; extend `SmartMatchWidget.tsx`'s already-real algorithm to run against real WRI/evidence data instead of `localStorage`.
**Backend:** register and fix `server/routes/job.ts` (the `ctx.user.role`/`accessLevel` bug), build real jobs/opportunities tables (currently referenced by unregistered routes but with no backing table at all).
**DB:** `jobs`, `opportunities`.
**Permissions:** job CRUD scoped to owning org; matching results are per-viewer explainable, not just a number.
**Definition of done, slice-specific:** no match score ships without an explanation referencing real criteria and real evidence — the explicit fix for the `JobMatchingPage.tsx` failure mode.

### Slice 11 — Applications, shortlisting and interviews
**Outcome:** a full apply→shortlist→interview loop on real data.
**Frontend:** rebuild application flow (reference `backup-old-site`'s `application-store.ts`/`JobDiscoveryPage.tsx` bidirectional pattern); new interview scheduling (reference `EmployerDashboard.tsx`'s interview tab — the strongest archived reference for this).
**Backend:** register and fix `server/routes/application.ts` (missing ownership checks on `byJob`/`updateStatus` — must be fixed, not just registered as-is).
**DB:** `applications`, `interviews`.
**Permissions:** applicant sees own applications; org sees applications to its own jobs only, enforced at the query level, not just the UI.
**Definition of done, slice-specific:** the ownership-check bugs identified in `FRONTEND_BACKEND_CONNECTION_MATRIX.md` are closed before this ships, not carried forward.

### Slice 12 — Development organisations and evidence contribution
**Outcome:** a school/NGO/church can attest to real milestones/feedback for a talent, with consent.
**Frontend:** new workspace (per `USER_ROLES_AND_WORKSPACES.md` — must not be forced into the generic employer dashboard).
**Backend/DB:** consent records, attestation/endorsement tables feeding the Evidence domain (Slice 5).
**Permissions:** consent-gated — an org cannot attest to a person without that person's prior, revocable consent.
**Definition of done, slice-specific:** this is the concrete product answer to "how do institutions contribute evidence" (`PRODUCT_COHERENCE_REVIEW.md` Q18).

### Slice 13 — Outcomes, employer feedback and WRI progression
**Outcome:** real hiring/placement outcomes exist and feed back into WRI.
**Frontend:** outcome-recording UI for employers (hired/not-progressed + optional structured feedback).
**Backend/DB:** outcome-record tables, linkage into WRI component 10 (`WRI_CONCEPTUAL_MODEL.md`).
**Definition of done, slice-specific:** this is the slice that finally makes the "outcome history" WRI component real — cannot ship earlier, since it requires Slices 10–11's real applications to exist first.

### Slice 14 — Learning, badges and certificates
**Outcome:** real course completion producing real, verifiable credentials.
**Frontend:** rebuild `Learn.tsx` against real content/backend; certificate view with public verification-by-code (reference `backup-old-site`'s `CertificatePage.tsx` pattern).
**DB:** courses/lessons/enrollments/progress, certificates, badges.
**Definition of done, slice-specific:** certificates and badges are evidence items with the same confidence-framing requirement as any other evidence (Slice 5), not a decorative add-on.

### Slice 15 — Messaging and notifications
**Outcome:** real, working messaging and notifications, closing the currently-broken `NotificationBell.tsx` gap.
**Backend:** register `server/routes/message.ts` (already correctly scoped) and `server/routes/notification.ts` (fix the arbitrary-`userId` gap first).
**Frontend:** fix the dead `/notifications` link; wire `Messages.tsx` to the real backend.
**Definition of done, slice-specific:** `NotificationBell.tsx`'s calls actually succeed against a registered router for the first time.

### Slice 16 — Employer analytics and HR decision support
**Outcome:** real dashboards answering the seven HR questions in `HR_VALUE_PROPOSITION.md`, not static chart arrays.
**Frontend:** rebuild `EmployerAnalytics.tsx` against real application/outcome data.
**Definition of done, slice-specific:** every chart traces to a real query, no hardcoded `MONTHS`/`APPLICATIONS_OVER_TIME`-style arrays.

### Slice 17 — Admin, trust, verification and audit
**Outcome:** a real admin panel administering real domains, and a real trust/safety workflow for evidence disputes.
**Frontend:** fix the `safeJSONParse` bug across the 5 affected Admin sections at minimum; connect all 21 Section components to real backend queries; new evidence-dispute/verification-review workspace (net-new, no equivalent in either codebase).
**Permissions:** consider a dedicated trust-and-safety access tier rather than folding into generic `admin` (flagged as a product-owner decision in the Final Report).
**Definition of done, slice-specific:** sequenced deliberately last among the "core" slices because it needs Slices 1–16's real domains to actually administer — an admin panel over real data now, not a second silent-mock surface.

### Slice 18 — Monetisation and subscriptions
**Outcome:** a real, working subscription/billing model for organisations.
**Reference:** `backup-old-site`'s `employer-billing.ts` tier structure (job credits, featured slots, team seats) is a clean, reusable SaaS-tier *model* — the payment rail behind it was mocked and is not a reference for actual integration (`SECURITY_AND_PRIVACY_REVIEW.md`).
**Definition of done, slice-specific:** a real payment provider integration, not a simulated timer-based "verification" like the archived branch's.

### Slice 19 — External integrations and PWA
**Outcome:** the product works acceptably offline-tolerant and mobile-installable, per `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`.
**Reference:** `backup-old-site`'s `usePWA.ts` is a complete, portable reference implementation.
**Scope:** WhatsApp/push integrations only if a real, authenticated (not the archived branch's public/unauthenticated `send`) implementation is built.

### Slice 20 — Deferred expansion assessment: QuickWork, Champions, SkillSpace
**Not a build slice — an explicit decision point.**
- **SkillSpace / skilled trades / informal-work marketplace:** stays Coming Soon per the phase mandate. Not assessed further here.
- **Champions:** real, DB-backed application/review lifecycle exists in the archived branch and is a reasonably low-risk feature to build for real in a later phase — not required for the core loop, so it stays deferred past Phase One's 17 core/supporting slices, but isn't flagged as risky.
- **QuickWork:** requires its own go/defer decision, not a default include. In its favour: shift-based evidence (a completed, rated QuickWork shift) is a legitimate Evidence-layer input for people without formal employment history, directly serving the informal-experience principle. Against: the archived reference implementation has a real rating-logic bug (`rateShift` comparing a profile id to a user id), shallow frontend persistence, and — more importantly — QuickWork is its own two-sided marketplace (a QuickWork client and worker role, `USER_ROLES_AND_WORKSPACES.md`) with its own trust/payment/dispute surface, which is a lot of net-new scope for a Phase One that's already large. **Recommendation: defer QuickWork past Phase One**, but keep its evidence-contribution angle in mind when designing the Evidence domain in Slice 5, so a later QuickWork slice can plug in without a schema rework.

## Recommended deviation from a literal layer-by-layer reading

The phase brief's default order is followed above with one deliberate emphasis: **Slice 1 explicitly includes fixing the untyped tRPC client**, and **Slice 10/11 explicitly include fixing the specific ownership-check bugs found in the audit**, rather than treating "register the existing router" as sufficient. Registering broken authorization logic as-is would just move the "looks wired, isn't" failure mode from the frontend (today's problem) to the backend (tomorrow's), which is the one outcome this whole phase exists to prevent.
