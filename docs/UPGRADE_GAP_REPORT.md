# Upgrade Gap Report

Response to the **Levav Platform Upgrade Brief** (2026-07, see `docs/UPGRADE_BRIEF.md`), per its §15 instruction: *"Review the current landing page, signup, onboarding, routing, dashboards, feed components, messaging, and database schema. Create a gap report against this upgrade brief."*

Every "Current" claim below was verified by reading the code in this session, not inferred from file names. Effort: **S** (< 1 day), **M** (days), **L** (1–2 weeks), **XL** (multi-week / needs backend build-out).

## The one structural finding that shapes everything else

The brief requires capabilities that **cannot honestly exist client-side**: verified listings (§10), messaging permissions and anti-spam (§7), privacy controls enforced server-side (§14), tenant/user data isolation "through server-side permissions and database policies" (§14), and audit logs. The current app is a frontend prototype on localStorage with fake auth (`demo_token_*`, any password accepted). The real backend (`server/`, Hono + tRPC + Drizzle + Postgres) exists but exposes only `auth` and partial `talent`, and the database schema has exactly **four tables**: `users`, `talents`, `organizations`, `organization_members`. There are no tables for posts, follows, comments, reactions, messages, notifications, jobs, gigs, volunteer openings, courses, enrollments, Levav 28 progress, or verification workflows.

So this upgrade is not a UI reskin — most of the brief is **new domain model + new API + new UI**, and the sequencing decision (wire real backend progressively vs. UI-first behind service interfaces) must be made before item 1 of the brief's §16 order is finished.

## Section-by-section gaps

### §2 Public landing page — Effort: M
- **Current:** `src/pages/Home.tsx` is a cinematic 5-section marketing page. CTAs: "Start Your Levav 28™ Journey" → `/onboarding`, "Hire Workforce-Ready Talent" → `/employers`, "Join the Movement" → `/auth?mode=signup`.
- **Gap:** No "Create a Free Account" primary CTA, no 9-path choice section (jobs / QuickWork / Levav 28 / hire / post gigs / volunteer / courses / community), no feed preview, no verified-opportunities preview, no Levav ID/WRI preview, no trust-signals section. Pure frontend work — buildable now.

### §3 Signup + personalised routing — Effort: L (frontend) + backend decision
- **Current:** `src/pages/Auth.tsx` is fake client-side auth with a binary talent/employer role select; any email/password succeeds; `Math.random()` IDs. `src/pages/Onboarding.tsx` is a single talent-shaped 3-step flow that always funnels to Levav 28. Real `auth.register`/`auth.login` exist server-side but the frontend never calls them.
- **Gap:** No multi-select goals (9 options), no personal-status selection (9 options), no routing matrix, no primary-path derivation. The onboarding flow needs to branch per goal/status. Wiring real auth here is the natural moment — the server code already exists and works on paper.

### §4 First login experience — Effort: M
- **Current:** Login redirects to `/dashboard` (or `/admin`); Onboarding completion redirects to `/levav28`. No guided checklist, no name-greeting flow, no path-specific setup, no follow recommendations.
- **Gap:** Entire guided first-run experience. Depends on §3's goal/status data existing.

### §5–6 Home feed + post creation — Effort: XL
- **Current:** **Does not exist in any form.** No feed page, no post model, no follow model, no comments/reactions/saves/shares/reports anywhere in `src/`, `server/`, or `db/`.
- **Gap:** The largest single item. Needs: `posts`, `follows`, `reactions`, `comments`, `saved_posts`, `reports` tables + API + ranking + feed UI + post composer + permission rules. Structured opportunity/course cards in the feed additionally depend on §10's listing model.

### §7 Messaging — Effort: XL
- **Current:** `src/pages/Messages.tsx` is mocked (`MockMessage`/`MockConversation` types, localStorage-seeded), one-to-one only.
- **Gap:** Real conversations/messages model, context-bound threads (application, proposal, placement), group threads (cohorts/teams), message requests, blocking, reporting, attachment controls, unsolicited-contact limits. All server-dependent.

### §8 Courses in feed — Effort: M (controlled catalogue) 
- **Current:** `src/pages/Learn.tsx` renders a static catalogue from `levavData.ts` with localStorage progress. No providers, no approval, no cards.
- **Gap:** Course card component + provider/approval flags. Brief explicitly permits a controlled catalogue without the full Skills Marketplace (stays "Coming Soon" — currently `SkillGap.tsx` is a static placeholder, consistent with that).

### §9 Levav 28 upgrade — Effort: L–XL
- **Current:** `src/pages/Levav28.tsx` + `levavData.ts`: one static 28-day pathway, identical for every user; localStorage progress; day-unlock logic works; certificate is an `alert()` stub.
- **Gap:** Six status-based pathway variants (unemployed mock-office, employed, self-employed, freelancing, student, transition), workspace view (goals, deadlines, assessment criteria, evidence submission, feedback), AI simulations, team/cohort collaboration, opt-in milestone sharing to feed. Pathway *branching by status* is achievable on current architecture (M); teams/evidence/AI/feedback are backend-dependent (XL).

### §10 Opportunity feeds + verification — Effort: XL
- **Current:** Jobs/gigs/volunteer are hardcoded arrays (`MOCK_JOBS`, static QuickWork gigs, static Impact page). The Opportunities page even self-labels its mock data — good honesty, but nothing is real. No publisher concept, no listing lifecycle, no badges, no review queue.
- **Gap:** Full listing domain: `listings` (typed: job/gig/volunteer/internship/course-promo), publisher verification (orgs table + `verification_status` already exist — the only §10 building block present), draft→review→published lifecycle, duplicate/risk detection, apply/propose/enrol actions.

### §11 Workspace structure — Effort: L
- **Current:** Separate pages exist for talent-ish, employer-ish, and admin views, but there is no workspace concept, no switching, and Volunteer, Organisation, QuickWork-Client, and Community workspaces don't exist at all.
- **Gap:** Workspace shell + switcher keyed to the user's capabilities (the schema's derived-capability design — talent row, org membership — is actually the right foundation for this).

### §12 CV / Levav ID / WRI / work evidence — Effort: L–XL
- **Current:** WRI scoring engine is real client-side logic (localStorage), starts at 0, earns per action — the closest thing to the brief that already works. Backend `wri.ts` is a stub returning `null`. No CV upload, no extraction, no CV generation, no Levav ID record, no privacy controls per section.
- **Gap:** CV upload/parse/confirm flow, generated CV, Levav ID as persistent server-side record, per-section privacy, stage-gated employer visibility.

### §13 Notifications — Effort: M–L
- **Current:** `NotificationBell` is mocked. Backend `notification.ts` exists but is quarantined for a real authorization hole (any authed user can push a notification to any user — confirmed still present).
- **Gap:** Fix the authz bug, wire it, extend the event types to the brief's list, add real triggers from the social/opportunity systems.

### §14 Safety and privacy — Effort: XL, cross-cutting
- **Current:** Fake auth; no server-side permission enforcement anywhere in the running app; audit log is localStorage (`auditService.ts`); champion/admin gating is client-side only and trivially bypassable.
- **Gap:** Everything. This section is the reason the backend decision can't be deferred: every §14 requirement is server-side by definition. Known pre-existing backend bugs to fix before wiring (per `docs/SECURITY_AUDIT.md`, re-confirmed this session): `employer.ts` `ctx.user.id`→`userId`, `application.ts#updateStatus` missing ownership check, `notification.ts#create` missing authz, `upload.ts` presigned-URL on `publicProcedure`.

## Recommended sequencing (aligned to brief §16, adjusted for reality)

1. **Landing page revamp** (§2) — no dependencies, frontend-only, immediate visible progress.
2. **Decide the backend question** — everything after item 1 forks on it.
3. **Free signup + goals/status selection + routing** (§3) — wire real auth here (server code exists; fix + verify with tests per CLAUDE.md testing rule; vitest is now installed).
4. **Guided first login + workspace shell** (§4, §11).
5. **Schema + API for the social core** (posts/follows/reactions/comments) → **feed UI** (§5–6), feature-flagged.
6. **Structured listings + verification lifecycle** (§10), reusing org verification; opportunity/course cards into feed (§8).
7. **Levav 28 status-based pathways** (§9) — pathway branching first (cheap), workspace/teams/evidence after the social core exists.
8. **Messaging** (§7) — after follows/permissions exist, since its permission model depends on them.
9. **Notifications, privacy controls, audit** (§13–14) — hardened alongside each shipped system, not bolted on at the end.

## Standing constraints honored

- Feature flags for incomplete modules (§15) — flags needed for: feed, messaging, workspaces, verification queue.
- Skills Marketplace stays "Coming Soon" (§8/§15).
- Per `CLAUDE.md`: no new untested business logic — each backend piece ships with vitest coverage; never weaken auth to make a feature work; single component system (shadcn/Radix/Tailwind/framer-motion).
