# UI, UX and Modernisation Review

**Status:** Evidence-based review of `main`'s current visual/interaction system (`bda184c`). `backup-old-site` is referenced only for isolated UX patterns worth comparing against, not as a design-system source (its visual system wasn't part of this pass — its code was reviewed for functionality, not aesthetics).

## What the brief asks Levav to feel like, and not feel like

Feel: premium, modern, confident, African, intelligent, minimal, warm, responsive, human, intentionally designed.
Not feel: generic, template-driven, visually noisy, over-animated, inconsistent, or obviously AI-generated.

## Current state, against that bar

### What's genuinely working
- **Color system is real and consistent, not per-page reinvented.** `midnight #000000`, `lime #C6FF34` (primary accent), a real second brand color `violet #7E3BED` used deliberately (gradients, admin badges, WRI "Professional" tier), plus a disciplined neutral scale (`off-white`, `light-gray`, `medium-gray`, `dark-gray`, `card-bg`). **Correction to the brief's own description of the brand:** it's not strictly black/white/lime — violet is a real, load-bearing second accent already in production use, not a stray. `DESIGN_SYSTEM_RECOMMENDATION.md` treats this as canonical rather than pretending it doesn't exist.
- **A real, reused glass/blur utility set** (`.glass`, `.glass-strong`, `.glass-hover`, `.glass-glow`) and a consistent `.btn-lime` pill pattern — evidence of an actual design system underneath, not ad hoc per-component styling. This is the foundation `DESIGN_SYSTEM_RECOMMENDATION.md` should formalise, not replace.
- **`prefers-reduced-motion` is respected globally** — a real accessibility signal already implemented correctly.
- **The homepage hero's Three.js shader is well-engineered**, not just decorative: lazy-loaded, `IntersectionObserver`-gated to pause off-screen, respects reduced-motion. This is the kind of "motion should support, not distract" execution the brief asks for, done right, once.

### What's working against the "premium, intentional, human" bar
- **Framer Motion is used in 40 of 149 `.ts/.tsx` files (~27%)** — not misused per-instance, but over-applied per file count. Every one of the 21 admin Section components imports it for simple fade-ins. Motion this pervasive on plain data-list/dashboard views reads as decorative reflex, not intentional communication of change — exactly the "theatrical" failure mode the brief warns against for professional workflows. Recommendation: reserve motion for state transitions, onboarding, and progress reinforcement (where it already earns its place — Levav 28, onboarding wizard); strip it from static admin list/table views.
- **Unverifiable marketing claims undermine "confident" and "intelligent."** `HeroSection.tsx`'s hardcoded stats ("2,500+ Talents," "45+ Countries," "98% Completion," "150+ Categories") are not backed by any real counter. A platform whose stated purpose is producing *credible evidence* cannot open with uncredible claims about itself — this is a coherence failure between brand voice and product principle, not just a copy nitpick (see `PRODUCT_VISION_AND_HEART.md`).
- **Inert placeholder affordances read as unfinished, not minimal.** Footer social icons that `preventDefault()` on click, a Levav 28 certificate button that only `alert()`s, a "coming soon" image-upload field sitting next to a fully-built, unused real upload component. Each individually is small; together they're the concrete texture of "not intentionally designed" that the brief explicitly wants avoided.
- **The Admin panel's silent mock-data bug (`FRONTEND_BACKEND_CONNECTION_MATRIX.md`) is a UX-trust issue, not just a code bug** — an admin who posts a job, then checks the Jobs admin section and sees only unrelated mock entries, will reasonably conclude the platform is broken or lying to them. This is worth fixing before any visual modernisation work, because no amount of visual polish fixes a dashboard that shows fiction.
- **No second UI component library** (confirmed: shadcn/ui + Radix + Tailwind throughout, `motion` package correctly never introduced alongside `framer-motion`) — this constraint is being honoured; hold it.

## Review by area (per the brief's checklist)

| Area | Finding |
|---|---|
| Typography/hierarchy | Inter body font, system display-font stack (`-apple-system`/`SF Pro Display`), no custom webfont beyond Inter. Functional, not distinctly "African" or premium-differentiated — a candidate for a deliberate typography choice in `DESIGN_SYSTEM_RECOMMENDATION.md` rather than a default system stack. |
| Spacing/layout/grids | Not independently audited page-by-page in this pass; the shared glass/card utility classes suggest reasonable consistency at the component level. Flag for a dedicated pass once real data (not mock) is flowing through dashboards, since real data volume often breaks layouts mock data was tuned around. |
| Dashboards/data visualisation | Charts throughout (`EmployerAnalytics.tsx`, `TalentAnalytics.tsx`, `WriHistoryPage.tsx` on the archived branch) are static arrays dressed as live data — this is a data problem more than a visual one, but the visual chrome will need real empty/loading/error states once data is real, none of which exist meaningfully today because nothing ever fails or loads slowly against mock arrays. |
| Forms/onboarding | `Onboarding.tsx`/`Levav28.tsx` multi-step wizards are the most mature interaction patterns in the app — good candidates to hold as the reference pattern for future multi-step flows (Talent DNA capture, org verification) rather than reinventing per-feature. |
| Empty states | Largely untested because mock data is never actually empty. This needs deliberate design work once real data (which will be genuinely empty for new users/orgs) ships — an empty Jobs list for a brand-new employer is a real onboarding moment, not an edge case. |
| Mobile responsiveness | Not independently verified in this pass (no browser testing performed — this is a code-level audit). Given `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`'s mobile-first requirement, a dedicated device-testing pass is a prerequisite before Phase One ships, not optional polish. |
| Accessibility/contrast | `prefers-reduced-motion` handled; contrast/ARIA not independently audited here — shadcn/Radix primitives generally provide reasonable defaults, but this needs explicit verification, not assumption. |
| Light/dark mode | Current system appears single-theme (dark, black-foundation) by design intent (per `CREATIVE_BRIEF.md`'s described direction) rather than a light/dark toggle — confirm this is a deliberate choice for `DESIGN_SYSTEM_RECOMMENDATION.md` rather than an oversight. |
| Bundle size / performance | `CLAUDE.md` documents a single 2.38MB production JS bundle — a direct violation of the mobile-data-affordability principle in `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`. This is a modernisation priority independent of any visual redesign: code-splitting (route-based `React.lazy`, deferring the Three.js shader bundle off the critical path already partially done via lazy-load) should be scoped before Phase One general availability. |

## What "modernisation" should mean here

Per the brief: modernisation must improve product clarity and usability, not merely appearance. Concretely, for this codebase, that means: (1) fix what's silently lying (Admin panel bug, fake stats, dead-end buttons) before restyling anything, (2) reduce motion to where it earns its place, (3) solve the bundle-size problem as a usability issue for the actual target user (mobile, inconsistent connectivity), and (4) only then invest in incremental visual refinement on top of an already-solid color/glass/button foundation that does not need to be thrown out and rebuilt.
