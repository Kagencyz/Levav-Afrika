# Open Defects — awaiting Codex

**Owner:** Claude (Product Command). Codex reads this file; Codex does not edit it.

This register exists because a defect list relayed through chat did not survive into Codex's working context, and WP-0001/WP-0003 were once resubmitted with an unchanged working tree. **The repository is the durable channel.** Before returning `READY_FOR_REVIEW` on any packet, check this file for open defects against it.

**Review status is verified against the tree, not the report.** Claude checks file contents and modification times before reading an implementation summary.

---

## Open defects

**None against Codex.**

**Blocked on environment, not on engineering:** Codex's checkout has no `origin` remote configured, so it cannot fetch any Product Command document. The canonical remote is:

```
https://github.com/Kagencyz/Levav-Afrika.git
```

Verified from the product owner's checkout, not guessed. Codex was right to refuse to act on a guessed address, and right to refuse to reproduce Claude-owned documents from a chat message.

**WP-0002 verdict withdrawn** — Claude reviewed a different implementation than Codex built. See `SPRINT0_VERDICTS.md` §0. Codex should push its own WP-0002 branch for re-review.

---

## Carry-forward follow-ups

Not defects against any current packet — each was checked and found not to violate the acceptance criteria it sits near. Recorded so they are not lost, and dispositioned to the packet that will own the surface.

| # | Finding | Why it is not a defect | Owning packet |
|---|---|---|---|
| F-01 | `src/pages/SkillGap.tsx` — `getUserWRI()` still exists with a hard-coded `return 72` fallback; `currentWRI` (line 305) and `targetWRI = 95` (line 306) are computed and **never rendered** | WP-0003 AC4 requires that no surface *renders* a numeric WRI. Verified: neither variable is referenced anywhere else in the file, and the page shows the approved empty state instead | Sprint 3 (WRI engine) or the first packet to touch SkillGap. Delete `getUserWRI`, both variables, and the `talent_profile.wri` read path |
| F-02 | `src/pages/TalentProfile.tsx` — mock talent objects still carry `wri: 87`, `wri: 82`, … | Dead data. Every render path was removed; the named D4 symbols are gone | Whichever packet rebuilds TalentProfile |
| F-03 | Landing page copy — "Gigs and freelance projects. Stay active, keep earning." (PathsSection) uses a term PDR-0003 prohibits; "A 28-day transformation…" is empty-inspiration framing under Language System §2.2 | WP-0003 explicitly scoped out copy rewrites beyond the named WRI strings | WP-0004 and the Language packets |
| F-04 | The `talent_profile` localStorage key can carry a `wri` field, read by `SkillGap` and `SmartMatchWidget` | Nothing writes it; the read is inert. Adding it to the retired-key list now would imply a live vector that does not exist | Revisit if any writer is ever introduced; otherwise resolved by F-01 |

---

## Closed

### WP-0001 + WP-0003 — **ACCEPTED** 2026-08-12

All four defects fixed and verified in the tree before the implementation report was read.

| ID | Defect | Verification |
|---|---|---|
| D1 | Public landing page rendered a fabricated WRI | `ProfilePreviewSection.tsx` rewritten. Verified live at 360 px: no `74`, no dimension bars, no fabricated evidence metrics. Copy reframed to "is intended to become a living professional record" — honest about a capability that does not yet exist. Codex additionally corrected "gigs" → "projects" nearby, unprompted (PDR-0003) |
| D2 | `docs/AUTHENTICATION_ARCHITECTURE.md` stale and unarchived | Moved to `docs/archive/`; citing pointers in `DOMAIN_MODEL.md` updated |
| D3 | `DOMAIN_MODEL.md` cited archived docs as authority | Lines 93 and 98 corrected; no archived-doc reference remains |
| D4 | Dead WRI scaffolding | `WRI_COLORS`, `WRI_LABELS`, `DEFAULT_WRI_BREAKDOWN`, `breakdownEntries` and the `WRIDistributionSection` body all removed, including the fabricated "35% more" compensation claim |

**Gates re-run by Claude, not taken from the report:** 56/56 tests across 9 files · server typecheck clean · build succeeds · frontend typecheck 156 → **136** (baseline shrank, never grew) · `AGENTS.md` still a byte-exact match · all removal greps clean · retired keys `wri_score` and `levav_audit_log` correct against the originals · no replacement key introduced.

**360 px verification, performed by Claude:**

- **Landing page** — `document.scrollWidth === 360`, no horizontal overflow, no numeric WRI present.
- **SkillGap** — approved empty-state copy renders verbatim; `scrollWidth === 360`; no numeric score.
- **Admin Audit Logs** — **not verified live.** `/admin` correctly redirects to `/auth`, and Claude does not create accounts or enter credentials. Verified structurally instead: `AuditSection.tsx` contains only fluid layout (`space-y-6`, `rounded-2xl … p-6 sm:p-8`, `max-w-3xl`), no table, no grid, no fixed width and no unbreakable string, so it cannot overflow at 360 px. Stated as a limitation rather than claimed as a live check.

**Authorised on acceptance:** commit, push `agent/wp-0001-wp-0003`, and open the draft PR for the Vercel preview.
