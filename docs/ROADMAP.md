# Roadmap

This is the long-horizon phase sequence, given for orientation — **it is not a commitment to build every phase, and not permission to implement beyond whatever milestone is explicitly approved.** See `docs/NEXT_MILESTONE.md` for the one phase actually recommended to start now.

## Phase 0 — Repository safety and source-of-truth confirmation ✅ Done
Fixed the git-scoping issue, confirmed `levav-talent/` as canonical. See `docs/REPOSITORY_AUDIT.md` and `docs/DECISIONS.md`.

## Phase 1 — Development environment and dependency stability ✅ Done
Verified install/lint/typecheck/build/dev-server, documented every gap. See `docs/CURRENT_STATE.md`, `docs/DEPENDENCY_AUDIT.md`.

## Phase 2 — Architecture and data-model correction
Fix the confirmed backend bugs (`employer.ts`, `job.ts`), resolve the `users.role` enum mismatch (`employer`/`champion` roles used in frontend but not in DB schema), decide the runtime path-alias strategy, generate real migrations.

## Phase 3 — Authentication, organisations, roles and tenant isolation
Replace the fake client-side auth with the real `auth.ts` backend (already mostly correct) once Phase 2 is done. Extend the `users.role` enum. Establish real ownership/tenant checks (employer ↔ their jobs/applications, talent ↔ their profile).

## Phase 4 — Talent onboarding and Levav ID
Decide what "Levav ID" actually is as a concept (currently no distinct implementation exists — see `docs/PRODUCT_SYSTEM_MAP.md`) before building it; don't build a name without a defined mechanism.

## Phase 5 — Employer onboarding and workforce requirements
The `employers` table already models registration/verification well. Culture/values/hiring-criteria capture (per the product-audit questions in the original brief) has no schema or UI today — net new work.

## Phase 6 — Workforce Readiness Index
`wriScores` table exists; `wri.ts` endpoint is a stub. This is the smallest gap of any named Levav concept to close, if it's prioritized — schema and one route already scaffolded, just needs the scoring logic and a real endpoint.

## Phase 7 — Matching and opportunity systems
`job.ts`/`talent.ts` already provide a working data layer for a conventional job board. "Intelligent candidate matching" as envisioned (evidence-backed, explainable match reasoning) doesn't exist yet in any form — `SmartMatch.tsx` is a client-only static algorithm today.

## Phase 8 — Levav 28 and learning systems
Currently 100% frontend/localStorage (`Levav28.tsx`, `Learn.tsx`). No schema exists. Building this for real means designing tables for courses, lessons, progress, and completion/certification — none of which exist today.

## Phase 9 — QuickWork, SkillSpace and contribution systems
Same situation as Phase 8 — `QuickWork.tsx`, `SkillGap.tsx` are frontend-only with no schema. Volunteerism/verified-contribution tracking has no implementation anywhere.

## Phase 10 — Payments, subscriptions and commercial systems
`MilestonePayments.tsx` and admin `SubscriptionsSection.tsx` are both static mocks with zero backend or payment-provider integration today.

## Phase 11 — Administration, analytics and governance
Most of the 20 admin sections are static/mock (see `docs/CURRENT_STATE.md`). Real admin tooling needs to be built against the actual backend once it exists, not layered onto mock arrays.

## Phase 12 — UI/UX refinement, performance and production readiness
Bundle splitting (currently a single 2.38MB chunk), dark/light mode (currently half-wired, see `docs/UI_UX_AUDIT.md`), and a real accessibility pass are the concrete, already-identified items here.

---

**Where this roadmap actually starts, concretely, is Phase 2** (architecture/data-model correction) — everything from Phase 3 onward depends on the backend being genuinely runnable first. See `docs/NEXT_MILESTONE.md` for the specific, scoped first step.
