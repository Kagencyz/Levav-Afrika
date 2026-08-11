# Full-Stack System Audit

**Status:** Read-only audit. No code changed. Reflects the state of `main` (`bda184c`) and `origin/backup-old-site` (`8b23fb5`) as inspected during the Reconciliation, Modernisation and Integration phase.

This document is the top-level summary. Detail lives in the sibling documents in this folder — this one exists so a reader gets the shape of the whole system without opening all seventeen others.

## 1. Two unrelated codebases, one product idea

`main` and `backup-old-site` share no git ancestry (`git merge-base` returns nothing). They are two independent attempts at "Levav Talent," built by different sessions/authors, at different times, with different architectural choices. `main` is the active, smaller, more disciplined rebuild. `backup-old-site` is an earlier, much larger, more feature-complete but never-finished attempt, preserved only as a reference — see `docs/DECISIONS.md`'s reconciliation entries and `ARCHIVED_IMPLEMENTATION_REVIEW.md` for how it was recovered.

## 2. What `main` actually is today

- **Frontend:** Vite + React 19 + TypeScript, ~35 pages, 21 admin "Section" components, shadcn/ui + Radix + Tailwind, framer-motion, Three.js hero shader. Visually the most polished part of the codebase.
- **Backend:** Hono + tRPC v11 + Drizzle ORM against PostgreSQL. Only two router namespaces are registered and reachable: `auth` (register/login/me) and `talent` (create/update/get-own-profile, 3 of 6 written procedures). Everything else — employer, job, application, message, notification, review, upload, wri — is written but **deliberately unregistered** ("Stage A" exclusion, per `server/router.ts` comments and `docs/NEXT_MILESTONE.md`).
- **Database:** 4 tables (`users`, `talents`, `organizations`, `organizationMembers`). One migration generated, matches `schema.ts` exactly, **never applied to any database**.
- **Frontend↔backend wiring:** effectively zero. Grep of the entire `src/` tree finds 6 `trpc.*` call sites in 3 files, two of which (`ReviewForm.tsx`, `FileUpload.tsx`) are dead code never imported by any page. `Auth.tsx` — the one page that should call the real, working `auth.register`/`auth.login` procedures — instead fabricates a `localStorage` session client-side and never touches the network. The frontend tRPC client is also untyped (`createTRPCReact<any>()`), so nothing would catch this drift at compile time even if someone tried to fix it. Full detail: `FRONTEND_BACKEND_CONNECTION_MATRIX.md`.
- **Admin panel data bug:** five of the Admin panel's "real" sections (Jobs, Employers, Users, Candidates, Applications) call `safeJSONParse(localStorage.getItem(key), fallback)` instead of `safeJSONParse(key, fallback)` — a parameter-order bug that makes them **always** silently fall back to hardcoded mock arrays, never showing anything a user actually did on the site. Detail: `PRODUCT_SURFACE_INVENTORY.md`.
- **Documentation drift:** `CLAUDE.md` and `docs/CURRENT_STATE.md` describe an earlier snapshot (MySQL schema, `api/` directory, backend deps "not installed") that predates the Postgres rework, the `server/` rename, and the dependency additions committed in `1d05ee6`/`bda184c`. They need a refresh — flagged here, not fixed, per this phase's read-only mandate.

## 3. What `backup-old-site` actually is

A much bigger surface: ~39 pages, 28 tRPC routers, a 42-table Drizzle/MySQL schema with real `relations.ts`, a working (if disconnected) OAuth system, a genuinely sophisticated WRI scoring engine, and real profession-specific Levav 28 content (224 written scenarios across 8 professions). It is also unfinished in specific, documented ways: a local email/password auth system that was never wired into request context, several `ReferenceError`-guaranteed code paths from an unimported `env`, missing ownership checks on a handful of mutations, mock payment/WhatsApp integrations, effectively no real automated tests, and three-to-four duplicate implementations of the same page (two employer dashboards, two admin dashboards, three onboarding flows). Its own self-authored `PRODUCTION_AUDIT.md` rates it 6.2/10, "development-ready, not production-ready," and that verdict still holds. Full detail: `ARCHIVED_IMPLEMENTATION_REVIEW.md`, `SECURITY_AND_PRIVACY_REVIEW.md`.

Its greatest value is not as code to merge (it won't be — different schema, different DB dialect, different auth provider, disjoint history) but as a **reference**: a working WRI calculator with real weighted components, an ATS-grade employer dashboard, a proven tRPC-router-per-domain shape, a real profession-pack content library, and a battle-tested list of what not to repeat.

## 4. Net position, going into Phase One

| Layer | `main` today | Gap to Phase One |
|---|---|---|
| Identity | Fake client-side auth; real `auth`/`talent` backend exists but unreachable from any page | Wire login/register to the real backend; extend schema past 4 tables |
| Development (Levav 28) | Full mock UI, hardcoded content, localStorage progress | Needs real content (can draw on archived profession packs), real persistence, real evidence capture |
| Evidence | Does not exist as a concept in `main` | Needs a schema, an ingestion model, and a confidence/verification model (see `WRI_CONCEPTUAL_MODEL.md`) |
| Opportunity | Jobs/applications UI exists, entirely mock/localStorage; backend routers written, unregistered, missing ownership checks | Register + fix `server/routes/job.ts`/`application.ts`, connect real schema |
| Matching | `SmartMatchWidget.tsx` has a genuine, if simple, scoring algorithm over mock data | Needs to run against real evidence/WRI data, not `localStorage` |
| Outcomes | Does not exist | New domain entirely |

## 5. Confirmed constraints for this phase

- Migration `0000_round_jetstream.sql` unapplied — checksum `759350427944739f1c60be4661752e8bbd9d21be85591c5a9a150805178b06fb`, unchanged throughout this audit.
- Stage C authentication implementation not started.
- `origin/backup-old-site` is archival-only, not a merge candidate.
- Nothing in this phase modified source code, applied migrations, staged, committed, or pushed anything. See the Final Report for the explicit confirmations.
