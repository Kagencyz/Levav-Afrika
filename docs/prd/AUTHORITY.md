# Document Authority — Levav v4.1

**Owner:** Claude (Product Command). Codex must not edit this file.

## Authority order (Master PRD §1)

1. `docs/prd/SEND_TO_BOTH_Levav_Master_PRD_v4_1.pdf` — the Master PRD v4.1. **Authoritative.**
2. Approved Product Decision Records in `docs/decisions/DECISION_LOG.md`.
3. The current repository and verified runtime — what exists today.
4. Implementation State documents — what is working, partial, mocked, broken or deferred.
5. Agent instruction files (`CLAUDE.md`, `AGENTS.md`) — how the agents operate. These never override product requirements.

`docs/prd/MASTER_PRD_v4.1.extracted.txt` is a plain-text extraction of the PDF, published so the PRD is greppable from the repository. Where extraction and PDF differ, **the PDF wins**.

## What this supersedes

The Master PRD v4.1 supersedes the implementation authority of Levav PRD v3.0, the v3.3 Dual-Agent Blueprint, and every earlier brief or audit note where they conflict. It does **not** supersede verified runtime evidence about what the code does today.

## Write ownership (Master PRD §41)

| Claude writes | Codex writes |
|---|---|
| `CLAUDE.md`, `docs/prd/`, `docs/product/`, `docs/decisions/`, `docs/qa/`, `docs/agent-handoffs/claude/`, `specs/` | `AGENTS.md`, `src/`, `server/`, `api/`, `db/`, tests, `scripts/`, build/CI/deploy config, `docs/implementation/`, `docs/agent-handoffs/codex/` |

No file has simultaneous write ownership. When approved product text must land in a Codex-owned file, Claude records it in a Work Packet and Codex applies it.

## Audit vocabulary (Master PRD §1.1)

KEEP · ENHANCE · MODIFY · COMPLETE · BUILD · REMOVE · DEFER

## Non-negotiable preservation rule (Master PRD §1.2)

Working authentication, organisation membership, database foundations, deployment configuration and security controls are preserved unless a **verified defect** requires change. No agent replaces a working architecture to match an older document's example.
