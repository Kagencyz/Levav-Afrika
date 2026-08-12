# specs/

Claude-owned product contracts (Master PRD §41). Codex reads these and implements them; Codex does not edit them.

| Directory | Contents | Arrives |
|---|---|---|
| `scenarios/` | Levav 28 scenario definitions against the approved scenario schema — role, industry, seniority, facts, personas, difficulty, branch constraints, expected evidence artefacts (L28-007) | Sprint 4 |
| `rubrics/` | Behaviourally Anchored Rating Scales per WRI dimension, versioned. Anchors describe observable behaviour, never vague adjectives (WRI-005) | Sprint 3–4 |
| `product-contracts/` | Product-level contracts Codex implements against: evidence event shapes, WRI snapshot structure, entitlement matrix, visibility policy | **`EVIDENCE_GRAPH_CONTRACT_v1.md` is live.** WRI snapshot contract next (Sprint 3) |

`scenarios/` and `rubrics/` are empty; content follows the build sequence in Master PRD §46.

**Read the Evidence Graph contract before any Sprint 2 work.** It is binding on the schema, and §43 forbids building WRI before it is stable — so it is also the gate on Sprint 3.

**Rubric confidentiality:** scoring rubrics and internal weights are never exposed to employers or users (SEC-011). Anything published here is internal.
