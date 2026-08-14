# Product System Map

Maps every named Levav concept to what genuinely exists in the codebase — database table, API endpoint, and frontend page — versus what exists only as vision/documentation. Verified by reading `db/schema.ts`, `api/routes/*.ts`, and the relevant `src/pages/*.tsx` directly.

| Concept | DB table? | API endpoint? | Frontend page | Real status |
|---|---|---|---|---|
| **Talent profiles** | `talents` (id, userId, name, bio, category, skills[], portfolio[], location, rate, featured) | `talent.ts` — full CRUD, real Drizzle queries, ownership checks | `TalentDirectory.tsx`, `TalentProfile.tsx`, `ProfileCreate.tsx` | Backend logic reads as correct, but is unverified — it has never been executed (see `docs/ARCHITECTURE.md`); frontend pages don't call it — they use `MOCK_TALENTS` + localStorage |
| **Employer profiles / verification** | `employers` (registration, industry, verificationStatus enum, business docs) — the richest table in the schema | `employer.ts` — register/verify/reject flows | `Employers.tsx`, admin `EmployersSection.tsx` | Backend has a confirmed bug (`ctx.user.id` doesn't exist, breaks register/myProfile/verify); frontend uses `MOCK_` employer lists |
| **Jobs / opportunities** | `jobs` (type, salary, status, skills[]) | `job.ts` — full CRUD, public list/detail | `Opportunities.tsx`, `JobDetail.tsx`, `JobApply.tsx`, `EmployerJobs.tsx` | Backend has a Drizzle enum-comparison bug in the list filter; every frontend page uses `MOCK_JOBS`. `Opportunities.tsx` literally has `const isUsingMockData = true` with a visible "mock data" UI banner |
| **Applications** | `applications` (status enum, coverLetter, resumeUrl) | `application.ts` | `Dashboard.tsx`, `JobApply.tsx` | Backend has two real authorization gaps (`byJob` and `updateStatus` lack ownership checks); frontend uses `MOCK_APPLICATIONS` |
| **Messaging** | `messages` | `message.ts` — correctly scoped by user id | `Messages.tsx` | Backend code reads as correct but is unverified — never executed; frontend uses `MockMessage`/`MockConversation` types seeded to localStorage |
| **Reviews** | `reviews` | `review.ts` | `ReviewForm.tsx` | Backend doesn't verify the reviewer actually had a completed booking with the reviewee before allowing a review; this is the one component that does call the real tRPC endpoint (with mock fallback on error) |
| **Notifications** | `notifications` | `notification.ts` | `NotificationBell.tsx` | Backend's `create` has no check restricting who can notify whom; this component does call tRPC (with mock fallback) |
| **Workforce Readiness Index (WRI™)** | `wriScores` (overall/technical/communication/reliability/leadership/creativity/growth) — the only table mapping to a named Levav concept | `wri.ts` — **stub, `get` unconditionally returns `null`** | Referenced conceptually across dashboards, not a dedicated page | Table exists; nothing reads or writes it. Entirely non-functional end to end |
| **Levav 28™** | *No table* | *No endpoint* | `Levav28.tsx` (56KB) | Pure frontend: static day/task data from `src/lib/levavData.ts` + localStorage progress. Has a literal `alert("Certificate download coming soon!")` |
| **Levav Learn™** | *No table* | *No endpoint* | `Learn.tsx` (56KB) | Static course catalog from `levavData.ts` + localStorage progress. No lesson delivery, quizzing, or grading backend of any kind |
| **QuickWork™** | *No table* | *No endpoint* | `QuickWork.tsx` (39KB) | Static gig data + localStorage. No real gig marketplace, payment, or fulfillment logic |
| **Levav SkillSpace™** | *No table* | *No endpoint* | `SkillGap.tsx` | Static content; contains placeholder resource links (`url: "#"`) |
| **Levav Impact™** | *No table* | *No endpoint* | `Impact.tsx` | Static/placeholder content page |
| **Levav Champions™** | *No table* (role is a frontend-only string, not in the `users.role` DB enum) | *No endpoint* | `ChampionApply.tsx`, champion-gated sections of `ContentStudio.tsx` | Gating is done entirely client-side (`user?.role === 'champion'`) with no server-side enforcement possible, because the concept doesn't exist server-side at all |
| **Levav ID™** | Not a distinct table — closest analog is `users.id` / `talents.id` | — | Referenced conceptually, no dedicated implementation | No evidence of a distinct "Levav ID" system beyond ordinary DB primary keys |
| **The Levav Code™** | — | — | Not found in code | No implementation found anywhere in `src/`, `api/`, or `db/` |
| **Subscriptions / employer commercial model** | *No table* | *No endpoint* | admin `SubscriptionsSection.tsx` | Static hardcoded rows, no persistence, no billing integration |
| **Volunteerism / verified contribution** | *No table* | *No endpoint* | Not found as a distinct page | No implementation found |

## Schema/frontend role mismatch

The DB schema's `users.role` enum is `['talent', 'client', 'admin']`. The frontend actually uses roles `'talent' | 'employer' | 'admin' | 'champion'` throughout (e.g. `ContentStudio.tsx` champion gating, employer-only pages). **`'employer'` and `'champion'` do not exist as valid values in the database schema.** If the backend were connected today, employer and champion accounts could not be represented correctly without a schema migration.

## Net assessment against the stated vision

The "Workforce Intelligence Ecosystem" — matching, readiness scoring, verified contribution, structured learning — does not exist as a working system. What exists is:
1. A generic talent-marketplace data model and API (talents, jobs, applications, messages, reviews) that is reasonably well-built but disconnected and has a few real bugs.
2. A well-organized, visually coherent frontend prototype expressing the Levav vision through static content and localStorage, with no persistence beyond a single browser.
3. Zero database or API representation of the five most distinctive Levav concepts (Levav 28, Learn, QuickWork, SkillSpace, Impact) and the Champions role.

This is not a criticism of the work done — the UI/product-flow layer is a legitimate, coherent prototype of the vision — but `CURRENT_STATE.md` and any stakeholder conversation must be explicit that this is a prototype, not a working platform.
