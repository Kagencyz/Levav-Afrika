# Acceptance Review Protocol

**Owner:** Claude (Product Command). **Requirements:** Master PRD §42.3, §47

Codex returns `READY_FOR_REVIEW`. Claude returns exactly one of `ACCEPTED`, `DEFECTS_FOUND`, `BLOCKED_PRODUCT_DECISION`.

---

## The standing rule

> A feature is not accepted because a file exists, a page renders, a test passes or Codex says it is done.

Claude verifies against **acceptance criteria and runtime evidence**. Where Claude cannot verify a claim, the claim is a defect until evidence is supplied — not a benefit of the doubt.

## What Claude checks, in order

1. **Requirement coverage** — every requirement ID in the packet is addressed. Partial coverage is `DEFECTS_FOUND`, not "accepted with follow-up".
2. **Acceptance criteria** — each criterion checked individually against evidence, not against the implementation summary.
3. **Product semantics** — does it mean what the PRD says it means? A correct implementation of the wrong concept is a defect.
4. **Edge and required states** — loading, empty, error, permission, offline, poor network, mobile (§36, §47).
5. **Evidence and WRI integrity** — no UI path mutates a score; no participation auto-inflates readiness; provenance is recorded; snapshots are versioned.
6. **Privacy and entitlement** — protected data is enforced **server-side**. Claude specifically checks that the protected surface cannot be reached by direct API call with a non-entitled session. UI hiding is never sufficient.
7. **Language** — copy resolves through the copy module and matches `COPY_DICTIONARY.md`. Invented product copy is a defect (LANG-005).
8. **Test coverage** — business logic, permissions, transitions and negative security cases have automated tests.
9. **Regression risk** — auth, organisation membership, identity and deployment behaviour still work.

## Evidence Claude requires before accepting

| Claim | Acceptable evidence |
|---|---|
| "Tests pass" | Command output with counts, in the implementation report |
| "Typecheck passes" | Output of the both-projects gate, plus baseline delta |
| "The endpoint is protected" | A negative test that calls it unauthorised/unentitled and asserts the failure |
| "The empty state exists" | The state's copy key and where it renders |
| "It works on poor networks" | What was throttled and what happened |
| "Migration is reversible" | The down path, or an explicit statement that it is not and why |

## Defect report format

Numbered, each with the requirement ID, what was expected, what was observed, and why it matters. Severity:

- **S1 Blocking** — breaks a Master PRD invariant (evidence integrity, entitlement, identity, popularity-into-readiness, overclaiming). Never accepted, never deferred.
- **S2 Major** — acceptance criterion unmet.
- **S3 Minor** — quality issue that does not violate a criterion. May be accepted with a recorded follow-up.

Codex fixes S1 and S2 within the same packet and returns `READY_FOR_REVIEW` again. The cycle repeats until `ACCEPTED`.

## Definition of Done checklist (Master PRD §47)

A packet is accepted only when every applicable line is true and evidenced:

- [ ] Acceptance criteria met
- [ ] No regression to existing valid functionality
- [ ] Server-side permission and entitlement checks tested
- [ ] Migration documented and reversible where practical
- [ ] Loading, empty, error and permission states exist
- [ ] Mobile behaviour verified
- [ ] Poor-network behaviour considered
- [ ] Critical business logic has automated tests
- [ ] Audit and analytics events exist where required
- [ ] Security-sensitive paths have negative tests
- [ ] Admin or support workflow documented where required
- [ ] Product copy does not overclaim, and uses governed keys
- [ ] AI output failure states handled
- [ ] Evidence changes are auditable
- [ ] Protected WRI cannot be bypassed by direct URL or API call
- [ ] Claude has marked the packet ACCEPTED
