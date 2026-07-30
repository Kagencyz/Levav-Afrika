# Decisions Log

Architectural and process decisions made during the initial repository audit, with rationale. Append new entries chronologically; don't rewrite history here.

## 2026-07-23 — Re-scoped git to a dedicated repository inside `levav-talent/`

**Decision:** initialized a fresh `git init` inside `levav-talent/` rather than continuing to use the pre-existing repository rooted at `~/Downloads`.

**Why:** the old repository's root was the entire `~/Downloads` folder, commingling this project with hundreds of unrelated personal files, and its index held ~660 staged-but-uncommitted entries spanning that whole folder (installer images, other client projects, a SQL dump, financial CSVs). The canonical `levav-talent/` folder itself was entirely untracked in that repository. See `docs/REPOSITORY_AUDIT.md` for full detail.

**What was NOT done:** the old `~/Downloads/.git` was not deleted, modified, committed to, or pushed. It was left exactly as found, in case anything there is still needed.

## 2026-07-23 — `levav-talent/` confirmed as the canonical codebase

**Decision:** treat `levav-talent/` (full-stack: Vite/React + Hono/tRPC/Drizzle/MySQL) as the canonical Levav Talent codebase, and the sibling `app/` folder (frontend-only, from the original Kimi generation) as historical reference only.

**Why:** confirmed directly by the user. `app/`'s only connection to git history is the original single commit in the old Downloads-rooted repo; it is not part of `levav-talent/`'s new repository and should not be edited as if it were live.

## 2026-07-23 — Verified backend runnability via a temporary, reverted dependency addition

**Decision:** temporarily added the 11 missing backend npm dependencies to `package.json`, ran `npx tsc --noEmit` and attempted `tsx api/boot.ts` to establish ground truth about the backend's actual state, then reverted `package.json`/`package-lock.json` back to the frontend-only baseline afterward.

**Why:** the only way to distinguish "the backend has real bugs" from "the backend can't even be evaluated because modules are missing" was to actually install the dependencies and try. Reverting afterward keeps `package.json` an honest reflection of what's actually wired up today (nothing) rather than implying the backend is one `npm install` away from working — it is not, per the runtime path-alias issue also discovered during this same diagnostic (see `docs/ARCHITECTURE.md`).

**What this produced:** confirmed `employer.ts`'s `ctx.user.id` bug and `job.ts`'s Drizzle enum-comparison bug independent of the missing-module noise; confirmed the backend fails on its very first import under plain `tsx` due to the `@db/*` path alias having no runtime resolver; confirmed ~150 real frontend typecheck errors exist regardless of backend state, dominated by a single framer-motion `Easing` typing issue. Full detail in `docs/CURRENT_STATE.md`.

**Follow-up commit kept:** `package-lock.json` was committed (frontend-only) as part of this same session, since it hadn't existed in the initial checkpoint commit and is needed for reproducible installs.

## 2026-07-23 — Wrote the full Phase 7 documentation set before any feature work

**Decision:** produced `CLAUDE.md`, `AGENTS.md`, and the `docs/` set (`REPOSITORY_AUDIT`, `ARCHITECTURE`, `PRODUCT_SYSTEM_MAP`, `UI_UX_AUDIT`, `SECURITY_AUDIT`, `DEPENDENCY_AUDIT`, `CURRENT_STATE`, `ROADMAP`, `NEXT_MILESTONE`, this file) reflecting only verified findings, with no application code changes.

**Why:** per the audit's own operating rules — understand and document before building — and because the gap between the stated Levav vision and the actual, mock-data-driven implementation is large enough that any new feature work needs this ground truth on record first, for this and future sessions.

**Next decision point:** whether to approve the milestone proposed in `docs/NEXT_MILESTONE.md` (make the backend runnable, wire real auth) before any other feature work proceeds.

## 2026-07-23 — Approved the "backend runtime foundation + auth + talent-profile slice" milestone, with amendments

**Decision:** approved the planning package (`docs/NEXT_MILESTONE.md`, `docs/adr/001-database-platform.md`, `docs/AUTHENTICATION_ARCHITECTURE.md`) with four amendments: (1) business logic must stay platform-agnostic rather than tightly coupling to Supabase-specific SDKs/products; (2) `docs/DOMAIN_MODEL.md` was produced as the authoritative entity/relationship definition, required to exist before implementation begins; (3) the runtime module strategy was decided only after comparing three options (`tsx`+`tsconfig-paths`, a hand-rolled esbuild script, `tsup`) rather than jumping to a single recommendation — `tsup` was selected; (4) the Supabase-vs-self-hosted-Postgres question (previously flagged as unresolved in the ADR) is now resolved: proceed with Supabase.

**Why:** the user wanted the specific technical direction confirmed (Postgres/Supabase, organizations-not-roles) while closing two gaps in the original planning pass — an explicit anti-lock-in principle, and a genuine comparison of runtime options rather than a single unexamined pick — plus a dedicated domain model document to reduce the risk of the schema needing an immediate rewrite once implementation starts.

**What this does NOT do:** approving this planning package is explicitly **not** the same as approving implementation. No code has been written, no infrastructure provisioned, no migrations generated, nothing pushed. A further, separate approval is required before `docs/NEXT_MILESTONE.md`'s ordered implementation phases begin — see that document's "Checkpoints" section.

**Next decision point:** implementation approval itself.

## 2026-07-23 — Stage B amended: platform access model, organization type, invitation provenance

**Decision:** after Stage B's initial schema/migration (users/talents/organizations/organization_members on PostgreSQL) was implemented and reported, three amendments were approved before applying the migration:

1. **`users.role` (`talent | employer_member | admin`) replaced with `users.accessLevel` (`standard | admin`).** Business identity (talent, organization team member) is no longer stored on `users` at all — it's derived from the existence of related rows (`talents.userId`, active `organizationMembers.userId`). This also removes an earlier structural limitation: a user can now simultaneously be a Talent and an active organization member, which the old exclusive-enum design forbade.
2. **`organizations.organizationType` added** — a required (no default) enum of `company | church | non_profit | government | school | university | agency | startup | other`, reflecting that Levav's employer base spans more than conventional companies.
3. **`organizationMembers.invitedByUserId` added** — nullable (null = founding member), `ON DELETE SET NULL` rather than `CASCADE`, since it references a different user than the row's own subject and deleting the inviter must never delete the invitee's membership.

**Why:** the original `role` enum conflated a genuine platform-access concept (`admin`) with business identities that should be derivable facts, not a stored, mutually-exclusive flag — a real correctness gap the user caught before the migration was applied, which is exactly when it's cheapest to fix. `organizationType` and invitation provenance close two real gaps in the organization model ahead of the `employer` router's eventual review.

**Mechanical follow-through required** (not new feature work, same principle as the original Stage B report): `api/trpc.ts`'s `adminProcedure` check, `api/lib/jwt.ts`'s token payload, and `api/routes/auth.ts`/`api/routes/talent.ts`'s references were updated from `role` to `accessLevel` so the registered surface kept compiling. `auth.ts#register` no longer accepts a `role` input — there's nothing meaningful to accept at the platform level in this model. Caught in the same pass: `register`/`login` weren't normalizing email before querying/inserting, which would have violated the `users_email_normalized` CHECK constraint added in the original Stage B pass — fixed alongside the rename since it's a correctness bug against a constraint already committed to, not new scope.

**Documentation brought back into alignment:** `docs/DOMAIN_MODEL.md` rewritten to match — every `role = 'talent'`/`role = 'employer_member'` reference removed, a new "Business capability derivation" section added as the authoritative statement of how talent/org identity are derived rather than stored, `organizationType` and `invitedByUserId` documented in full. `championStatus` remains explicitly deferred (moved out of the User fields table, since it was never actually part of the schema, into "What is explicitly deferred," with an explicit note that if built later it must never become a value inside `accessLevel`).

**What this does NOT do:** the migration was regenerated (schema changed) but **not applied**. Nothing committed, nothing pushed. Approval of these amendments is not approval to apply the migration — that remains a separate, explicit checkpoint.

**Next decision point:** whether to apply the migration.

## 2026-07-30 — QuickWork reframed culturally; Champion→NGO revenue share designed but explicitly deferred; feed and Impact org dashboards deferred

**Decision:** in response to a product-vision request covering the navigation-blanking bug, a social feed, a QuickWork cultural reframe, functional Impact org dashboards, and a new Champion→NGO revenue-share mechanic, the user chose (via an explicit either/or prompt): (1) design the Champion→NGO revenue-share mechanic now, in writing, but do not build it yet; (2) of the remaining build candidates, do the QuickWork rebuild next — not the feed, not Impact org dashboards.

**What shipped this pass:**
- Root-caused and fixed the "navigation blanks out unless you refresh" report: it was not the dropdown/routing logic (several dead-end fixes were tried and reverted in the process — see prior session history), but heavy pages (`Opportunities.tsx`, `QuickWork.tsx`, hundreds of animated cards) taking 1.5–3.5s to mount under constrained CPU with zero visual feedback during that gap. Fixed by removing a redundant double-nested `AnimatePresence` wrapper (`App.tsx` + `Layout.tsx` were both animating route transitions on the same key) and adding `RouteLoadingBar.tsx`, an NProgress-style top progress bar shown on every route change.
- Rebuilt `QuickWork.tsx`'s framing: hero copy repositions flexible time-block work (hours/days/weeks) as a legitimate alternative to waiting idle for a formal job offer, explicitly addressed to both talent and startups needing short-term expertise. Added a real "Post a Gig" tab so a client/startup can list work directly from the UI, backed by a new `postGig`/`getPostedGigs` pair in `src/lib/levavData.ts` (localStorage-backed, consistent with this page's existing mock-data pattern — not wired to the real backend). Posted gigs merge into the existing gig list app-wide via a new `allGigs` memo. WRI toast copy on apply/complete updated to reflect the reframing.
- Wrote `docs/CHAMPION_NGO_REVENUE_SHARE.md`: a design-only document (data model, flow, authorization rules, and explicit build prerequisites) for letting a Champion designate one verified NGO from Levav Impact to receive a fixed percentage of their Content Studio course revenue. It explicitly states it cannot be implemented before three prerequisites land: real payments for course purchases, a real (non-mock) verified NGO directory on Levav Impact, and a real backend-verified Champion approval workflow — none of which exist today.

**What this does NOT do:** no code was written for the revenue-share mechanic — the document is design-only, consistent with the user's "design now, build later" decision. The social feed and Impact organization-side dashboards were not started; both remain explicitly acknowledged as separate, larger pieces the user still wants, not selected as this pass's build target.

**Next decision point:** which of the still-open pieces (social feed, Impact org dashboards, or beginning the revenue-share prerequisites — real payments) to build next.
