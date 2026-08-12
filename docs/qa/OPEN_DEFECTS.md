# Open Defects — awaiting Codex

**Owner:** Claude (Product Command). Codex reads this file; Codex does not edit it.

This register exists because a defect list relayed through chat did not survive into Codex's working context, and WP-0001/WP-0003 were resubmitted with an unchanged working tree. **The repository is the durable channel.** Before returning `READY_FOR_REVIEW` on any packet, check this file for open defects against it.

**Review status is verified against the tree, not the report.** Claude checks file contents and modification times before reading an implementation summary. A report claiming a fix that the tree does not contain is itself a defect.

---

## WP-0001 + WP-0003 — round 2 · 4 open · 2026-08-12

Round 2 changed no files. All four defects below were raised in round 1 and remain unfixed. Line numbers are from `main` @ `664be76` plus Codex's uncommitted tree.

### D1 — S1 BLOCKING — public landing page renders a fabricated WRI
**Requirements:** WRI-001, FEED-008, PDR-0002, PDR-0003, LANG §2.3 · **File:** `src/sections/home/ProfilePreviewSection.tsx`, rendered from `src/pages/Home.tsx:43`

| Location | Action |
|---|---|
| Lines 19–24 | Delete the `wriDimensions` array. `Technical` and `Leadership` are retired non-PRD constructs (PDR-0002) |
| Line 107 | Delete the `74` score element |
| Line 108 | Delete its `WRI&trade;` label |
| Line 113 onward | Delete the `{wriDimensions.map(...)}` block and its animated progress bars — AC4 names progress indicators implying a hidden value explicitly |
| Line 28 | `'QuickWork™ · 12 gigs completed, 4.9★'` — remove the fabricated metrics; `gigs` is prohibited (PDR-0003) |
| Line 29 | `'Levav Impact™ · 40 verified service hours'` — remove the fabricated figure |
| Line 62 | `your WRI™ measures readiness` claims a live capability. Reword to intent, not present tense |

Keep the section, the profile card, the name, the role and the verified badge. Illustrate the concept; render no number.

### D2 — S2 — a stale, unarchived document repeats the fake-auth claim
**Requirements:** WP-0001 AC3 · **File:** `docs/AUTHENTICATION_ARCHITECTURE.md`

Cites archived `docs/SECURITY_AUDIT.md` as current three times, references `api/lib/jwt.ts` and `api/context.ts` (neither exists), and states *"because the backend has never run… this is precisely the fake-auth problem."* Same hazard class as the pre-v4.1 `AGENTS.md`.

**Fix:** `git mv docs/AUTHENTICATION_ARCHITECTURE.md docs/archive/`. Its httpOnly-cookie recommendation is already implemented. `docs/DOMAIN_MODEL.md` cites it at lines 14, 34 and 55 — repoint those in the same pass.

### D3 — S2 — `docs/DOMAIN_MODEL.md` cites archived documents as authority
**Requirements:** WP-0001 AC3

- **Line 93** — "the `employer` router stays unregistered per `docs/NEXT_MILESTONE.md` §4". That router is **deleted** (PDR-0006) and that document is archived.
- **Line 98** — "Full status in `docs/PRODUCT_SYSTEM_MAP.md`" — archived.

**Fix:** repoint both at `docs/product/COVERAGE_MATRIX_v1.md`; state the routers are deleted, not unregistered.

### D4 — S3 — dead WRI scaffolding retained
**Requirements:** ENG-005, COMP-003

- `src/pages/TalentProfile.tsx` — `WRI_COLORS`, `WRI_LABELS`, `DEFAULT_WRI_BREAKDOWN`, `wriBreakdown`, and `breakdownEntries` at line 581 (computed, never used).
- `src/pages/MarketIntel.tsx` — the `WRIDistributionSection` component body survives, containing **"Talent with WRI scores above 80 earn on average 35% more than those below."** A fabricated compensation benchmark in the tree is a COMP-003 problem waiting to be re-rendered.

**Fix:** delete both.

---

## Confirmed good — do not redo

Verified by Claude in round 1 and unchanged. Re-doing any of this wastes a cycle:

- `AGENTS.md` is a byte-exact match to the supplied text.
- No WRI writer, audit symbol or `@contracts` alias remains anywhere in `src/` or `server/`.
- Retired key strings are correct — `wri_score` and `levav_audit_log`, matching the original `LS_KEYS.wriScore` value and `AUDIT_KEY`, not the variable names.
- `retiredLocalState.ts` introduces no replacement key (AC15 holds) and carries the PDR-0009 removal condition.
- `AuditSection.tsx` renders the three approved strings verbatim, with no number, table or filter.
- The WRI retirement guard test is well constructed.
- Router allowlist failure demonstrations were correct; the registered set is untouched.
- 56/56 tests across 9 files. Build succeeds. Bundle 21 kB smaller.
- Frontend typecheck improved 156 → 136.

## Still open, not a defect

The 360 px visual scenarios (WP-0003 #7, WP-0001 A1 #10) remain unverified — Codex's browser connection was unavailable, correctly declared. **Claude will verify these.** Do not block on them.

## On acceptance

When D1–D4 are fixed in the tree: commit, push the branch, and open the draft PR for the Vercel preview. Publishing a preview before D1 is fixed would put a fabricated Workforce Readiness Index on a public URL, which is why the PR is held.
