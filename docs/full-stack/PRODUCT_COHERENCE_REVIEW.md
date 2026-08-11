# Product Coherence Review

**Status:** Product-strategy document answering the twenty coherence questions posed for this phase, grounded in the audit findings elsewhere in this folder.

**1. What is the primary Levav product?**
A workforce-readiness intelligence platform that develops African talent and gives organisations evidence-backed hiring confidence — not a job board, not a course platform, not an ATS, though it contains elements adjacent to all three. The product *is* the connection between real development (Layer 2), real evidence (Layer 3), and real matching (Layer 5) — none of the three alone is the product.

**2. What is the first meaningful value a talent receives?**
Not a job match (there's nothing to match against yet for a new user) and not a registration confirmation. It's the first Levav 28 day or onboarding reflection producing a real, specific, evidence-backed statement about themselves they didn't have language for before — the "personal discovery" stage in `USER_JOURNEY_MAPS.md`. This must be genuinely useful standalone, independent of ever getting a job through the platform, or the value proposition collapses the moment matching doesn't immediately produce a hire.

**3. What is the first meaningful value an employer receives?**
A shortlist explained in terms the employer actually asked for (their own Talent DNA criteria), for less effort than posting to a WhatsApp group — not a large applicant pool. Per `HR_VALUE_PROPOSITION.md`, volume is not the value; explainable relevance is.

**4. What makes a user return daily?**
For talent: an open development loop (a Levav 28 day, a reflection, a course module) that doesn't require an active job search to be worth opening — see `PRODUCT_VISION_AND_HEART.md`'s daily-return test. For employers: a live pipeline (new evidence on a shortlisted candidate, a new WRI-qualified applicant) — this only works once Slices 10–11 are real, so daily employer return is a mid-roadmap payoff, not a Phase One day-one feature.

**5. What data becomes more valuable over time?**
Evidence history (growth trajectory, consistency — `WRI_CONCEPTUAL_MODEL.md` components 4–5) and outcome history (component 10, once it exists). Both are compounding: a platform with six months of a talent's real evidence and, eventually, real outcome correlation is not replicable by a competitor launching today with an empty database. This is the long-term moat (see Q20).

**6. Why is Levav not merely a job board?**
A job board's core asset is listings; Levav's core asset is evidence and readiness intelligence *about people*, independent of any specific listing. `backup-old-site`'s `JobMatchingPage.tsx` (hardcoded match scores dressed as "AI") is the cautionary example of what Levav becomes if this distinction isn't held — a job board with worse UX and a dishonest matching claim.

**7. Why is Levav not merely an assessment platform?**
An assessment platform's output is a score for its own sake. Levav's WRI is explicitly designed (`WRI_CONCEPTUAL_MODEL.md`) to never be a standalone universal score — it's always contextual (role/org-scoped) and always connected forward into real opportunity and backward into real development content. A score with nowhere to go is an assessment platform; Levav's scores exist to route people into Layer 4 (Opportunity).

**8. Why is Levav not merely an ATS?**
An ATS manages an employer's existing pipeline; it has no opinion about whether the pipeline itself is good. Levav's Talent DNA (`EMPLOYER_TALENT_DNA.md`) and evidence-backed matching exist specifically to improve *what enters* the pipeline, not just track it once it's there. `backup-old-site`'s `EmployerDashboard.tsx` is, structurally, mostly an ATS — a legitimate feature to have, but Phase One must not let ATS-parity become the finish line; Talent DNA and evidence-backed matching are what make it more than that.

**9. How do Levav 28, WRI, Levav ID, Levav Code, Learn, employer matching, development organisations, and outcomes reinforce one another?**
Levav 28 and Learn produce practice → practice produces evidence → evidence feeds WRI (contextualised per role/org) → WRI plus Levav ID (the portable, explainable identity artifact) make a talent legible to employer matching → matching, informed by Talent DNA, produces applications/interviews → outcomes close the loop back into WRI (component 10) and validate/recalibrate the whole chain. Development organisations plug into the Evidence layer directly (attested milestones, structured feedback) as an alternate evidence source for people without formal employer history — this is what makes the model work for the informal/invisible-experience population `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md` centers. Levav Code (the archived branch's covenant-acceptance concept) is the identity-layer commitment that gives the whole evidence chain integrity — worth carrying forward conceptually as part of Layer 1.

**10. What makes Levav distinctly African without limiting global relevance?**
The operating assumptions in `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md` (mobile-first, informal-experience-inclusive, SME/NGO/church-usable, qualification-fraud-aware) are good product design *anywhere*, not exclusionary of other markets — they're just currently underserved by global tools built for well-signalled, high-connectivity markets. Building for the harder constraint set produces a product that works everywhere; the reverse is not true.

**11. What proves that Levav celebrates African intelligence and excellence?**
Real evidence of real capability moving real people into real opportunity — not marketing copy. `HeroSection.tsx`'s current unverifiable stats are the opposite of proof and should be replaced with real, honestly-labelled numbers once they exist (see `UI_UX_MODERNISATION_REVIEW.md`).

**12. Which features are core?**
Identity, Development (Levav 28 + Learn), Evidence, WRI, Talent DNA, Jobs/Opportunity, Matching, Applications/Interviews — the six layers' Phase One expression, per `INTEGRATION_ROADMAP.md` Slices 1–11.

**13. Which features are supporting?**
Messaging, notifications, development-organisation contribution tooling, employer analytics, admin/trust/verification — necessary for the core loop to function safely and at scale, but not themselves the value proposition.

**14. Which features are premature?**
Outcome-history-dependent features (retention analytics, workforce planning intelligence) — they need real outcome data that doesn't exist yet. Anything that presents a computed "score" or "match" without a real evidence base behind it (the `JobMatchingPage.tsx` mistake) is premature by construction, regardless of when it's built.

**15. Which features should be deferred?**
SkillSpace, skilled trades, and the broader informal-work marketplace (explicit Coming Soon per `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`). QuickWork's Phase One inclusion is not assumed — see `INTEGRATION_ROADMAP.md` Slice 20 for the explicit assessment. Wallet/payments beyond what a subscription model needs. Social/community feed, creator tools, referrals, leaderboards, WhatsApp/push integrations — real, well-built patterns exist in the archived branch for several of these, but none are load-bearing for the core promise and should wait until the core loop (Identity → Development → Evidence → Opportunity → Matching → Outcomes) is real end-to-end.

**16. What would make HR pay?**
Time saved on shortlisting for under-resourced employers, and confidence in a hire from an unfamiliar background that a CV alone couldn't provide — see `HR_VALUE_PROPOSITION.md`'s "what would make HR pay" section for the full argument.

**17. What would make talent remain active?**
A development loop that's valuable on its own terms (Q2/Q4 above), plus visible, honest progress — the growth-trajectory and areas-for-development outputs in `WRI_CONCEPTUAL_MODEL.md` give a person a reason to come back and close a specific gap, not just check a static score.

**18. What would make institutions contribute evidence?**
A real, low-friction attestation tool (structured feedback, milestone confirmation) that costs a coordinator less effort than what they do today (an emailed reference letter, a verbal recommendation) while producing something more durable and portable for the person they're vouching for — this is a distinct product requirement from the employer side, sequenced as Slice 12.

**19. What creates defensible long-term value?**
Accumulated, longitudinal evidence and (eventually) outcome data that a new entrant cannot replicate without years of real usage — see Q5. Trust built through explainability (nothing else in this space commits to always showing *why* a score/match exists) is the second moat.

**20. What can competitors not easily copy?**
The combination of (a) evidence-confidence-aware, explainable, multi-context WRI, (b) a bias-guardrail translation layer between employer preference and matching criteria (`EMPLOYER_TALENT_DNA.md`), and (c) the accumulated longitudinal data both depend on. Any one of these is copyable in isolation; the combination, built up over real usage, is not. A generic job board or generic assessment tool can copy the UI; neither can copy years of real African evidence and outcome data.
