# Behaviourally Anchored Rating Scales v1

**Owner:** Claude (Product Command). Codex implements against this; Codex does not edit it.
**Requirements:** WRI-005, WRI-GOV-001, EVD-004, AI-002, AI-008, SEC-011, AFR-009
**Governing spec:** `specs/product-contracts/WRI_SCIENTIFIC_SPEC_v1.md`. Construct definitions live there; this document is how those constructs are rated.
**Status:** APPROVED. Required before any Levav 28 evidence-producing task ships (Sprint 4).

**⚠ INTERNAL. Never exposed to employers, users or any client response (SEC-011).** Anchors are the scoring key. A person who can read them can perform to them, which destroys the measurement.

---

## 1. Version keys

Each dimension is versioned independently. An evaluation node records the specific key it was rated under in `instrument_version` (Evidence Graph contract §3).

| Dimension | Version key |
|---|---|
| D1 Critical thinking | `bars.d1.v1` |
| D2 Problem solving | `bars.d2.v1` |
| D3 Initiative and ownership | `bars.d3.v1` |
| D4 Reliability and execution | `bars.d4.v1` |
| D5 Communication | `bars.d5.v1` |
| D6 Collaboration and teamwork | `bars.d6.v1` |
| D7 Adaptability and learning agility | `bars.d7.v1` |
| D8 Professional discipline | `bars.d8.v1` |
| D9 Leadership readiness | `bars.d9.v1` |
| D10 Contribution and service orientation | `bars.d10.v1` |

Superseding a dimension bumps only its key. Historical evaluations keep the key they were rated under, forever.

## 2. The scale

| Level | Meaning |
|---|---|
| 1 | Behaviour absent where the situation clearly called for it |
| 2 | Attempted, but incomplete or misapplied |
| 3 | **Competent for the role and level — the expected standard** |
| 4 | Consistently strong; handled complications the situation introduced |
| 5 | Demonstrated the behaviour in a way that improved the outcome beyond what was asked |

**Level 3 is the standard, not the midpoint.** Most competent professionals land at 3. A rater or model producing a bell curve centred on 3 out of habit is miscalibrated, and a distribution check is part of release review (WRI-GOV-001).

## 3. The rule that matters most: not exercised

> **A rater must be able to decline. If the task did not put the person in a position to demonstrate the behaviour, the dimension is `not_exercised` — never a low rating.**

This is not a convenience. A rating form that forces a value on every dimension manufactures data, and manufactured data is worse than missing data because it looks the same as the real thing downstream.

`not_exercised` produces **no evidence for that dimension**. It is not a zero, it does not lower an estimate, and it does not enter the confidence calculation. It is the rating-level expression of PDR-0012.

Corollary for scenario design: a scenario declaring five eligible dimensions must actually create situations for all five. If raters routinely return `not_exercised` for one of them, the scenario is miswritten, not the person underperforming.

## 4. Rating protocol

**Rate what you observed, not what you infer about the person.** The unit is the work in front of you. "They seem disorganised" is not an observation; "the submission contained three unresolved placeholders" is.

1. Read the anchors before looking at the work. Deciding a level and then finding an anchor to justify it is the most common rating failure.
2. Locate the level whose anchor the observed behaviour actually matches. Do not average across anchors.
3. If the behaviour sits between two anchors, take the **lower** one. The higher anchor describes something that did not happen.
4. Record the specific behaviour that placed it there. An evaluation without a cited behaviour is not reviewable, and inter-rater reliability cannot be measured on unreviewable ratings.
5. If unsure between `not_exercised` and level 1, choose `not_exercised`. Absent opportunity and absent behaviour are different facts.

### 4.1 Additional constraints on AI raters

- Structured output only, validated against this scale (AI-002). Prose verdicts are not ratings.
- Return a confidence value with every rating. Below the configured threshold, route to human review rather than recording a low-confidence rating as fact (WRI-005).
- The model never sees the subject's identity, demographics, photograph, name, or prior WRI. It sees the work and the scenario context.
- The model may not rate a dimension the scenario did not declare eligible (Evidence Graph contract §5).
- Suspected undisclosed AI authorship is a **risk signal only** and never a rating penalty (AI-008, §48).
- Prompt and model versions are recorded alongside the rubric key (AI-003).

### 4.2 Fairness instructions — binding on every rater, human or model

- **Rate the construct, not the fluency.** Non-standard English, a second-language register, spelling errors, or unfamiliar idiom are not evidence about any dimension. This applies hardest to D5, where the confound and the construct look alike.
- **Never treat a technical condition as a behaviour.** A dropped connection, a late submission caused by an outage, a truncated upload, or load shedding is not unreliability or indiscipline (AFR-009). Where the record cannot distinguish a technical failure from a behavioural one, it is `not_exercised`.
- **Do not read length as effort or brevity as carelessness.** A short, complete answer is often the stronger one.
- **Rate relative to the declared role and level**, particularly D9. A graduate and a director are not on one absolute scale.
- **Do not carry impressions between dimensions.** A strong D2 is not evidence for D8. Halo effect is the second most common rating failure after anchor-shopping.

---

## D1 · Critical thinking `bars.d1.v1`

*Analyses information, tests assumptions, evaluates alternatives, reaches reasoned conclusions. **Not** intelligence, education or verbal fluency.*

| Level | Anchor |
|---|---|
| 1 | Accepted the brief's premises without examination. Conclusions do not follow from the information provided, or restate the brief as though it were analysis |
| 2 | Noticed that something did not fit but did not pursue it, or raised a doubt and then proceeded as though it had been resolved. Considered a single interpretation only |
| 3 | Identified the assumption the task turned on, tested it against the information available, and reached a conclusion that follows from that information. Distinguished what was given from what was inferred |
| 4 | Identified a flawed, missing or conflicting premise that the brief did not flag, and adjusted the approach accordingly. Weighed at least two readings of the evidence and said why one was better supported |
| 5 | Established that the stated question was the wrong one and reframed it, showing the reasoning. Named the specific evidence that would overturn their own conclusion |

## D2 · Problem solving `bars.d2.v1`

*Defines problems, identifies causes, develops options, implements, evaluates results. **Not** critical thinking — this is about moving from a broken state to a working one.*

| Level | Anchor |
|---|---|
| 1 | Restated the problem without advancing it, or acted on the presenting symptom with no attempt to find the cause |
| 2 | Identified a plausible cause and proposed one course of action with no alternative considered, or generated options and did not choose between them |
| 3 | Separated symptom from cause, produced more than one viable option, chose with the trade-off stated, and defined what a resolved state would look like |
| 4 | Reached a workable solution despite a constraint that ruled out the obvious approach, and sequenced the work so the most uncertain part was tested first |
| 5 | Resolved the immediate problem and removed or reduced the condition that produced it, or made the same failure detectable earlier next time |

## D3 · Initiative and ownership `bars.d3.v1`

*Identifies useful work, acts appropriately, accepts responsibility, follows through. **Not** volume of activity or eagerness.*

| Level | Anchor |
|---|---|
| 1 | Waited for instruction where the need was evident and within their remit. When something went wrong, located the cause outside themselves |
| 2 | Acted, but outside their authority without flagging it, or raised a problem with no proposal attached. Followed through only while being observed |
| 3 | Identified work that needed doing and did it within their authority. Escalated what exceeded that authority, with a recommendation. Named their own error without being asked |
| 4 | Acted on something nobody had noticed, or closed a loop that was not formally theirs, without creating disruption elsewhere. Corrected their own mistake before it reached anyone else |
| 5 | Changed how the work is done so the problem does not recur, and handed it over in a state where it survives their absence |

## D4 · Reliability and execution `bars.d4.v1`

*Fulfils commitments, manages deadlines, communicates delays, delivers. **Not** speed. The strongest signal is the communicated delay, not the absence of delay.*
*Primarily evidenced by observations rather than evaluations — factual records carry the most weight here.*

| Level | Anchor |
|---|---|
| 1 | Missed the agreed deadline without notice. Delivered nothing, or something unrelated to the brief |
| 2 | Delivered late, or delivered on time but incomplete against the stated scope. Any notice came after the deadline had passed |
| 3 | Delivered what was agreed, by when it was agreed. Where slippage occurred, raised it before the deadline with a revised commitment that then held |
| 4 | Delivered as agreed while absorbing a scope change, a missing input, or a competing priority, and stated which trade-off they made |
| 5 | Delivered as agreed and surfaced a downstream risk the requester had not identified, in time for it to be acted on |

## D5 · Communication `bars.d5.v1`

*Listens, asks useful questions, communicates clearly in relevant professional contexts. **Not** English proficiency, accent, formality or confidence of tone.*

**Highest fairness risk in the model. Read §4.2 before rating this dimension.** Rate whether the reader can act, not whether the prose is elegant.

| Level | Anchor |
|---|---|
| 1 | The reader cannot act on the message. Essential information is absent, or the ambiguity that prompted the exchange is left unresolved |
| 2 | The information is present but the reader must reconstruct it, or must ask a follow-up to act. Asked a question the brief had already answered |
| 3 | Conveyed the decision or request and the reason for it, so the reader could act without a follow-up. Where ambiguity existed, asked the question that actually resolved it |
| 4 | Adapted the level of detail and register to a different audience without losing accuracy, and led with the thing that reader most needed |
| 5 | Made a genuinely complex or contested situation decidable for someone without prior context, in the form that reader could use |

## D6 · Collaboration and teamwork `bars.d6.v1`

*Coordinates with others, manages disagreement, supports group outcomes. **Not** agreeableness — sustained disagreement handled well is stronger evidence than frictionless compliance.*

| Level | Anchor |
|---|---|
| 1 | Proceeded without regard to a dependency they knew another person had, or escalated a disagreement without attempting to resolve it directly |
| 2 | Acknowledged another's input without incorporating it or explaining why not, or conceded a substantive point purely to end the friction |
| 3 | Incorporated a colleague's constraint into their own work. Disagreed where they disagreed and reached a position both could work with. Passed on information others needed without being asked |
| 4 | Held a sustained disagreement to a productive conclusion without damaging the working relationship or the outcome |
| 5 | Produced a group outcome better than any individual position on the table, and made others' contributions visible rather than absorbing the credit |

## D7 · Adaptability and learning agility `bars.d7.v1`

*Responds to change, feedback and unfamiliar situations; improves over time. **Not** compliance or tolerance for chaos.*

**Requires at least two time-separated observations** (WRI spec §4, rule 7). A single attempt cannot evidence improvement — rate `not_exercised` if only one exists.

| Level | Anchor |
|---|---|
| 1 | Repeated an approach that had already failed, with no change. Specific feedback is not reflected anywhere in later work |
| 2 | Acknowledged feedback without changing behaviour, or changed something adjacent to what the feedback addressed |
| 3 | Applied specific feedback in a later task in a way that is visible in the work. Adjusted approach when the scope or information changed |
| 4 | Performance on an unfamiliar task type approached their performance on familiar ones. Sought the information or help needed rather than waiting or guessing |
| 5 | Generalised a lesson from one context to a materially different one, or anticipated a change and had adapted before it was required |

## D8 · Professional discipline `bars.d8.v1`

*Preparation, time management, documentation, quality control, conduct. **Not** perfectionism — checking your work is discipline; being unable to ship is not.*

| Level | Anchor |
|---|---|
| 1 | Work arrived unchecked, containing errors a single read-through would have caught. Commitments were not tracked. Confidential material handled carelessly |
| 2 | Checked inconsistently. Documentation exists but another person could not follow it. Arrived at a discussion without the preparation it assumed |
| 3 | Work was checked before it was submitted. Decisions were recorded so someone else could pick them up. Came prepared. Handled confidential material appropriately |
| 4 | Held that standard under time pressure or volume, and caught their own error before it left their hands |
| 5 | Improved the process or the record-keeping so that quality no longer depends on their personal attention |

## D9 · Leadership readiness `bars.d9.v1`

*Decision judgement, delegation, accountability, conflict handling, developing others. **Not** seniority, title or extraversion.*

**Always rated relative to the person's declared role and level.** A graduate demonstrating this is not compared to a director.

| Level | Anchor |
|---|---|
| 1 | Avoided a decision that was theirs to make. Delegated a task without the context needed to do it. Attributed a team outcome to the team rather than to their own accountability |
| 2 | Decided without stating a basis anyone could evaluate. Handed over tasks but not the authority to complete them. Addressed conflict by removing it from view |
| 3 | Made the decision with incomplete information and stated the basis for it. Delegated with context and an agreed check-in. Took accountability for the outcome. Addressed disagreement directly with the person involved |
| 4 | Developed someone else's capability rather than absorbing the work. Made a decision they knew would be unpopular and explained it to the people it affected |
| 5 | Built capability or a standard in others that persisted beyond their own involvement in the work |

## D10 · Contribution and service orientation `bars.d10.v1`

*Creates verified value through contribution, support, service or mentorship. **Not** participation in Levav Impact, hours served, or generosity as a trait.*

**Participation never evidences this dimension (IMPACT-002).** Only verified outputs and confirmed outcomes of contribution do. If the record shows attendance or hours without an output, rate `not_exercised`.

| Level | Anchor |
|---|---|
| 1 | No output resulted from the contribution context. Assistance was offered only where an immediate reciprocal benefit existed |
| 2 | Effort was expended without a confirmed output, or mentorship was offered with no observable effect on the other person's work |
| 3 | Delivered outputs in a service or support context that the receiving party confirmed were useful to them |
| 4 | Sustained contribution across time with confirmed outcomes, and adapted what they gave to what was actually needed rather than what was easy to give |
| 5 | Built capability in a person or an organisation that continued to function after their contribution ended |

---

## 5. Review and governance

Before any dimension is used to produce evidence at scale (WRI-GOV-001):

1. **Inter-rater reliability** — qualified raters reach comparable levels from the same work. Below the agreed threshold, the anchors are ambiguous and must be revised before use.
2. **Distribution check** — a level-3-heavy distribution is expected; a normal curve centred on 3 across every dimension indicates raters are anchor-shopping rather than observing.
3. **Fairness review** — level distributions examined across language background, connection quality and prior-opportunity proxies. Systematic differences require a job-relatedness justification or a rubric revision.
4. **`not_exercised` rate per scenario** — a persistently high rate means the scenario does not create the situation it claims to. Fix the scenario.

Revisions supersede a dimension's version key. Historical evaluations are never re-rated under a new key (WRI-004).
