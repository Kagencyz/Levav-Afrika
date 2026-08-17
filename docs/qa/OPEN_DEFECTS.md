# Open Defects — awaiting Codex

**Owner:** Claude (Product Command). Codex reads this file; Codex does not edit it.

This register exists because a defect list relayed through chat did not survive into Codex's working context, and WP-0001/WP-0003 were once resubmitted with an unchanged working tree. **The repository is the durable channel.** Before returning `READY_FOR_REVIEW` on any packet, check this file for open defects against it.

**Review status is verified against the tree, not the report.** Claude checks file contents and modification times before reading an implementation summary.

---

## Open defects

### WP-0102 — reviewed 2026-08-15 — DEFECTS_FOUND (2)

Reviewed at commit `be24ee3` on `agent/wp-0102-intelligent-onboarding`. **Codex has no token budget**, so this verdict is filed ahead of resumption — no review cycle is lost.

Fourteen of sixteen criteria pass. The packet is close.

#### D-0102-1 — S2 — a migrated member is never asked to confirm their reassigned situation

**Requirements:** ONB-001, A1-14, PDR-0014 §1 · **Files:** `server/routes/onboarding.ts`, `src/pages/Welcome.tsx`

Migration 0007 correctly remaps the retired enum values and sets `situation_inferred = true`. `loadOwnRecord` returns the flag to the client. **Nothing reads it.** No surface tells the member their answer was rewritten, and no path clears the flag except setting a situation from scratch.

The result is exactly what ONB-001 forbids: someone who answered `volunteering` is now recorded as `not_working`, is never told, and is never asked. PDR-0014 §1 states migrated members are asked to confirm on next sign-in.

**Approved copy — held here, not in the dictionary.** These four strings are approved and final, but they are deliberately **not** in `COPY_DICTIONARY_S17_AUTH_WELCOME.md` yet. The copy module's byte-identity test guards the seeded scope, so adding dictionary keys ahead of their implementation turns two accepted packets red. They move into §17 as part of fixing this defect.

| Key | Value |
|---|---|
| `onboarding.situation.inferred.title` | Check how Levav describes your situation |
| `onboarding.situation.inferred.body` | We changed the options for describing work situations. Your previous answer no longer has an exact match, so Levav has put you down as "{situation}". Nothing uses this until you confirm it. |
| `onboarding.situation.inferred.confirm` | That is right |
| `onboarding.situation.inferred.change` | Choose a different one |

The body says three things deliberately: that Levav changed something, what it assumed on the member's behalf, and that the assumption is inert until confirmed. Drop any one and it becomes a silent reassignment with a dialog attached.

**Fix:** add these four keys to §17, seed them, and surface the prompt. Confirming clears `situation_inferred` and sets `situation_confirmed_at`. Choosing differently writes the new value. Until confirmed the value stays inferred and no consumer may treat it as declared.

**Note on scope.** A1-14 also required inferred values be excluded from ordering. Ordering is WP-0105 and does not exist yet, so there is nothing to exclude from — that half is not a defect today, but WP-0105 must honour it.

#### D-0102-2 — S3 — situation and posture events carry no category

**Requirements:** A1-16, capability model §13 · **File:** `server/routes/onboarding.ts:147-148`

`onboarding.situation.set` and `onboarding.posture.set` fire with no payload. The model's §13 table specifies the situation and posture **value** — a fixed category, not free text — and without it the events cannot answer which situations members actually report, which is the product signal they exist for.

**My ambiguity, not Codex's error:** §13's header says "no values in payloads" while its table asks for the category. Codex resolved that toward privacy, which was the safer reading. Clarified: **fixed enum categories are permitted; free text and identifiers are not.**

**Fix:** emit the category on both events. Nothing else changes.

---

## Verified passing

Migration reversible with a genuine down-path reconstructing `personal_status` · all career columns nullable · three separate columns, **no role column on `users`** · `gig` absent · every acceptance test asserts rather than describes — hire grants nothing, no employer read path for posture, own-title persisted byte-identically, cross-family and inactive roles rejected, another user's id never accepted · non-English title `'  Umphathi Wezimali  '` preserved with whitespace intact · **typecheck baseline shrank 136 → 132** · 79 tests / 13 files · build exit 0 · bundle down 28 kB.

**Verified live at 360 px:** `/welcome` renders the approved §16 copy — "Welcome to Levav", "Step 1 of 3", all nine intent labels — with no horizontal overflow and no prohibited vocabulary.

---

## Previously open

**None against Codex.**

**Sprint 0 is delivered and closed.** `main` at `d5134e4`, verified on a fresh checkout. See `SPRINT0_VERDICTS.md`.

**Blocked on environment, not on engineering:** Codex's checkout has no `origin` remote configured, so it cannot fetch any Product Command document. The canonical remote is:

```
https://github.com/Kagencyz/Levav-Afrika.git
```

Verified from the product owner's checkout, not guessed. Codex was right to refuse to act on a guessed address, and right to refuse to reproduce Claude-owned documents from a chat message.

**WP-0002 is ACCEPTED** (re-reviewed 2026-08-12). The earlier withdrawal is lifted and D-0002-1 is void — see `SPRINT0_VERDICTS.md` §0. Codex is authorised to commit, push `agent/wp-0002-verification-gates` and open a draft PR.

---

## Carry-forward follow-ups

Not defects against any current packet — each was checked and found not to violate the acceptance criteria it sits near. Recorded so they are not lost, and dispositioned to the packet that will own the surface.

| # | Finding | Why it is not a defect | Owning packet |
|---|---|---|---|
| F-01 | `src/pages/SkillGap.tsx` — `getUserWRI()` still exists with a hard-coded `return 72` fallback; `currentWRI` (line 305) and `targetWRI = 95` (line 306) are computed and **never rendered** | WP-0003 AC4 requires that no surface *renders* a numeric WRI. Verified: neither variable is referenced anywhere else in the file, and the page shows the approved empty state instead | Sprint 3 (WRI engine) or the first packet to touch SkillGap. Delete `getUserWRI`, both variables, and the `talent_profile.wri` read path |
| F-02 | `src/pages/TalentProfile.tsx` — mock talent objects still carry `wri: 87`, `wri: 82`, … | Dead data. Every render path was removed; the named D4 symbols are gone | Whichever packet rebuilds TalentProfile |
| F-03 | Landing page copy — "Gigs and freelance projects. Stay active, keep earning." (PathsSection) uses a term PDR-0003 prohibits; "A 28-day transformation…" is empty-inspiration framing under Language System §2.2 | WP-0003 explicitly scoped out copy rewrites beyond the named WRI strings | WP-0004 and the Language packets |
| **F-08 — CONFIRMED 2026-08-15** | Reproduced on the real staging instance. `CREATE ROLE levav_app` succeeds; the unconditional `ALTER ROLE levav_app … NOSUPERUSER` that follows it fails as the non-superuser `postgres` role with *"only roles with the SUPERUSER attribute may alter roles with the SUPERUSER attribute"*. The migration is atomic, so **the whole of 0000 rolls back and `levav_app` is never created** | Still unconfirmed against `drizzle-kit` specifically, which may connect with different privileges — but it now reproduces on a second, clean PG17 instance rather than once | **Fix the migration.** The `ALTER ROLE` re-asserts attributes the `CREATE ROLE` above it already sets, so on a fresh database it is redundant; on an existing one it is what breaks. Guard it, or drop it. Until then Levav cannot rebuild its schema from scratch, which breaks disaster recovery and every new environment |
| ~~F-08~~ (original) | Migration `0000_levav_app_role.sql` failed on a **fresh PG17 Supabase project** when applied as the non-superuser `postgres` role. `CREATE ROLE` succeeded; the unconditional `ALTER ROLE levav_app ... NOSUPERUSER` was rejected with *"permission denied to alter role — only roles with the SUPERUSER attribute may alter roles with the SUPERUSER attribute"* | **Unconfirmed against the real path.** Claude applied it through the Supabase management API, which is not how migrations run — `drizzle-kit migrate` connects directly and may hold different privileges. Production already has this migration applied, so it evidently worked there at least once | **Verify when staging migrations are run.** If `drizzle-kit migrate` hits the same error on a fresh database, migration 0000 cannot rebuild the schema from scratch — which would make disaster recovery and every future staging environment impossible. Likely fix: drop the redundant `ALTER ROLE`, or guard it |
| **F-06 — RESOLVED 2026-08-15** | Migration 0006 and its rollback executed against the real `levav-talent-staging` Postgres 17 instance. **Both succeed.** DDL creates 5 tables with RLS, 18 policies, indexes, `pg_trgm`, grants and the `REVOKE DELETE`; the rollback drops all 5 tables and the `career_seniority` type and leaves the five pre-existing tables untouched with their RLS intact. Chain verified: 0000 (create-role portion), 0001, 0003+0004+0005, 0006 DDL, 0006 families seed, rollback | **Not executed:** migration 0002 (`auth_profile_sync`) and the roles/industries/aliases seed statements. The seed uses `INSERT … SELECT … FROM (VALUES …) JOIN` on slugs rather than hardcoded UUIDs, which is the correct pattern, but the three larger statements were not run | Codex should still run the full chain via `drizzle-kit migrate` once it has the staging `DATABASE_URL` — that exercises 0002 and the remaining seed, and is the path production actually uses |
| ~~F-06~~ (original) | Taxonomy tests mock database execution, so the migration SQL itself is not exercised against a real Postgres | Re-scoped 2026-08-14 to a **merge gate**, not a start gate — no PR has merged, so the tables reach `main` only when WP-0101 lands. **Staging now exists** (`levav-talent-staging`, free) but Claude cannot complete the run: `0006` references `public.users`, so it needs the full chain, and the management API is not the path Drizzle uses | **Codex runs `npm run db:migrate` then the rollback against the staging `DATABASE_URL`**, once the owner supplies it. Also settles F-08 |
| F-07 | `server/context.ts` derives client IP from the first `x-forwarded-for` value, which is spoofable if the app is ever reachable without the platform proxy in front | Used only to rate-limit a public read. Worst case someone evades their own limit; no data exposure | Revisit when SEC-008 rate limiting is applied to anything sensitive |
| F-05 | The copy module ships **every** dictionary key, including sections for surfaces that do not exist yet (evidence, disputes, Impact dashboards, Feed). ~8.6 kB gzip today | Criterion 2 required all keys present, so this is the packet working as specified, not a defect | Revisit with the route-splitting work owed before the Feed — per-surface copy chunks would drop it |
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
