# The Levav Language System v1

**Requirement IDs:** LANG-001 … LANG-005, AFR-008
**Owner:** Claude (Product Command). Codex implements faithfully and does not rewrite product meaning inside components (LANG-005).
**Status:** APPROVED for implementation. Amendments require a Product Decision Record.

This is the single voice of Levav — landing page, signup, onboarding, Personal Home, profiles, employer dashboards, Levav 28, WRI, QuickWork, Feed, Impact, Learn, Jobs, notifications, emails, empty states, errors and AI assistants. One product, one voice.

---

## 1. The voice

Levav sounds like **a competent colleague who respects your time and does not flatter you.**

Five properties, in priority order when they conflict:

1. **Clear** — a reader understands it once, at speed, on a phone.
2. **Human** — written to a person, not about a user segment.
3. **Intelligent** — precise about what Levav knows and does not know.
4. **Confident** — states things plainly; does not hedge into mush or beg.
5. **Practical** — every screen tells the reader what they can do next.

**Test for any string:** could a Zambian accountant with fifteen years' experience read this without feeling talked down to, and could a first-year graduate read it without needing a glossary? If either fails, rewrite.

## 2. The four prohibitions

These are product rules, not style preferences. Copy that breaks them is a defect, not a taste disagreement.

### 2.1 No charity framing
Levav is a professional infrastructure product. Its users are workers, not beneficiaries.

| Never | Instead |
|---|---|
| "Help us lift young Africans out of poverty" | "Levav helps people prove what they can do." |
| "Give back to your community" | "Contribute your professional skills." |
| "beneficiaries", "the less fortunate", "the underprivileged" | "contributors", "participants", the actual role |
| "Support our mission" (to a user) | State what the user gets and what it costs |

This binds hardest on **Levav Impact**, where charity vocabulary is the default temptation. Impact language is the language of *professional contribution*: an organisation posts an opportunity, a contributor applies, a supervisor verifies outputs. Nobody is being rescued.

### 2.2 No empty inspiration
Motivational copy is what a product writes when it has nothing to report.

| Never | Instead |
|---|---|
| "Your journey starts here" | "Start with a 20-minute onboarding." |
| "Unlock your potential" | "Complete Day 1 to see your first evidence." |
| "Transform your career" | "See which roles your evidence supports." |
| "Every talent activated. Every capability developed." | Delete. It is not a claim; it is a chant. |
| Day-header quotes and slogans | The day's actual task |

**Ban `unlock` as a gamification verb.** It appears 121 times in `src/` today. Use it only in its literal access sense ("Subscribe to unlock candidate comparison") — never for capability, potential or dimensions.

### 2.3 No unsupported claims
Levav's product is credibility. One overclaim costs more than ten dull sentences.

- Never state a benchmark, salary, match strength or readiness level the system cannot source. "Insufficient data" is a legitimate, shippable answer (COMP-003).
- Never imply WRI predicts job success. It describes demonstrated readiness.
- Never present a self-declared claim in the visual language of verified evidence (PROF-001).
- Never let an AI summary assert a fact it was not given (FEED-005, AI-007).
- Attribute external news to its original publisher, always, with a link (FEED-005).

### 2.4 No generic AI voice
Banned outright: *seamless, leverage, robust, cutting-edge, revolutionary, game-changing, supercharge, empower, elevate, unleash, harness, delve, tapestry, in today's fast-paced world, we're excited to announce, it's important to note.*

Also banned: the em-dash-heavy three-clause rhythm; opening a paragraph by restating the heading; ending a screen with an exclamation mark.

## 3. Mechanics (LANG-003)

- **Sentence case** for every interface label, heading, button and menu item. Brand names keep their casing: `Levav 28`, `QuickWork`, `Levav ID`, `Levav Impact`, `Levav Learn`, `WRI`.
- **Buttons name the user's action**, in the user's voice: `Save changes`, `Submit work`, `Verify contribution`. Never `Submit`, `OK`, `Click here`, `Learn more`.
- **Empty states have three parts**: what is here, why it is empty, one action. Never an illustration and a slogan.
- **Errors have two parts**: what went wrong in the user's terms, and the next safe step. Never a code alone, never blame, never "Oops!".
- **Uncertainty is stated plainly**: "Based on 3 pieces of evidence — this estimate will sharpen as you complete more work." Not "approximately" sprinkled over confidence.
- **Numbers carry their basis.** A score without its confidence and coverage is a misleading string, and shipping one is a WRI-001/WRI-003 defect.
- **British-influenced international English**, consistent with the PRD: *organisation, personalise, recognise, programme* (a series of activities), *behaviour*. Keep US spelling only where it is a code identifier.
- **Dates**: `12 August 2026`. **Times**: user's timezone, named (`14:00 CAT`). **Currency**: ISO code plus symbol on first use (`ZMW K1,200`) — never a bare symbol across markets (AFR-007).
- **Second person for the user** ("your evidence"), **Levav in the third person** ("Levav records this as verified"). Never "we" for the system in product surfaces; "we" is for the company in emails and policy.

## 4. Canonical terminology (LANG-002)

Codex must not introduce a synonym for anything in this table. The **Never** column lists terms currently in the codebase or in circulation that are now prohibited.

| Canonical term | Definition in one line | Never call it |
|---|---|---|
| **Levav ID** | A person's single persistent professional identity. | account, profile ID, talent ID, member number |
| **Personal Home** | The signed-in landing surface for an individual. | dashboard (for individuals), my page, hub |
| **Professional profile** | The evidence-bearing public surface of a person. | CV, résumé, portfolio, bio page |
| **Workforce Readiness Index (WRI)** | Versioned interpretation of evidence into demonstrated readiness. Spell out on first use per surface, then `WRI`. | readiness score, Levav score, talent score, rating, WRI points |
| **WRI dimension** | One of the ten defined readiness constructs. | trait, skill, attribute, stat, pillar |
| **Evidence Confidence** | How much the underlying evidence supports the estimate. | accuracy, certainty, reliability, confidence score |
| **Evidence coverage** | Which dimensions and evidence levels are represented. | completeness, profile strength |
| **Readiness trajectory** | Direction of change over time. | growth, progress bar, momentum |
| **Role Readiness** | Readiness evidence relative to a named target role. | role score |
| **Role Fit** | How well a person matches one role's requirements. Distinct from WRI — never merge the two words on one screen. | match score, compatibility |
| **Evidence** | A provenance-bearing record supporting a readiness claim. | achievement, badge, point, credit |
| **Verified / Self-declared** | The two evidence states a user ever sees. | confirmed, approved, trusted, unverified |
| **Levav 28** | The adaptive workforce simulation and development environment. Always with the space. | Levav28, L28, the 28-day challenge, the programme |
| **Day** *n* | One day of a Levav 28 journey. | level, stage, module, chapter |
| **Scenario** | A versioned simulated work situation. | task set, test, quiz, assessment |
| **Attempt** | One user pass at a scenario. | try, submission, run |
| **Practice attempt / Evidence attempt** | Development vs scored. Always distinguishable (L28-003). | mock, real |
| **QuickWork** | Structured short-form paid work. | gig, side hustle, freelance job, task, odd job |
| **Assignment** | One unit of QuickWork. | gig, job, task, project (unqualified) |
| **Capacity** | The productive time and terms a person offers. | availability slot, bandwidth |
| **Client** | The party commissioning QuickWork. | buyer, employer (in QuickWork context), poster |
| **Closeout review** | The structured review at assignment completion. | rating, feedback form, star review |
| **Levav Impact** | The verified contribution system. | volunteering (as a product name), CSR, giving |
| **Contribution opportunity** | A published Impact opportunity. | volunteer post, gig, cause |
| **Contributor** | A person doing Impact work. | volunteer (as identity), helper |
| **Placement** | A confirmed contributor-to-opportunity assignment. | booking, match |
| **Contribution record** | The verified record of completed Impact work. | certificate, badge |
| **Levav Learn** | The learning system. | courses, academy, training |
| **Employer Intelligence** | The employer decision-support layer. | recruiter tools, ATS |
| **Talent Search Profile** | An employer's structured statement of who they need. | search, query, requisition |
| **Hire Confidence** | Pre-hire explainable estimate. | prediction, success score, ROI |
| **Organisation** | Any registered entity — company, NGO, church, school, government. | company (as the general term), employer (as the general term) |
| **Feed** | The professional activity surface. | timeline, news feed, social |
| **Post** | A feed item authored by a person or organisation. | update (as a noun), status, share |
| **Follow** | The one-way network relationship. | connect, friend, subscribe |
| **What is New** | The curated update and sourced-news surface. Not "What's New" — the Language System avoids contractions in navigation. | news, blog, updates |

**Deprecated concepts:** *SkillSpace* is deferred (§7.2) and must not appear in any user-facing string or new code. *Levav Champions* remains a valid name but is Sprint 8 scope.

## 5. Talking about WRI without overclaiming

WRI copy is the highest-risk writing in the product. Three rules:

1. **Never show a WRI number without its Evidence Confidence and what produced it.** A bare number is a defect.
2. **Describe, never predict.** "Your evidence shows consistent delivery against deadlines" — not "You are likely to succeed in this role."
3. **Name what is missing.** Low confidence is a next action, not a failure: "Two of ten dimensions have evidence. Completing Days 6–10 will cover reasoning and execution."

Approved framing for the four confidence states:

| State | User-facing sentence |
|---|---|
| No data | "You have not created evidence yet. Levav 28 Day 1 is the fastest way to start." |
| Provisional | "This is a provisional estimate from limited evidence. It will change as you do more work." |
| Medium confidence | "Based on 12 pieces of evidence across 6 dimensions, from 2 sources." |
| High confidence | "Based on diverse, recent evidence across 9 dimensions, including verified real work." |

Never: "Your WRI is 72." Always: "WRI 72 · provisional · 4 of 10 dimensions covered."

## 6. Talking about Levav Impact without disguising unpaid work

Every Impact surface must make the pathway unmistakable. Required, non-negotiable strings appear in `COPY_DICTIONARY.md` under `impact.*`. The rules:

- The word **unpaid** appears on every contribution opportunity that carries no stipend. Not in a footer — in the opportunity header.
- Never describe a contribution opportunity in employment vocabulary: no *salary*, *hire*, *role* (unqualified), *position*, *staff*, *probation*, *full-time*.
- Never imply that contributing improves hiring outcomes. It creates evidence like any other verified work — no more, no less (IMPACT-002).
- State expected hours and duration as a **limit**, never as a minimum with no ceiling.
- The contributor's exit is always visible: "You can withdraw from this placement at any time."

## 7. Talking about the Feed without turning popularity into readiness

- Never display a follower count, like count or post count next to a WRI, Role Fit or employer-facing surface.
- Never use the vocabulary of reach — *viral, trending, top creator, influence* — anywhere in the product.
- A verified badge on a post marks **the source item** as verified, never the opinion in the post (FEED-006). Approved string: "Verified QuickWork completion" — not "Verified post".
- Sponsored content, if introduced, is labelled "Sponsored" in the same type size as the author name.

## 8. AI-generated copy

Every AI-produced string a user sees is bound by this document. Additionally:

- AI output is labelled where a reasonable user could mistake it for a Levav determination: "Drafted by Levav AI — check before you confirm."
- An AI assistant never claims certainty about a person's capability.
- On AI failure the user gets a plain statement and a manual route, never a fabricated result (AI-007): "Levav could not generate this right now. You can write it yourself and continue."
- AI summaries of external news carry the publisher name and link. No source, no card.

## 9. Implementation contract for Codex (LANG-004)

1. All user-facing strings resolve through the copy module delivered in **WP-0004** — not inline in components.
2. Keys are namespaced by surface: `levav28.day.header`, `quickwork.assignment.empty`, `wri.confidence.provisional`.
3. String values live in one place per locale, `en-ZM` first, with the structure ready for additional African languages (AFR-008). No component may hold a fallback copy of a governed string.
4. New user-facing text in a Work Packet must either use a key from `COPY_DICTIONARY.md` or be listed as an open product decision in the implementation report. Codex does not invent product copy.
5. Copy changes to governed keys require Claude approval. Copy changes made "because it fitted the layout better" are defects.

## 10. Visual language

The visual direction from `CREATIVE_BRIEF.md` — premium and minimal, black-and-white foundation, controlled lime accent, strong typography, restrained motion — is **retained** and pairs with this voice. Two additions from product requirements:

- Verified and self-declared evidence must be **structurally** distinguishable, not distinguishable by colour alone (PROF-001 + AFR-010).
- Motion and decorative media are never load-bearing. Every surface must be complete and usable with images unloaded (AFR-002, FEED-007).
