# Levav Copy Dictionary v1

**Requirement IDs:** LANG-002, LANG-003, LANG-004, AFR-007, AFR-008
**Owner:** Claude. **Implemented by:** Codex under WP-0004 and every subsequent feature packet.

Approved strings, keyed. Codex implements these verbatim. A string not in this dictionary that a packet needs is an **open product decision** in that packet's implementation report — Codex does not invent it.

**Locale:** `en-ZM` is the base. Keys are stable across locales; values are not.
**Interpolation:** `{name}` style. Never concatenate sentence fragments in code — plurals and other languages break.

---

## 0. Global

| Key | Value |
|---|---|
| `global.brand` | Levav |
| `global.tagline` | Prove what you can do. |
| `global.action.save` | Save changes |
| `global.action.cancel` | Cancel |
| `global.action.continue` | Continue |
| `global.action.back` | Back |
| `global.action.retry` | Try again |
| `global.state.loading` | Loading |
| `global.state.saving` | Saving |
| `global.state.saved` | Saved |
| `global.error.generic.title` | Something went wrong on our side |
| `global.error.generic.body` | Your work has not been lost. Try again, and if it keeps failing, contact support. |
| `global.error.network.title` | You are offline |
| `global.error.network.body` | Levav will keep your draft and submit it when your connection returns. |
| `global.error.permission.title` | You do not have access to this |
| `global.error.permission.body` | If you think this is wrong, ask an administrator of the organisation to check your access. |
| `global.error.notfound.title` | This page does not exist |
| `global.error.notfound.body` | The link may be out of date. Go to your home page to continue. |
| `global.lowdata.toggle` | Low-data mode |
| `global.lowdata.description` | Loads text first and images only when you tap them. |

## 1. Signup, onboarding, account

| Key | Value |
|---|---|
| `auth.signup.title` | Create your Levav ID |
| `auth.signup.subtitle` | One identity for your work, your evidence and every organisation you join. |
| `auth.signup.action` | Create Levav ID |
| `auth.login.title` | Sign in |
| `auth.login.action` | Sign in |
| `auth.verify.title` | Confirm your email address |
| `auth.verify.body` | We sent a confirmation link to {email}. Open it to finish setting up your Levav ID. |
| `auth.verify.ratelimited` | Too many confirmation emails have been sent to this address. Wait a few minutes and try again. |
| `auth.error.credentials` | That email address and password do not match an account. |
| `onboarding.goals.title` | What do you want to do on Levav? |
| `onboarding.goals.subtitle` | Choose everything that applies. You can change this later. |
| `onboarding.status.title` | Where are you right now? |
| `onboarding.complete.title` | Your Levav ID is ready |
| `onboarding.complete.body` | Next: build evidence of what you can do. Levav 28 Day 1 takes about 20 minutes. |
| `onboarding.complete.action` | Start Levav 28 |
| `account.email.change.title` | Change your account email address |
| `account.email.change.body` | Your Levav ID, evidence, WRI history and organisation memberships stay attached to you. Only the address changes. |
| `account.email.change.reauth` | Confirm your password to continue |
| `account.email.change.pending` | We sent a confirmation link to {email}. Your current address stays active until you confirm the new one. |
| `account.email.change.done` | Your account email address is now {email}. |

## 2. Professional profile

| Key | Value |
|---|---|
| `profile.empty.title` | Your profile is empty |
| `profile.empty.body` | Add your headline, current role and skills so employers understand what you do. |
| `profile.empty.action` | Edit profile |
| `profile.photo.action` | Change photo |
| `profile.cover.action` | Change cover image |
| `profile.evidence.verified` | Verified |
| `profile.evidence.verified.detail` | Confirmed by {verifier} on {date}. |
| `profile.evidence.selfdeclared` | Self-declared |
| `profile.evidence.selfdeclared.detail` | Added by {name}. Not verified by Levav. |
| `profile.wri.private` | Your WRI is private. Employers see it only when you allow it and their plan includes it. |
| `profile.featured.empty` | Feature your strongest work so it appears first. |

## 3. WRI

Every WRI display uses the composite pattern: `wri.summary` — never a bare number.

| Key | Value |
|---|---|
| `wri.name.full` | Workforce Readiness Index |
| `wri.name.short` | WRI |
| `wri.summary` | WRI {score} · {confidenceLabel} · {covered} of {total} dimensions covered |
| `wri.confidence.none.label` | No evidence yet |
| `wri.confidence.none.body` | You have not created evidence yet. Levav 28 Day 1 is the fastest way to start. |
| `wri.confidence.provisional.label` | Provisional |
| `wri.confidence.provisional.body` | A provisional estimate from limited evidence. It will change as you do more work. |
| `wri.confidence.medium.label` | Medium confidence |
| `wri.confidence.medium.body` | Based on {count} pieces of evidence across {dimensions} dimensions, from {sources} sources. |
| `wri.confidence.high.label` | High confidence |
| `wri.confidence.high.body` | Based on diverse, recent evidence across {dimensions} dimensions, including verified real work. |
| `wri.disclaimer` | WRI describes readiness your evidence demonstrates. It is not a personality test and not a prediction of job success. |
| `wri.gap.action` | See what evidence is missing |
| `wri.dispute.action` | Dispute this evidence |
| `wri.rolefit.distinction` | Role Fit is separate from WRI. Strong general readiness does not guarantee fit for one role. |

**The ten canonical dimension names** (LANG-002 — no synonyms, no abbreviations in UI):
Critical thinking · Problem solving · Initiative and ownership · Reliability and execution · Communication · Collaboration and teamwork · Adaptability and learning agility · Professional discipline · Leadership readiness · Contribution and service orientation

## 4. Levav 28

| Key | Value |
|---|---|
| `levav28.name` | Levav 28 |
| `levav28.intro.title` | Levav 28 |
| `levav28.intro.body` | A simulated workplace built around your role and industry. You work through real situations — briefs, messages, decisions, deadlines — and Levav records what your work demonstrates. |
| `levav28.intro.action` | Start Day 1 |
| `levav28.day.header` | Day {n} of 28 · {phaseName} |
| `levav28.day.locked` | Day {n} opens when you finish Day {previous}. |
| `levav28.day.missed` | You missed Day {n}. Pick it up now — nothing is lost. |
| `levav28.attempt.practice` | Practice — this does not create evidence |
| `levav28.attempt.evidence` | This creates evidence |
| `levav28.feedback.title` | What your work showed |
| `levav28.checkpoint.met` | You have enough evidence to open the next stage. |
| `levav28.checkpoint.short` | You need more evidence before the next stage opens. These three tasks will cover the gaps. |
| `levav28.report.title` | Your Day 28 readiness report |
| `levav28.report.body` | This is a baseline, not a finish line. Your readiness keeps changing as you do more work. |
| `levav28.integrity.followup` | We would like you to talk through your reasoning on this task. This is a normal check, not an accusation. |
| `levav28.offline.saved` | Saved on this device. Levav will submit it when you reconnect. |

**Prohibited in this surface:** motivational quotes, phase names like `CONFRONT`, "unlock", streaks, badges, "challenge", "graduation".

## 5. QuickWork

| Key | Value |
|---|---|
| `quickwork.name` | QuickWork |
| `quickwork.intro.body` | Structured paid work that fits the capacity you actually have. Every completed assignment becomes verified evidence. |
| `quickwork.capacity.empty.title` | You have not listed any capacity |
| `quickwork.capacity.empty.body` | Tell clients the hours, days and kinds of work you can take on. |
| `quickwork.capacity.empty.action` | List your capacity |
| `quickwork.capacity.paused` | Your capacity is paused. Clients cannot match you until you resume. |
| `quickwork.assignment.status.draft` | Draft |
| `quickwork.assignment.status.pending_verification` | Pending verification |
| `quickwork.assignment.status.open` | Open |
| `quickwork.assignment.status.matched` | Matched |
| `quickwork.assignment.status.confirmed` | Confirmed |
| `quickwork.assignment.status.active` | Active |
| `quickwork.assignment.status.submitted` | Submitted |
| `quickwork.assignment.status.client_review` | In client review |
| `quickwork.assignment.status.completed` | Completed |
| `quickwork.assignment.status.disputed` | Disputed |
| `quickwork.assignment.status.cancelled` | Cancelled |
| `quickwork.assignment.action.submit` | Submit work |
| `quickwork.review.title` | Close out this assignment |
| `quickwork.review.body` | Rate only what you actually observed. Leave anything you did not see. |
| `quickwork.dispute.open` | Raise a dispute |
| `quickwork.dispute.body` | Both records stay. A reviewer will look at the assignment history and decide. |
| `quickwork.rate.nodata` | Levav does not have enough data to suggest a rate for this kind of work yet. |

**Prohibited:** "gig" in every form, "hustle", "earn money fast", star-rating language without the structured review.

## 6. Levav Impact

| Key | Value |
|---|---|
| `impact.name` | Levav Impact |
| `impact.intro.body` | Contribute your professional skills to organisations doing work that matters, and build a verified record of what you delivered. |
| `impact.pathway.notice` | **This is a contribution opportunity, not employment.** It is unpaid, time-limited, and it does not create a job offer or an employment relationship. |
| `impact.pathway.stipend` | This opportunity covers {stipendDescription}. It is still a contribution opportunity, not employment. |
| `impact.opportunity.hours` | Expected commitment: up to {hours} hours over {duration} |
| `impact.opportunity.supervisor` | Your work will be supervised and verified by {supervisorRole} at {organisation}. |
| `impact.opportunity.withdraw` | You can withdraw from this placement at any time. |
| `impact.opportunity.apply` | Apply to contribute |
| `impact.placement.status.applied` | Applied |
| `impact.placement.status.placed` | Placed |
| `impact.placement.status.active` | Active |
| `impact.placement.status.completed` | Completed |
| `impact.placement.status.verified` | Verified by {organisation} |
| `impact.record.title` | Contribution record |
| `impact.record.body` | {organisation} confirmed {hours} hours between {start} and {end}, and these outputs. |
| `impact.record.dispute` | This record is not accurate |
| `impact.wri.notice` | Contributing does not raise your WRI on its own. Only verified observations of your work can, in the same way as any other work. |
| `impact.outcome.activity` | Activity |
| `impact.outcome.output` | Output |
| `impact.outcome.outcome` | Outcome — measured by {organisation} |
| `impact.outcome.unmeasured` | This organisation has not published a measurement basis for outcomes. |

**Prohibited:** "volunteer" as a person's identity, "give back", "beneficiary", "cause you care about", employment vocabulary, any leaderboard of contributors.

## 7. Feed and network

| Key | Value |
|---|---|
| `feed.name` | Feed |
| `feed.empty.title` | Your feed is quiet |
| `feed.empty.body` | Follow people and organisations in your field to see their work here. |
| `feed.empty.action` | Find people to follow |
| `feed.compose.placeholder` | Share something useful about your work |
| `feed.compose.action` | Post |
| `feed.compose.draft` | Draft saved |
| `feed.view.following` | Following |
| `feed.view.foryou` | For you |
| `feed.view.opportunities` | Opportunities |
| `feed.view.learning` | Learning |
| `feed.view.impact` | Impact |
| `feed.card.verified.quickwork` | Verified QuickWork completion |
| `feed.card.verified.impact` | Verified contribution |
| `feed.card.verified.note` | Levav verified this work item. The rest of this post is the author's own. |
| `feed.action.follow` | Follow |
| `feed.action.following` | Following |
| `feed.action.save` | Save |
| `feed.action.report` | Report |
| `feed.action.mute` | Mute {name} |
| `feed.action.block` | Block {name} |
| `feed.report.body` | Tell us what is wrong with this post. A moderator will review it. |
| `feed.media.tap` | Tap to load image |
| `whatsnew.name` | What is New |
| `whatsnew.source` | Source: {publisher} |
| `whatsnew.source.action` | Read the original |
| `whatsnew.ai.label` | Summary drafted by Levav AI from the linked article. |

**Prohibited:** "trending", "viral", "top creator", follower counts near any readiness surface, "connect" for the follow relationship.

## 8. Employer surfaces

| Key | Value |
|---|---|
| `employer.search.empty.title` | Describe the person you need |
| `employer.search.empty.body` | Write it in your own words. Levav turns it into search criteria for you to confirm. |
| `employer.search.parsed.confirm` | Check these criteria before we search |
| `employer.search.noresults` | No one currently matches all of these criteria. Relax {suggestion} to widen the search. |
| `employer.candidate.why` | Why this candidate appears |
| `employer.wri.locked.title` | WRI is not included in your plan |
| `employer.wri.locked.body` | Your plan shows public professional information. Upgrade to see readiness dimensions, evidence confidence and evidence gaps. |
| `employer.wri.provisional` | This candidate's evidence is still limited. Treat this estimate as provisional. |
| `employer.interview.title` | Questions based on this candidate's evidence gaps |
| `employer.interview.disclaimer` | WRI is decision support. Do not reject a candidate on WRI alone. |

## 9. Notifications and email

Subject lines are sentence case, under 60 characters, and name the thing that happened.

| Key | Value |
|---|---|
| `notify.email.verify.subject` | Confirm your email address for Levav |
| `notify.email.emailchange.subject` | Confirm your new Levav account email address |
| `notify.quickwork.matched.subject` | You have been matched to an assignment |
| `notify.quickwork.reviewdue.subject` | {client} is waiting for your closeout review |
| `notify.impact.verified.subject` | {organisation} verified your contribution |
| `notify.levav28.dayready.subject` | Day {n} of your Levav 28 journey is ready |
| `notify.wri.updated.subject` | Your readiness evidence has been updated |
| `notify.preferences.action` | Change what Levav emails you |

**Prohibited in email:** "Hi there", "We're excited", exclamation marks in subject lines, countdowns, artificial urgency.

## 10. Strings that must be deleted

Present in the codebase today and prohibited from this point. Codex removes them as it touches each surface, and never reintroduces the pattern.

| Current string / pattern | Why |
|---|---|
| "Every talent activated. Every capability developed." | Unsupported claim, empty inspiration |
| "A six-step transformation pathway that turns raw talent into workforce-ready capability." | Unsupported claim |
| "Meet Yourself", "The Mirror", "CONFRONT" and all Levav 28 day quotes | Wrong product; motivational framing |
| Every gamification use of "unlock" (121 occurrences) | §2.2 |
| "gig" in all forms (157 occurrences) | §4 canonical terminology |
| "Share one gap with the community. Vulnerability builds connection." | Not professional voice; not a work task |
| Any WRI number rendered without confidence and coverage | WRI-001, WRI-003 |
