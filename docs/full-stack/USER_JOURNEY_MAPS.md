# User Journey Maps

**Status:** Product/architecture design document, conceptual only.

Each journey below lists the intended end-to-end flow, then what exists today (in `main`, with `backup-old-site` noted only where it offers a materially better reference), what's missing, and where it currently dead-ends.

## Talent journey

**Intended:** Account creation → identity → onboarding → personal discovery → mindset development → Levav 28 → practical tasks → evidence creation → WRI progression → Levav ID → learning → opportunities → matching → application → interview → placement → performance → feedback → continued growth → contribution.

| Stage | Exists in `main` today | Gap |
|---|---|---|
| Account creation | `Auth.tsx` — client-side fake session only | Needs real `auth.register` wiring (backend already exists and works — see `FRONTEND_BACKEND_CONNECTION_MATRIX.md`) |
| Identity | `talent.createOwnProfile` exists server-side, unreachable from any page | Wire `ProfileCreate.tsx`/`Onboarding.tsx` to it |
| Onboarding | `Onboarding.tsx`, local only | Needs real persistence once real auth exists |
| Personal discovery | Nothing dedicated (archived `DiscoveryJourney.tsx` is the closest reference, honestly reframed — see `TALENT_DEVELOPMENT_MODEL.md`) | Net-new design, informed by archived UX pattern minus the fake-"AI" framing |
| Mindset development / Levav 28 / practical tasks | `Levav28.tsx`, local, hardcoded content | Needs real persisted content (archived profession packs are a strong content reference) and real evidence capture |
| Evidence creation | Does not exist as a concept | Net-new domain — see `WRI_CONCEPTUAL_MODEL.md`, `DATABASE_DOMAIN_GAP_ANALYSIS.md` |
| WRI progression | `wriService.ts`, local-only computation | Needs a real evidence-backed engine — archived `wri-calculator.ts` is a strong reference |
| Levav ID | Does not exist in `main` | Archived `LevavIdExportPage.tsx` (working PDF export) is a strong reference |
| Learning | `Learn.tsx`, local, hardcoded catalog | Needs real content/backend |
| Opportunities / matching / application | `Opportunities.tsx`/`SmartMatchWidget.tsx`/`JobApply.tsx`, local, real matching algorithm over mock data | Needs real jobs/applications backend (written, unregistered — see `FRONTEND_BACKEND_CONNECTION_MATRIX.md`) and real evidence to match against |
| Interview | Does not exist in `main` | Net-new; archived `EmployerDashboard.tsx`'s interview scheduling is a reference for the employer side; talent-facing side has no strong archived reference (`InterviewPage.tsx` there is a static skeleton) |
| Placement / performance / feedback / continued growth / contribution | Does not exist in either codebase in real form | Entirely net-new — this is the Outcomes layer, sequenced last (`INTEGRATION_ROADMAP.md` Slice 13) because it structurally depends on everything before it being real first |

**Dead ends found today:** `Auth.tsx` never reaching the real backend means the entire journey after account creation is disconnected from any persistent identity — every subsequent "local" stage is actually anchored to nothing durable across devices/sessions. The Levav 28 "Certificate download" `alert()` is a literal dead end mid-journey.

## Employer journey

**Intended:** Account creation → authority attestation → organisation creation → organisation verification → organisation profile → Talent DNA → workforce goals → hiring criteria → role creation → matching → shortlist → interview → hiring → onboarding → performance feedback → retention insights → workforce analytics → measurable organisational value.

| Stage | Exists in `main` today | Gap |
|---|---|---|
| Account creation | Same as talent — fake session via `Auth.tsx` | Same fix as above |
| Authority attestation | Does not exist | Net-new — needed so "employer owner" claims are checked before an org can post jobs/see candidate data, not merely self-declared |
| Organisation creation / verification / profile | Schema exists (`organizations`, `organizationMembers`, `organization_verification_status` enum), no UI anywhere | Needs a full UI built against the existing, already-designed schema |
| Talent DNA / workforce goals / hiring criteria | Does not exist in either codebase | Entirely net-new — see `EMPLOYER_TALENT_DNA.md` |
| Role creation (jobs) | `EmployerJobs.tsx`, local, real CRUD logic | Needs the real `job` router (written, unregistered) |
| Matching / shortlist | `SmartMatchWidget.tsx`, real algorithm, mock data | Needs to run against real evidence once it exists |
| Interview | Does not exist in `main`; archived `EmployerDashboard.tsx` interview tab is the strongest reference in either codebase | Net-new build informed by that reference |
| Hiring / onboarding / performance feedback / retention insights / workforce analytics / organisational value | Does not exist in real form anywhere | Outcomes layer, entirely net-new, sequenced last |

**Dead ends found today:** an employer cannot create an organisation at all in `main`'s UI despite the schema supporting it — this is the single largest gap in the employer journey and the reason `INTEGRATION_ROADMAP.md` sequences organisation identity (Slice 7) immediately after core talent identity, before any employer-facing feature work.

## Development-organisation journey

**Intended:** Registration → organisation verification → programme creation → participant association → milestone contribution → structured feedback → evidence submission → endorsement → outcome reporting → talent development analytics.

Neither codebase has anything resembling this journey today. It depends entirely on the organisation-identity and evidence domains existing first (`DATABASE_DOMAIN_GAP_ANALYSIS.md`), and on the workspace separation in `USER_ROLES_AND_WORKSPACES.md` being respected — a school shouldn't be routed into the generic employer dashboard once one exists. Entirely net-new for Phase One, sequenced as Slice 12, after Talent DNA/jobs infrastructure exists to attach evidence to.

## Admin journey

**Intended:** Platform oversight → users → organisations → verification → consent → evidence disputes → opportunities → assessments → WRI integrity → payments → trust and safety → audit records → reporting → configuration.

`main`'s `Admin.tsx` + 21 Section components structurally cover a wide surface (users, employers, jobs, candidates, applications, courses, content moderation, roles, subscriptions, support, university, QuickWork, reports, audit, settings), but **zero of them call the real backend**, and five have the `safeJSONParse` bug that makes even their "real" local data path silently fail (`PRODUCT_SURFACE_INVENTORY.md`). Evidence disputes, verification queues, and WRI integrity have no equivalent anywhere in either codebase — genuinely net-new, and load-bearing for the trust story the whole product depends on (`AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`'s qualification-fraud concern). Sequenced as Slice 17, deliberately late — admin tooling needs real domains underneath it to administer, or it repeats the same "looks wired, isn't" trap.

## Cross-journey requirement

Every stage transition above needs, at minimum: the screen(s) involved, the API procedure(s) it calls, the permission rule enforced, the notification event fired (if any), and the audit event logged (if the action is evidence-, verification-, or money-adjacent). `FRONTEND_BACKEND_CONNECTION_MATRIX.md` is where this gets tracked concretely as domains are built; this document is the map of *what the stages are*, not yet the wiring detail.
