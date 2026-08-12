# Sprint 1 — Identity, Taxonomy and Personalisation

**Owner:** Claude (Product Command). **Requirements:** AUTH-001…003, ONB-001…003, PROF-001…004, LANG-002/004, AFR-001/002/007/010, SEC-004/010, DATA-MODEL-001/003
**Prepared:** 2026-08-12, while implementation capacity was paused. Issued so that specification is never the thing blocking a build.

---

## Exit gate (Master PRD §46)

> A new user can register, confirm identity, complete intelligent onboarding, receive a real personal profile state and enter the relevant next journey **without mock identity logic**.

The last four words are the test. Sprint 1 is not done when the screens look right; it is done when nothing on that path reads from `localStorage` or a `MOCK_*` array.

## What already exists (verified, not assumed)

Sprint 1 builds on a genuinely good foundation. Do not rebuild any of it:

- **Identity** — `users.id` FKs `auth.users.id`, written only by the `handle_new_user()` trigger. Talent and organisation capability are derived from row existence, not a role column. AUTH-001 is materially satisfied.
- **Auth** — Supabase Auth, httpOnly `SameSite=Lax` cookie, 56 passing tests.
- **Onboarding, partially** — `user_onboarding` stores `goals`, `primaryGoal`, `personalStatus`; `onboardingRouter.complete`/`get` are real and registered; `src/lib/onboardingRouting.ts` routes first-run destination by primary goal and is test-covered.
- **Profile, minimally** — `talents` holds `name`, `bio`, `category` (free varchar), `skills` (jsonb), `location`. `createOwnProfile`, `updateOwnProfile`, `getOwnProfile`, `list`, `getById` are registered.

## What is missing

`category` is a free-text varchar with no taxonomy behind it. There is no career family, target role, seniority, industry, work mode, experience, education, projects, links, photo, cover image or visibility control. There is no email-change flow. Nothing distinguishes a self-declared claim from verified evidence. Personal Home renders from mock data.

## Packet sequence

| ID | Title | Requirements | Depends on |
|---|---|---|---|
| **WP-0101** | Career taxonomy — versioned, admin-managed, African sectors | ONB-002, GRAPH-001, GRAPH-003 | — |
| **WP-0102** | Intelligent onboarding on real taxonomy | ONB-001, ONB-003, LANG-002 | WP-0101 |
| **WP-0103** | Professional profile — real fields, claims vs verified | PROF-001, PROF-003, DATA-MODEL-003 | WP-0101 |
| **WP-0104** | Secure account email change | PROF-004, AUTH-001, SEC-010 | — (independent) |
| WP-0105 | Personal Home on real services | ONB-003, AUTH-001 | 0102 + 0103 |
| WP-0106 | Organisation membership and verification | AUTH-002, EMP-001 | 0103 |

**WP-0101 … WP-0104 are issued now.** WP-0105 and WP-0106 are scoped below but deliberately **not yet issued** — §43 forbids building on contracts that are not stable, and both depend on the profile shape WP-0103 settles. They are issued the day WP-0103 is ACCEPTED.

WP-0104 is independent of the others and can run in parallel at any point.

## Ordering constraints

- **WP-0101 before WP-0102 and WP-0103.** Both consume the taxonomy. Building either against free-text `category` means rewriting it a fortnight later.
- **Nothing in Sprint 1 may create an evidence record or a WRI value.** The Evidence Graph is Sprint 2 and WRI is Sprint 3. A profile field is a *claim* (E0) until Sprint 2 gives it provenance. Any packet that starts inventing evidence semantics is returned.
- **Every packet inherits PDR-0001.** No client code computes, awards or persists a WRI value.

## Not in Sprint 1

- CV extraction and AI career inference — see **PDR-0011**. No AI provider abstraction exists (AI-001 … AI-008 are all BUILD), and ONB-001's guardrail is that the user confirms rather than the system guesses. Sprint 1 delivers intelligence through taxonomy and progressive disclosure, not through a model.
- Verified evidence display. PROF-001 requires that verified and self-declared items look different; in Sprint 1 **everything is self-declared**, so the requirement is met by labelling every claim honestly, not by building a verified state with nothing behind it.
- Employer-facing profile views, WRI visibility, entitlement. Sprint 6.

## Scope notes for the two unissued packets

**WP-0105 — Personal Home on real services.** Replace `Dashboard.tsx`'s mock content with real profile completeness, real onboarding state and the correct next action per primary goal. Honest empty states throughout; no readiness figure of any kind. Depends on the profile shape from WP-0103.

**WP-0106 — Organisation membership and verification.** `organizations.verificationStatus` already has the enum (`pending`/`in_review`/`verified`/`rejected`) but no process moves a row through it. Build the submission, review queue and status transitions with server-side authorisation on `orgRole`, plus the audit trail those transitions require. Verified status must never be self-assignable.

## Copy

Every user-facing string in these packets comes from `COPY_DICTIONARY.md`. Sprint 1 additions are in §12 of that document. Two existing live strings are corrected inside WP-0102 because they breach PDR-0003: `'Find QuickWork™ or freelance gigs'` and `'Post a quick job or gig'` in `src/lib/onboardingRouting.ts`.
