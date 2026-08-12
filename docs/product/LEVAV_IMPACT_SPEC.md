# Levav Impact — Product Specification v1

**Owner:** Claude (Product Command). **Requirements:** IMPACT-001 … IMPACT-005, EVD-001/003, AUTH-002/003, PROF-003, FEED-002/006, LEARN-002, TRUST-002, SEC-004/007/010, PRIV-001, AFR-001/002/004/007, LANG-001 … 005
**Sprint:** 8 · **Status:** APPROVED as product specification. Work packets follow when Sprint 8 opens.
**Binding:** `EVIDENCE_GRAPH_CONTRACT_v1.md`, `WRI_SCIENTIFIC_SPEC_v1.md`, `LEVAV_LANGUAGE_SYSTEM.md` §6, `COPY_DICTIONARY.md` §6 and §14.

---

## 1. What Impact is

A verified contribution system. People use real professional capability in service contexts; organisations mobilise skilled contributors; the work produces a verified record of what was actually delivered.

It is a **first-class product system**, not a page. It has its own opportunity model, its own dashboards on both sides, its own verification chain, and its own place in Personal Home and the Feed.

## 2. The line that must never be crossed

> **Contribution is not employment, and Levav must never let it become disguised unpaid labour.**

This is the single highest product risk in the whole platform. It is not primarily a legal risk — it is that Levav would become a channel for organisations to extract professional work for free while calling it opportunity, in a market where people are desperate enough to accept.

The defences are structural, not a disclaimer:

| Control | Rule |
|---|---|
| **Explicit pathway declaration** | Every opportunity states, in the header, that it is a contribution opportunity and not employment. `impact.pathway.notice`, never in a footer |
| **Bounded commitment** | Expected hours and duration are a **ceiling**, entered by the organisation and shown to the contributor. An opportunity with no upper bound cannot be published |
| **Hard limits** | An opportunity exceeding the configured hours-per-week or total-duration threshold cannot be published as Impact. It is work, and it belongs in QuickWork or Jobs. The threshold is a §49 human decision |
| **No employment vocabulary** | Salary, hire, position, staff, probation, full-time and equivalents are rejected at publication. Language System §6 |
| **Always exitable** | `impact.opportunity.withdraw` appears on every placement. Withdrawing is never penalised, never affects readiness, never appears as a negative record |
| **No conversion pressure** | Levav never presents contribution as a route to a job at that organisation. An organisation may later post a real role, and the contributor applies to it like anyone else |
| **Repeat-extraction detection** | An organisation running continuous placements that replace a role it should be paying for is a trust signal, surfaced to moderation (Sprint 10) |
| **Readiness neutrality** | Participation never raises WRI (IMPACT-002). Only verified outputs, observed by a supervisor, can produce evidence — exactly as any other work |

**Stipends do not change the pathway.** An opportunity covering transport or a meal is still a contribution opportunity, and says so (`impact.pathway.stipend`).

## 3. Information architecture — where Impact lives and what links to what

This section is the navigation contract. Every link named here must exist.

### 3.1 Member (talent) surfaces

| Surface | Route | Entry points into it |
|---|---|---|
| **Impact home / discovery** | `/impact` | Primary navigation · Personal Home Impact card · Feed Impact view · onboarding goal `find-volunteer` |
| **Opportunity detail** | `/impact/opportunities/:id` | Discovery list · Feed opportunity card · notification · direct share link |
| **Apply** | `/impact/opportunities/:id/apply` | Opportunity detail — one step, see §6 |
| **My contributions** | `/impact/my-contributions` | Personal Home Impact card · profile Impact section · notification |
| **Placement detail** | `/impact/placements/:id` | My contributions · notification · organisation message |
| **Contribution record** | `/impact/records/:id` | Placement detail on completion · profile · Privacy and Evidence Centre |

**Personal Home must carry an Impact card** (this is the link the talent dashboard needs). Its states:

- No activity → what Impact is in one line, plus **Find contribution opportunities** → `/impact`
- Application pending → organisation, opportunity, submitted date → `/impact/my-contributions`
- Active placement → opportunity, supervisor, hours logged against the ceiling, next action → `/impact/placements/:id`
- Awaiting verification → what the organisation still has to confirm
- Verified record → what was delivered, and **Add to profile** if not already visible

**The professional profile carries an Impact section** (PROF-003) listing verified contribution records the member has chosen to show, each linking to `/impact/records/:id`.

**The Privacy and Evidence Centre** lists every Impact-derived evidence node with its provenance and dispute route (WP-0204).

### 3.2 Organisation surfaces

Impact lives inside the organisation workspace, not as a separate product.

| Surface | Route | Purpose |
|---|---|---|
| **Impact dashboard** | `/org/:orgId/impact` | The landing view — see §5 |
| **Opportunities** | `/org/:orgId/impact/opportunities` | List, status, applicant counts |
| **Create / edit opportunity** | `/org/:orgId/impact/opportunities/new` | Publication flow with the §2 controls enforced |
| **Applicants** | `/org/:orgId/impact/opportunities/:id/applicants` | Review, accept, decline |
| **Placements** | `/org/:orgId/impact/placements` | Active and completed, by status |
| **Verification queue** | `/org/:orgId/impact/verify` | The supervisor's action list — see §7 |
| **Outcomes and reporting** | `/org/:orgId/impact/outcomes` | Activity, output, outcome — see §9 |
| **Organisation public page** | `/organisations/:orgId` | Public Impact presence, opportunities open now |

**Cross-links that must exist in both directions:**

- Opportunity detail (member) ↔ organisation public page
- Placement detail (member) ↔ placement record (organisation)
- Contribution record (member) ↔ the verification the organisation submitted
- Verification queue item (organisation) ↔ the contributor's public profile only, never their private evidence or readiness

### 3.3 The one-way rules

- An organisation reaches a contributor's **public profile**. Never their evidence, WRI, trajectory or other placements (AUTH-003).
- A member reaches the **organisation's public page and their own placement**. Never the organisation's other applicants or internal notes.

## 4. Opportunity model (IMPACT-001)

Types: skilled volunteering · community project · mentorship · professional service · pro bono assignment · time-bound campaign or field initiative · organisational service placement with defined outputs.

Required at publication — an opportunity missing any of these cannot be published:

| Field | Note |
|---|---|
| Purpose or cause | Plain description of what the work is for |
| Skills sought | Mapped to the WP-0101 taxonomy |
| Expected outputs | **What will exist when this is done.** The field that makes verification possible |
| Location and work mode | Remote, on-site, hybrid, with location where relevant |
| Duration and hours ceiling | A maximum, not a minimum |
| Named supervisor | A real person in the organisation who will verify the work |
| Safety and context information | See §8 |
| Costs and stipend | What is covered, or explicitly nothing |
| Pathway declaration | Automatic, non-removable |

**Publication requires a verified organisation.** Unverified organisations may draft but not publish (IMPACT-001).

## 5. Organisation Impact dashboard (IMPACT-003)

The landing view at `/org/:orgId/impact`. Designed so a programme coordinator can see what needs them today.

**Action strip — what is waiting on this organisation**

| Card | Links to |
|---|---|
| Applicants awaiting review — count and oldest wait | Applicants |
| Placements awaiting verification — count and oldest wait | Verification queue |
| Placements ending this week | Placements |
| Opportunities expiring or unfilled | Opportunities |

Ageing is shown deliberately. A contributor waiting three weeks for a decision is the most common failure in volunteering programmes, and the dashboard should make it visible rather than comfortable.

**Programme summary**

Open opportunities · active placements · completed this period · verified contribution hours · contributors engaged · repeat contributors · outputs delivered.

Every figure is **verified-only**. Nothing counts an unverified claim, and the dashboard says so.

**Recent activity** — a short reverse-chronological list of applications, acceptances, completions and verifications, each linking to its record.

**Reporting** — link to `/org/:orgId/impact/outcomes` (§9).

Permissions: visible to members with an organisation role permitting Impact management. Verification is restricted to the named supervisor or an organisation admin (§7). Enforced server-side (AUTH-002).

## 6. Application and placement — easy sign-up (IMPACT-001)

The instruction here is that signing up must be genuinely easy. The design principle: **a member who already has a Levav profile should be able to apply in one step, without re-entering anything Levav already knows.**

### 6.1 Applying

From opportunity detail, one action — `impact.opportunity.apply`. The form contains:

1. **What the organisation will see** — name, headline, public profile, and the skills relevant to this opportunity. Pre-filled from the profile. Nothing re-typed.
2. **Availability** — pre-filled from any declared capacity, editable here.
3. **One optional message** — why they want to contribute. Optional means optional; an empty message never disadvantages an applicant, and the interface must not imply otherwise.
4. **The pathway notice and the hours ceiling**, shown at the point of commitment, not buried earlier.

That is the whole form. No CV upload, no cover letter, no essay, no separate account, no organisation-specific questionnaire in v1. Friction here excludes exactly the people Levav exists to reach — someone applying on a phone, on mobile data, between other work.

**Incomplete profiles may still apply.** A member without a full profile sees what is missing and can add it inline or proceed anyway. Impact must not become a gate that requires profile completion first.

### 6.2 Placement lifecycle

```
applied → accepted (placed) → active → outputs submitted → verified → contribution record
             │                   │
             ├── declined        └── withdrawn (contributor) / ended (organisation)
```

- **Declined** carries an optional reason. It is private to the applicant, never public, and never affects readiness.
- **Withdrawn** is always available and never penalised.
- **Ended by the organisation** requires a reason and notifies the contributor.
- Every transition is timestamped, authorised server-side and auditable.

### 6.3 Response commitments

The organisation sees ageing on every pending application (§5). Where an application has been pending beyond a configured window, the member is told honestly that the organisation has not responded yet, and may withdraw. Levav does not pretend a silent application is progressing.

## 7. Verification (IMPACT-002)

Verification is what separates Impact from a list of good intentions.

**Who:** the named supervisor from the opportunity, or an organisation admin. Never the contributor. Never automatic. Enforced server-side.

**What is confirmed:** role performed · dates · hours or duration, within the published ceiling · the outputs actually delivered · completion state · optionally, a structured review of observed work behaviour against the closeout rubric.

**Artefacts** may be attached under rights and visibility controls (IMPACT-002), scanned and type-restricted (SEC-007).

**The contributor can dispute an inaccurate record** — routed through the Sprint 2 dispute workflow (WP-0203), which preserves the original and stops it counting immediately.

**Verification produces evidence.** The verified outputs and any structured behavioural review become E3 evidence through the event pipeline — `impact.placement.verified` (Evidence Graph §8). The participation does not. Hours alone do not. This is the boundary IMPACT-002 exists to protect, and it is enforced by `eligible_dimensions`: an hours-only verification declares none.

## 8. Safety

Contribution work puts people in physical locations, sometimes with vulnerable groups. This is not a section to gesture at.

- **Only verified organisations publish.**
- **A named supervisor is mandatory** — no anonymous placements.
- **Location and context are disclosed before application**, including whether work is in a private residence, a remote site, or after dark.
- **Work involving children or vulnerable adults must be declared** on the opportunity. Levav states plainly what checks it has and has not performed — it does not imply a safeguarding assurance it cannot provide. Where local law requires clearance, the organisation confirms it holds it; Levav records that confirmation as the organisation's claim, not as Levav's verification.
- **A reporting route is available from every placement and opportunity**, reaching moderation directly rather than the organisation.
- **Blocking an organisation is available to any member** and removes them from that organisation's discovery.
- Safety reports are prioritised above other moderation (Sprint 10).

## 9. Measurement — activity, output, outcome (IMPACT-005)

Three distinct things that the sector routinely conflates, and Levav must not:

| Level | Definition | Who asserts it |
|---|---|---|
| **Activity** | Hours served, sessions attended, contributors engaged | Levav records it, verified by the supervisor |
| **Output** | A thing that exists because the work happened — a report, a system, sessions delivered, people trained | Verified by the supervisor against the published expected outputs |
| **Outcome** | A change in a community or beneficiary group | **Only the organisation, and only with a stated measurement basis** |

**Levav never manufactures a social-impact claim.** Where an organisation asserts an outcome, the interface attributes it to that organisation and shows its stated basis. Where no basis is published, the surface says so (`impact.outcome.unmeasured`) rather than displaying the claim as fact.

Programme metrics: verified placements · completion rate · repeat participation · outputs delivered · verified contribution hours · skills deployed · organisation-confirmed outcomes where measurement quality is sufficient.

**No leaderboards. No contributor ranking. No badge for hours** (IMPACT-004). Popularity metrics never substitute for verified contribution.

## 10. Feed integration (IMPACT-004, FEED-002/006)

- **Members** may publish a contribution story from a verified record. The verified element is marked as a verified *work item*, never as a claim that the whole post is objectively true (FEED-006).
- **Organisations** may publish Impact updates and opportunity announcements from their page.
- Opportunities may appear in the Feed's Impact and Opportunities views (FEED-004).
- **Feed engagement on an Impact post never affects readiness, ranking or verification** (FEED-008).
- A member's contribution is only ever published by the member. An organisation cannot publish a named contributor's participation without their consent.

## 11. Privacy and visibility

- A contribution record appears on the member's profile **only when they permit it** (IMPACT-002). Default is private.
- Application to an opportunity is visible to that organisation only. Never public, never to other organisations.
- Declined applications are private to the applicant.
- An organisation sees the contributor's public profile and their placement. Nothing else (§3.3).
- Impact evidence appears in the Privacy and Evidence Centre with full provenance and a dispute route.
- Withdrawing from a placement leaves no public trace.
- Records are retained under SEC-010, and the member can export them.

## 12. Africa-first behaviour

Impact discovery and application must work on a low-end phone on mobile data (AFR-001/002). Opportunity lists are text-first with images lazy-loaded; the application form survives a dropped connection (AFR-004); location is shown with practical travel context, not only a map; stipend and cost information uses local currency (AFR-007); notifications for time-sensitive placement changes use email or SMS fallback where justified (AFR-006).

## 13. Copy

All Impact copy comes from `COPY_DICTIONARY.md` §6 and the dashboard and navigation keys added in §14. The Language System §6 prohibitions are binding: no "volunteer" as an identity, no "give back", no "beneficiary", no charity framing, no employment vocabulary, no leaderboards.

## 14. Open decisions

| # | Decision | Disposition |
|---|---|---|
| 1 | Hours-per-week and total-duration thresholds above which an opportunity is not Impact | **§49 human decision.** The load-bearing control in §2 — it needs a human owner, informed by local labour norms. Recommend drafting with Zambian labour practice in view |
| 2 | Whether Levav requires evidence of safeguarding clearance for work with vulnerable groups, or records the organisation's assertion | **§49 human decision.** Verifying clearances is an operational commitment Levav may not be able to keep; asserting one it cannot keep is worse than recording a claim honestly |
| 3 | Response-window length before an applicant is told the organisation has not responded | Product decision, configurable. Recommend 14 days |
| 4 | Whether contribution records can be verified retrospectively for work completed outside Levav | Recommend **no** in v1 — retrospective verification has no observation behind it and is the easiest route to fabricated evidence |
