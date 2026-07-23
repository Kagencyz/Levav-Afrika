# Levav Platform Enhancement Plan

## User's Vision (6 Key Requirements)
1. **Link all dashboards to appropriate front-end buttons** — Every CTA, nav item, sidebar button routes to the correct page
2. **QuickWork™ needs to work properly** — Dedicated gig marketplace with browse, apply, complete, review flow
3. **Learn needs proper build** — Actual lesson/courses with progress tracking, linked to Champions program
4. **Content Studio** — Only accessible by Champions (role-gated), for creating courses/lessons
5. **Daily challenges in Levav 28™ must be functional** — 28-day program with day-by-day actionable challenges
6. **WRI Score™ starts at 0, earned through action** — Not given at signup. Only increases after: completing Levav 28 Day 1, finishing a Learn lesson, volunteering at Impact NGO, completing QuickWork with positive reviews

---

## Stage 1: Architecture & Shared Infrastructure
- Create `src/lib/levavData.ts` — Central data store for Levav 28 days, Learn courses, QuickWork gigs, WRI scoring rules
- Create `src/lib/wriEngine.ts` — WRI score calculator (starts 0, unlocks per task completion)
- Create `src/hooks/useChampion.ts` — Champion role detection hook
- Update `src/hooks/useAuth.ts` — Add champion role support
- Update routing in App.tsx

## Stage 2: Parallel Feature Development (5 agents)
- **Agent 1 (QuickWork)**: Build `src/pages/QuickWork.tsx` — Full gig marketplace with browse, filter, apply, track, complete, review flow. Includes gig detail modal, application form, my gigs tracker.
- **Agent 2 (Learn Rebuild)**: Rewrite `src/pages/Learn.tsx` — Course catalog, lesson viewer with video/text content, progress tracking per lesson, course completion certificates. Links to Champions.
- **Agent 3 (Content Studio)**: Build `src/pages/ContentStudio.tsx` — Champion-only page with course creation form, lesson builder, content management dashboard. Role-gated via useChampion hook.
- **Agent 4 (Levav 28)**: Build `src/pages/Levav28.tsx` — 28-day transformation program. Daily challenge cards with actionable tasks, progress tracking, day unlock logic (complete previous day to unlock next). Integrates with WRI engine.
- **Agent 5 (WRI Engine + Dashboard Integration)**: Build `src/lib/wriEngine.ts` + Update `src/pages/Dashboard.tsx` — WRI starts at 0, visual score breakdown showing locked/unlocked dimensions, score only increases after verified task completions. Update dashboard sidebar linking.

## Stage 3: Navigation Integration & Linking Fixes
- Update `src/App.tsx` — Add all new routes
- Update `src/components/Navbar.tsx` — Add champion nav link (conditional)
- Update `src/components/MobileBottomNav.tsx` — Add QuickWork tab
- Update `src/pages/Dashboard.tsx` — Fix sidebar links (QuickWork → /quickwork, My Profile → /dashboard/profile)
- Update `src/pages/Home.tsx` — Ensure all CTA buttons link correctly
- Update `src/pages/Onboarding.tsx` — On completion redirect to /levav28 (not just generic dashboard)

## Stage 4: Build & Deploy
