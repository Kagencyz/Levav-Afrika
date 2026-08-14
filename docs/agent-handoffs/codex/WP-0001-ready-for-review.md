# WP-0001 — READY_FOR_REVIEW

- **Packet:** WP-0001
- **Classification:** MODIFY / REMOVE
- **Implementation:** authority reset, historical-document archive, dead-router and dead-contract removal, explicit audit-control unavailable state, retired local-data cleanup.
- **Migrations:** None.
- **API:** No reachable API change; exact registered procedure set preserved.
- **Security:** Removed hazardous unregistered router implementations and the orphan upload caller; retained exact router allowlist; did not change auth, sessions, RLS, or grants.
- **Privacy:** `levav_audit_log` is removed on application load and no replacement key is written.
- **Known limitation:** Server-side audit logging remains unimplemented, now disclosed accurately in the admin UI.
