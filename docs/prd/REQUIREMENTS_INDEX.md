# Requirements Index and Traceability

**Owner:** Claude. **Source of requirement IDs:** Master PRD v4.1.
Traceability chain: **Requirement ID → classification → Work Packet → acceptance → implementation**.

A requirement is only "done" when a Work Packet covering it has been marked ACCEPTED under `docs/qa/ACCEPTANCE_REVIEW_PROTOCOL.md`.

---

## Requirement families

| Prefix | Family | PRD § | Count | Current owner sprint |
|---|---|---|---|---|
| `LANG` | Product language and UX writing | 6.1 | 5 | Sprint 0 (WP-0004) + every packet |
| `AUTH` | Identity, roles, workspaces | 8 | 3 | Sprint 1 |
| `ONB` | Intelligent onboarding | 9 | 3 | Sprint 1 |
| `PROF` | Profile and Levav ID | 10 | 4 | Sprint 1, extended Sprint 8 |
| `EVD` | Evidence Graph | 11 | 4 | Sprint 2 |
| `WRI` / `WRI-GOV` | Readiness index and governance | 12 | 5 + 1 | Sprint 3 |
| `L28` | Levav 28 | 13 | 9 | Sprint 4 |
| `QW` | QuickWork | 14 | 10 | Sprint 5 |
| `EMP-TAL` | Employed talent journey | 15 | 4 | Sprint 6 |
| `EMP` | Employer Intelligence | 16 | 6 | Sprint 6 |
| `HIRE` | Hiring and post-hire | 17 | 4 | Sprint 7 |
| `JOB` | Jobs and matching | 18 | 3 | Sprint 6 |
| `COMP` | Compensation Intelligence | 19 | 3 | Sprint 9 |
| `IMPACT` | Levav Impact | 20 | 5 | Sprint 8 |
| `LEARN` | Levav Learn | 21 | 4 | Sprint 8 |
| `CHAMP` | Champions | 22 | 2 | Sprint 8 |
| `FEED` | Professional Feed and Network | 23 | 8 | Sprint 8 |
| `GRAPH` | Workforce Graph | 24 | 3 | Sprint 9 |
| `DATA` | Institutional data | 25 | 4 | Sprint 9 |
| `MON` | Monetisation | 26 | 4 | Sprint 6+ |
| `TRUST` | Trust and evidence integrity | 27 | 2 | Sprint 10 |
| `AI` | AI architecture | 28 | 8 | Sprint 4+ |
| `SEC` / `PRIV` | Security and privacy | 29 | 12 + 1 | Continuous |
| `AFR` | Africa-first infrastructure | 30 | 10 | Continuous |
| `ENG` | Engineering direction | 31 | 5 | Continuous |
| `DATA-MODEL` | Data model rules | 33 | 3 | Sprint 2 |
| `EVENT` | Evidence event pipeline | 34 | 2 | Sprint 2 |
| `API` | API principles | 35 | 8 | Continuous |
| `OBS` | Observability | 37 | 7 | Sprint 10 |
| `CODEX` | Engineering behaviour | 45 | 7 | Continuous |

**Total: 172 numbered requirements.** Classification for each is in `docs/product/COVERAGE_MATRIX_v1.md`.

## Coverage summary at Sprint 0 close

| Class | Count | Meaning |
|---|---|---|
| KEEP | 12 | Satisfied today — chiefly identity, auth, stack direction, secrets handling |
| COMPLETE | 11 | Partially implemented, real foundation to build on |
| ENHANCE | 3 | Works, needs strengthening |
| MODIFY | 6 | Exists but behaves differently from the requirement |
| BUILD | 118 | Missing |
| REMOVE | 9 | Conflicts with approved direction — see below |
| DEFER | 13 | Valid, outside the active release |

**Honest reading:** roughly 15% of the Master PRD has a real foundation in the repository today. The identity and authentication layer is genuinely good and is the thing worth building on. Everything the product is *named* for — Levav 28, WRI, QuickWork, Impact, the Feed — exists only as frontend prototype with no server, no evidence and no audit trail.

## The nine REMOVE classifications

These conflict with approved product direction and must not be carried forward:

| Item | Requirement breached | Packet |
|---|---|---|
| Client-side WRI scoring engine (`levavData.ts` + `wriService.ts`) | WRI-001/003/004, EVD-001, §48 | WP-0003 |
| `feed-first-post` WRI rule | FEED-008 | WP-0003 |
| `impact-volunteer` WRI rule | IMPACT-002 | WP-0003 |
| `learn-lesson-complete` WRI rule | LEARN-002 | WP-0003 |
| `LEVAV28_DAYS` motivational content | L28-001…006 | Sprint 4 (PDR-0004) |
| Eight unreachable routers | SEC-004, ENG-005 | WP-0001 |
| `contracts/index.ts` | ENG-004 | WP-0001 |
| `src/lib/auditService.ts` (localStorage audit log) | SEC-005 | WP-0001 |
| `src/pages/MarketIntel.tsx` | COMP-003 | Sprint 9 or earlier removal |

## Work Packet register

| ID | Title | Requirements covered | Status |
|---|---|---|---|
| WP-0001 | Repository truth and authority reset | ENG-003/004/005, §1, §46 | READY_FOR_BUILD · **Amendment A2 2026-08-13** (router test guards reachability) |
| WP-0002 | Real verification gates and CI | §47.1, ENG-003, CODEX-005 | READY_FOR_BUILD |
| WP-0003 | Remove client-side WRI scoring | WRI-001/003/004, EVD-001, FEED-008, IMPACT-002, LEARN-002 | READY_FOR_BUILD |
| WP-0004 | Copy architecture foundation | LANG-002/003/004/005, AFR-008 | READY_FOR_BUILD |
| WP-0101 | Career taxonomy | ONB-002, GRAPH-001/003, DATA-MODEL-001 | READY_FOR_BUILD |
| WP-0102 | Intelligent onboarding | ONB-001/002/003, AUTH-001, LANG-002/003 | READY_FOR_BUILD |
| WP-0103 | Professional profile | PROF-001/002/003, AUTH-003, DATA-MODEL-003, SEC-004 | READY_FOR_BUILD |
| WP-0104 | Secure account email change | PROF-004, AUTH-001, SEC-006/008/010 | READY_FOR_BUILD |
| WP-0105 | Personal Home on real services | ONB-003, AUTH-001 | Scoped, **not issued** — awaits WP-0103 |
| WP-0106 | Organisation membership and verification | AUTH-002, EMP-001 | Scoped, **not issued** — awaits WP-0103 |
| WP-0201 | Evidence node storage, lifecycle, visibility | EVD-001…004, DATA-MODEL-001/003, AUTH-003, SEC-004 | READY_FOR_BUILD |
| WP-0202 | Event pipeline and sole ingestion writer | EVENT-001/002, DATA-MODEL-002, API-006 | READY_FOR_BUILD |
| WP-0203 | Dispute workflow | TRUST-002, EVD-002, WRI-GOV-001, SEC-010 | READY_FOR_BUILD |
| WP-0204 | Privacy and Evidence Centre | PRIV-001, AUTH-003, SEC-010, AFR-001/010 | READY_FOR_BUILD |
| WP-0301 | WRI model configuration | WRI-004, WRI-GOV-001, SEC-011, §49 | READY_FOR_BUILD |
| WP-0302 | Scoring and confidence engine (pure) | WRI-001/002/003/004/005, EVD-003, AFR-009 | READY_FOR_BUILD |
| WP-0303 | Snapshots and recalculation consumer | WRI-004, EVENT-001/002, OBS-002/003/006 | READY_FOR_BUILD |
| WP-0304 | Trajectory and Role Readiness | WRI-001/002, EMP-TAL-001/002/003 | READY_FOR_BUILD |
| WP-0305 | Member-facing WRI surfaces | WRI-001/003, LANG-003 | Scoped, **not issued** — awaits WP-0303 |

### Product contracts issued

| Contract | Governs | Gates |
|---|---|---|
| `specs/product-contracts/EVIDENCE_GRAPH_CONTRACT_v1.md` | Evidence node shape, levels, immutability, visibility, event pipeline | Sprint 2, and Sprint 3 via §43 |
| `specs/product-contracts/WRI_SCIENTIFIC_SPEC_v1.md` | Ten dimensions, BARS, confidence, snapshots, validation, fairness | Sprint 3 |

| `specs/rubrics/BARS_v1.md` | Rating instrument for all ten dimensions, versioned per dimension | Sprint 4 |

All ten BARS rubrics are authored. Scenario content in `specs/scenarios/` remains outstanding before Levav 28 ships (Sprint 4).

## Requirements blocked on human decision (Master PRD §49)

Neither agent may settle these as permanent policy:

| Requirement | Decision needed | PDR |
|---|---|---|
| L28-005 | Day 15 evidence-sufficiency threshold | PDR-0007 ESCALATED |
| QW-008 | Payment, escrow, dispute and fee model | PDR-0008 ESCALATED |
| WRI-004 | Final scale, evidence weights, confidence thresholds, recency rules | §49 — options to be prepared before Sprint 3 |
| EMP-004 | Plan names, prices, seats, WRI depth per plan | §49 — before Sprint 6 |
| COMP-001 | Compensation data providers and supported markets | §49 — before Sprint 9 |
| DATA-002 | Institutional cohort thresholds | §49 — before Sprint 9 |
| CHAMP-002 | Champion content rights and revenue share | §49 — before Sprint 8 |

Sprint 3, 5, 6 and 9 packets must implement these as **configurable, versioned parameters with clearly-labelled provisional defaults** — never as hard-coded truth (WRI-004, CODEX-006).

## Sequencing constraints (Master PRD §43)

Prohibited orderings, enforced by Claude when issuing packets:

- WRI before the Evidence Graph contract is stable → Sprint 3 cannot precede Sprint 2.
- Premium WRI UI before server-side entitlement design → no employer WRI surface before EMP-004.
- Workforce Intelligence on raw individual data before governance → Sprint 9 gated on DATA-001…004.
- Claude and Codex editing the same file, ever.
