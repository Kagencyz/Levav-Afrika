# Professional Feed and Network — Product Specification v1

**Owner:** Claude (Product Command). **Requirements:** FEED-001 … FEED-008, PROF-001 … 004, IMPACT-004, LEARN-003, CHAMP-001/002, TRUST-001/002, SEC-004/007/008/010, PRIV-001, AFR-001 … 004/007/010, LANG-001 … 005, §39, §48
**Sprint:** 8 · **Status:** APPROVED as product specification.
**Binding:** `LEVAV_LANGUAGE_SYSTEM.md`, `COPY_DICTIONARY.md` §7 and §15, `EVIDENCE_GRAPH_CONTRACT_v1.md`, `LEVAV_IMPACT_SPEC.md`, `CREATIVE_BRIEF.md` (visual direction only).

---

## 1. What this is

The daily professional surface of Levav. Where members maintain a real professional presence, publish work, discover opportunities and organisations, and see what is changing in their field.

It must feel **active, useful and inviting** — a place someone returns to without being nagged. And it must do that while remaining evidence-safe: **social popularity is never readiness**.

### 1.1 On familiarity, and one constraint

The interaction patterns of modern professional networks are well understood by the people Levav serves, and there is no value in making them relearn a feed. Levav should use those patterns: a composer at the top, cards in a column, inline engagement, a profile with a cover image and featured work, a notification centre.

Master PRD §39 sets the boundary: **no competitor brand, proprietary workflow or copied language belongs in the specification or the experience.** Learn the pattern; write our own words; build our own product. Every string in this spec comes from the Levav copy dictionary, and none of it borrows another product's vocabulary.

### 1.2 Premium is restraint, not weight

The instruction is that this must look genuinely beautiful and premium. The trap is that "premium" gets built as heavy — big imagery, elaborate motion, dense chrome — and Levav's users are on mid-range Android phones and metered data. A feed that is gorgeous on a MacBook and unusable in Kitwe has failed the requirement, not met it.

**Premium here means:** exceptional typography, generous and consistent spacing, a restricted palette used with discipline, motion that is fast and purposeful, and nothing on screen that is not doing work. §9 makes this measurable rather than aspirational.

## 2. Information architecture

Every route named here must exist and must be reachable from the routes indicated.

### 2.1 Member routes

| Surface | Route | Reached from |
|---|---|---|
| Feed | `/feed` | Primary navigation · Personal Home · post-onboarding for the `community` goal |
| Post detail | `/feed/posts/:id` | Any card · notification · shared link |
| Composer | modal from `/feed` | Composer entry on feed and Personal Home |
| Profile (own) | `/profile` | Avatar menu · Personal Home · own post author line |
| Profile (public) | `/p/:levavId` | Any author line, mention, search result, follow list |
| Edit profile | `/profile/edit` | Own profile · Personal Home prompt |
| Followers / Following | `/p/:levavId/followers`, `/following` | Profile counts |
| Notifications | `/notifications` | Primary navigation bell |
| Saved | `/saved` | Avatar menu · save confirmation |
| What is New | `/whats-new` | Primary navigation · feed view tab |
| Search | `/search` | Persistent search entry |
| Account settings | `/settings/account` | Avatar menu — includes secure email change (WP-0104) |
| Privacy | `/settings/privacy` | Avatar menu — links to Privacy and Evidence Centre |
| Blocked and muted | `/settings/blocked` | Privacy settings |

### 2.2 Organisation routes

| Surface | Route | Purpose |
|---|---|---|
| Organisation page | `/organisations/:orgId` | Public presence: about, updates, open opportunities, Impact programme |
| Organisation admin | `/org/:orgId` | Workspace home |
| Organisation posts | `/org/:orgId/posts` | Publish and manage updates under membership permissions |
| Organisation followers | `/organisations/:orgId/followers` | Public |

**Cross-links required:** author line → profile · organisation mention → organisation page · verified work card → the underlying record (QuickWork assignment, Impact contribution, Learn achievement) where the viewer is entitled · Impact opportunity card → `/impact/opportunities/:id` · profile Impact section → contribution records.

## 3. Professional presence (FEED-001, PROF-003)

- **Profile photo and cover image.** Both optional; the profile must look composed without either — a default state that looks broken punishes exactly the people least likely to have a professional headshot.
- **Headline, current role, location, about, selected expertise.**
- **Featured work** — the member chooses what appears first: projects, verified evidence, Impact contributions, pinned posts.
- **Edit controls connect to the canonical profile** (WP-0103). There is no second social identity and no duplicate profile record.
- **Verified and self-declared remain structurally distinct** (PROF-001), by shape and label, never by colour alone (AFR-010).
- **Organisation pages** for verified organisations, with posting under membership permissions.

## 4. Publishing (FEED-002)

Post types: text · images and compressed media · project and portfolio updates · documents or approved links · verified QuickWork completion cards where visibility permits · Levav 28 milestones that expose no rubric or score · Learn achievements · Impact stories from verified records · organisation and opportunity announcements.

**The composer**

- Opens in one tap, focused, with the text field ready. Nothing between intent and typing.
- Drafts autosave locally and survive a dropped connection (FEED-007, AFR-004).
- Media is compressed client-side before upload, with a visible size indication on metered connections.
- Attaching a verified item is an explicit choice from the member's own records — never automatic, never suggested by scanning their text.
- Post visibility is set at composition: public, members, followers.
- Edit and delete are available, subject to evidence-preservation rules where a post has been used as a verified artefact (FEED-002).

**What the composer must never do:** infer achievements, auto-generate a post from activity, or publish anything on the member's behalf.

## 5. Engagement and network (FEED-003)

Follow (one-way, no request) · reactions · comments · replies · save · share or repost with optional comment · mentions · topic tags · report · block · mute.

**Reactions** are a small, professional set with clear meaning — the set is an open decision in §12, but it is deliberately short. A long reaction palette turns a professional surface into a mood board.

**Comments and replies** are one level of nesting. Deeper threads are unreadable on a phone.

**Follows are public; follower counts are not prominent.** They appear on the profile, never on cards, never adjacent to any readiness surface (§7).

## 6. Discovery (FEED-004)

Views: **Following** · **For you** · **Opportunities** · **Learning** · **Impact** · organisation updates.

Personalisation may use declared interests, career context from the taxonomy, follows, location, skills and permitted activity signals.

**Never used as ranking signals:** WRI, dimension estimates, evidence confidence, protected assessment data, or any employer intelligence (FEED-004). These are not inputs to a social feed under any circumstance.

**Ranking principles:** recency matters, relevance to the member's declared career context matters, and engagement volume matters least. A post with many reactions does not outrank a directly relevant opportunity. Sponsored content, if introduced, is labelled at the same type size as the author name and can never displace genuine relevance (FEED-008).

## 7. Feed integrity — the hard boundary (FEED-008)

> Likes, reactions, follower counts, posting frequency and reach **never** affect WRI, Role Fit, Role Readiness, employer ranking, search order or matching.

Enforced structurally, not by policy:

- Engagement produces **no evidence node**. It is on the Evidence Graph contract §2.1 not-evidence list.
- No engagement metric is an input to any WRI computation. WP-0302's engine has no access to it.
- No follower count, reaction count or post count appears on any employer-facing surface, or on any screen showing a readiness value.
- **PDR-0010** (nominated written work samples as evidence) remains **PROPOSED** and is decided at Sprint 8. Until it is approved, no feed content becomes evidence by any route. If it is approved, the mechanism is nomination and rubric assessment — never publishing, and never engagement.

## 8. What is New — editorial specification (FEED-005)

**Editorial scope approved by the product owner, 2026-08-12. Recorded as PDR-0013.**

The ambition is that What is New becomes the surface a working professional in Zambia opens each morning — not a widget in the corner of a feed. That is achievable, because nobody is currently doing it well for this audience, and because Levav eventually holds workforce data nobody else has (§8.4).

### 8.1 Sections

| Section | What belongs in it | What must not |
|---|---|---|
| **Workforce and labour market** | Hiring patterns, sector demand, skills employers are actually asking for, wage and employment reporting from valid sources | Any figure Levav cannot source. COMP-003 forbids fabricated benchmarks and it applies here |
| **How the work is done** | Practical craft by function — finance, operations, marketing, engineering, teaching, clinical, trades. Concrete method, not theory | Listicles. "Ten habits of" is not craft |
| **Professional growth** | Career decisions, skill building, moving between roles and sectors, what a transition actually requires | Motivational content. See §8.2 — this section carries the highest risk of becoming a slogan farm |
| **AI and technology at work** | What AI actually changes about specific roles, practical adoption in organisations, what it costs, what fails | Hype, prediction, "AI will replace X" without evidence, vendor marketing reprinted as insight |
| **People and management** | Managing teams, difficult conversations, performance, hiring and onboarding practice, retention | Generic management platitude. If it would apply equally to any organisation on earth, it is not useful |
| **Leadership** | Decision-making under constraint, accountability, developing others, leading through change | Personality-cult profiles and success mythology |
| **Africa business context** *(added)* | Labour law and regulatory change, compliance affecting employers, business registration, tax and payroll change, market entry | Political commentary. Levav reports what affects work, not who should govern |
| **Sector spotlights** *(added)* | Mining, agriculture, construction, health, education, logistics, trade, hospitality — mapped to the WP-0101 career families | Nothing. This is the section that makes Levav relevant to people who do not work in offices, and it should be as good as the white-collar sections |
| **Opportunity notices** *(added)* | Scholarships, grants, bursaries, training programmes, certifications, funded development | Anything requiring payment to access an opportunity. Any unverified provider |
| **Building an organisation** *(added)* | Practical SME and startup operations — hiring the first employee, contracts, cash flow, structuring work | Founder mythology |
| **From Levav** | Product updates, verified organisation news, employer announcements | Marketing dressed as news |

The four added sections are my recommendation for what makes this a destination rather than a feature. **Sector spotlights** and **Africa business context** are the ones no general professional network serves — a mining supervisor in Kitwe and an SME owner navigating a payroll rule change have nowhere good to go, and serving them well is both differentiating and consistent with the product's purpose.

### 8.2 Editorial standard

Categories are easy; the quality bar is what makes a destination. Every card must satisfy all four:

1. **Specific.** It concerns a named role, sector, situation or change. "Improve your communication" fails. "What a monthly report should contain when your manager only reads the first page" passes.
2. **Actionable or decision-relevant.** The reader can do something differently, or decide something better. Awareness alone is not enough.
3. **Sourced or grounded.** Either an attributed external source, or Levav's own governed aggregate (§8.4). Never an unsourced assertion presented as fact.
4. **Honest about uncertainty.** Where something is contested or early, the card says so. Confident wrongness is the fastest way to lose a professional audience.

**Professional growth carries a specific hazard.** It is the section that most easily degenerates into aphorism, and the Language System §2.2 prohibition on empty inspiration is binding on it. If a card could be printed on a poster, it does not ship.

**AI and technology carries the opposite hazard.** Hype. No card may predict job displacement without evidence, reprint vendor material as insight, or treat a product launch as a workforce event.

### 8.3 Making it a place people return to

- **Relevance by career context.** Sections are ordered by the member's career family, seniority and declared interests from onboarding, not by engagement.
- **A predictable rhythm.** A dependable publishing cadence beats volume. People return to what is reliably there.
- **Save and read later**, with saved items available in `/saved`.
- **Offline reading** (AFR-002/004): a saved card's summary and attribution are readable without a connection. The original always requires the network, and the interface says so rather than failing silently.
- **An optional digest** — email or in-app, member-controlled frequency, never opt-out-by-default (LANG-003, AFR-006).
- **No streaks, no unread badges pressuring return, no "you missed" language.** A destination earns the visit.

### 8.4 The long-term differentiator

Once Sprint 9 delivers governed aggregate Workforce Intelligence, Levav can publish workforce insight **from its own data** — readiness patterns, skills gaps and demand by sector and geography that no other publisher has.

That is the real answer to "go-to place", and it is deliberately not available yet. It is gated on DATA-001 … DATA-004: aggregate only, minimum cohort thresholds enforced, no individual record inferable. **Publishing a Levav-derived statistic before those controls exist is prohibited**, and doing it carelessly once would cost the credibility the whole product depends on.

### 8.5 Who can publish into What is New

Levav does not have to write all of this, and should not. Members and content partners contribute — but What is New is an **editorial surface**, and that is the distinction which governs everything below.

| | Feed | What is New |
|---|---|---|
| Who publishes | Any member or verified organisation | Levav, plus **reviewed** contributions |
| Review | None before publication; moderation after | **Every card is reviewed before it appears** |
| What it means | This person said this | Levav put this in front of you |

That difference is the whole reason What is New can become a destination. An unreviewed feed of everyone's opinions already exists one tab away.

**Four contributor types:**

1. **Members (talents and professionals).** Any member may submit work for consideration — a practitioner's account of how something is actually done in their sector. Submission is from a post they already published, or written directly for What is New. The section that benefits most is *How the work is done*, which is better written by someone doing the work than by an editor.
2. **Content partners.** Organisations, publishers, training providers, professional bodies and subject specialists with a standing arrangement to contribute. Verified, named, and bound by the same editorial standard.
3. **Champions** (CHAMP-001/002). Verified high-value contributors are the natural standing contributor pool, and contributing here is one of the things Champion status is *for*. Champion status does not bypass review.
4. **Organisations**, on their own page and in *From Levav* where the update is genuinely of general interest — not marketing.

**Rules that apply to every contributor without exception:**

- **The §8.2 editorial standard applies identically.** A member's submission and a partner's submission clear the same bar as Levav's own. Specific, actionable, grounded, honest about uncertainty.
- **Attribution is always visible** — author name, and their organisation where relevant, linking to their Levav profile or organisation page.
- **Conflict of interest is declared on the card.** A software vendor writing about tooling in their category, a training provider writing about certification, a recruiter writing about hiring — the reader is told, on the card, not in a policy page. This is not optional and it is not a footnote.
- **No paid placement, ever.** Money never buys a What is New card. If sponsored content is ever introduced it is labelled and sits outside the editorial sections, and it can never displace genuine relevance (FEED-008, MON-001). A partnership arrangement buys *consideration*, never publication.
- **Contributing never affects readiness.** Not WRI, not Role Fit, not employer ranking, not search order. Publishing is not evidence (Evidence Graph §2.1), and PDR-0010 stays PROPOSED — decided at Sprint 8 — with nomination and rubric assessment as its only possible mechanism, never publication.
- **The contributor keeps ownership** of what they write and grants Levav a licence to publish and summarise it. They may withdraw it; withdrawal removes it going forward and does not rewrite history.
- **Partner status is revocable** and is reviewed on the same terms it was granted.
- **Corrections are visible.** A corrected card shows that it was corrected and when. Silent editing of a published card is prohibited — it is the same integrity principle as EVD-002.

**Submission flow:** submit → editorial review → accepted, returned with a reason, or declined. A decline is private to the contributor, never public, and never affects their standing anywhere in Levav.

**Response commitment:** contributors are told how long review takes and are notified of the outcome. Silence is the fastest way to lose good contributors, and it is the same failure the Impact spec designs against for applicants.

### 8.6 Rules for external news, without exception

- Publisher name and a link to the original on every card.
- No card without a source. No aggregated-without-attribution content.
- **AI summaries state that they are summaries, name the publisher, and never assert a fact not in the source** (AI-007). An AI-written news card with no source is prohibited outright.
- Levav never republishes an article's substance in a way that substitutes for reading the original.
- Republication rights are respected. Where a publisher's terms do not permit summary, Levav links without summarising.

## 9. Performance and Africa-first behaviour (FEED-007, AFR-001 … 004)

This is where "premium" is made measurable. **The Feed cannot ship onto the current 2,495 kB single bundle** — that is a blocking dependency, not a nice-to-have.

| Budget | Target |
|---|---|
| Feed route JS, gzipped, excluding shared vendor chunk | ≤ 120 kB |
| Initial feed render | Text and layout complete before any image loads |
| Largest Contentful Paint, simulated 3G, mid-range Android | ≤ 3.0 s |
| Feed images | Responsive sizes, modern formats, lazy-loaded below the fold |
| Avatar images | ≤ 15 kB at display size |
| Cover images | ≤ 120 kB at display size |
| Cumulative Layout Shift | ≤ 0.1 — media reserves its space before loading |
| Motion | ≤ 200 ms transitions; respects `prefers-reduced-motion` |

**Required behaviours:** low-data mode that loads text first and images on tap (`global.lowdata.*`) · graceful media failure that never breaks the card · pagination or bounded infinite scroll that does not trap the reader or consume data unasked · compose drafts preserved through ordinary interruptions · every action available offline-tolerant where the semantics allow.

## 10. Craft standards — what "premium" means concretely

Not a mood board. These are reviewable.

**Typography carries the design.** One family, a defined scale, no more than three weights on a surface. Body copy at a comfortable reading measure. Headline and metadata visually distinct by size and weight, not by decoration. Text is never placed over an image without a guaranteed contrast treatment.

**Spacing is a system, not a judgement.** A single spacing scale used consistently. Vertical rhythm consistent between cards. Generous whitespace is the primary premium signal available at zero bytes.

**Colour is restricted and disciplined.** The `CREATIVE_BRIEF.md` foundation — black and white with a controlled lime accent — holds. The accent marks one thing per view: the primary action. An interface where three elements compete for the accent has no accent.

**Motion is fast and purposeful.** Entry transitions under 200 ms. Motion communicates state change or spatial relationship, never decoration. Nothing animates on scroll for effect. Nothing loops.

**Density is deliberate.** The feed is a reading surface. Cards have room to breathe; chrome is minimal; engagement controls are present but quiet until the card is the reader's focus.

**Every state is designed**, not defaulted: loading uses skeletons matching final layout, not spinners. Empty states are composed, not apologetic. Errors are quiet and actionable. A profile with no photo, no cover and one line of text must still look intentional.

**Accessibility is part of the craft bar** (AFR-010): contrast meets standard, targets are at least 44 px, focus is visible and ordered, the whole feed is operable by keyboard and comprehensible to a screen reader, and nothing depends on colour alone.

**Dark and light are both first-class.** Neither is an inverted afterthought.

## 11. Safety and trust (FEED-003, TRUST-001/002)

Report (post, comment, profile, organisation) reaching moderation · block, which is mutual and removes visibility both ways · mute, which is silent and one-way · anti-spam limits on posting, commenting and following rates · new-account limits before broad public reach.

**These controls ship before broad public growth, not after** (FEED-003). A network without them is a network that will be abused by the time anyone notices.

Reports on safety-critical content are prioritised (Sprint 10). Reporting a post never notifies its author of who reported it.

## 12. Open decisions

| # | Decision | Disposition |
|---|---|---|
| 1 | The reaction set | Product decision. Recommend a short, professional set with unambiguous meaning and no ambiguous or ironic options. Fewer is better; a set can grow, but retiring one people use is expensive |
| 2 | Repost with comment vs plain repost | Recommend comment-only. A plain repost is a volume mechanic that fills a feed without adding a thought |
| 3 | Whether "For you" is default or Following is | Recommend **Following** as default. A member who has chosen who to follow should see them; an algorithmic default in a professional evidence product invites exactly the engagement optimisation §7 forbids |
| 4 | PDR-0010 — nominated work samples as evidence | **Decided at Sprint 8.** Until then, no feed content becomes evidence |
| 5 | Whether followers are shown as a count at all | Recommend showing on the profile only, never on cards. A count on every card is a status display, and status displays drive the behaviour we are trying to keep out |
| 6 | External news **sourcing and editorial ownership** | Scope is now decided (§8, PDR-0013). What remains a **§49 human decision** is who holds editorial responsibility, which publishers Levav sources from, and what republication rights it has. Curation is an editorial position with reputational and legal consequences; it needs a named human owner before a single card ships |

## 13. Dependencies

- **Bundle work is blocking.** Route-level code splitting must land before the Feed ships (§9).
- WP-0103 profile, WP-0104 email change, Impact spec §10 for Impact posts, Evidence Graph for verified cards.
- Moderation tooling (Sprint 10) must at minimum accept and queue reports before public growth.
