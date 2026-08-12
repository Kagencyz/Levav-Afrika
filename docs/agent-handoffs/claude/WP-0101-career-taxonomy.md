# WP-0101 — Career taxonomy

**Status:** READY_FOR_BUILD · **Sprint:** 1 · **Owner after handoff:** Codex
**Requirement IDs:** ONB-002, GRAPH-001, GRAPH-003, DATA-MODEL-001, LANG-002
**Audit classification:** BUILD · **Related decisions:** PDR-0011

---

## Product problem

`talents.category` is a free `varchar(120)`. Every career signal in Levav — onboarding, matching, Levav 28 personalisation, Role Fit, Workforce Graph, institutional aggregation — depends on knowing what work a person does. Free text cannot support any of it: "Accountant", "accountant", "Snr. Accountant" and "Chief Accountant (Mining)" are four unrelated strings.

ONB-002 also requires the taxonomy to represent the actual African economy, not a technology-sector list with agriculture bolted on. Zambia's workforce is mining, agriculture, construction, trade, public administration, education, health, logistics and hospitality before it is software.

The requirement that makes this hard is the last clause of ONB-002: **local job titles must map to canonical roles without erasing local language or context.** A person who calls themselves a "Bursar" or a "Camp Manager" must not be told they are wrong, and must not be silently relabelled.

## User journey

A person selects their career family and role during onboarding. If their own job title is not in the list, they enter it in their own words, and Levav maps it to a canonical role while keeping what they typed. Their profile shows their title; the system reasons over the canonical role. Neither is lost.

## In scope

1. **Taxonomy tables** — versioned, admin-managed, not hard-coded in `src/`:
   - `career_families` — the top level (e.g. Finance and Accounting, Agriculture, Mining and Extractives, Construction and Built Environment, Health, Education, Public Administration, Technology, Logistics and Supply Chain, Trade and Retail, Hospitality and Tourism, Creative and Media, Professional Services, Manufacturing, Energy and Utilities, Social and Community).
   - `career_roles` — canonical roles within a family, each with a seniority band.
   - `industries` — separate from career family. A finance officer can work in mining; conflating the two loses exactly the signal employers need.
   - `role_aliases` — local and colloquial titles mapping to a canonical role, with the language or region they come from.
2. **Versioning** (GRAPH-001) — every taxonomy row carries a version and an active flag. Values are superseded, never edited in place, so a profile captured last year still resolves to what it meant then.
3. **Seed data** — a first pass covering the families above with roles at three seniority bands (entry, mid, senior). Breadth over depth: better to cover sixteen families shallowly than three exhaustively.
4. **Read API** — list families, list roles by family, list industries, and resolve a free-text title to candidate canonical roles.
5. **Own-title preservation** — the resolve endpoint returns candidates; it never auto-assigns. The caller stores both the canonical role id and the user's own title verbatim.
6. **Admin write path** — server-side, `accessLevel = 'admin'` only, audited.

## Out of scope

- AI-assisted mapping (PDR-0011). Resolution in this packet is deterministic — exact match, normalised match, alias match, then trigram or equivalent fuzzy match. No model.
- Skills taxonomy. Skills stay `jsonb` on `talents` this sprint; a real skills graph is Sprint 9.
- Compensation mapping, Role Fit, matching. Later sprints consume this; none of it is built here.
- Migrating existing `talents.category` values. That happens in WP-0103 where the profile is reshaped.

## Existing behaviour to preserve

- `talents.category` keeps working until WP-0103 replaces it. This packet **adds**; it does not alter `talents`.
- Auth, onboarding and the registered router set are untouched.
- 56 tests keep passing.

## Acceptance criteria

1. Four tables exist with a reversible migration, RLS enabled, following the existing `levav_app` grant pattern in `db/schema.ts`. No DELETE grant.
2. Every taxonomy row carries a version and an active flag; superseding a value leaves the old row readable.
3. Seed covers at least 16 career families, at least 8 industries, and at least 5 roles per family across three seniority bands.
4. The seed is African-first: agriculture, mining, construction, trade, public administration, health and education are present as first-class families, not sub-items of "Other".
5. Reads are public (unauthenticated) — onboarding needs them before a session exists in some flows. Writes require `accessLevel = 'admin'`, enforced **server-side**, with a negative test proving a standard user cannot write.
6. `resolveTitle("Bursar")` returns ranked candidate roles and **never** mutates anything. A test asserts at least three local Zambian titles resolve to sensible candidates, and that an unrecognised title returns an empty candidate list rather than a wrong guess.
7. Admin taxonomy changes write an audit row (actor, action, before, after, timestamp).
8. `npm run typecheck`, `npm test` and `npm run build` pass; frontend baseline does not grow.

## Data requirements

New tables only. `talents` is not modified. The migration is reversible. Seed data ships as a migration or a documented seed script, not as a `src/` constant — a taxonomy hard-coded in the frontend cannot be versioned or admin-managed, which fails ONB-002.

## Privacy requirements

Taxonomy is reference data and contains no personal data. `role_aliases` must not accumulate user-submitted free text automatically — an unrecognised title entered by a user is stored on **their profile**, not promoted into the shared alias table. Promotion is an admin action, so one person's typo does not become everyone's vocabulary.

## Security considerations

- Writes are admin-only and server-enforced; UI hiding is not sufficient.
- `resolveTitle` takes user input — parameterise the query and cap input length. A fuzzy-match endpoint on unbounded input is a denial-of-service surface.
- Rate-limit `resolveTitle` (SEC-008); it is public and called per keystroke if the UI debounces poorly.

## Analytics and event requirements

Emit `taxonomy.title.unresolved` with the normalised title (no user identifier) when `resolveTitle` returns nothing. That is the backlog for the next taxonomy version, and it is how the seed stops being a guess. No personal data on the event.

## UI states

None — this packet is data and API. The onboarding UI that consumes it is WP-0102. Do not build taxonomy UI here.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | List families unauthenticated | Returns active families for the current version |
| 2 | Standard user attempts a taxonomy write via direct API call | Rejected server-side |
| 3 | Admin supersedes a role | Old row still readable; profiles referencing it still resolve |
| 4 | `resolveTitle("Bursar")`, `("Camp Manager")`, `("Marketeer")` | Ranked candidates, nothing mutated |
| 5 | `resolveTitle("qwertyuiop")` | Empty candidates; `taxonomy.title.unresolved` emitted |
| 6 | `resolveTitle` with a 10,000-character input | Rejected on length, no timeout |
| 7 | Migration down | Clean revert; `talents` unaffected |

## Dependencies

None. Blocks WP-0102 and WP-0103.

## Open product decisions

1. **Seniority band vocabulary.** Proposed: entry, mid, senior, lead, executive. If Codex has a reason to prefer another set, propose it — but it must be a fixed enum, not free text.
2. **Whether `industries` should be hierarchical** (sector → sub-sector). Proposed flat for Sprint 1, extensible later. Flat is reversible; a wrong hierarchy is not.

Neither blocks the packet; implement the proposal and note it in the report.
