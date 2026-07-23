# UI/UX Audit

**Scope note:** this audit is based on reading the codebase, design docs, and component structure, plus confirming the dev server boots and serves HTTP 200. It is **not** a full interactive/visual QA pass (no systematic click-through of all 34 pages, no screenshot comparison, no measured Lighthouse/axe run). Anything below marked "unverified visually" should get a real browser pass before being treated as settled — don't upgrade these to "confirmed" without actually looking.

## Information architecture & navigation

- 34 top-level routes declared in `src/App.tsx`, all resolving to real files (no broken routes found).
- A dedicated `MobileBottomNav.tsx` component exists alongside the main `Navbar.tsx`, suggesting a deliberate mobile navigation pattern was designed in (unverified visually — haven't confirmed it actually renders/behaves correctly at small viewports).
- `OfflineBanner.tsx` and a `SyncQueue.tsx` component exist, suggesting offline-state UX was considered — consistent with a product meant to work on inconsistent African mobile connectivity. Not verified to actually function (no service worker test performed beyond confirming `public/sw.js` exists).

## Visual direction vs. `CREATIVE_BRIEF.md`

`CREATIVE_BRIEF.md` specifies a "Liquid Glass" premium design language, black/white foundation with lime→violet gradients, and a 5-"moment" homepage. `src/pages/Home.tsx` composes exactly 5 section components matching that brief 1:1 (`HeroSection`, `JourneySection`, `EcosystemSection`, `HumanStoriesSection`, `VisionSection`) — the homepage structure genuinely follows the documented plan. Whether the *executed* visual quality (spacing, motion timing, gradient restraint) matches the brief's intent is unverified visually.

## Component system

- Single, consistent system: shadcn/ui (`new-york` style) + Radix primitives + Tailwind + `lucide-react`. No competing UI library found — this is healthy and should be preserved.
- `framer-motion` is the animation library in use throughout (not the newer `motion` package, not both — no migration conflict).

## Dark/light mode — gap found

`next-themes` is a declared dependency, but it is used in exactly one place (`src/components/ui/sonner.tsx`, for toast theming) and there is **no app-wide `ThemeProvider`** in `src/App.tsx` or `src/main.tsx`. The toaster itself is hardcoded to `theme="dark"`. **There is currently no working light/dark mode toggle for the application** — despite the dependency being present, the feature isn't wired up. This is a real gap against the Phase 5 requirement for light and dark mode support.

## Reduced motion

`prefers-reduced-motion` is respected in `src/index.css` and in `src/components/ui/shader-animation.tsx` (the Three.js shader background). This is good practice and should be extended to the framer-motion animations elsewhere in the app if it isn't already (not fully audited file-by-file).

## Accessibility

- 25 files use `aria-*` attributes, largely inherited from Radix primitives (which have solid accessibility defaults out of the box) rather than hand-rolled ARIA — this is the right default (don't reinvent what Radix gives you).
- No automated accessibility audit (axe, Lighthouse) was run as part of this pass. Recommend running one before making accessibility claims either way.

## Performance

- **Confirmed, not estimated:** the production build (`npm run build`) emits a single JS chunk of 2.38MB minified / ~596KB gzipped, with Vite's own build output warning that chunks exceed the 500KB recommendation. There is no route-based code-splitting (`React.lazy`) anywhere in `src/App.tsx` — all 34 pages ship in one bundle regardless of which route a visitor lands on.
- Given the target audience includes users on constrained African mobile connectivity, this is a concrete, fixable performance problem worth prioritizing: splitting by route (especially heavy pages like `Levav28.tsx`, `Learn.tsx`, `QuickWork.tsx` at 39–56KB of source each, or `ShaderDemo.tsx`'s Three.js dependency) would meaningfully cut first-load size for most visitors.
- `Home.tsx`'s `HeroSection` dynamically imports `shader-animation.tsx`, but `ShaderDemo.tsx` also statically imports it — Vite's build log flags this explicitly ("dynamic import will not move module into another chunk"), meaning the code-splitting that *was* attempted for the shader component doesn't actually take effect.

## Loading / empty / error states

Not systematically audited page-by-page in this pass. Given that most pages read from hardcoded `MOCK_*` arrays (see `docs/CURRENT_STATE.md`), genuine loading/error states (the kind you'd get from a real async API call — pending/error/empty from a `useQuery`) are largely moot today; they only become meaningful once pages are wired to the real backend. Worth re-auditing this specifically once that migration happens.

## Mock-data UI transparency

To the frontend's credit, several pages are explicit in-UI about running on mock data rather than hiding it: `Opportunities.tsx` shows a visible "mock data" banner (`isUsingMockData = true`), and `EmployerJobs.tsx` has an explicit "Mock data indicator" comment near a visible UI element. This is good practice for a prototype and should be kept (or made even more visible) until real data is wired in — don't strip these indicators without also finishing the backend wiring.

## What to do next (recommended, not yet executed)

1. A real browser QA pass: click through all 34 routes at desktop and mobile widths, check the mobile bottom nav and offline banner actually function, and run an automated accessibility check (axe or Lighthouse).
2. Decide whether dark/light mode is actually a product requirement — if yes, wire `next-themes`' `ThemeProvider` properly; if no (i.e., the product is intentionally dark-only per the "black and white foundations" brief), remove the unused dependency and document the decision.
3. Address the bundle-splitting gap before any performance-sensitive launch, given the target market's connectivity profile.
