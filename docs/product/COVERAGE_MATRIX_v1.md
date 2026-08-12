# Requirement Coverage Matrix v1

**Owner:** Claude (Product Command). **Verified against** `main` @ `0366f0d`, 2026-08-12.
Vocabulary: KEEP · ENHANCE · MODIFY · COMPLETE · BUILD · REMOVE · DEFER (Master PRD §1.1).

A requirement is classified from **verified code or runtime evidence only**. "A page renders" is never evidence.

---

## 6.1 Language and UX Writing

| ID | Requirement | Class | Evidence / note |
|---|---|---|---|
| LANG-001 | One canonical product voice | BUILD | No voice spec existed. Now defined in `LEVAV_LANGUAGE_SYSTEM.md` |
| LANG-002 | Canonical terms do not drift | MODIFY | `gig` 157 uses vs `QuickWork` 65; `Levav 28`/`Levav28` both used; `Quickwork` miscased 4× |
| LANG-003 | Concise, action-oriented copy | MODIFY | "Unlock" used 121× as gamification; landing copy carries unsupported claims |
| LANG-004 | Strings are governable | BUILD | No `i18n`/`copy`/`strings` module exists. **WP-0004** |
| LANG-005 | Claude owns spec, Codex implements | KEEP | Established by this document set |

## 8 Identity, Roles, Workspaces

| ID | Class | Evidence |
|---|---|---|
| AUTH-001 One persistent identity | **KEEP** | `users.id` FKs `auth.users.id`; talent/employer capability derived from `talents` / `organization_members` rows, not a role column. No duplicate-identity path exists |
| AUTH-002 Role ≠ entitlement | BUILD | No subscription, plan or entitlement model exists in schema or router |
| AUTH-003 Evidence stays person-centred | BUILD | No evidence model exists yet; principle must be honoured when Sprint 2 lands |

## 9 Onboarding

| ID | Class | Evidence |
|---|---|---|
| ONB-001 AI infers, user confirms | BUILD | No CV extraction, no inference, nothing to confirm |
| ONB-002 African career taxonomy | BUILD | `talents.category` is a free `varchar(120)`. No taxonomy table, no versioning |
| ONB-003 Early first-run value | COMPLETE | `user_onboarding` (goals, primaryGoal, personalStatus) + `src/lib/onboardingRouting.ts` are real and tested; they capture preference, not career context |

## 10 Profile and Levav ID

| ID | Class | Evidence |
|---|---|---|
| PROF-001 Claims vs verified look different | BUILD | `talents` has no verification state at all; everything renders identically |
| PROF-002 Levav ID durable anchor | COMPLETE | Identity is durable (AUTH-001) but there is no share/visibility policy layer |
| PROF-003 Modern editable profile | COMPLETE | `talents` = name, bio, category, skills, location only. No photo, no cover image, no experience/education/projects/links, no visibility settings |
| PROF-004 Secure email change | BUILD | No email-change flow exists |

## 11 Evidence Graph

| ID | Class | Evidence |
|---|---|---|
| EVD-001 … EVD-004 | **BUILD** | No evidence entity, no provenance, no E0–E4 levels, no dispute state, no separation of factual observation from evaluation. Sprint 2 |

## 12 WRI

| ID | Class | Evidence |
|---|---|---|
| WRI-001 Separate score/confidence/coverage/trajectory | BUILD | Only a single integer per dimension exists |
| WRI-002 WRI ≠ Role Fit | BUILD | Neither concept is implemented server-side |
| WRI-003 Confidence separate from performance | BUILD | No confidence value exists anywhere |
| WRI-004 Versioned, configurable coefficients | BUILD | Coefficients are hard-coded literals in `WRI_SCORING_RULES` |
| WRI-005 Behaviourally anchored rating scales | BUILD | No rubric exists |
| WRI-GOV-001 Governed model change | BUILD | No governance artefact existed before this document set |
| — Existing `src/lib/wriService.ts` + `levavData.ts` WRI block | **REMOVE** | Breaches FEED-008, IMPACT-002, WRI-001/003/004, EVD-001 and §48. **WP-0003**, PDR-0001, PDR-0002 |

## 13 Levav 28

| ID | Class | Evidence |
|---|---|---|
| L28-001 Multiple modalities | BUILD | Task types are `action`/`reflection`/`quiz`/`external` — none is a work modality |
| L28-002 Adaptive difficulty | BUILD | Content is a fixed array |
| L28-003 Assessment vs development split | BUILD | Not present |
| L28-004 Persistent personas | BUILD | No personas exist |
| L28-005 Day 15 evidence sufficiency | BUILD | `isDayUnlocked()` is calendar/click gating only |
| L28-006 Day 28 report | BUILD | Not present |
| L28-007 Scenario Studio | BUILD | Not present. Sprint 4+ |
| L28-008 Integrity | BUILD | Not present |
| L28-009 Low-bandwidth | BUILD | Not present |
| — Existing `LEVAV28_DAYS` content | **REMOVE** | 33-day motivational programme, not a work simulation. PDR-0004 |

## 14 QuickWork

| ID | Class | Evidence |
|---|---|---|
| QW-001 Capacity Profile | BUILD | No capacity model |
| QW-002 AI Work Scoper | BUILD | Not present |
| QW-003 Assignment lifecycle | BUILD | Existing statuses are `applied \| in-progress \| completed \| reviewed` in localStorage — 4 of 9 required states, no authorisation, no timestamps, no audit |
| QW-004 Matching | BUILD | Not present |
| QW-005 Work behaviour evidence | BUILD | Not present |
| QW-006 Structured closeout review | BUILD | Only a `clientRating` number |
| QW-007 Verified artefacts | BUILD | Not present |
| QW-008 Commercial protection | BUILD + human decision | Blocked on Master PRD §49 pricing/escrow decisions |
| QW-009 Client reputation | BUILD | Not present |
| QW-010 Progression | BUILD | Not present |
| — `QuickWorkGig` type and `gig` vocabulary | MODIFY | PDR-0003 |

## 15–17 Employed talent, Employer Intelligence, Hiring

| ID | Class | Evidence |
|---|---|---|
| EMP-TAL-001 … 004 | BUILD | No current-role / next-role readiness concept exists |
| EMP-001 Employer onboarding | COMPLETE | Organisation registration + membership + verification **status enum** are real (`organizations`, `organization_members`, `organizationRouter`). Verification *process*, search profile and paywall states are absent |
| EMP-002 Talent Search Profile | BUILD | Not present |
| EMP-003 Explainable matching | BUILD | Not present |
| EMP-004 Employer paywall / entitlement | BUILD | Not present. **Blocks any premium WRI UI** (§43) |
| EMP-005 Job Design Assistant | BUILD | `employer.ts` exists but is unreachable and broken |
| EMP-006 Interview Intelligence | BUILD | Not present |
| HIRE-001 … 004 | BUILD / DEFER | Sprint 7 |

## 18–19 Jobs, Compensation

| ID | Class | Evidence |
|---|---|---|
| JOB-001 … 003 | BUILD | `job.ts` / `application.ts` unreachable; pages run on `MOCK_*` arrays |
| COMP-001 … 003 | DEFER | Sprint 9. `src/pages/MarketIntel.tsx` presents localStorage numbers as market intelligence — **REMOVE the surface** until COMP-001 can be satisfied, or it fabricates benchmarks |

## 20 Levav Impact

| ID | Class | Evidence |
|---|---|---|
| IMPACT-001 Structured opportunities | BUILD | `IMPACT_OPPORTUNITIES` is a seed array; `postOpportunity()` writes localStorage |
| IMPACT-002 Verified contribution record | BUILD | No verification, no organisation confirmation, no dispute route |
| IMPACT-003 Organisation workspace | BUILD | Not present |
| IMPACT-004 Identity and discovery | BUILD | Not present |
| IMPACT-005 Activity/output/outcome guardrails | BUILD | Not present |
| — `impact-volunteer` → +15 leadership WRI | **REMOVE** | Automatic WRI inflation from participation. Breaches IMPACT-002. **WP-0003** |

## 21–22 Learn, Champions

| ID | Class | Evidence |
|---|---|---|
| LEARN-001 … 004 | BUILD | localStorage progress only |
| — `learn-lesson-complete` → +5 technical WRI | **REMOVE** | Breaches LEARN-002. **WP-0003** |
| CHAMP-001 … 002 | DEFER | Sprint 8 |

## 23 Feed and Network

| ID | Class | Evidence |
|---|---|---|
| FEED-001 Professional presence | BUILD | No photo, no cover image, no organisation page |
| FEED-002 Publishing | BUILD | `createPost()` writes localStorage; no media, no persistence, no moderation |
| FEED-003 Engagement and network | BUILD | `toggleLike`/`addComment`/`toggleFollow` are device-local |
| FEED-004 Discovery | BUILD | Not present |
| FEED-005 What is New / sourced news | BUILD | Not present. Attribution rules must exist before any news card ships |
| FEED-006 Verified context | BUILD | Not present |
| FEED-007 Low-bandwidth feed | BUILD | Blocked by FINDING-06 (2.5 MB bundle) |
| FEED-008 Popularity is not readiness | **REMOVE (violation)** | `feed-first-post` → +10 communication WRI. **WP-0003** |

## 24–27 Graph, Institutional data, Monetisation, Trust

| ID | Class | Evidence |
|---|---|---|
| GRAPH-001 … 003 | DEFER | Sprint 9 |
| DATA-001 … 004 | DEFER | Sprint 9, gated on governance |
| MON-001 … 004 | BUILD | No billing model exists |
| TRUST-001 … 002 | BUILD | No dispute, moderation or reviewer-trust model exists |

## 28 AI

| ID | Class | Evidence |
|---|---|---|
| AI-001 … AI-008 | BUILD | No AI integration exists in the repository today. Nothing to preserve; nothing yet violated |

## 29 Security and Privacy

| ID | Class | Evidence |
|---|---|---|
| SEC-001 Encryption in transit/at rest | KEEP | Supabase-managed |
| SEC-002 Secrets server-side | KEEP | `.env` gitignored; `server/lib/env.ts`; publishable key only |
| SEC-003 Tenant-aware authorisation | COMPLETE | Enforced in tRPC; RLS present but service-path policies are deliberately permissive by design |
| SEC-004 Server-side protected-field control | BUILD | Nothing protected exists yet |
| SEC-005 Audit log of protected views | BUILD | `src/lib/auditService.ts` writes to **localStorage** — not an audit log. REMOVE and rebuild server-side |
| SEC-006 Privileged admin MFA | BUILD | `src/pages/Admin.tsx` runs on mock arrays + localStorage |
| SEC-007 Upload scanning | BUILD | `upload.ts` unreachable; `getPresignedUrl` lacks authorisation |
| SEC-008 Rate limiting | COMPLETE | Supabase Auth rate limits are surfaced and tested; app endpoints are not limited |
| SEC-009 Telemetry retention separation | BUILD | N/A until evidence exists |
| SEC-010 Correction/export/deletion | BUILD | Not present |
| SEC-011 Rubrics never exposed | BUILD | N/A — no rubrics yet. Constraint recorded for Sprint 4 |
| SEC-012 No identifiable data sold | KEEP | No institutional product exists |
| PRIV-001 Privacy and Evidence Centre | BUILD | Sprint 2 |

## 30 Africa-first infrastructure

| ID | Class | Evidence |
|---|---|---|
| AFR-001 Mobile-first | ENHANCE | Responsive Tailwind throughout; unverified on device |
| AFR-002 Low-data mode | BUILD | Not present |
| AFR-003 Compression / resumable upload | BUILD | Not present |
| AFR-004 Poor-network states | COMPLETE | `src/hooks/useOffline.ts` exists; not applied across surfaces |
| AFR-005 Offline drafts | BUILD | Not present (localStorage persistence is not the same thing) |
| AFR-006 Email/SMS fallback | BUILD | Not present |
| AFR-007 Currency/timezone/locale | COMPLETE | `src/lib/currency.ts` + `CurrencySelector` exist, localStorage-backed |
| AFR-008 Language architecture | BUILD | **WP-0004** |
| AFR-009 Network ≠ low readiness | BUILD | Constraint recorded for Sprint 4 (L28-008) |
| AFR-010 Accessibility | ENHANCE | Radix primitives give a floor; no audit performed |
| — 2.5 MB single bundle | MODIFY | FINDING-06 |

## 31–35 Engineering direction, data, events, API

| ID | Class | Evidence |
|---|---|---|
| ENG-001 No stack migration | **KEEP** | Current stack matches §31 exactly |
| ENG-002 Preserve auth foundations | **KEEP** | Verified working |
| ENG-003 Verify before changing | KEEP | Enforced by this audit and WP-0001 |
| ENG-004 Real structure over folder examples | KEEP | Repository uses `server/`, not the PRD's illustrative `api/` |
| ENG-005 Incremental connection, no blind rewrite | KEEP | Binding constraint on every packet |
| DATA-MODEL-001 Derive from current schema | KEEP | Enforced |
| DATA-MODEL-002 Evidence events | BUILD | Sprint 2 |
| DATA-MODEL-003 Visibility in the data model | BUILD | Sprint 2 |
| EVENT-001 … 002 | BUILD | No event pipeline exists |
| API-001 Authenticated protected endpoints | KEEP | `authedProcedure` in `server/trpc.ts` |
| API-002 Organisation membership checks | COMPLETE | Present in `organizationRouter` |
| API-003 … API-008 | BUILD | Entitlement, adapters, idempotency, versioning absent |
| OBS-001 … 007 | BUILD | Structured JSON logs exist for auth only |

## Surfaces recommended for REMOVE or DEFER

These exist as pages, consume review attention, and are outside the Master PRD's active release scope (§7.1/§7.2) or actively misrepresent data:

| Surface | Class | Reason |
|---|---|---|
| `src/pages/MarketIntel.tsx` | REMOVE | Presents localStorage values as compensation/market intelligence. COMP-003 forbids fabricated benchmarks |
| `src/pages/ShaderDemo.tsx` | REMOVE | Demo route in a production build; contributes to the `three` bundle cost |
| `src/pages/MilestonePayments.tsx`, `ContractWorkspace.tsx` | DEFER | Payment/escrow model is an unresolved §49 human decision (QW-008) |
| `src/pages/Screening.tsx`, `SmartMatch.tsx` | DEFER | Depend on WRI and Role Fit, which do not exist. Cannot be honest until Sprint 3/6 |
| `src/pages/Booking.tsx`, `ContentStudio.tsx` | DEFER | Not in §7.1 release scope |
| `contracts/index.ts` | REMOVE | Dead, unreferenced, stale vs schema. **WP-0001** |
| 8 unreachable routers | REMOVE | FINDING-07. **WP-0001** |
| `src/lib/auditService.ts` | REMOVE | A localStorage "audit log" is worse than none — it implies a control that does not exist |

**Note on removal:** REMOVE means "conflicts with approved product direction and must not be carried forward". For user-facing surfaces, Codex must replace them with an honest state or an unregistered route — never a screen that keeps claiming a capability Levav does not have.
