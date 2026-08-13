# Codex restart prompt — 2026-08-13

**Purpose:** the text to give Codex when it resumes Engineering Command after the 2026-08-13 absence.
**Companion:** `ENGINEER_HANDOVER_2026-08-13.md` — the detail behind everything the prompt asserts.

## Why this exists as a file

`AGENTS.md` is the first file Codex reads, and at the time of writing it is **still the stale version**: it claims the backend is MySQL, unrunnable, dependency-less, with zero tests and fake auth. WP-0001 item 1 replaces it, but WP-0001 has not been built, so the false document is what a returning engineer meets first. Rewriting working authentication is the top entry on the §48 never-do list, and this prompt exists to get in front of that.

**Once WP-0001 is ACCEPTED, most of this prompt is obsolete** — `AGENTS.md` will be correct and the corrected figures will be on `main`. Keep it until then; delete it after, rather than letting it become another stale instruction.

## The prompt

Give Codex everything between the markers.

---

You are Codex, Engineering Command on Levav-Afrika, under Master PRD v4.1.
Claude has been operating as Product Command while you were away. Read this
before anything else.

DO NOT TRUST AGENTS.md. It is stale and is the first thing you would normally
read. It claims the backend is MySQL, unrunnable, dependency-less, has zero
tests, and that auth is fake. Every one of those is false. The backend is
Postgres/Supabase, deployed, 56 tests pass, and Supabase Auth on httpOnly
cookies is real and working. Rewriting working auth is the top entry on the
§48 never-do list. WP-0001 item 1 replaces AGENTS.md with text Claude already
supplies verbatim in the packet — apply it, do not paraphrase.

FIRST: five PRs/branches carry corrected documentation that is NOT on main
yet. If you read main you get figures that were measured wrong. Merge or read
from these first:
  #16  claude/code-setup-plugin-install-b9sbzl  - verification gate truth, WP-0002 amendment
  #17  claude/ground-truth-audit-2026-08-13     - the audit, FINDING-08..12
  #18  claude/pdr-0013-migration-ownership      - PDR-0014 + WP-0005
       claude/pdr-0006-amendment                 - PDR-0006 A1 + WP-0001 A2
       claude/reconcile-sprint0-record           - Sprint 0 corrections + your handover note

START HERE: docs/agent-handoffs/claude/ENGINEER_HANDOVER_2026-08-13.md on the
reconcile-sprint0-record branch. It has the corrected figures, the build
order, and a list of things Claude got wrong so you can calibrate.

CORRECTED FIGURES — replace anything you remember:
  - npm run typecheck covers 15 of 25 server/api files, not "the server".
    tsconfig.server.json is a hand-maintained 12-file allowlist.
  - Frontend type errors: 136 in src/, not 156. The 156 came from
    tsconfig.app.json, which also includes api, server, db, contracts, tests.
  - No gate typechecks any test file. Two carry errors and pass green.
  - db/migrations/ has NEVER been applied to any database. Production was
    built by a Supabase history mostly absent from this repo. Do not run
    npm run db:migrate against anything.
  - server/router.test.ts guards procedure NAMES, not reachability.

BEFORE YOU MEASURE ANYTHING: run npm ci, then confirm npx tsc --version says
5.9. A fresh clone has no node_modules and npx will pull TypeScript 6.0.2,
which rejects baseUrl as a config error and exits before checking a single
file. That reads as a clean pass. It produced a wrong measurement already.

BUILD ORDER. WP-0001 blocks every later packet.
  1. WP-0001 + Amendment A1 + Amendment A2 (A2 strengthens router.test.ts to
     guard reachability, not names)
  2. WP-0002 — note item 7 must land AFTER the WP-0001 deletions. Before
     them it turns 24 hidden errors into a failed Vercel deploy, because
     build is `typecheck && vite build`. The baseline is 136.
  3. WP-0005 — migration ownership, per PDR-0014. This governs MIGRATIONS
     ONLY. drizzle-orm stays as the runtime query builder and db/schema.ts
     stays as the typed query surface. Removing the ORM is a defect.

ROLES ARE BACK TO NORMAL. Claude is Product Command and does not edit code —
PDR-0015 temporarily authorised it to, but that lapsed unexercised the moment
you returned. Nothing was built under it; there is no Claude-authored
application code to review. You build, you report in §42.2 format, Claude
accepts or returns DEFECTS_FOUND under docs/qa/ACCEPTANCE_REVIEW_PROTOCOL.md.
If a packet needs a product decision you do not have, return
BLOCKED_PRODUCT_DECISION rather than inventing one.

Never weaken a test to make it pass. Never edit the router allowlist to turn
a red test green without saying why. Your automated PR reviews caught three
real defects in Claude's work today — that loop is load-bearing, keep it.

Start by confirming the five branches above are merged or readable, then
report your plan for WP-0001 before you build.

---

## Two things to decide before sending it

1. **Merging #16–#18 first is cleaner.** The prompt tells Codex to read from unmerged branches, which works but is awkward. Merge them and open the other two, and Codex reads `main` with everything consistent.
2. **The final line asks for a plan before building.** That is deliberate — it creates a checkpoint before code lands, which is how the acceptance protocol is meant to work. Remove that line if speed matters more than the checkpoint.

## Maintenance

Every factual claim in the prompt is sourced from `GROUND_TRUTH_AUDIT_2026-08-13.md` and the packets it names. If any of those change, this file is stale and must be updated or deleted — it is exactly the kind of document `STALE_INSTRUCTIONS_REGISTER.md` exists to catch.
