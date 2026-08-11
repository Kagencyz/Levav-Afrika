# Archived Implementation Review — `origin/backup-old-site`

**Status:** Reference-only review. This branch (`8b23fb5`, authored by "Selah Intelligence," 2026-06-22, no shared git ancestry with `main`) is preserved archivally per `docs/DECISIONS.md`'s reconciliation entries. **It will not be merged.** This document exists so its ideas can be mined deliberately, and its mistakes not repeated.

## How this branch came to be preserved

`origin/main` was previously force-pushed over this branch's tip by an untraceable prior action (git metadata cannot establish who — see `docs/DECISIONS.md`). It survives only because a `backup-old-site` branch was created before/around that event and has since been pushed to `origin/backup-old-site`. Treat it as read-only history, not a live branch to build on.

## Per-subsystem review (as requested: functional / scaffolded / tested / authenticated / authorised / tenant-isolated / DB-backed / duplicated / unsafe assumptions / UX comparison / redesign inspiration)

### DiscoveryJourney.tsx (the "Levav 28 Discovery Journey")
Functional UI, not functional intelligence: 6-step self-assessment with real Framer Motion polish, but `calculateWRI()` is a deterministic average of 1–5 self-rated sliders framed as "AI-generated." No auth/authz relevance (client-only), no DB (localStorage only). Not tested. **Redesign inspiration, not reuse**: the step-by-step reflection → generated summary UX pattern is strong; the dishonest AI framing must not be repeated (see `PRODUCT_VISION_AND_HEART.md`'s "prove, don't assert" guardrail).

### Levav 28 (live crucible)
`Levav28Page.tsx` is the real, functional implementation (as opposed to `DiscoveryJourney.tsx` and the orphaned `Levav28Crucible.tsx`/`TalentOnboarding.tsx` pairing — three parallel builds of the same idea, only one live). Its content (`crucible-data.ts`/`crucible-packs.ts`) — 224 profession-specific CONFRONT/DISSECT/OWN/EXECUTE scenarios across 8 professions — is genuinely well-written and the single highest-value non-code asset in either codebase. No DB persistence (localStorage/tRPC-fallback pattern). `Levav28Crucible.tsx`'s AI-driven alternative (real `trpc.ai.generateChallenge`/`evaluateOwn` calls) is a legitimate product idea for a rebuild if LLM budget exists, but it's dead code today (only reachable via the unrouted `TalentOnboarding.tsx`).

### WRI
Split findings: `WriHistoryPage.tsx` (frontend) is pure demo data, no real persisted history — a UI built ahead of the data model that was meant to back it. `api/services/wri-calculator.ts` (backend) is the opposite: real, DB-backed, deterministic, weighted 7-component scoring with a proper audit-log table (`wriComponentScores`). Authenticated via whichever request context calls it (inherits the Kimi/local-auth split described below). Not duplicated. No unsafe assumptions found in the calculator itself. **Strong reuse candidate** for the calculation logic and audit-log pattern; the frontend history page should be rebuilt against real persisted snapshots, not ported as-is.

### QuickWork
`QuickworkPage.tsx` — real backend router (`quickwork-router.ts`, DB-backed, WRI-trigger-integrated) but shallow frontend wiring: the apply flow is local component state only, not persisted, unlike the parallel job-application flow (`application-store.ts`) which is properly wired. Backend bug found: `rateShift` compares a profile id to a user id (different id spaces) — the talent/employer branch logic is effectively broken. Not duplicated at the page level. Assessed separately for Phase One inclusion — see `INTEGRATION_ROADMAP.md` Slice 20; this review doesn't resolve that question, it just confirms the archived version isn't a safe pattern to copy uncritically given the rating bug.

### Champions
Backend (`champions-router.ts`) is real, DB-backed, full application → review → stats lifecycle, `adminQuery`-gated correctly. Frontend (`ChampionsPage.tsx`, `ChampionOnboardingPage.tsx`) is a solid, well-built multi-step application pattern, tRPC-first with sensible fallback. No duplication, no unsafe assumptions found. Reasonable reuse candidate for the application-flow UX pattern.

### Courses / Learn
Backend (`course-router.ts`) is real and DB-backed (courses/lessons/enrollment/progress). Frontend is the weakest-wired pairing found: `LearnPage.tsx` appears to build its own local data rather than consuming the real catalog or the `demo-data.ts` course list, and `LessonPlayerPage.tsx` (well-built video-player chrome) has no real video backend and no trpc calls at all — a UI shell with nothing behind it. Not a strong reuse candidate as built; the chrome/interaction design is fine to reference, the wiring is not.

### Wallet
Backend (`wallet-router.ts`) is real, DB-backed for balance/transactions. `WalletPage.tsx` is tRPC-wired with a demo fallback; `WalletTopUpPage.tsx` is pure UI simulation of an MTN MoMo/Airtel top-up with no real payment gateway call. The mobile-money vocabulary/UX (provider selection, status states) is a genuinely useful reference for the Zambian/African market (`AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`); the settlement logic underneath is not real anywhere in this branch.

### Payments
`api/routers/payment-router.ts` — honestly mocked, not deceptively: comments describe what the real MTN MoMo/Airtel API call would look like, `verify` auto-completes after a hardcoded 10-second timer rather than calling a provider. DB records/wallet crediting around the mock are real. Contains an unimported-`env` bug that would throw on its error path. Not a reference for actual payment integration — only for the surrounding data-recording shape.

### AI evaluation
`api/services/ai-evaluation.ts` and `ai-challenge.ts` are the strongest "AI" work in the branch: real regex/pattern-based accountability scoring (not LLM-dependent) with optional OpenAI enhancement, and a real curated fallback-template bank by profession/day with optional GPT-4o-mini generation. Both are honest about the non-LLM fallback path. `whisper-dictation.ts` similarly has a real OpenAI Whisper integration path with a sensible client-side fallback. `AudioDictationCanvas.tsx` (the frontend consumer) is genuinely well-engineered — native-paste blocking as an anti-cheat measure, a proper `MediaRecorder` state machine. **Strong reuse candidates**, all three, for `TALENT_DEVELOPMENT_MODEL.md`'s evidence-capture requirements. Contrast sharply with `swarm-agents.ts` (powers `AdvisorPage.tsx`) — that one is pure string-template generation with no real intelligence; the multi-persona *concept* is worth keeping, the current content is not.

### WhatsApp
`whatsapp-router.ts` has a real Twilio integration path (console-log fallback without creds) — genuinely wired, not a stub. Security finding: `send` is fully `publicQuery`, unauthenticated — anyone could trigger outbound sends if credentials were ever configured, a real abuse/cost risk. Also hits the unimported-`env` bug on its fallback path. Reusable as an integration pattern only after the auth gap is closed.

### Push notifications
`push-router.ts` — real DB-backed subscription CRUD and preferences (`authedQuery`-gated correctly). The send-side (`NotificationSettingsPage.tsx` consumes preferences; actual push dispatch) wasn't reviewed as part of this pass. Reasonable structural reference.

### Certificates / Badges
Both real and DB-backed (`certificate-router.ts`, `badge-router.ts`). `CertificatePage.tsx`'s public verification-by-cert-number link is a genuinely good trust pattern worth keeping conceptually.

### Referrals
`referral-router.ts` real, DB-backed, complete lifecycle (code generation, signup tracking, reward crediting, leaderboard). `ReferralPage.tsx` clean ZMW-per-invite mechanic. Reasonable reference, low priority for Phase One (see `INTEGRATION_ROADMAP.md`).

### Volunteer matching
`volunteer-router.ts` real, DB-backed, WRI-trigger-integrated. Authorization gap found: `validate`/`list`/`stats` are only `authedQuery` (any logged-in user), not scoped to an actual coordinator/admin role — any authenticated user could validate volunteer hours or see coordinator stats. `CoordinatorPanel.tsx`'s validation-queue UX pattern is a good reference regardless.

### Search
`search-router.ts` — real, `publicQuery`, unified search across 4 tables via `LIKE` (no full-text index). `SearchPage.tsx` only actually integrates with the real job store; courses/talent/employer search in the UI is likely still static. Functional as a pattern, not performant at scale — flag full-text indexing as a follow-up if reused.

### Realtime
`useRealtime.ts` — a real SSE client (`EventSource`, reconnect backoff), with a code comment admitting the server side is simulated. Not a safe assumption to build on without verifying/rebuilding the server side.

### PWA
`usePWA.ts` — complete, correct, portable as-is: service worker registration, install-prompt capture, standalone-mode detection, online/offline state. One of the few pieces of this branch worth near-verbatim reuse, and directly relevant to `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`'s mobile-first/connectivity requirements.

### Analytics
`analytics-router.ts` real, DB-backed aggregate queries. One access-control looseness: `overview` is `publicQuery` where it arguably should be admin-only — minor exposure, worth correcting if reused rather than copying as-is.

### Archived backend routers, overall
All 28 routers query the real database with real Zod validation and a consistent structured-error wrapper (`safeOperation`/`levav-errors.ts`) — this is a legitimately more mature backend pattern than `main`'s current (correct, but much smaller) `publicProcedure`/`authedProcedure`/`adminProcedure` set. The role-scoped procedure builders (`talentQuery`/`employerQuery`/`creatorQuery`/multi-role variants in `api/middleware.ts`) are a stronger reference shape than `main`'s three-tier system and worth adapting.

## Cross-cutting risks confirmed across the branch

- **Auth is structurally broken, not just incomplete.** Two parallel auth systems exist — Kimi OAuth (live, wired into `createContext`) and local email/password (fully built in isolation, bcrypt + JWT, but **never wired into request context** — its token authenticates nothing except its own `me` query). Anyone building on this pattern must finish that wiring or choose one system, not both.
- **Systemic unimported-`env` bug** in `impact-router.ts`, `payment-router.ts`, `whatsapp-router.ts`, and `trigger-dispatcher.ts` — guaranteed `ReferenceError` on those error paths regardless of environment, strong evidence this branch was never fully integration-tested end-to-end.
- **No real automated test coverage.** `api/tests/router-registry.test.ts` is a static registration-check script with zero assertions, not a test suite, and its own path-resolution logic likely fails when actually run through the configured `vitest` runner.
- **Duplicated/abandoned pages**, all confirmed live-routed unless noted: `EmployerPortal.tsx` (mock) vs `EmployerDashboard.tsx` (real) — both routed; `AdminDashboard.tsx` (mock) vs `AdminMaster.tsx` (real) — both routed; `OnboardingPage.tsx`/`DiscoveryJourney.tsx` (both routed) vs `TalentOnboarding.tsx` (not routed, dead); `ApplicantTrackingPage.tsx` vs `EmployerDashboard.tsx`'s Applicants tab (functional overlap, both routed).
- **Tracked `.env` in git history.** Present since the branch's initial commit, alongside a `.gitignore` that already lists `.env` — classic force-add-before-ignore pattern. Every secret it names (`APP_ID`, `APP_SECRET`, `DATABASE_URL`, `KIMI_AUTH_URL`, `KIMI_OPEN_URL`, `OWNER_UNION_ID`) must be treated as compromised. Not read as part of this review; see `SECURITY_AND_PRIVACY_REVIEW.md` for the full risk writeup.
- **The branch's own self-audit (`PRODUCTION_AUDIT.md`, 6.2/10, "development-ready, not production-ready") is itself partially stale** — it claims missing CORS/rate-limiting that later code (`api/boot.ts`) actually has. Don't trust either the code or the self-audit alone; cross-check, as this review did.

## Verdict: what to mine vs. what to leave behind

**Mine deliberately:** `crucible-data.ts`/`crucible-packs.ts` (content), `wri-calculator.ts` (scoring engine + audit-log pattern), `EmployerDashboard.tsx` (ATS feature shape, once rebuilt on real permission checks), `AudioDictationCanvas.tsx` (evidence-capture UX), `LevavIdExportPage.tsx` (PDF export pattern), `application-store.ts`/`JobDiscoveryPage.tsx` (bidirectional application flow), `usePWA.ts`/`useBackend.ts`/`useDemoAuth.ts` (infrastructure patterns), the role-scoped procedure-builder shape in `api/middleware.ts`, the `contracts/schemas.ts` shared-Zod-schema pattern, the `levav-errors.ts` structured-error pattern.

**Leave behind:** the Kimi/local-auth split (pick one system, wire it fully), `swarm-agents.ts`'s templated "AI," `JobMatchingPage.tsx`'s fake match scores, every duplicate/abandoned page listed above, the mock payment rail as anything other than a UX reference, and the branch's testing approach entirely (build real tests from Phase One's start instead).
