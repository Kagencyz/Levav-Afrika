# Talent Development Model

**Status:** Product-strategy document defining the talent promise and how each target capability is meant to move from introduced to employer-legible.

## The talent promise

Levav must not merely help people apply for work. It must help them become the kind of people organisations want to hire, trust, develop, and retain.

**Become visible through growth, evidence, excellence, and meaningful contribution.**

## The repeated test

For every talent-facing experience, ask:

- Would this help the talent think better?
- Would it help them work better?
- Would it help them communicate better?
- Would it help them take responsibility?
- Would it help them solve problems?
- Would it help them build something meaningful?
- Would it help them contribute to the Africa we want to build?

An experience that cannot answer yes to at least one of these — honestly, not aspirationally — does not belong in Phase One. `backup-old-site`'s `DiscoveryJourney.tsx` is a useful cautionary example: it frames its self-assessment output as "AI-generated," but the underlying `calculateWRI()` is a deterministic average of self-rated sliders. The UX pattern (step-by-step reflection → generated summary) is worth keeping; the dishonest "AI" framing is not — see `ARCHIVED_IMPLEMENTATION_REVIEW.md`.

## The capability list, and what "not decorative" requires of each

The brief lists twenty target capabilities. Treating them as real product requirements (not values-statement decoration) means defining, for each, how it is introduced, developed, practised, observed, evidenced, scored, improved, and made meaningful to an employer. That's a lot of structure to hold per-capability in prose, so this document defines the **shared pipeline** once, then maps each capability against it.

**The eight-stage pipeline every capability must pass through:**

1. **Introduced** — where the talent first encounters the concept (a Levav 28 day, an onboarding module).
2. **Developed** — the learning content or guided practice that builds it.
3. **Practised** — a real task where the talent exercises the capability (a Levav 28 crucible response, a QuickWork shift, a volunteering assignment).
4. **Observed** — who or what sees the practice happen (self, peer, mentor, employer, an AI evaluator).
5. **Evidenced** — what artifact is captured as proof (a written reflection, a rated interaction, a delivered project, structured feedback).
6. **Scored** — how the evidence maps to a readiness signal (see `WRI_CONCEPTUAL_MODEL.md` — this is a WRI *dimension* input, never a standalone vanity number).
7. **Improved** — the feedback loop that shows the talent what to do next (what's uncertain, what raises the score, what to practise again).
8. **Made meaningful to an employer** — the specific, explainable statement a hiring manager sees ("responds constructively to feedback: evidenced by 3 peer-reviewed Levav 28 revisions" — not "soft skills: 78%").

### Capability-to-pipeline mapping (Phase One priority subset)

| Capability | Practice source (Phase One) | Evidence artifact | Employer-legible statement pattern |
|---|---|---|---|
| Critical thinking | Levav 28 CONFRONT/DISSECT tasks (archived profession-pack content is a strong reference — see below) | Written reflection, scored against rubric | "Diagnosed root cause in N of N scenario tasks without prompting" |
| Practical problem-solving | Levav 28 OWN/EXECUTE tasks, project submissions | Delivered artifact + self/peer review | "Completed N structured problem-solving tasks; N independently reviewed" |
| Responsibility / ownership | Accountability-scored reflection (see below), feedback response pattern | Reflection text, response-to-feedback log | "Demonstrated ownership language in N/N accountability reviews" |
| Integrity | Verification-gated evidence (no self-certified claim counted at full confidence — see `WRI_CONCEPTUAL_MODEL.md`) | Verified vs self-reported evidence ratio | Surfaced as evidence-confidence, not a standalone "integrity score" |
| Self-awareness | Structured reflection prompts, gap-identification tasks | Reflection text | Feeds "development areas" section, not a numeric score |
| Communication | Written submissions, structured interview feedback, peer review | Submission text, feedback record | "Clear, structured written communication across N evidenced submissions" |
| Collaboration | Peer-reviewed tasks, team-based QuickWork/volunteer assignments | Peer feedback | "Received positive collaboration feedback from N independent reviewers" |
| Emotional maturity | Response-to-feedback pattern (how they revise after critique) | Revision history | Folded into responsibility/reliability dimension |
| Learning agility | Course completion pace/consistency, revision quality over time | Learning platform events | Growth-trajectory chart, not a single number |
| Resilience | Consistency over time despite setbacks (missed day recovered, low score improved) | Longitudinal WRI/engagement data | "Recovered and completed N consecutive Levav 28 days after a gap" |
| Execution | Task completion rate, on-time delivery | Task/submission timestamps | "Completed N/N committed tasks on time" |
| Professional judgement | Scenario-based decision tasks (archived crucible content again relevant) | Decision + rationale text | Folded into critical thinking dimension with role-specific weighting |
| Adaptability | Cross-context task performance (different profession packs, changing requirements) | Task performance across contexts | Folded into learning agility |
| Leadership potential | Volunteering/mentoring/Champion-track contribution, peer endorsement | Endorsement + contribution record | Separate, explicitly labelled "potential" signal — never conflated with demonstrated leadership |
| Cultural intelligence | Cross-context collaboration evidence (volunteering, diverse-team QuickWork) | Peer/coordinator feedback | Folded into collaboration dimension |
| Creativity | Open-ended project submissions | Delivered artifact | Qualitative, employer-reviewable artifact link, not a numeric score |
| Discipline / consistency | Levav 28 streak, learning-completion regularity | Activity log | Growth-trajectory chart component |
| Contribution beyond personal income | Verified volunteering, development-organisation-attested contribution | Verified hours/outcomes | Distinct "contribution" evidence category, feeds Impact-adjacent recognition, not folded silently into employability score |

Capabilities not in this Phase One subset (adaptability/cultural intelligence noted as folded above) are not dropped — they're intentionally represented as *inputs into* the readiness dimensions in `WRI_CONCEPTUAL_MODEL.md` rather than as twenty separate standalone scores, because twenty parallel undifferentiated numbers is exactly the "generic score" failure mode the brief explicitly warns against. This same list is also the **shared Levav foundation** referenced below — the capabilities every profession's journey develops in common, distinct from what's profession-specific.

## Personalised profiling and onboarding

Onboarding is not registration — it is the first data-gathering step in a long-term developmental relationship, and its output actively shapes every downstream experience, not just a profile page. At minimum, onboarding establishes: profession or intended profession, professional specialisation, education level, experience level, current employment status, career stage, strengths, development gaps, aspirations, learning preferences, work preferences, confidence areas, interests, and near-term professional goals.

This is captured, not asserted — it feeds the same evidence-confidence discipline as everything else in `WRI_CONCEPTUAL_MODEL.md`: onboarding answers are self-reported inputs that *shape what happens next* (content selection, scenario difficulty, recommendations), but they do not themselves move a readiness signal. Selecting "accountant" at onboarding personalises the journey; it does not make someone readier than selecting "teacher" would.

**What personalisation actually changes, concretely:** Levav 28 content and scenario selection, daily challenges, critical-thinking exercises, professional scenarios, learning recommendations, interview preparation content, evidence-opportunity suggestions (which QuickWork/volunteering/projects get surfaced), and the pacing of readiness development. An accountant and a nurse must not receive the same journey — different profession packs (below), different scenario emphasis, different evidence opportunities.

**Profession is not permanent.** A person's selected profession/specialisation is a current-best-guess input, refinable and changeable at any time — the journey re-personalises when it changes, and prior evidence/progress under the old profession selection is retained (evidence doesn't become invalid because someone changed direction; it's still real evidence of the capabilities it demonstrated, just re-weighted against the new context). This has a direct data-model consequence: profession/specialisation is a versioned or timestamped attribute of the person, not a fixed enum written once at signup.

**Personalisation evolves, and must get more specific over time, not stay fixed at the onboarding snapshot.** As Levav 28 responses, evidence, and progress accumulate, the AI layer (see below) uses the accumulating profile — not just the onboarding form — to select the next experience. Onboarding sets the starting point; it is not the sole input forever.

## Profession-specific competency frameworks

Each profession Levav supports needs its own structured framework, not just a differently-labelled copy of the shared foundation:

- A **competency framework** specific to that profession (what "capable" looks like in that field, beyond the shared foundation).
- **Profession-specific scenarios** — the CONFRONT/DISSECT/OWN/EXECUTE-style content already proven valuable in the archived profession packs (below).
- **Ethical situations** specific to that profession's real dilemmas (a nurse's confidentiality dilemma is not an accountant's conflict-of-interest dilemma).
- **Practical challenges** grounded in that profession's actual day-to-day work.
- **Expected evidence** — what a credible demonstration of capability looks like *in this profession specifically* (a delivered lesson plan for a teacher, a reconciled ledger for an accountant, a working feature for a software engineer).
- **Assessment rubrics** scoped to the profession's expected evidence.
- **Difficulty levels**, so the same profession's content can serve someone early-career and someone more advanced without collapsing into one fixed difficulty.
- **Workplace communication situations** specific to that profession's real stakeholders (a nurse communicating with a patient's family; a project manager communicating a slipped deadline to a client).
- **AI-readiness content** — how this profession is being reshaped by AI tools, and what capability that demands of someone entering or advancing in it.
- **Relevant development milestones** — profession-specific markers of progress, distinct from the shared foundation's general growth trajectory.

**Shared Levav foundation, present in every profession's journey regardless of specifics:** critical thinking, problem-solving, integrity, responsibility, communication, collaboration, adaptability, resilience, learning agility, professional judgement, discipline, consistency, execution, and contribution — this is the same list as the Phase One capability set above; profession-specific frameworks are additive on top of it, never a replacement for it. Every profession's scenarios exercise these shared capabilities *through* profession-specific content, which is exactly why the archived profession packs' CONFRONT/DISSECT/OWN/EXECUTE structure (below) generalises well: the phase structure develops the shared foundation, the scenario content makes it profession-relevant.

## The AI layer's governance boundary — AI observes, Levav scores

This is a hard architectural rule, not a preference: **AI must never directly award a WRI score or readiness signal.** The AI layer's role is bounded to:

- Generating relevant, personalised scenarios (profession-, level-, and progress-appropriate).
- Analysing responses.
- Identifying strengths and gaps.
- Producing structured observations.
- Recommending development actions.
- Suggesting relevant evidence opportunities.

**Levav's own rules, rubrics, evidence model, and scoring engine — not the AI — determine how those observations influence readiness.** Concretely: an AI evaluator's output is itself a piece of evidence with its own confidence tag (`WRI_CONCEPTUAL_MODEL.md`'s evidence-confidence model applies to AI-generated observations exactly as it applies to a human mentor's feedback — an AI observation is not automatically higher- or lower-confidence than a human one; it's tagged and weighted by the same rubric-driven scoring engine, not by the AI itself deciding its own weight). This is the same non-negotiable boundary `backup-old-site`'s `ai-evaluation.ts` already models correctly (a real, rubric-driven local scoring pass, with AI as an optional *enhancement* layered on top — not the sole or final arbiter) and the direct fix for `DiscoveryJourney.tsx`'s mistake (an "AI-generated" score that was actually just a slider average dressed up as intelligence) — see `ARCHIVED_IMPLEMENTATION_REVIEW.md`.

**Every personalised AI interaction must be able to answer, for the person experiencing it:**

1. Why is this relevant to this individual?
2. What capability is being developed or observed?
3. What evidence can result from it?
4. How will the individual know how to improve?
5. How does it prepare them to contribute meaningfully in their field?

An AI-generated scenario or piece of feedback that can't answer these five doesn't ship — this is the same discipline as the primary product principle in `PRODUCT_VISION_AND_HEART.md`, applied specifically to the AI layer.

## Reusable content asset: the archived Levav 28 profession packs

`backup-old-site`'s `src/lib/crucible-data.ts` + `crucible-packs.ts` contain 224 real, well-written, profession-specific scenarios (8 professions × 7 days × 4 phases: CONFRONT/DISSECT/OWN/EXECUTE) — genuine instructional-design content, not filler. This is the single highest-value non-code asset found in either codebase and should be treated as a starting content library for the Development layer, subject to review for the current profession set and any needed expansion. See `ARCHIVED_IMPLEMENTATION_REVIEW.md` for detail.

## Reusable pattern: accountability-scored reflection

`backup-old-site`'s `api/services/ai-evaluation.ts` implements real (non-LLM-dependent) regex-pattern accountability scoring — negative/deflection language vs positive/ownership language, pronoun-ratio analysis, with an optional LLM-blended enhancement. This is a legitimate, inexpensive, honest way to score "responsibility/ownership" from free-text reflection without requiring an LLM budget, and is worth adapting rather than reinventing. See `ARCHIVED_IMPLEMENTATION_REVIEW.md` and `WRI_CONCEPTUAL_MODEL.md`.

## What this rules out for Phase One

Registration and profile-field completion must never, on their own, move a readiness signal. Onboarding's profile answers (profession, aspirations, preferences, etc.) personalise content selection but never themselves move a readiness signal, per the same rule. Self-reported claims must be visibly distinguished from evidenced ones everywhere they're displayed, not just in a tooltip. Any capability without a real Phase One practice source (interview simulation without a real interviewer/evaluator, for instance) should show as "Coming Soon" rather than be faked with static content dressed as personalisation — the `JobMatchingPage.tsx` mistake, again. **No AI-generated observation may write directly to a WRI score or dimension** — it goes through the same rubric/evidence pipeline as every other evidence source, full stop; an AI layer that's allowed to shortcut the scoring engine "just this once for speed" is the fastest way back to an unearned score.
