# WP-0104 — Secure account email change

**Status:** READY_FOR_BUILD · **Sprint:** 1 · **Owner after handoff:** Codex
**Requirement IDs:** PROF-004, AUTH-001, SEC-006, SEC-010, SEC-008, LANG-003
**Audit classification:** BUILD

---

## Product problem

A member cannot change their account email address. That is a basic account capability, and its absence has a specific consequence in Levav: people lose access to accounts when they leave a job whose email they signed up with, or when a personal address changes. Losing the account means losing the evidence and readiness history attached to it — and PROF-002 requires the Levav ID to be a *durable* identity anchor.

PROF-004 states the principle precisely: **email is a credential and a contact field, not an identity.** Changing it must move nothing else. The same person, the same Levav ID, the same evidence, the same organisation memberships.

This is the most security-sensitive packet in Sprint 1. An email-change flow is a standard account-takeover target: compromise a session, change the address, own the account. The controls below are not optional hardening.

## User journey

A member opens account settings, enters a new address, and re-authenticates. Levav sends a confirmation link to the **new** address. The current address stays authoritative until that link is used, and a notice goes to the **old** address telling them a change was requested and how to stop it. Once confirmed, the new address is the credential. Their Levav ID, evidence, WRI history and memberships are untouched.

## In scope

1. **Email change request** — authenticated, requiring re-authentication (password or equivalent) at the moment of request, not merely a valid session.
2. **Verification of the new address** before it becomes authoritative. The old address remains the working credential until then.
3. **Notification to the old address** when a change is requested, including how to revoke.
4. **Revocation window** — the change can be cancelled from the old address until it is confirmed.
5. **Identity preservation** — `users.id` and every FK relationship survive unchanged. Only `users.email` and the Supabase Auth record change.
6. **Supabase Auth alignment** — `auth.users.email` and the app's `users.email` must not drift. The existing email-sync trigger is the mechanism; confirm it covers the change path, and if it does not, extend it rather than writing the app row directly.
7. **Audit** — request, confirm, revoke and failure all recorded server-side with actor, timestamp and both addresses.
8. **Session handling** — decide and implement what happens to other active sessions on confirmation. Recommended: invalidate them, because the common cause of an unexpected change is a compromise.

## Out of scope

- Phone number, MFA enrolment, password change, account deletion. Related, separately scoped.
- Organisation contact email (`organizations.contactEmail`) — a different field with different rules.
- Email preferences and notification settings.
- Social or SSO identity linking.

## Existing behaviour to preserve

- `users.email` has `users_email_unique` and a `users_email_normalized` check constraint (`email = lower(email)`). Both must hold after a change — normalise before writing.
- `users.id` is FK'd to `auth.users.id` and written only by the `handle_new_user()` trigger. **This packet must not write `users.id` under any circumstance.**
- Registration, login, logout and `me` behave identically.
- The 56 existing tests keep passing.

## Acceptance criteria

1. Changing an email requires **re-authentication at the time of request**. A valid session alone is insufficient. Negative test: a request with a valid session but no re-auth is rejected.
2. The new address is not authoritative until confirmed. Until then, login works with the **old** address only. Test both.
3. A confirmation link is single-use, time-limited and bound to the requesting user. Negative tests: reuse, expiry, and use by a different session.
4. The old address receives a notice on request, with a working revocation path. Revoking cancels the pending change and invalidates the token.
5. After a completed change: `users.id` is unchanged; `talents`, `user_onboarding` and `organization_members` rows still resolve to the same person. Assert by id, not by email.
6. `auth.users.email` and `users.email` match after the change. No drift path exists.
7. Changing to an address already registered fails cleanly, **without disclosing whether that address has an account** — the error is the same as any other rejection.
8. The endpoint is rate-limited (SEC-008). Test the limit.
9. Every request, confirmation, revocation and failure writes an audit record server-side.
10. All copy comes from `account.email.change.*` in `COPY_DICTIONARY.md` §1.
11. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

A pending-change record: user id, new address (normalised), token hash — **never the raw token** — requested-at, expires-at, consumed-at, revoked-at, and the requesting context. One active pending change per user; a new request supersedes and invalidates the previous one.

No change to `users` beyond the `email` value itself.

## Privacy requirements

- The new address is personal data and is not exposed on any public surface.
- The notice to the old address should not disclose the full new address — partial masking is sufficient to let the owner recognise whether they initiated it.
- Audit records are retained under SEC-010 and are readable only by privileged, audited paths. **Note:** there is no server-side audit store yet — PDR-0009 removed the fake one. If this packet lands before the real audit system, write to structured server logs with a correlation id and record in `docs/implementation/` that these events must migrate into the audit store when it exists. Do not build a substitute audit table as a side effect of this packet; return `BLOCKED_PRODUCT_DECISION` if that seems necessary.

## Security considerations

This is the section to over-deliver on.

- Re-authentication is mandatory and server-verified.
- Tokens: cryptographically random, stored hashed, single-use, short-lived (proposed 30 minutes — confirm), constant-time comparison.
- No user enumeration through timing or message differences.
- Rate-limit per user and per IP.
- Invalidate other sessions on confirmation (see in-scope item 8).
- The confirmation endpoint must not accept a user id from the client — derive everything from the token.
- Never log the raw token or the full new address at any level.

## Analytics and event requirements

`account.email.change.requested`, `.confirmed`, `.revoked`, `.failed` — with a reason code on failure, no addresses in the payload. These are security-relevant and belong in the audit trail as well as analytics.

## UI states

| State | Copy |
|---|---|
| Settings entry point | `account.email.change.title`, `account.email.change.body` |
| Re-authentication | `account.email.change.reauth` |
| Pending confirmation | `account.email.change.pending` — current address still active, revocation offered |
| Confirmed | `account.email.change.done` |
| Rejected (in use, invalid, rate-limited) | Same non-disclosing message; explains the next safe action |
| Expired link | Explains expiry, offers a fresh request |
| Offline | `global.error.network.*`; nothing partially submitted |
| 360 px | Full flow usable |

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Full happy path | New address authoritative; login works with new, fails with old |
| 2 | Request without re-auth | Rejected |
| 3 | Login with new address before confirming | Fails; old address still works |
| 4 | Reuse a consumed link | Rejected |
| 5 | Use an expired link | Rejected with the expiry message |
| 6 | Use the link from a different user's session | Rejected |
| 7 | Revoke from the old address, then try the link | Rejected |
| 8 | Change to an already-registered address | Generic rejection; no enumeration; timing not distinguishable |
| 9 | Second request supersedes the first | First token invalid |
| 10 | Exceed the rate limit | Limited, with a clear message |
| 11 | After change, fetch profile/onboarding/memberships by user id | All resolve to the same person |
| 12 | `auth.users.email` vs `users.email` post-change | Identical |
| 13 | Whole flow at 360 px | Usable |

## Dependencies

None. Independent of WP-0101 … WP-0103 and may run in parallel.

## Open product decisions

1. **Token lifetime.** Proposed 30 minutes. Shorter is safer; too short is unusable on poor connections where email delivery lags (AFR-004). Implement 30 and note it.
2. **Invalidating other sessions on confirmation.** Recommended yes. If Codex sees a concrete reason not to, return `BLOCKED_PRODUCT_DECISION` rather than deciding silently — this is a security posture question, not an implementation detail.
3. **Whether re-authentication accepts a recent-login window** (e.g. authenticated within 5 minutes counts) rather than always prompting. Proposed: always prompt in Sprint 1. It is one extra step on a rare action, and the failure mode of getting it wrong is account takeover.
