# Career taxonomy

WP-0101 introduces versioned reference data for career families, canonical roles, industries,
and regional role aliases. It does not modify `talents.category`; WP-0103 owns that migration.

## Data model

Every taxonomy row carries `version`, `active`, and `supersedes_id`. Values are replaced by
inserting a new version and marking the earlier row inactive; rows are never deleted. Career
and industry remain separate dimensions. `taxonomy_audit_log` records each administrative
write with actor, action, before/after state, entity and timestamp.

The seed contains 16 career families, 80 roles across five fixed seniority bands, 13
industries, and initial Zambian aliases. The migration explicitly grants public SELECT,
enables RLS, grants the restricted `levav_app` role only the operations the server uses, and
revokes DELETE. The matching rollback script is `db/rollbacks/0006_heavy_maria_hill.sql`.

## API

The public `taxonomy` router lists current families, roles and industries. `resolveTitle`
normalises a title, performs deterministic exact/alias/trigram matching, and returns ranked
candidates together with the person's original title unchanged. It never writes or assigns a
role. Unknown titles return no candidates and emit an anonymous `taxonomy.title.unresolved`
event. Input length is capped and calls are rate-limited per request IP.

Administrative creation and role supersession use `adminProcedure`; the platform access level
is checked server-side before any database operation. Each successful write and supersession
is performed in one transaction with its audit record.

## Applying and reverting

Apply `db/migrations/0006_heavy_maria_hill.sql` through the repository's normal Drizzle/Supabase
migration process after review. To revert before dependent Sprint 1 migrations land, run the
matching rollback script. It deliberately leaves `pg_trgm` installed because it may predate
this packet or be shared by other features.
