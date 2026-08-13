# Implementation State

## Sprint 0

### WP-0001 — Repository truth and authority reset

**Status:** ACCEPTED (2026-08-12)

The repository authority instructions now describe the real Postgres/Supabase and tRPC architecture. Superseded planning and audit documents are retained under `docs/archive/` and are not current implementation authority.

The eight unregistered legacy routers, their orphaned upload client/helper, the unused contracts module, and the browser-local audit-log implementation have been removed. The registered tRPC surface remains unchanged and is protected by an exact allowlist test.

The Admin Audit Logs tab remains reachable but explicitly states that no audit trail is being recorded. The retired `levav_audit_log` browser key is cleared once during application startup through the shared retired-state cleanup path.

No database migration or reachable API change is included in this packet. Authentication, cookie handling, RLS, and grants are unchanged.

### WP-0003 — Remove client-side WRI scoring

**Status:** IN_PROGRESS

The client-side scoring engine and its direct mutation calls have been removed. The retired `wri_score` browser value is cleared on application startup. Learn, Feed, QuickWork, Impact, Levav 28 and onboarding actions no longer award readiness points; the public profile preview and Skill Gap score cards now avoid fabricated numeric readiness.

Application-wide removal of remaining mock WRI displays is still in progress. This packet is not ready for Product Command review yet.
