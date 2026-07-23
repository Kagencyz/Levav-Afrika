# ADR 001 — Database Platform

**Status:** Accepted (approved with amendments, 2026-07-23). Not yet implemented — no infrastructure provisioned, no migrations generated. Implementation itself requires a separate approval checkpoint, per `docs/NEXT_MILESTONE.md`.

## Context

The current schema (`db/schema.ts`) uses Drizzle ORM against MySQL (`drizzle-orm/mysql-core`, `mysql2`). Per `docs/ARCHITECTURE.md` and `docs/CURRENT_STATE.md`, this backend has **never been executed even once** — no MySQL instance has ever been provisioned, no migrations have ever been generated (`db/migrations/` doesn't exist), and no real data has ever existed. This means the usual switching-cost argument for staying on an existing database ("we already have data/migrations/a working setup") does not apply here — there is nothing to migrate away from. The choice is genuinely greenfield.

This decision is being made now because the upcoming milestone (`docs/NEXT_MILESTONE.md`) requires standing up the database for real for the first time. Getting this right now avoids paying the integration cost twice.

**Important clarification:** Drizzle ORM itself is retained in every option below — Drizzle supports both MySQL and PostgreSQL dialects with a similar API. This decision is about the underlying SQL engine and hosting platform, not the ORM.

## Options considered

### Option A — Retain MySQL (via Drizzle)

Keep `drizzle-orm/mysql-core` + `mysql2`, provision a real MySQL instance for the first time, generate first migrations, fix the confirmed `employer.ts` bug.

### Option B — Migrate now to PostgreSQL (via Drizzle), hosted on Supabase

Switch `db/schema.ts` to `drizzle-orm/pg-core` (`mysqlTable` → `pgTable`, `mysqlEnum` → `pgEnum`, etc.), switch `db/connection.ts` to a Postgres driver, and host on Supabase (managed Postgres + connection pooling + local dev via the Supabase CLI). Supabase's MCP tooling is already configured and available in this environment.

### Option C — Restore the MySQL backend temporarily now, migrate to Postgres later

Get the current MySQL setup working first (provision, migrate, fix bugs), ship the auth milestone on it, then re-platform to Postgres in a later milestone.

## Evaluation

| Axis | A — MySQL | B — PostgreSQL / Supabase | C — MySQL now, migrate later |
|---|---|---|---|
| **Levav's long-term architecture** | Adequate for a conventional relational schema; weaker fit for the "intelligence" ambitions (matching, analytics) | Strong fit: JSONB for flexible employer-criteria/skills data, native array types, extension ecosystem (`pgvector` for future embedding-based matching, `PostGIS` for future geo/market-intel work relevant to Africa-wide expansion) | Same as A short-term, then pays the migration cost anyway with zero benefit gained in between |
| **Multi-tenant organisations** | Achievable via FK + `org_id` columns, enforced only in application code | Same modeling, **plus** native Row-Level Security as a second enforcement layer at the database itself | Same as A, then redone on B later |
| **Row-level security** | No native RLS; would require views/stored-procedure workarounds — weak | **Native RLS** — directly relevant given this audit already found real missing-authorization bugs (`application.ts#updateStatus`, `notification.ts#create`) that RLS-as-defense-in-depth would have caught even if the application-layer check were missing | Same weakness as A until the later migration |
| **Authentication** | No bearing either way — auth is handled by our own JWT/bcrypt code regardless of SQL engine (see `docs/AUTHENTICATION_ARCHITECTURE.md`) | Same — this decision does **not** require adopting Supabase Auth; Supabase is being evaluated purely as a managed Postgres host here | No bearing either way |
| **Employer and talent roles** | Modelable, no engine-specific advantage | Same modeling; JSONB is a better fit for variable employer-defined culture/criteria fields than MySQL JSON columns (weaker indexing/query support in MySQL) | Same as A, then redone |
| **Data integrity** | Real FK constraints if self-hosted MySQL/MariaDB with InnoDB; degrades if ever moved to a Vitess-based managed MySQL (e.g. PlanetScale historically restricted FK enforcement) | Full FK constraints, `CHECK` constraints, native enums, stronger constraint-checking overall | Same caveats as A |
| **Migrations** | Neither has any yet — a wash | Neither has any yet — a wash | Generates MySQL migrations now, discards/redoes them on Postgres later — pure wasted effort |
| **Local development** | Docker Compose MySQL, well-understood, no worse than Postgres | `supabase start` gives a full local stack (Postgres + Auth + Storage emulation) in one command via the Supabase CLI — arguably the simplest of the three, and matches tooling already available in this environment | Same as A initially, then a second local-dev setup later |
| **Deployment** | Self-managed MySQL hosting, or a managed MySQL provider (own ops burden either way) | Supabase provides managed hosting, automated backups, connection pooling (PgBouncer), and branching for preview environments out of the box | Same burden as A, deferred not avoided |
| **Operational complexity** | Real ongoing burden for a small/early team (patching, backups, scaling) if self-hosted | Meaningfully lower — Supabase absorbs most day-to-day DB operations | Same burden as A, twice (once now, once at the later migration) |
| **Cost** | Self-hosted MySQL has real infra + ops-time cost; managed MySQL (RDS, PlanetScale) has comparable pricing to Supabase | Supabase's free/low tier is cost-effective at this project's current stage | Cost of A now, plus cost of B later — strictly more total cost |
| **Scalability** | Fine at the scale this project needs for the foreseeable future — not a strong differentiator | Also fine; broader extension ecosystem gives more headroom for future analytics/AI features specifically named in the Levav vision | Same as A until re-platformed |
| **Testing** | Ephemeral Docker MySQL for CI/tests works fine | Ephemeral Postgres for CI/tests works fine; broader tooling ecosystem (testcontainers, pgTAP) — a minor, not decisive, edge | Same as A, then redone |
| **Auditability** | Standard binlog-based auditing | RLS policies are themselves declarative, reviewable security artifacts — directly useful given Levav's own governance/administration ambitions and the project's existing emphasis on audit logging (`auditService.ts`) | Same as A until re-platformed |
| **Future integrations** | Weaker fit for `pgvector`-style embedding search (relevant to "intelligent candidate matching," one of the core Levav asks) or geo-based features (relevant to Africa-wide multi-country expansion) | Strong fit for both of the above | Same weakness as A, deferred |

## Decision

**Recommend Option B — migrate now to PostgreSQL, hosted on Supabase.**

Rationale, in order of weight:
1. **Zero switching cost today.** No data, no working migrations, no live instance exists to preserve. This is the cheapest possible moment to make this choice.
2. **Native Row-Level Security directly addresses a class of bug this audit already found** (missing ownership/authorization checks in `application.ts` and `notification.ts`) — RLS gives a second, database-enforced layer that doesn't depend on every engineer remembering every check in every procedure.
3. **Better fit for named future Levav ambitions** — embedding-based matching (`pgvector`), geo/market-intel features, flexible employer-criteria JSON data (JSONB).
4. **Lower operational burden for a small/early team** via Supabase's managed hosting, backups, and local dev story — versus taking on MySQL ops directly.
5. **Option C is strictly dominated** — it pays all of Option A's setup cost now for zero data-continuity benefit (there is no data), and then pays Option B's cost again later. There is no scenario in which Option C is cheaper than choosing B now.

**What this decision does NOT do:** it does not mandate Supabase Auth, Supabase Storage, or any other Supabase product beyond managed Postgres hosting — those remain separate, later decisions. It does not change the ORM (Drizzle is retained). It does not authorize provisioning any infrastructure yet — see `docs/NEXT_MILESTONE.md` for what's actually approved to execute and when.

## Platform-agnostic data access (amendment, approved 2026-07-23)

**Business logic must not be tightly coupled to Supabase-specific SDKs or product features.** Supabase is adopted here as a *hosting and operations* choice — managed Postgres, backups, connection pooling, local dev via the Supabase CLI — not as an application-level dependency. Concretely:

- **Data access:** connect via a standard Postgres connection string and a conventional driver (`postgres` or `pg`) through Drizzle, exactly as the code would against any other Postgres host. **Do not** add `@supabase/supabase-js` as a data-access layer in `api/`/`db/` — there is no reason application code needs to know it's talking to Supabase specifically.
- **RLS policies**, if/when adopted, are written as portable SQL (via Drizzle migrations or plain `.sql` migration files), not as Supabase Studio-only constructs that couldn't be replayed against a plain Postgres instance.
- **Auth stays custom** (`docs/AUTHENTICATION_ARCHITECTURE.md`'s `jose`/`bcryptjs` design) — Supabase Auth is explicitly not adopted, which is itself part of what keeps this platform-agnostic: swapping the hosting provider later would not require rewriting how users authenticate.
- **Practical effect:** if the team ever needed to move off Supabase to a self-hosted Postgres instance or a different provider, the only change should be the connection string/credentials — not a rewrite of query logic, auth, or authorization code.

This is a discipline to maintain during implementation, not a mechanism that enforces itself automatically — flagged as a risk to watch in `docs/NEXT_MILESTONE.md`.

## Consequences

- `db/schema.ts` needs to be rewritten from `mysqlTable`/`mysqlEnum` to `pgTable`/`pgEnum` syntax (a schema-migration effort, not just a config change) — this is real work, planned in `docs/NEXT_MILESTONE.md`, not yet done.
- `db/connection.ts` needs to switch from `mysql2`/`drizzle-orm/mysql2` to a Postgres driver (`postgres`/`drizzle-orm/postgres-js` or `pg`/`drizzle-orm/node-postgres`).
- `drizzle.config.ts`'s `dialect` changes from `'mysql'` to `'postgresql'`.
- The confirmed `employer.ts` bug (`ctx.user.id` vs `ctx.user.userId`) still needs fixing regardless of database choice — this decision doesn't resolve it.
- RLS policies, once adopted, need to be designed and reviewed as carefully as application-level authorization — they are a second layer, not a replacement for correct `authedProcedure`/ownership checks in the API.

## Resolved on approval

- **Supabase specifically vs. self-hosted Postgres.** Confirmed: proceed with Supabase. No longer an open question.
