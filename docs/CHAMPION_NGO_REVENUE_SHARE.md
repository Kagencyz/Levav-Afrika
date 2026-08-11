# Champion → NGO Revenue Share — Design (not yet built)

Status: **Design only.** Nothing in this document is implemented. Per an explicit
product decision (2026, captured in `docs/DECISIONS.md`), this mechanic is being
designed now and built later, after the QuickWork rebuild and ahead of the social
feed / Impact org dashboards.

## 1. The idea in one sentence

A Levav Champion can designate one NGO — from the NGOs listed on Levav Impact — to
automatically receive a fixed percentage of the revenue their paid Content Studio
courses generate, so a Champion's success on the platform directly funds causes on
Levav Impact without the Champion having to do anything manual per sale.

## 2. Why this belongs on Levav, not as a bolt-on

- Champions already sell paid courses through Content Studio (`src/pages/ContentStudio.tsx`),
  which today is 100% localStorage/mock — no real payments exist yet (see
  `docs/CURRENT_STATE.md`). This mechanic assumes real payments exist first.
- Levav Impact already lists NGOs and volunteering opportunities (currently mock —
  see the Impact gap notes in `docs/UPGRADE_GAP_REPORT.md`). This mechanic is the
  first real money flow between the "Contribution" and "Prosperity" ends of the
  Levav journey (Potential → Capability → Contribution → Opportunity → Prosperity →
  Development), and should not be built before both sides (paid content + NGO
  directory) are backed by a real database.
- It's a retention and brand mechanic as much as a charitable one: a Champion's
  public profile can show "X% of my course revenue supports [NGO]," which is a
  differentiator for why someone becomes a Champion in the first place.

## 3. Prerequisites before this can be built

This is explicitly **not buildable yet** because it depends on infrastructure that
does not exist:

1. **Real payments.** There is currently no payment processor integration anywhere
   in the codebase. Course "purchases" are not implemented at all — Content Studio
   only lets a Champion author and preview courses. A payment flow (subscription or
   one-off) must exist before there is any revenue to split.
2. **Real NGO directory.** Levav Impact's organizations are mock data. NGOs need to
   be real, verified records with a payout destination (bank account / mobile money)
   before Levav can send them anything.
3. **Real Champion status.** `user.role === 'champion'` today is set client-side
   with no verification step wired to a backend (`ChampionApply.tsx` collects an
   application but there's no admin approval pipeline backed by the database yet).
4. **The backend generally.** Per `CLAUDE.md`, `api/`/`server/` is real code that has
   never been run in production. This feature cannot exist as a "prototype" — money
   changing hands is exactly the kind of feature that must not be faked with
   localStorage, per the project's own security rules.

## 4. Proposed data model

New tables (Drizzle/Postgres, additive to `db/schema.ts`):

```
championNgoDesignations
  id                uuid PK
  championUserId    uuid FK -> users.id
  ngoId             uuid FK -> organizations.id (or a new `ngos` table if NGOs
                                                  aren't modeled as `organizations`)
  sharePercentage   numeric(5,2)   -- e.g. 5.00 for 5%. Bounded 0.00–50.00 at the
                                       DB constraint level; product default 5–10%.
  status            enum('active','paused','revoked')
  createdAt         timestamp
  updatedAt         timestamp

  -- One active designation per champion at a time in v1 (simplicity). A champion
  -- changing their NGO deactivates the old row and creates a new one, preserving
  -- history for the audit trail below rather than mutating in place.

revenueShareTransactions
  id                uuid PK
  championUserId    uuid FK -> users.id
  ngoId             uuid FK -> organizations.id
  designationId     uuid FK -> championNgoDesignations.id
  sourceType        enum('course_purchase')   -- extensible later (subscriptions, etc.)
  sourceId          uuid                       -- the course purchase/order row
  grossAmountCents  integer
  sharePercentage   numeric(5,2)               -- snapshot at time of transaction,
                                                   not a live join, so historical
                                                   payouts are correct even if the
                                                   champion later changes their %
  shareAmountCents  integer                    -- computed: gross * sharePercentage
  currency          text                       -- e.g. 'ZMW'
  payoutStatus      enum('pending','batched','paid','failed')
  payoutBatchId     uuid FK -> ngoPayoutBatches.id, nullable
  createdAt         timestamp

ngoPayoutBatches
  id                uuid PK
  ngoId             uuid FK -> organizations.id
  periodStart       date
  periodEnd         date
  totalAmountCents  integer
  status            enum('pending','sent','confirmed','failed')
  payoutReference   text        -- external processor reference, once sent
  createdAt         timestamp
  sentAt            timestamp nullable
```

Design choices worth flagging:

- **Percentage is snapshotted per transaction**, not derived live from the current
  designation. A Champion who later drops their share from 10% to 5% must not
  retroactively change what past buyers' money already funded.
- **Payouts are batched**, not sent per-transaction. Real payment processors and
  mobile money rails charge per transfer; batching weekly/monthly per NGO is both
  cheaper and gives NGOs a predictable statement instead of a stream of tiny
  transfers.
- **One active designation per Champion in v1.** Splitting a single sale across
  multiple NGOs is a real future ask but adds meaningfully to both the data model
  and the UI (percentage-of-percentage math, rounding edge cases) for a v1 that
  should ship narrow.

## 5. Proposed flow

1. **Opt-in, not default.** A Champion is never auto-enrolled. On becoming a
   Champion (post-approval), they see an optional prompt: "Support a cause with
   part of your course revenue" with a link to set it up later from Champion
   settings — never a blocking step in onboarding.
2. **NGO selection** is a picker over the *verified* NGOs on Levav Impact only —
   not free text, not any organization. This avoids a Champion "designating" an
   NGO that has no relationship with Levav and no way to receive the funds.
3. **Percentage selection** from a small preset list (e.g., 5% / 10% / 15%) rather
   than a free-form field, to keep the payout math and the Champion's own take-home
   expectations simple and to avoid a Champion accidentally fat-fingering "50%".
4. **Transparency, both directions:**
   - On the Champion's public profile: "5% of proceeds from my courses support
     [NGO name]" with the NGO's logo — a visible trust signal for buyers.
   - On the NGO's Levav Impact page: an aggregate, non-identifying "Supported by N
     Champions" and running total, not a per-transaction ledger (buyer privacy).
   - The Champion gets a private dashboard panel showing their own contribution
     total over time, sourced from `revenueShareTransactions` where
     `championUserId = self`.
5. **At time of purchase:** when a course purchase completes, the same transaction
   that records the Champion's earnings also writes a `revenueShareTransactions`
   row computed off the Champion's *currently active* designation (if any) at
   that moment. If a Champion has no active designation, no row is written —
   the share simply isn't collected, it does not default to Levav or sit
   unallocated.
6. **Payout batching (async job, not part of the purchase request path):** a
   scheduled job aggregates `pending` transactions per NGO per period into a
   `ngoPayoutBatches` row, sends the transfer via whatever payment rail Levav
   integrates with the NGO, and updates status.

## 6. Authorization / audit rules (per this repo's existing security posture)

`docs/SECURITY_AUDIT.md` already flags missing authorization checks on other
money/state-changing endpoints (`application.ts#updateStatus`,
`notification.ts#create`, `upload.ts#getPresignedUrl`). This feature must not
repeat that pattern. Concretely, once built:

- Only the authenticated Champion may create/update/revoke their own designation
  (`championUserId` must equal `ctx.user.userId`, not client-supplied).
- Only platform admins may create/verify NGOs eligible to receive designations —
  a Champion cannot self-designate an unverified organization.
- `revenueShareTransactions` are system-written only (from the purchase-completion
  path), never client-writable — no endpoint should let anyone create or edit
  a transaction row directly.
- Every payout batch needs an audit trail (who/what triggered it, which processor
  reference came back) — reuse the pattern already established in
  `src/lib/auditService.ts` rather than inventing a second logging mechanism.
- Money math (percentage → cents) is done in integer cents server-side only, never
  trusted from the client, and never done in floating point.

## 7. What "build later" concretely means

Do not start implementation until, at minimum:
1. Real payments exist for Content Studio course purchases (a separate, prior
   project — this doc explicitly depends on it and is not a substitute for it).
2. The NGO directory on Levav Impact is backed by real, verified database records
   with a payout contact, not `MOCK_*` data.
3. Champion approval is a real, backend-verified workflow.

When those land, this document's data model and flow are the intended starting
point for implementation — but should be re-validated against whatever payment
processor gets chosen, since processor-specific constraints (minimum payout
amounts, supported payout methods for Zambian NGOs specifically) will shape the
batching logic in section 5.
