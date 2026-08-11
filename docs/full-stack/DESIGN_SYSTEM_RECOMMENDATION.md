# Design System Recommendation

**Status:** Recommendation only — no CSS/config changed. Builds on the existing, already-real foundation confirmed in `UI_UX_MODERNISATION_REVIEW.md`, rather than proposing a rebuild.

## Starting position: formalise what already works

`main`'s `tailwind.config.js`/`src/index.css` already contains a real, consistently-applied token set. The recommendation is to make it canonical and documented, not to replace it:

- **Colour:** `midnight #000000` (base), `off-white #F5F5F5` (primary text/surface), `lime #C6FF34` (primary accent — CTAs, active states, success), `violet #7E3BED` (secondary accent — used today for gradients, admin badges, tier indicators; should be formally scoped to *secondary emphasis / premium tier / distinct-from-primary-action* uses, not treated as interchangeable with lime), neutral scale (`light-gray #A0A0A0`, `medium-gray #666666`, `dark-gray #111111`, `card-bg #0A0A0A`).
- **Typography:** Inter (body), system display stack. Recommendation: make a deliberate choice here rather than defaulting — either commit to the system-stack choice explicitly (fast, works everywhere, genuinely fine for a data-dense product) or select one distinctive display face for headlines/hero moments only, kept off the critical rendering path for dashboard/data screens. Don't introduce a third typeface "for variety."
- **Motion:** framer-motion only (confirmed no `motion` package coexists — hold this constraint). Scope motion usage by *purpose*, not by file: page-transition, onboarding-progress, and data-change (a score moving, a status updating) contexts get motion; static list/table/dashboard views should default to no motion, per `UI_UX_MODERNISATION_REVIEW.md`'s finding that 27% file-level adoption has drifted into decorative reflex.
- **Glass/elevation:** the existing `.glass`/`.glass-strong`/`.glass-hover`/`.glass-glow` utility set is a real, working elevation language — formalise it as the canonical elevation system (glass = elevated/interactive surface, flat `card-bg` = static content) rather than letting new components invent ad hoc shadow/blur values.
- **Buttons:** `.btn-lime` pill pattern is the established primary-action shape — extend it into a proper variant set (primary/lime, secondary/violet, tertiary/ghost, destructive) rather than one-off per-page button styling.

## What needs to be defined that isn't yet

| Token category | Current state | Recommendation |
|---|---|---|
| Radii | Implicit/inconsistent across components (not independently audited) | Define a small scale (e.g. sm/md/lg/pill) and apply consistently — cards, inputs, buttons, modals should draw from the same scale |
| Shadows | Mostly expressed via the glass utilities | Keep glass as the primary elevation language; define a non-glass shadow scale only for contexts where a flat card needs subtle lift (e.g. inside a glass container, to avoid double-blur) |
| Feedback states | Ad hoc per component | Define canonical success/warning/error/info treatments once — likely lime (success/active), a defined warning colour (not yet in the palette — needs a deliberate choice, not an arbitrary amber grabbed at build time), a defined error/destructive red, violet or neutral for informational |
| Data states (loading/empty/error) | Largely unbuilt because mock data never fails (`UI_UX_MODERNISATION_REVIEW.md`) | Design these as first-class states before Phase One data goes live — an empty state for a brand-new employer's Jobs list is an onboarding moment, not boilerplate |
| Charts | Static demo arrays throughout both codebases; no consistent charting approach evident | Pick one charting library and one visual language (colour mapping to the palette above, not default library colours) before real data-visualisation work begins in Slice 16 |
| Tables | Not independently audited | Needs a canonical dense-data table pattern for admin/employer dashboards, distinct from the card-based patterns used elsewhere |
| Forms | `Onboarding.tsx`/`Levav28.tsx` multi-step patterns are mature | Extract as a reusable multi-step-flow pattern rather than rebuilding per feature (Talent DNA capture and org verification will both need this shape) |
| Mobile navigation | `MobileBottomNav.tsx` exists in `main` | Confirm it's the canonical mobile nav pattern going forward rather than one of several |
| Accessibility | `prefers-reduced-motion` handled; contrast/ARIA not independently verified | Needs an explicit contrast/ARIA audit pass, not an assumption that shadcn/Radix defaults are sufficient once custom styling is layered on |

## Explicit constraints to hold

- **No second component library.** shadcn/ui + Radix + Tailwind is the system. Confirmed clean in `main` today — keep it that way.
- **`framer-motion`, never `motion`.** Already a documented rule (`CLAUDE.md`); this phase confirms it's still being honoured and should stay a hard constraint.
- **Three.js is scoped to the homepage hero, not a general-purpose UI dependency.** Its current lazy-loaded, intersection-gated implementation is the right pattern if it's ever reused elsewhere (e.g. a Levav ID visual flourish) — don't introduce a second WebGL approach.

## Relationship to modernisation priorities

This document defines *what the system should be*; `UI_UX_MODERNISATION_REVIEW.md` defines *what's wrong with the current application of it* and, correctly, orders bundle-size and mock-data-honesty fixes ahead of visual refinement. Apply this design system as new domains from `INTEGRATION_ROADMAP.md` get built, rather than as a separate retrofit project — real dashboards (Slice 16), real forms (Slice 8's Talent DNA capture), and real empty/error states (every slice with a Definition of Done) are the natural places this gets formalised in code.
