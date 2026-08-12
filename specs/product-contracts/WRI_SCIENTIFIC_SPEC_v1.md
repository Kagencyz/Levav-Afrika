# Workforce Readiness Index — Scientific Specification v1

**Owner:** Claude (Product Command). Codex implements against this; Codex does not edit it.
**Requirements:** WRI-001 … WRI-005, WRI-GOV-001, EMP-TAL-001 … 003, EVD-003, AFR-009, SEC-011, §12, §48, §49
**Status:** APPROVED for Sprint 3 implementation. Coefficients and scale are **provisional and escalated** — see §9.
**Depends on:** `EVIDENCE_GRAPH_CONTRACT_v1.md`. WRI holds no facts of its own.

---

## 1. What WRI is

A **versioned interpretation** of a person's evidence, expressed as demonstrated readiness across ten defined constructs, always accompanied by how much the underlying evidence supports it.

It is not a personality score, an intelligence score, a social score, or a prediction of employment success. It is not a number that means anything on its own — which is why §5 makes a bare score structurally unavailable.

**The governing constraint:** every WRI value must be explainable back to specific evidence nodes, and every historical value must remain what it was when it was computed.

## 2. The ten dimensions

Operational definitions. Each states what the construct *is*, what it is **not** (the confound it is most often mistaken for), and what observable behaviour indicates it. The "not" column matters more than the definition — most measurement failure is construct contamination, not bad scoring.

### D1 · Critical thinking
Analyses information, tests assumptions, evaluates alternatives, reaches reasoned conclusions.
**Not:** intelligence, education level, or verbal fluency. A person who writes elegantly but never questions a premise scores low here.
**Indicators:** identifies a flawed assumption in a brief; distinguishes evidence from inference; changes position when given disconfirming information; states what would change their mind.

### D2 · Problem solving
Defines problems, identifies causes, develops options, implements, evaluates results.
**Not:** critical thinking. D1 is about judging information; D2 is about moving from a broken state to a working one. A person may reason well and never resolve anything.
**Indicators:** separates symptom from cause; generates more than one viable option; chooses with stated trade-offs; checks whether the fix worked.

### D3 · Initiative and ownership
Identifies useful work, acts appropriately, accepts responsibility, follows through.
**Not:** volume of activity, availability, or eagerness. Doing more is not initiative; doing the *needed* thing unprompted is.
**Indicators:** raises a problem before being asked; acts within authority without waiting; names their own error without deflection; closes a loop nobody was tracking.

### D4 · Reliability and execution
Fulfils commitments, manages deadlines, communicates delays, delivers.
**Not:** speed, or availability. The strongest signal is the *communicated* delay, not the absence of delay.
**Indicators:** delivers what was agreed; flags slippage early with a revised commitment; consistent across repeated engagements. **Primarily evidenced by observations, not evaluations** — this is the dimension where factual records (submission times, completion, rework) carry the most weight.

### D5 · Communication
Listens, asks useful questions, communicates clearly in relevant professional contexts.
**Not:** English proficiency, accent, formality, or confidence of tone. **This is the highest fairness-risk dimension in the model** — see §8.3.
**Indicators:** asks the question that resolves ambiguity rather than the obvious one; adapts register to audience; conveys a decision and its reason without the reader needing a follow-up.

### D6 · Collaboration and teamwork
Coordinates with others, manages disagreement, supports group outcomes.
**Not:** agreeableness or likeability. Sustained disagreement handled well is stronger evidence than frictionless compliance.
**Indicators:** incorporates a colleague's constraint; disagrees without escalating; shares information that helps someone else's work.

### D7 · Adaptability and learning agility
Responds to change, feedback and unfamiliar situations; improves over time.
**Not:** compliance, or tolerance for chaos. **Uniquely, this dimension requires longitudinal evidence** — a single observation cannot demonstrate improvement.
**Indicators:** applies feedback in a later task; adjusts approach when scope changes; performance on unfamiliar task types relative to familiar ones.

### D8 · Professional discipline
Preparation, time management, documentation, quality control, conduct.
**Not:** perfectionism or rule-following. Checking your own work is discipline; being unable to ship is not.
**Indicators:** work arrives checked; records decisions so others can follow; handles confidential material appropriately; prepares before a meeting.

### D9 · Leadership readiness
Decision judgement, delegation, accountability, conflict handling, development of others, **at an appropriate level**.
**Not:** seniority, title, or extraversion. A graduate can demonstrate this; an executive can fail to.
**Indicators:** decides with incomplete information and states the basis; delegates with context rather than instructions; takes accountability for a team outcome; develops someone else's capability.
**Scoring note:** always evaluated relative to the person's context. A senior leader and a graduate are not on one absolute scale.

### D10 · Contribution and service orientation
Creates verified value through contribution, support, service or mentorship beyond narrow self-interest.
**Not:** participation in Levav Impact (IMPACT-002), volunteering hours, or generosity as a personality trait. **Participation never evidences this dimension. Verified outputs of contribution can.**
**Indicators:** verified outputs delivered in a service context; mentorship with a confirmed outcome; help given that a counterparty confirms mattered.

## 3. Behaviourally anchored rating scales

WRI-005: anchors describe **observable behaviour**, never vague adjectives. "Good communication" is not an anchor. "Asked the question that resolved the ambiguity before starting work" is.

Five levels, one meaning across all dimensions:

| Level | Meaning |
|---|---|
| 1 | Behaviour absent where the situation clearly called for it |
| 2 | Attempted, but incomplete or misapplied |
| 3 | Competent for the role and level — the expected standard |
| 4 | Consistently strong; handles complications the situation introduced |
| 5 | Demonstrates the behaviour in a way that improved the outcome beyond what was asked |

**Level 3 is the standard, not the midpoint of a bell curve.** Most competent professionals should land at 3. A model that produces a normal distribution centred on 3 out of habit is miscalibrated.

### 3.1 Worked example — D4 Reliability and execution

| Level | Anchor |
|---|---|
| 1 | Missed the agreed deadline without notice; delivered nothing, or something unrelated to the brief |
| 2 | Delivered late, or delivered on time but incomplete against the stated scope. Any notice came after the deadline had passed |
| 3 | Delivered what was agreed, by when it was agreed. Where slippage occurred, raised it before the deadline with a revised commitment that then held |
| 4 | Delivered as agreed while absorbing a change in scope, a missing input, or a competing priority, and said which trade-off they made |
| 5 | Delivered as agreed and surfaced a downstream risk the requester had not identified, in time for it to be acted on |

**Authoring requirement:** the remaining nine dimensions must be anchored to this pattern in `specs/rubrics/`, versioned, **before any Levav 28 evidence-producing task ships** (Sprint 4). Anchors are internal (SEC-011) — never exposed to employers or users.

## 4. Evidence to dimension

The Evidence Graph declares `eligible_dimensions` as a **ceiling** (contract §5). The WRI model decides actual contribution within it, subject to:

1. **Never exceed the ceiling.** A node declaring D5 only can never move D9.
2. **Level weighting.** E3 and E4 carry more than E2; E2 more than E1; E0 carries the least and can never, alone, lift a dimension above provisional confidence.
3. **Observations and evaluations are weighted separately** (Evidence Graph §4). A factual record and a judgement are not interchangeable.
4. **Independence matters more than volume.** Five observations from one client are weaker than three from three clients.
5. **Recency is a decay, not a cliff.** Older evidence keeps contributing at reduced weight; it never expires into nothing.
6. **Disputed and quarantined evidence is excluded** while in that state, and its exclusion is visible in the explanation.
7. **D7 requires at least two time-separated observations.** A single attempt cannot evidence improvement.

## 5. Required outputs — always together

WRI-001 and WRI-003. These six are produced and displayed as one unit. **A bare score is not a valid output of this system**, and the API must make it awkward to obtain one.

| Output | Meaning |
|---|---|
| **Overall estimate** | Aggregate across dimensions. The least informative number in the set |
| **Dimension profile** | Per-dimension estimate with its own confidence |
| **Evidence confidence** | How much the evidence supports the estimate. Separate value, separate computation |
| **Evidence coverage** | Which dimensions and evidence levels are represented, and which are absent |
| **Readiness trajectory** | Direction over time, only where longitudinal evidence exists |
| **Role Readiness** | Present only where a target role exists (EMP-TAL-002) |

**Role Fit is not a WRI output.** It is a separate computation using role requirements and Workforce Graph context (WRI-002), and the two must never be merged on one screen or in one field.

## 6. Confidence

Confidence answers *how much should you trust this estimate*, and is computed independently of the estimate itself.

**Inputs:** observation count · evidence diversity across types · number of independent actors · E3/E4 coverage · recency distribution · duration of the observed work · agreement across contexts · measurement reliability of the instruments used.

Two properties the implementation must satisfy, both testable:

1. **Confidence can rise while the estimate falls.** Stronger evidence revealing a weakness is a *better* measurement. A system where the two move together is measuring one thing twice.
2. **Confidence is bounded by the weakest input, not the average.** Twenty observations from a single client do not produce high confidence.

**A high estimate on thin evidence and a high estimate on diverse recent evidence must be visually and structurally distinguishable** (WRI-003). Approved copy is in `COPY_DICTIONARY.md` §3.

## 7. Snapshots

WRI-004. Every computation writes an immutable snapshot recording: model version, coefficient set version, rubric versions, evidence window, contributing evidence node ids, all six outputs, timestamp.

- **Historical snapshots never mutate.** A model change produces new snapshots going forward; it does not rewrite the past (§48).
- **Recomputation is queued through the event pipeline**, never inline in a request (Evidence Graph §8).
- Every snapshot is explainable: which nodes contributed, at what weight, under which rubric version.
- Role-specific weighting lives in Role Readiness, never as a hidden change to historical WRI.

## 8. Validation programme

§12.3. WRI is a measurement system under development, and must be treated as one.

### 8.1 Required questions
Content validity · construct validity · criterion validity · test-retest reliability · inter-rater reliability · scenario equivalence · fairness · calibration.

### 8.2 Sequencing
Content and construct validity are answerable at Sprint 4 with scenario review. Inter-rater reliability becomes answerable once human and AI ratings coexist. **Criterion validity and calibration require E4 outcomes and cannot be honestly claimed before Sprint 7.**

Until criterion validity exists, no Levav surface, document or sales material may state or imply that WRI predicts job performance. That is an unsupported claim under LANG §2.3 and prohibited under §48.

### 8.3 Fairness
Analysed at every model release (WRI-GOV-001). Specific risks in Levav's context, which generic fairness testing will miss:

- **D5 Communication** is the highest risk. English proficiency, accent, dialect and formality are not communication competence. A rubric or model that rewards native-like English is measuring the wrong construct, and would systematically disadvantage exactly the workforce Levav exists to serve.
- **AFR-009 is a fairness requirement, not an infrastructure note.** Device quality, network instability, load shedding and data cost must never register as low reliability or low discipline. Any signal derived from timing, session continuity or responsiveness must be tested for correlation with connection quality before it may inform D4 or D8.
- **Access to prior opportunity** correlates with evidence volume. Someone with fewer chances to demonstrate readiness has less evidence — which is a *coverage* fact, not a readiness fact, and must express itself as low confidence rather than a low estimate.
- Protected characteristics are excluded from employment ranking (§48). They may be used **only** in aggregate fairness analysis, never as model inputs.

### 8.4 Absence of evidence
**No evidence is never a low score.** An unmeasured dimension renders as not measured. See **PDR-0012**.

## 9. Governance and what stays escalated

WRI-GOV-001: construct definitions documented, major scoring changes versioned, historical cohort tests before release, fairness analysis in every release review, and a user dispute route for evidence that materially affects readiness conclusions.

**Escalated to human decision (§49) — neither agent may set these as permanent policy:**

| Decision | Note |
|---|---|
| Final WRI scale | Recommended 0–100 for readability, with the caveat that a 0–100 scale invites false precision. A banded presentation over a continuous internal value is the safer product form |
| Final evidence weights per level | Sprint 3 ships configurable and labelled provisional |
| Confidence thresholds for provisional / medium / high | As above |
| Recency decay rate | As above |
| Scientific validation thresholds for release | Needs the governance group in §12.4 |

Sprint 3 implements every one of these as a **versioned, configurable parameter with a clearly-labelled provisional default**. Hard-coding any of them as truth is prohibited (WRI-004, §48).

## 10. Prohibited

1. Any client computing, awarding or persisting a WRI value (PDR-0001).
2. A bare score without confidence and coverage.
3. Merging WRI and Role Fit.
4. Mutating a historical snapshot.
5. Social activity, participation, enrolment or profile completeness influencing any dimension.
6. Exposing rubrics, anchors or internal weights to employers or users (SEC-011).
7. Recommending automatic rejection on WRI alone (EMP-006).
8. Claiming predictive validity before criterion validity exists.
9. Penalising a person solely on an AI-authorship detector (§48).
10. Treating a device or network limitation as a readiness signal (AFR-009).

## 11. Sprint 3 deliverables

Dimension definitions as versioned reference data · configurable coefficient sets, versioned, defaults labelled provisional · confidence computed independently of the estimate · coverage · trajectory where longitudinal evidence exists · Role Readiness separated from WRI · immutable snapshots with full explainability · queued recomputation via the event pipeline · the `wri.confidence.*` copy from the dictionary.

**Tests:** deterministic snapshots from fixed evidence · confidence rising while estimate falls · a dimension staying *not measured* with no evidence · eligible-dimension ceiling never exceeded · disputed evidence excluded and its exclusion explained · historical snapshots unchanged after a model version bump · no client-writable path.

**Exit gate (§46):** given controlled test evidence, the system produces deterministic versioned snapshots and separate confidence values, with traceable contributions and tests.
