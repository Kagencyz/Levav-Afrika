# WP-0005 — Migration ownership and schema reproducibility

**Status:** READY_FOR_BUILD
**Sprint:** 0 · **Owner after handoff:** Codex
**Requirement IDs:** ENG-001, ENG-003, ENG-005, §46, §47
**Audit classification:** MODIFY (`package.json` scripts) · REMOVE (`db/migrations/`) · BUILD (schema capture)
**Related decisions:** PDR-0014
**Source finding:** FINDING-08, `docs/product/GROUND_TRUTH_AUDIT_2026-08-13.md`

---

## Product problem

The production database cannot be rebuilt from this repository.

Production was built by a five-migration Supabase history. Four of those migrations have no file here at all, and the fifth exists at version `20260811220321` while the applied record is `20260811220734` — a different migration. Meanwhile `db/migrations/` holds six Drizzle migrations describing a parallel history that **has never been applied to anything**: the live database has no Drizzle migrations table, only `supabase_migrations.schema_migrations`.

Three things follow. There is no disaster-recovery or new-environment path from source. `db/migrations/` is read as the schema of record — the Sprint 0 audit and `CLAUDE.md` both cite it that way — while describing a database that does not exist. And `npm run db:migrate` is a live hazard: pointed at production it finds no Drizzle migrations table, concludes nothing has been applied, and attempts all six migrations against a database that already holds every object they create.

PDR-0014 settles the ownership question. This packet executes it.

## User journey

None directly. This packet is what makes the database an auditable artefact rather than a live-only one.

## Verified figures at handoff

Measured 2026-08-13 via read-only Supabase MCP calls (`list_migrations`, `information_schema` `SELECT`s). Reproduce before starting; a mismatch means production moved and this packet needs re-scoping.

| Applied migration | File in repo |
|---|---|
| `20260730031229 initial_schema` | absent |
| `20260730031558 user_onboarding` | absent |
| `20260730031650 rls_hardening_and_app_role` | absent |
| `20260811220734 reconcile_supabase_auth` | version mismatch (`20260811220321`) |
| `20260812020647 add_organization_registration_profile` | absent |

Live grants to `levav_app`: `SELECT` on `users`; `SELECT, INSERT, UPDATE` on `talents`, `organizations`, `organization_members`, `user_onboarding`. **No DELETE on any table.** Five tables in `public`. These are the properties the capture must preserve and the acceptance check must reproduce.

## In scope

1. **Capture the live schema into `supabase/migrations/`.** The repository must hold every migration record that has actually been applied, at the version it was applied under. Use the Supabase CLI's own pull/diff facility rather than a hand-written baseline. The `20260811220321` / `20260811220734` mismatch is reconciled here — the repository keeps the record that ran.
2. **Prove reproducibility.** Build a fresh database from `supabase/migrations/` alone and demonstrate it matches production's structure: same five tables, same columns and constraints, same RLS policies, same grants, still no DELETE anywhere. Report the comparison, not just the exit code.
3. **Remove `db/migrations/`.** Six migrations that have never run and describe a divergent schema. Git history preserves them.
4. **Remove `db:generate` and `db:migrate` from `package.json`.** They are the mechanism of the hazard, not a convenience worth keeping. If any developer workflow genuinely depends on `drizzle-kit generate`, say so in the report rather than keeping the script silently.
5. **Verify `db/schema.ts` against the live schema and record the result.** Under PDR-0014 it becomes a mirror of a schema it no longer defines. Any divergence found is a defect in the mirror and must be corrected to match the database — never the reverse.
6. **Document the new workflow** in `docs/implementation/IMPLEMENTATION_STATE.md` (or alongside it): how a schema change is authored, reviewed and applied now that the Supabase CLI owns migrations. One short section; the next person to add a column should not have to infer it.

## Out of scope

- **Any schema change.** This packet makes the existing schema reproducible. It adds no table, no column, no policy, no grant.
- **Replacing Drizzle.** `drizzle-orm` remains the runtime query builder and `db/schema.ts` remains the typed query surface every route depends on. PDR-0014 is explicit that it governs migrations only, and ENG-001 keeps Drizzle in the approved stack. Ripping out the ORM is a defect against this packet.
- The six phantom tables referenced by the quarantined routers. Those files are deleted by WP-0001; do not create tables to satisfy them.

## Existing behaviour to preserve

- Production is untouched. This packet is a capture, not a migration.
- `npm test`, `npm run typecheck` and `npm run build` all still pass.
- Auth, onboarding, dashboard and organisation flows behave identically — they depend on `db/schema.ts` and the live grants, neither of which changes.

## Acceptance criteria

1. `supabase/migrations/` contains a record for every migration listed by `list_migrations` against production, at the applied version. State the list and show it matching.
2. A fresh database built from `supabase/migrations/` alone reproduces production's structure. Provide the comparison output covering tables, RLS policies and grants, including the absence of any DELETE grant.
3. `db/migrations/` is gone, and no script, config or doc references it.
4. `db:generate` and `db:migrate` are gone from `package.json`. Grep output confirms no remaining caller.
5. `db/schema.ts` is confirmed to match the live schema, with the check shown. If it diverged, the correction is in the diff and described in the report.
6. The workflow for authoring a schema change is written down.
7. **No DDL was executed against production during this packet.** State this explicitly in the report.
8. `npm test`, `npm run typecheck` and `npm run build` pass, and auth/onboarding behaviour is unchanged.

## Data requirements

No data is created, migrated or destroyed. The capture is structural only. If the Supabase CLI's pull emits any row data, strip it and say so.

## Privacy requirements

**No production data may enter the repository.** A schema capture must contain no user rows, no email addresses and no auth records. Check the generated files before committing — a `pg_dump`-style capture will happily include `auth.users` contents if invoked wrongly.

## Security considerations

- The capture must not commit connection strings, service-role keys or the `DATABASE_URL`. Confirm none appear in the generated migrations.
- Grants and RLS policies are security controls, not incidental schema. The reproduced database must carry them exactly — a capture that drops a policy and still "works" in a fresh database has silently removed a control.
- Do not weaken any policy to make the fresh-build comparison pass. If the comparison fails, report the difference.

## Analytics and event requirements

None.

## UI states

None. Any user-visible change is a defect.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Build a fresh database from `supabase/migrations/` | Five tables, RLS enabled on all five, 18 policies, zero DELETE policies |
| 2 | Compare fresh build against production structure | No differences in tables, columns, constraints, policies or grants |
| 3 | Query `information_schema.role_table_grants` on the fresh build for `levav_app` | `SELECT` on `users`; `SELECT, INSERT, UPDATE` on the other four; no DELETE anywhere |
| 4 | `grep -rn "db:migrate\|db:generate\|db/migrations" .` excluding `node_modules` | No hits |
| 5 | Run the app against the fresh database | Register, log in, complete onboarding, load dashboard — all succeed |
| 6 | Inspect the committed capture for row data or secrets | None present |

## Dependencies

None. This packet is independent of WP-0001 through WP-0004 and can run in parallel with them. It touches `supabase/`, `db/migrations/` and two `package.json` scripts; WP-0002 touches `tsconfig` and different scripts, so the two do not contend beyond a possible trivial `package.json` merge.

## Open product decisions

None. PDR-0014 settles ownership. If the capture reveals a schema object nobody can account for — a table, column or policy in production with no origin — that is a `BLOCKED_PRODUCT_DECISION`, not something to quietly include or drop.

## Report back

§42.2 format. Include the applied-migration list, the fresh-build comparison output, the grant check, confirmation that no DDL touched production, and confirmation that no production data or secret entered the repository.
