# WP-0103 — Professional profile

**Status:** READY_FOR_BUILD · **Sprint:** 1 · **Owner after handoff:** Codex
**Requirement IDs:** PROF-001, PROF-002, PROF-003, AUTH-003, DATA-MODEL-003, SEC-004, LANG-002, AFR-002/003/010
**Audit classification:** COMPLETE · **Related decisions:** PDR-0001, PDR-0011

---

## Product problem

`talents` holds `name`, `bio`, `category`, `skills`, `location`. The Master PRD calls the profile "a professional evidence surface, not a decorated CV" and lists photo, cover, headline, experience, education, projects, certifications, links and visibility controls. None exist.

The requirement that shapes this packet is PROF-001: **claims and verified evidence must look different.** In Sprint 1 there is no verification system — the Evidence Graph is Sprint 2. So the honest position is that **everything on the profile is self-declared**, and the interface must say so. The temptation is to build a verified badge now and wire it later. That would ship a lie.

## User journey

A member opens their profile, adds a photo and cover image, writes a headline, records their experience and education, lists projects and links, and chooses what is public. Every item they added themselves is labelled as their own claim — not as something Levav confirmed. When verification arrives in Sprint 2, verified items gain a distinct treatment; nothing has to be relabelled, because claims were never dressed as evidence.

## In scope

1. **Extend the profile** — headline, about, photo, cover image, current role (FK to taxonomy) plus own title, experience entries, education entries, projects, certifications, links. Migrate `category` to the taxonomy fields from WP-0101 and retire the free varchar.
2. **Self-declared labelling** — every user-entered item carries an explicit self-declared state in the **data model**, not just the UI (DATA-MODEL-003). Sprint 2 sets some to verified; nothing here does.
3. **Visibility controls** — per-section public / signed-in / private, stored server-side and enforced server-side. Default is conservative: a new profile is not public until the member chooses.
4. **Image upload** — photo and cover, with compression, size limits, type restriction and server-side validation (SEC-007, AFR-003). Resumable or chunked where practical.
5. **Featured items** — the member selects which projects or links appear first (PROF-003).
6. **Public profile read** honouring visibility, exposing only approved fields (PROF-002).

## Out of scope

- **Any verified state, badge, or verification flow.** Sprint 2. Building the visual language for verification is in scope; populating it is not.
- **Any WRI, readiness, or score element** (PDR-0001). The profile shows `profile.wri.private` copy and nothing numeric.
- CV upload and parsing (PDR-0011).
- Recommendations, endorsements, structured reviews — they need the Evidence Graph.
- Feed integration and organisation pages — Sprint 8.
- Employer-facing profile views and entitlement — Sprint 6.

## Existing behaviour to preserve

- `createOwnProfile`, `updateOwnProfile`, `getOwnProfile`, `list`, `getById` keep working. `list`/`getById` are public reads today — they must **stay working while gaining visibility filtering**, which will change what they return. That is intended; state the behaviour change explicitly in the report.
- The 1:1 user↔talent invariant (`talents_user_id_unique`) is preserved.
- Existing profiles keep loading with new fields null.
- Auth, identity and the registered router set unchanged.

## Acceptance criteria

1. Reversible migration; RLS and grants follow the existing `talents` pattern; no DELETE grant.
2. Existing profiles load and render with every new field null. No forced re-entry.
3. `category` values are migrated to taxonomy fields where they map, and preserved as `self_described_title` where they do not. **No value is discarded.** State the mapping rate in the report.
4. Every self-declared item is marked as such in the database, and the UI labels it using `profile.evidence.selfdeclared*` copy. No verified badge exists anywhere in this packet.
5. Visibility is enforced **server-side**. Negative test: a direct API call for a private section of another member's profile returns nothing, regardless of UI.
6. A new profile is not publicly visible by default.
7. Image upload restricts type and size server-side, rejects a disguised file (wrong magic bytes with an image extension), and stores nothing executable. Negative test required.
8. Images are compressed and served at responsive sizes; the profile is fully usable with images unloaded (AFR-002).
9. Profile edit and view work at 360 px; verified/self-declared distinction does not rely on colour alone (AFR-010).
10. No WRI, score, or readiness element appears anywhere. `grep -in "wri" src/pages/TalentProfile.tsx` returns only the private-notice copy.
11. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Experience, education, projects and certifications are **separate rows, not JSON blobs** — Sprint 2 needs to attach evidence and provenance to an individual role or project, and a JSON array cannot be referenced by a foreign key. `skills` may stay `jsonb` this sprint; the skills graph is Sprint 9.

Each item carries: owner, self-declared state, visibility, created/updated timestamps, and a display order for featured items.

Images are stored in object storage with server-side validation; the row holds a reference, never the bytes.

## Privacy requirements

- AUTH-003: the profile is person-owned. No organisation gains access through employment. Nothing in this packet grants an org read path into a member's profile.
- Visibility is independent of existence (AUTH-003) — a hidden item still exists and is still the member's.
- Public reads expose only fields the member marked public. Confirm the public payload contains no email, no phone, no internal ids beyond what the URL needs.
- Deleting an item is a real deletion of a self-declared claim, which is legitimate in Sprint 1 — nothing here is evidence yet. Once Sprint 2 lands, EVD-002 forbids silent overwrite; note that boundary in the implementation report so it is not lost.

## Security considerations

- Every write is scoped to the calling user's own profile. Negative test for cross-user write.
- Upload: validate content type by magic bytes, cap dimensions and file size, strip EXIF (location data in a photo is a privacy leak the member did not choose), and never serve user content from the application origin if it can be avoided.
- Rate-limit uploads (SEC-008).
- `list`/`getById` are unauthenticated — confirm they cannot be used to enumerate private fields or to page through the whole user base.

## Analytics and event requirements

- `profile.section.updated` with the section name, no values.
- `profile.visibility.changed` with section and new level — this is a privacy-relevant action and belongs in the audit trail, not only analytics.
- `profile.image.uploaded` with type and resulting size.

## UI states

| Surface | States |
|---|---|
| Own profile | Empty (`profile.empty.*`), partial, complete, saving, save failed, offline |
| Each section | Empty with a specific next action; never a bare "Add" with no context |
| Images | No photo, no cover, uploading with progress, upload failed with retry, image failed to load |
| Visibility | Current level always visible on each section; changing it confirms what becomes visible to whom |
| Public profile | Viewed by a stranger — only public sections; viewed by the owner — a clear preview mode showing what others see |
| WRI area | `profile.wri.private` copy only. No number, no placeholder, no locked badge |
| 360 px | Full edit and view, no horizontal overflow |

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Existing profile loads post-migration | Renders; new fields null; no data lost |
| 2 | `category` = "Accountant" | Mapped to a canonical role; original preserved |
| 3 | `category` = "Bursar at a mission school" | Unmapped; kept verbatim as self-described title |
| 4 | Add experience, education, project, link | Each stored as its own row, self-declared, ordered |
| 5 | Set a section to private, fetch it as another user via direct API | Returns nothing |
| 6 | New profile, fetched by a stranger | Not publicly visible |
| 7 | Upload a `.png` that is actually a script | Rejected server-side |
| 8 | Upload a 40 MB photo | Rejected or compressed within limits, no timeout |
| 9 | Upload a photo containing GPS EXIF | EXIF stripped |
| 10 | Cross-user profile write via direct API | Rejected |
| 11 | Profile with images blocked | Fully usable |
| 12 | Edit and view at 360 px | No overflow, all actions reachable |

## Dependencies

**WP-0101 must be ACCEPTED** (taxonomy fields). Independent of WP-0102, though both consume the taxonomy — coordinate the shared field names rather than defining them twice.

Blocks WP-0105 and WP-0106.

## Open product decisions

1. **Object storage provider.** Supabase Storage is the obvious fit with the existing stack and needs no new vendor. Confirm in the report; if Codex proposes otherwise, it needs an adapter (API-004).
2. **Whether visibility is per-section or per-item.** Proposed per-section for Sprint 1 — simpler to reason about and to enforce. Per-item is a superset we can add without a rewrite if the data model carries visibility on the row, which criterion 4 already requires.
