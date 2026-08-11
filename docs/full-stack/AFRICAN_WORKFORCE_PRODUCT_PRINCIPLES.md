# African Workforce Product Principles

**Status:** Product-strategy document. Defines the operating context Levav must be designed for, and the design consequences that follow. This is the lens `PRODUCT_SURFACE_INVENTORY.md` and `INTEGRATION_ROADMAP.md` are filtered through.

## The context Levav must be designed for

- African labour markets, not a generic global template.
- African organisations of every size and type — not only large multinationals.
- African graduates and young professionals entering a market with weak signalling between education and employment.
- SMEs with limited or no dedicated HR capacity.
- NGOs, charities, schools, and churches that develop people but have no formal "employer" identity.
- Universities and training institutions.
- Mobile-first behaviour as the default, not an edge case.
- Inconsistent internet access and limited data affordability.
- Informal experience that is real but currently invisible to any credentialing system.
- Qualification fraud as a live, not theoretical, risk employers face.
- Employer reliance on personal networks in the absence of a trustworthy alternative.
- Underemployment and high youth unemployment as the backdrop, not a footnote.
- Capable people without elite credentials — the population Levav exists to make visible.
- The need to *develop* talent, not merely filter it.
- Mindset, discipline, critical thinking, and responsibility as the traits that actually predict workplace success in this context, more than a CV line.

## Design consequences

Each context item above has a direct product consequence. These are requirements, not aspirations:

| Context | Design consequence |
|---|---|
| Mobile-first, inconsistent connectivity | Every core flow (onboarding, Levav 28 task submission, application) must work acceptably on a mid-range Android phone on a weak connection: aggressive code-splitting, offline-tolerant forms with local queuing before submit, no flow that assumes a persistent connection. `main`'s current 2.38MB single JS bundle (per `CLAUDE.md`) is a direct violation of this principle and must be addressed before Phase One ships, independent of any feature work. |
| Limited data affordability | Avoid autoplay video, large unoptimised images, and chatty polling; prefer push/webhook-style updates over frequent client polling; make PWA/installable-and-offline-tolerant a Phase One consideration (`backup-old-site`'s `usePWA.ts` is a legitimate, complete reference implementation — see `ARCHIVED_IMPLEMENTATION_REVIEW.md`). |
| SMEs/NGOs/schools/churches with no HR department | The employer-facing product cannot assume a dedicated recruiter persona. Talent DNA capture, job posting, and shortlist review must be usable by a single overworked generalist in under the time they'd otherwise spend on a WhatsApp group post. |
| Informal/invisible experience | Evidence must have a path that doesn't require a formal employer's HR system — volunteer hours, church/NGO-verified contribution, a mentor's structured feedback, a completed QuickWork shift, all need first-class evidence status, not a "notes" field bolted onto a CV. |
| Qualification fraud | Every verification claim in the product (organisation verification, education, endorsement) needs an explicit verification *state* (unverified / self-reported / attested / independently verified) surfaced to the viewer, never presented as uniformly trustworthy. See `WRI_CONCEPTUAL_MODEL.md`'s evidence-confidence dimension. |
| Reliance on personal networks | Levav's core value proposition to an employer is specifically an alternative to network-based hiring — this only holds if match/shortlist quality is demonstrably better than what a WhatsApp referral produces, which requires real, checkable evidence behind every recommendation, not a black-box score. |
| Develop, not merely filter | The product must contain real development content and a real development loop (Levav 28, learning, reflection) as a first-class, revenue-relevant product line — not a feature bolted onto a job board to justify the "development" language. This is the central argument in `TALENT_DEVELOPMENT_MODEL.md`. |
| Capable people without elite credentials | Matching and WRI must never treat "school attended" as a default-weighted signal. See the bias-guardrail table in `EMPLOYER_TALENT_DNA.md`. |

## Celebrating Africa without reducing standards

Levav communicates "Africa is intelligent, capable, creative, valuable, and can produce globally competitive talent" — but this must be **earned by evidence the product produces**, not asserted by marketing copy. Concretely:

- No feature should imply a lower bar for African talent than a global one — WRI, evidence standards, and matching criteria must be legitimately rigorous, or the "celebration" is patronising rather than respectful.
- Excellence must be visible and specific: a real completed project, a real piece of verified feedback, a real skill demonstrated — not a participation badge for registering.
- Visibility on the platform must be earned through learning, building, contributing, improving, and producing evidence of growth — not through the act of registering. This is a hard product requirement, not a tone note: it means the default state of a new, unengaged profile must read (to an employer) as *early-stage*, not as *equivalent to* an active, evidenced profile. Ranking, matching, and default sort order all need to reflect this.

## Phase One population focus

Phase One targets professional and graduate talent, and the organisations that hire, develop, or credential them: employers of any size, schools, universities, NGOs, churches, training institutions, development agencies, and government institutions. SkillSpace, skilled trades, and the broader informal-work marketplace remain visible as **Coming Soon** future expansion — real, named, on the roadmap, but not built, and not allowed to complicate Phase One's scope. QuickWork's inclusion in Phase One is not assumed; see `INTEGRATION_ROADMAP.md` Slice 20 for the explicit go/defer assessment.
