# Onboarding and Capability Model v1

**Owner:** Claude (Product Command). **Requirements:** AUTH-001, AUTH-002, AUTH-003, ONB-001, ONB-002, ONB-003, PROF-002, EMP-001, EMP-002, SEC-004, PRIV-001, LANG-002/003, AFR-001/010
**Decision record:** PDR-0014 · **Binds:** WP-0102 (amended), WP-0105, WP-0106
**Status:** APPROVED. Codex implements this; it does not invent the semantics.

---

## 0. The structural rule

The product owner's direction lists ten kinds of person. Implemented naively, that becomes a ten-value account-role enum, and every one of Levav's identity requirements breaks: a person who is both a talent and an employer needs two accounts, evidence fragments, and AUTH-001 is lost.

**Four independent axes, never collapsed:**

| Axis | What it is | Who sets it | Enforced? |
|---|---|---|---|
| **A · Employment situation** | What is true about your work right now | The member declares | No — a preference |
| **B · Opportunity posture** | Whether you want to be approached | The member declares | No — a preference, but it gates *visibility* |
| **C · Platform intentions** | What you want to do on Levav — multi-select | The member declares | No — drives ordering only |
| **D · Capabilities** | What you may actually do | **Derived from rows, never declared** | **Yes — server-side** |

Every one of the owner's ten cases is a combination of A, B and C. **None of them is a role.** "Employed but open to opportunities" is `employed` + `open_to_opportunities`. "Employed and primarily seeking growth" is `employed` + `not_seeking` + intention `develop`. The distinction the owner is drawing between those two is a **posture** difference, not a different kind of user.

---

## 1. Approved employment-situation vocabulary (Axis A)

Single-select. What is true now — not what you want.

| Value | Display label | Meaning |
|---|---|---|
| `employed` | Employed | In a role, working for an organisation |
| `self_employed` | Self-employed | Working for yourself, no organisation with staff |
| `running_organisation` | Running an organisation | Operating a business, NGO or practice |
| `freelancing` | Freelancing | Independent, working across multiple clients |
| `studying` | Studying | Education is your main occupation |
| `not_working` | Not currently working | Not in work now |
| `career_break` | On a career break | Away from work — caring, health, travel, or returning |

**Changes from the shipped enum**, which has nine values:

- `volunteering` is **removed as a situation.** Contributing is an activity, not an employment state — a person who volunteers is also employed, studying or not working. It becomes intention `contribute`.
- `changing_careers` is **removed as a situation.** It is a direction, captured by target role in the career step, not a state.
- `returning_to_work` is **merged into `career_break`**, which covers the whole absence rather than only its end.
- `unemployed` is **renamed `not_working`** with the label "Not currently working". The state must be recorded honestly — the Language System forbids euphemism as much as deficit framing — but the label describes a circumstance rather than assigning an identity.

**Migration:** existing rows map `volunteering → not_working`, `changing_careers → employed`, `returning_to_work → career_break`. Every migrated member is asked to confirm on next sign-in (ONB-001 — no silent reclassification). Until they confirm, the value is marked inferred and is not used for ordering.

## 2. Opportunity posture (Axis B) — and the rule that matters most

Single-select. Separate from situation, and the axis the owner's direction actually turns on.

| Value | Display label |
|---|---|
| `actively_seeking` | Actively looking for work |
| `open_to_opportunities` | Open to the right opportunity |
| `not_seeking` | Not looking right now |

> **`actively_seeking` and `open_to_opportunities` are never disclosed to any employer, on any surface, in any aggregate, at any subscription tier — unless the member has explicitly opted in to being discoverable, per employer-visibility settings that do not exist until Sprint 6.**

This is a safety requirement, not a privacy preference. People are dismissed for looking for work. Levav must never be the reason an employer learns that an employee is searching — including the member's own employer, who may hold an organisation account.

Until Sprint 6 delivers explicit, member-controlled discoverability, **posture is private to the member and to server-side matching only.** No employer read path may exist.

## 3. Platform intentions (Axis C) — multi-select

**Yes, members may select multiple, and the model assumes they will.** The owner's tenth case — participating in several capabilities at once — is the normal case, not an edge case.

| Value | Display label |
|---|---|
| `develop` | Build and prove my readiness |
| `find_work` | Find a job |
| `find_quickwork` | Find QuickWork assignments |
| `learn` | Learn and close skill gaps |
| `contribute` | Contribute my skills through Impact |
| `network` | Connect with other professionals |
| `hire` | Hire people for an organisation |
| `post_quickwork` | Post QuickWork assignments |
| `represent_organisation` | Represent an organisation |

**PDR-0003 corrections applied.** The shipped `SIGNUP_GOALS` strings "Find QuickWork™ or freelance gigs" and "Post a quick job or gig" are replaced above. "Gig" is prohibited.

A **primary intention** is retained — the first selected, or an explicit choice — and drives first-run routing, which already works (`onboardingRouting.ts`).

## 4. Preferences versus capabilities (Axis D)

**Declaring an intention grants nothing.**

| Capability | Derived from | Never from |
|---|---|---|
| Talent capability | A `talents` row for this user | Any declared intention |
| Organisation member | An `organization_members` row, `status = 'active'` | Declaring `represent_organisation` |
| What you may do in an organisation | That row's `orgRole` | Any preference |
| Publish Impact opportunities | Organisation `verificationStatus = 'verified'` | Declaring `contribute` |
| Post jobs, see candidates | Verified organisation + entitlement (EMP-004, Sprint 6) | Declaring `hire` |
| Admin | `users.accessLevel = 'admin'` | Anything declared |

Selecting `hire` does **not** make someone an employer. It makes Levav show them the path: create an organisation, or request membership of one. The capability arrives when the row exists and verification passes — enforced server-side, never by UI (SEC-004).

This is why the shipped schema is right and must be preserved: capability is a join, not a column. Nothing in this model adds a role enum to `users`.

## 5. Privacy defaults

| Data | Default | Notes |
|---|---|---|
| Employment situation | **Private** | Never public, never employer-visible in Sprint 1 |
| Opportunity posture | **Private** | §2 — hard rule |
| Platform intentions | **Private** | Product personalisation only |
| Target role | **Private** | Becomes employer-relevant only through Sprint 6 discoverability |
| Career family, role, industry, seniority | **Private by default**, member may publish to profile | Publishing is an explicit act (WP-0103 visibility) |
| Organisation membership | **Visible to that organisation.** Public only if the member publishes it | An organisation always knows its own members |

Everything here appears in the Privacy and Evidence Centre with an edit route (PRIV-001).

## 6. Editing later

One surface: **Settings → Your situation and interests**, reachable from the avatar menu and from a Personal Home prompt.

- Every value in A, B and C is editable at any time, independently.
- Changing any of them **never** alters capabilities, deletes evidence, resets onboarding or changes access.
- Changing posture to `not_seeking` takes effect immediately on any matching surface.
- A member may decline to answer A or B. `unspecified` is valid and must not block anything (ONB-003).

## 7. Personal Home module ordering

Deterministic, explainable, and member-overridable. Ordering is computed from intentions first, situation second, and **never** from readiness, engagement or recency of login.

| Intention | Modules raised |
|---|---|
| `develop` | Levav 28 · readiness · Learn |
| `find_work` | Jobs · profile completeness · readiness |
| `find_quickwork` | QuickWork capacity · assignments |
| `learn` | Learn · skill gaps |
| `contribute` | Impact opportunities · contributions |
| `network` | Feed · profile · What is New |
| `hire` / `post_quickwork` / `represent_organisation` | Organisation workspace · create-or-join-organisation |

Situation adjusts within that: `not_working` + `actively_seeking` raises Jobs and QuickWork; `employed` + `not_seeking` + `develop` raises Levav 28 and Learn and lowers Jobs without removing it.

**A member can reorder or pin modules, and that choice wins over any computed order.**

## 8. Irrelevant modules — shown, not hidden

**Nothing is silently hidden.** Three presentation tiers:

| Tier | Behaviour |
|---|---|
| **Primary** | Ordered to the top, expanded |
| **Secondary** | Present, collapsed, below the fold. Everything Levav offers stays discoverable |
| **Eligibility-gated** | Shown with the condition stated and the action that satisfies it — "Publishing opportunities needs a verified organisation. Create one, or ask to join." |

Hiding produces two failures: members never learn what Levav does, and people with several capabilities become invisible to themselves. An eligibility-gated module is an invitation; a hidden one is a dead end.

Never render an eligibility-gated module as broken, empty or disabled-without-explanation.

## 9. Context switching — talent and organisation member

**One identity, one account, explicit context** (AUTH-001).

- A **workspace switcher** in the primary navigation lists: *Personal*, then every organisation where `organization_members.status = 'active'`.
- **Personal is always the default** on sign-in. Levav never opens into an organisation context.
- The current context is visible at all times — an organisation context is unmistakable, never a subtle tint.
- Switching changes **navigation and permissions**, never identity. Evidence, WRI, profile and Levav ID remain personal and are not visible in an organisation context (AUTH-003).
- Personal notifications never surface inside an organisation context, and vice versa.
- A member with no active membership sees no switcher — and instead sees the eligibility-gated path from §8.
- Every organisation action is authorised server-side against that membership and `orgRole`. The switcher is navigation, not permission.

## 10. Organisation profile — what matching requires

Already in `organizations`: name, type, industry, size, registration number, website, description, address, city, country, contacts, verification status.

Required additionally for matching:

| Field | Why |
|---|---|
| Operating locations | Multiple; matching is location-sensitive |
| Hiring markets | Where they recruit, which may differ from where they operate |
| Work modes offered | Remote, hybrid, on-site |
| Sector, mapped to the taxonomy | Free-text industry cannot match (WP-0101) |
| Organisation size band | Distinguishes an SME from an enterprise for QuickWork and Jobs relevance |
| Verification status | **Gates publication.** Unverified organisations may draft, never publish |

## 11. Hiring needs — what employers provide, and permitted use

Captured per requirement, not per organisation: role, seniority, skills, location and work mode, engagement type (employment, QuickWork, contribution), timeline, number of people, and the outcomes the role must deliver.

**Permitted uses:** matching candidates to the requirement; explaining to a candidate why an opportunity appeared; explaining to an employer why a candidate appeared (EMP-003); aggregate demand analysis under Sprint 9 governance.

**Prohibited uses:**

- Any inference about an individual beyond role relevance.
- **Any protected characteristic in ranking** (§48) — and criteria that proxy for one are rejected at capture, not filtered downstream.
- Exposing a member's opportunity posture (§2).
- Paid placement overriding genuine relevance (MON-001).
- Compensation expectations shown to an employer without the member's explicit consent.

An employer may weight legitimate job-related dimensions (EMP-002). They may never weight anything in §48's exclusion list.

## 12. Required states

Every surface built under this model:

| State | Requirement |
|---|---|
| **Empty** | What this is, why it is empty, one action. Never a bare illustration |
| **Loading** | Skeleton matching final layout, not a spinner |
| **Error** | What went wrong in the member's terms, plus the next safe step. Nothing partially submitted is lost |
| **Ineligible** | The condition and the action that satisfies it (§8). Never a disabled control with no explanation |
| **Not yet available** | **PDR-0009 pattern.** State plainly that the capability does not exist yet. Never an empty result, never "coming soon" with a date Levav cannot honour |
| **Offline / poor network** | Selections preserved; onboarding resumable (AFR-004) |
| **360 px** | Every surface usable, no horizontal overflow |

## 13. Required analytics events

No values in payloads — categories and counts only. None of this is evidence and none of it may reach the WRI engine.

| Event | Payload |
|---|---|
| `onboarding.step.completed` | step name |
| `onboarding.situation.set` | situation value |
| `onboarding.posture.set` | posture value |
| `onboarding.intentions.set` | count, and whether multiple were chosen |
| `onboarding.career.skipped` | — |
| `onboarding.completed` | primary intention, whether career detail was provided, whether situation and posture were specified |
| `home.module.ordered` | ordered module keys and whether the order was computed or member-set |
| `home.module.eligibility_shown` | module key and unmet condition — **this is the product signal for how many people want something they cannot yet reach** |
| `home.module.reordered` | member override recorded |
| `context.switched` | to personal or organisation — never the organisation identity |
| `settings.situation.changed` | which axis changed |

`home.module.eligibility_shown` is the most valuable of these: it measures demand for capabilities Levav has not yet delivered.

## 14. Open decisions

| # | Decision | Disposition |
|---|---|---|
| 1 | Whether posture becomes employer-visible under explicit member opt-in | **Sprint 6, with §2 as a binding constraint.** Any design must make disclosure an affirmative, revocable act, and must consider that a member's own employer may hold an account |
| 2 | Whether `career_break` should be a situation or an attribute of `not_working` | Implemented as a situation. Revisit with real usage; it exists because "not working" describes a caring or health absence badly |
| 3 | Number of intentions before ordering becomes meaningless | Recommend no hard cap; if a member selects everything, fall back to a sensible default order and log it |
