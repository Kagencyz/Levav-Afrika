# WP-0101 — READY_FOR_REVIEW

## What was built

- Four versioned taxonomy tables plus an append-only taxonomy audit table, RLS policies,
  explicit grants, no DELETE privilege, generated Drizzle metadata, and a rollback script.
- African-first seed: 16 families, 80 roles, 13 industries, and Zambian aliases including
  Bursar, Camp Manager and Marketeer.
- Public reads and deterministic `resolveTitle`, with exact, alias and trigram ranking,
  bounded input, per-IP throttling, original-title preservation and anonymous unresolved-title
  events.
- Server-enforced admin creation for each taxonomy entity and audited role supersession.

## Product decisions applied

- PDR-0011: no AI inference. Resolution is deterministic and returns candidates for the person
  to confirm.
- PDR-0016: the response preserves `ownTitle` byte-for-byte and never auto-assigns a candidate.
- Seniority uses the proposed fixed five-band enum: entry, mid, senior, lead, executive.
- Industries are flat for Sprint 1 and independently versioned, as proposed.

## Acceptance evidence

1. Migration and rollback cover all new objects; every table has RLS and no DELETE policy or
   grant.
2. Every shared taxonomy row has version, active and supersedes fields; supersession inserts a
   new version and retains the old row.
3. Seed counts: 16 families, 80 roles, 13 industries; every family has five roles spanning at
   least entry, mid and senior.
4. Agriculture, mining, construction, trade, public administration, health and education are
   top-level families.
5. Public reads use `publicProcedure`; all writes use `adminProcedure`. A negative standard-user
   test proves the database transaction is never reached.
6. Tests resolve Bursar → Accountant, Camp Manager → Camp Manager, and Marketeer → Sales
   Representative while preserving the submitted title. Unknown input returns an empty list;
   10,000-character input is rejected before querying.
7. Positive supersession test proves inactive-old/new-version behaviour and an actor/action/
   before/after audit insert in the same transaction.
8. Validation results are recorded below after the complete gate run.

## Preserved behaviour

`talents.category`, auth, onboarding and every existing router remain unchanged. The taxonomy
router is an additive, explicitly allowlisted surface. There is no taxonomy UI in this packet.

## Limitations

The production migration is not applied by this branch. The in-process rate limiter is suitable
for the current single-function deployment but must move to shared infrastructure if the API is
deployed across independently scaled regions. No AI inference or user-title promotion occurs.
