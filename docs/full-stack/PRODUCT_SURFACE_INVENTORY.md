# Product Surface Inventory

**Status:** Evidence-based inventory from direct code inspection of `main` (`bda184c`) and `origin/backup-old-site` (`8b23fb5`). "Maturity" is about wiring/functionality, not visual polish — both codebases are visually reasonable; almost nothing in `main` is functionally real.

Legend: **Wired** = real API/DB round-trip · **Local** = real logic, persisted only to `localStorage` · **Mock** = static hardcoded data, no persistence · **Skeleton** = UI shell, minimal/no logic · **Dead** = built but never imported/reachable.

## `main` — by product area

| Area | Page(s) | Maturity | Note |
|---|---|---|---|
| Authentication | `Auth.tsx` | Mock | 100% client-side; fake `demo_token_<timestamp>`, any credentials succeed; real `auth.register`/`auth.login` backend exists and works but is never called |
| Account recovery | — | Missing | No forgot-password/reset flow exists anywhere in `main` |
| Talent onboarding | `Onboarding.tsx` (1443 lines) | Local | Multi-step wizard, `localStorage['onboarding_data']`, awards WRI points via `levavData.ts` |
| Levav 28 | `Levav28.tsx` (1394 lines), `Levav28Section.tsx` (admin) | Local / Mock | Real day/task tracker over hardcoded `LEVAV28_DAYS`; admin view is inline mock KPIs disconnected from real per-user progress; "Certificate download" is an `alert()` placeholder |
| Levav ID | — | Missing | No equivalent concept built in `main` |
| Levav Profile | `TalentProfile.tsx`, `ProfileCreate.tsx` (1006 lines) | Local / Mock | Profile builder works locally; image upload is a raw-URL-paste field even though a real S3-upload component (`FileUpload.tsx`) exists in the tree, unused |
| Workforce Readiness Intelligence | `wriService.ts`, surfaced in `Dashboard.tsx` | Local | Computed client-side from localStorage activity; backend `wri.get` procedure is an unconditional stub returning `null` |
| Levav Code | — | Missing | No equivalent in `main` |
| Talent dashboard | `Dashboard.tsx` (978 lines) | Local / Mock | Role-branched hub; WRI/job matches computed from localStorage |
| Employer onboarding | — | Missing | No dedicated flow; `Auth.tsx` role picker only |
| Employer dashboard | `EmployerJobs.tsx` (1172 lines), `Employers.tsx`, `EmployerAnalytics.tsx` | Local / Mock | Job CRUD genuinely writes to `localStorage['employer_jobs']`, which `Opportunities.tsx`/`JobDetail.tsx`/`SmartMatchWidget.tsx` correctly read — one of the few coherent cross-page mock flows; analytics charts are static arrays |
| Organisation management | — | Missing | No org entity concept surfaced in the UI at all (schema has it — see `DATABASE_DOMAIN_GAP_ANALYSIS.md`) |
| Employer Talent DNA | — | Missing | Net-new concept, see `EMPLOYER_TALENT_DNA.md` |
| Workforce goals / candidate criteria | `Screening.tsx` (1344 lines) | Local | Candidate screening/criteria builder, client state only |
| Jobs / Opportunities | `Opportunities.tsx`, `JobDetail.tsx`, `JobApply.tsx` | Local | Reads `employer_jobs` localStorage coherently |
| Candidate matching | `SmartMatchWidget.tsx`, `SmartMatch.tsx` | Local | **Real, explainable algorithm** (skill overlap + location + WRI + category), run over mock/localStorage data — the one honest matching implementation in either codebase |
| Applications | `JobApply.tsx`, `ApplicantTrackingPage` (n/a in main) | Local | No admin surfacing works (see Admin bug below) |
| Interviews | — | Missing | No interview scheduling surface in `main` |
| Messaging | `Messages.tsx` (466 lines) | Local | Real send/persist logic, `localStorage['levav_conversations']`, no realtime/backend |
| Notifications | `NotificationBell.tsx`, `useNotifications.ts` | Wired (partial) / Local | The **only** component with live `trpc.notification.*` calls — but `notification` isn't a registered router namespace in `server/router.ts`, so those calls fail at runtime; falls back to mock + local queue. "View all notifications" links to a route that doesn't exist (`NotFound.tsx`) |
| Levav Learn / Courses | `Learn.tsx` (1443 lines), `CoursesSection.tsx`, `UniversitySection.tsx` (admin) | Local / Mock | Real enroll/complete logic over hardcoded `LEARN_COURSES` catalog; admin views disconnected from it |
| Certificates | — | Missing (stub only) | Only reachable via the Levav 28 `alert()` placeholder |
| Badges | — | Missing | No badge concept in `main` |
| QuickWork | `QuickWork.tsx` (947 lines), `QuickWorkSection.tsx` (admin) | Local / Mock | Real apply/status logic over hardcoded `QUICKWORK_GIGS`; admin view disconnected |
| Champions | `ChampionApply.tsx` (1256 lines), `ChampionApplicationsSection.tsx` (admin) | Local | Coherent end-to-end mock flow — application and admin review share the same localStorage key correctly |
| Mentoring | — | Missing | No dedicated surface |
| Volunteering | — | Missing | No dedicated surface (Impact/Contact pages are static content only) |
| Referrals | — | Missing | No referral surface in `main` |
| Wallet | — | Missing | "Wallet" appears only as a `lucide-react` icon, not a feature |
| Payments | `Booking.tsx`, `MilestonePayments.tsx`, `ContractWorkspace.tsx` | Local | "Escrow"/milestone-release UI mutates localStorage only; no payment gateway anywhere in the codebase |
| Analytics | `EmployerAnalytics.tsx`, `TalentAnalytics.tsx` | Mock | Static chart arrays, not computed from activity |
| Admin dashboard | `Admin.tsx` + 21 Section components | Mock (mostly) | **0 of 21 Section components call `trpc.*`.** 5 of them (Jobs/Employers/Users/Candidates/Applications) have a parameter-order bug in `safeJSONParse` that makes them silently always show mock data even though the real localStorage data they're trying to read exists — see `FRONTEND_BACKEND_CONNECTION_MATRIX.md` |
| Platform settings | `SettingsSection.tsx` (admin), `Settings.tsx` | Local | Correctly wired to `settingsService.ts` |
| Search | `SearchPage` (n/a in main; folded into `TalentDirectory.tsx`/`Opportunities.tsx`) | Local | Filter UIs over local/localStorage arrays |
| Social/community feed | — | Missing | No equivalent in `main` |
| Creator tools | — | Missing | No equivalent in `main` |
| WhatsApp | — | Missing | Not present in `main` |
| Push notifications | — | Missing | Not present in `main` |
| PWA | — | Missing | Not present in `main` |
| Realtime | — | Missing | Not present in `main` |
| AI evaluation | — | Missing | Not present in `main` |
| SkillSpace | — | Missing (intentional — Coming Soon per `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`) | |

**Home/marketing pages** (`Home.tsx` + 5 sections, `About.tsx`, `Contact.tsx`, `Impact.tsx`): static content, well-built Three.js hero shader, but `HeroSection.tsx`'s "2,500+ Talents / 45+ Countries / 98% Completion / 150+ Categories" stats are hardcoded, unverifiable claims — a direct violation of `PRODUCT_VISION_AND_HEART.md`'s "prove, don't assert" guardrail, and should be replaced with real counters or removed before public launch.

**Dead code found in `main`:** `FileUpload.tsx` (real S3 upload flow, never imported), `ReviewForm.tsx` (real `trpc.review.create` mutation, never imported), `CurrencySelector.tsx` (never imported), `contracts/index.ts` (already flagged dead in `CLAUDE.md`).

## `backup-old-site` — by product area (archival reference only)

| Area | Page(s) | Maturity | Note |
|---|---|---|---|
| Authentication | `Login.tsx` | Wired (real, but auth-system-disconnected — see `ARCHIVED_IMPLEMENTATION_REVIEW.md`) | Kimi OAuth is the live path; a separately-built local email/password system is never wired into request context |
| Account recovery | `ResetPasswordPage.tsx`, `VerifyEmailPage.tsx` | Wired | Standard, complete flows |
| Talent onboarding | `OnboardingPage.tsx`, `DiscoveryJourney.tsx` (1041 lines), `TalentOnboarding.tsx` | Local (all three) | Three parallel, unconsolidated onboarding flows; `TalentOnboarding.tsx` is dead (not routed) |
| Levav 28 | `Levav28Page.tsx` (real, live crucible), `Levav28Crucible.tsx` (AI-driven alternate, only used by dead `TalentOnboarding.tsx`) | Local / Dead | Real content library (`crucible-data.ts`/`crucible-packs.ts`, 224 scenarios) is the standout asset |
| Levav ID | `ProfilePage.tsx`, `LevavIdExportPage.tsx` | Wired | Real working PDF export (html2canvas + jsPDF) — standout feature |
| Levav Profile | `ProfilePage.tsx` | Wired | Solid |
| Workforce Readiness Intelligence | `WriHistoryPage.tsx` (UI), `api/services/wri-calculator.ts` (engine) | Mock (UI) / Real (engine) | UI is pure demo data; the calculation engine backing it is genuinely real and reusable |
| Levav Code | `api/routers/levav-code-router.ts` | Wired | 8-pillar covenant acceptance, DB-backed |
| Talent dashboard | `TalentDashboard.tsx` | Wired | Solid, mature |
| Employer onboarding | Within `EmployerDashboard.tsx` settings | Local/Wired mix | No standalone onboarding flow |
| Employer dashboard | `EmployerDashboard.tsx` (1719 lines, real ATS), `EmployerPortal.tsx` (224 lines, abandoned duplicate) | Local/Wired vs Mock | `EmployerDashboard.tsx` is the single most feature-complete surface in either codebase |
| Organisation management | `api/routers/employer-router.ts` | Wired | Role-selection + profile CRUD |
| Employer Talent DNA | — | Missing | Not present even here — confirmed net-new for Phase One |
| Workforce goals / candidate criteria | — | Missing | Not a distinct surface |
| Jobs / Opportunities | `JobDiscoveryPage.tsx` | Wired | Clean bidirectional talent→employer application flow via `application-store.ts` |
| Candidate matching | `JobMatchingPage.tsx` | **Mock, mislabelled "AI"** | Hardcoded `[78,65,82,71,88]` score array — the canonical anti-pattern example throughout this audit |
| Applications | `application-store.ts`, `ApplicantTrackingPage.tsx` (redundant with EmployerDashboard's Applicants tab) | Wired/Local | |
| Interviews | `InterviewPage.tsx` (talent-facing, fully static), EmployerDashboard's Interviews tab (real) | Mock / Wired | Functional half lives only on the employer side |
| Messaging | `MessagesPage.tsx` | Wired/Local mix | Standard |
| Notifications | `NotificationSettingsPage.tsx` | Wired | Real Web Push preference toggles |
| Levav Learn / Courses | `LearnPage.tsx`, `LessonPlayerPage.tsx` | Skeleton | Video player chrome well-built, no real video/backend |
| Certificates | `CertificatePage.tsx` | Wired | Public verification-link pattern is a good reference |
| Badges | `api/routers/badge-router.ts` | Wired | Real DB-backed eligibility logic |
| QuickWork | `QuickworkPage.tsx` | Wired (shallow) | Apply flow not actually persisted client-side |
| Champions | `ChampionsPage.tsx`, `ChampionOnboardingPage.tsx` | Wired/Local | Solid multi-step application pattern |
| Mentoring | — | Referenced in Talent DNA/advisor concept only | `AdvisorPage.tsx` (`swarm-agents.ts`) is templated text, not real mentoring |
| Volunteering | `VolunteerPage.tsx`, `CoordinatorPanel.tsx` | Wired/Skeleton | Coordinator validation queue is a real, useful pattern |
| Referrals | `ReferralPage.tsx` | Wired | Clean ZMW-per-invite mechanic |
| Wallet | `WalletPage.tsx`, `WalletTopUpPage.tsx` | Wired (balance) / Mock (payment) | Real Zambia-specific mobile-money UX vocabulary (MTN MoMo, Airtel Money) — worth referencing even though settlement is decorative |
| Payments | `api/routers/payment-router.ts` | Mock, honestly labelled | Simulated MTN MoMo/Airtel; real fields, fake rail |
| Analytics | `AdminMaster.tsx` (real), `AnalyticsPage.tsx` | Wired/Mixed | |
| Admin dashboard | `AdminMaster.tsx` (real, role-gated), `AdminDashboard.tsx` (abandoned mock duplicate) | Wired / Mock | Same duplicate-page failure mode as EmployerDashboard/EmployerPortal |
| Platform settings | `SettingsPage.tsx` | Wired | Standard |
| Search | `SearchPage.tsx` | Local | Real job-store integration only; courses/talent likely still static |
| Social/community feed | `SocialFeedPage.tsx` | Wired | Real optimistic like/comment mutations — most "alive-feeling" page in either codebase |
| Creator tools | `CreatorStudio.tsx`, `CreatorOnboardingPage.tsx` | Local (CRUD) | Real localStorage CRUD with seeded realistic drafts |
| WhatsApp | `api/routers/whatsapp-router.ts` | Wired (real Twilio path) | **Public, unauthenticated `send` procedure** — abuse/cost risk, see `SECURITY_AND_PRIVACY_REVIEW.md` |
| Push notifications | `api/routers/push-router.ts` | Wired | Subscription CRUD real; no send-side reviewed |
| PWA | `usePWA.ts` | Wired | Complete, portable as-is |
| Realtime | `useRealtime.ts` | Skeleton | SSE client is real; comment admits server side is simulated |
| AI evaluation | `api/services/ai-evaluation.ts`, `ai-challenge.ts`, `whisper-dictation.ts` | Wired (real, non-LLM-dependent fallback + optional LLM enhancement) | Genuinely good reference implementations |
| SkillSpace | — | Not present | Consistent with Phase One deferral |

**Duplicate/abandoned pages found in `backup-old-site`:** `EmployerPortal.tsx` (vs `EmployerDashboard.tsx`), `AdminDashboard.tsx` (vs `AdminMaster.tsx`), `TalentOnboarding.tsx` + `DiscoveryJourney.tsx` (vs `OnboardingPage.tsx`), `ApplicantTrackingPage.tsx` (vs EmployerDashboard's Applicants tab), and an orphaned corrupted file `api/services/sedIONssu` (near-duplicate draft of `trigger-dispatcher.ts`, zero imports, safe to disregard). These are exactly the "duplicated concepts" the product vision warns against, and a concrete argument for why `backup-old-site` is mined for parts, not merged wholesale.

## Cross-codebase pattern worth naming

Both codebases independently arrive at the same trap: a feature that *looks* data-driven (an admin section, a match score, a WRI history chart) but is either silently disconnected from the real data it should show (`main`'s Admin bug) or was never connected to anything real in the first place (`backup-old-site`'s `JobMatchingPage.tsx`, `WriHistoryPage.tsx`). Phase One's Definition of Done (`INTEGRATION_ROADMAP.md`) exists specifically to make this failure mode structurally harder to ship again.
