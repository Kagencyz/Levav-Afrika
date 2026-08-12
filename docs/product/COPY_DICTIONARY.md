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
| `feed.compose.draft` | Draft saved |
| `feed.view.following` | Following |
| `feed.view.foryou` | For you |
| `feed.view.opportunities` | Opportunities |
| `feed.view.learning` | Learning |
| `feed.view.impact` | Impact |
| `feed.action.follow` | Follow |
| `feed.action.following` | Following |
| `feed.action.save` | Save |
| `feed.action.report` | Report |
| `feed.action.mute` | Mute {name} |
| `feed.action.block` | Block {name} |
| `feed.media.tap` | Tap to load image |
| `whatsnew.name` | What is New |

**Prohibited:** "trending", "viral", "top creator", follower counts near any readiness surface, "connect" for the follow relationship.

**Composer, verified-card, report and What-is-New strings are defined in §15**, which is canonical for the Feed. They were duplicated here in an earlier revision; two had drifted apart.

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

## 11. Admin — unavailable controls

Copy for security surfaces that exist in the interface but are not yet implemented. The governing rule: **an unimplemented control states that it is unimplemented.** It never renders an empty result, because an empty result reads as "nothing happened" and that is a false assurance about a control that is not running.

| Key | Value |
|---|---|
| `admin.audit.unavailable.title` | Levav is not recording an audit trail yet |
| `admin.audit.unavailable.body` | Audit logging is not in place. No record is being kept of sign-ins, privileged actions or protected-data access, and none exists for any earlier period. Treat the absence of records here as "not measured", never as "nothing happened". |
| `admin.audit.unavailable.planned` | Server-side audit logging is specified in the Master PRD (SEC-005) and is scheduled for production hardening. |

**Prohibited on any unimplemented control:** "No entries found", "No activity yet", "0 events", "Nothing to show", "Coming soon", an empty table with headers, a zeroed stat card, or a disabled filter row. Each of these implies a working control that returned nothing.

## 12. Sprint 1 — career context, profile sections, visibility

### Career step (WP-0102)

| Key | Value |
|---|---|
| `onboarding.career.title` | What work do you do? |
| `onboarding.career.subtitle` | This shapes your Levav 28 scenarios and the opportunities you see. You can change it later. |
| `onboarding.career.family` | Career family |
| `onboarding.career.role` | Role |
| `onboarding.career.owntitle.action` | My title is not listed |
| `onboarding.career.owntitle.label` | What do you call your role? |
| `onboarding.career.owntitle.help` | Use your own words. Levav will suggest the closest match and keep your title as you wrote it. |
| `onboarding.career.candidates.title` | Closest matches |
| `onboarding.career.candidates.none` | Levav does not have a match for this yet. Your title is saved as you wrote it, and you can continue. |
| `onboarding.career.candidates.reject` | None of these match |
| `onboarding.career.seniority` | Seniority |
| `onboarding.career.industry` | Industry |
| `onboarding.career.industry.help` | The sector you work in, which may differ from your profession. |
| `onboarding.career.target` | Role you are working towards (optional) |
| `onboarding.career.skip` | Skip for now |
| `onboarding.confirm.title` | Check what Levav understood |
| `onboarding.confirm.body` | Correct anything that is wrong. Nothing is used until you confirm it. |
| `onboarding.confirm.action` | Confirm and continue |
| `onboarding.resume.title` | Pick up where you left off |

### Profile sections (WP-0103)

| Key | Value |
|---|---|
| `profile.section.experience` | Experience |
| `profile.section.education` | Education |
| `profile.section.projects` | Projects |
| `profile.section.certifications` | Certifications |
| `profile.section.links` | Links |
| `profile.experience.empty` | Add the roles you have held so employers can see your track record. |
| `profile.education.empty` | Add your qualifications. |
| `profile.projects.empty` | Add work you are proud of. Projects are how you show what you can do before you have verified evidence. |
| `profile.certifications.empty` | Add certifications you hold. |
| `profile.links.empty` | Add a portfolio, publication or professional link. |
| `profile.item.selfdeclared.notice` | Everything you add here is your own account of your work. Levav has not verified it. |
| `profile.item.feature` | Feature this |
| `profile.item.featured` | Featured |
| `profile.preview.action` | See what others see |
| `profile.preview.banner` | You are viewing your profile as another person would. |

### Visibility (WP-0103)

| Key | Value |
|---|---|
| `visibility.label` | Who can see this |
| `visibility.public` | Anyone |
| `visibility.members` | Signed-in members |
| `visibility.private` | Only me |
| `visibility.default.notice` | Your profile is private until you choose what to share. |
| `visibility.changed.public` | This section is now visible to anyone with your profile link. |
| `visibility.changed.private` | This section is now visible only to you. It is not deleted. |

### Images (WP-0103)

| Key | Value |
|---|---|
| `profile.image.uploading` | Uploading |
| `profile.image.failed` | That image did not upload. Check your connection and try again. |
| `profile.image.toolarge` | That image is too large. Choose one under {limit}. |
| `profile.image.wrongtype` | That file is not an image Levav can use. Use a JPG or PNG. |
| `profile.image.exif.notice` | Levav removes location data from photos before saving them. |

**Prohibited across these surfaces:** any verified badge or verified language (nothing is verified until Sprint 2), any completeness percentage or profile-strength score (a score is a readiness signal in disguise — PDR-0001), "unlock", and any claim that a complete profile improves employment outcomes.

## 13. Sprint 2 — evidence, disputes, Privacy and Evidence Centre

### Evidence framing (WP-0204)

| Key | Value |
|---|---|
| `evidence.centre.title` | Your evidence |
| `evidence.centre.subtitle` | Everything Levav holds about your work, where it came from, and who can see it. |
| `evidence.empty.title` | Levav holds no evidence about you yet |
| `evidence.empty.body` | Evidence appears here as you do work — simulations, assignments and verified contributions. Nothing has been recorded so far. |
| `evidence.level.e0` | Self-declared |
| `evidence.level.e1` | From a Levav Learn assessment |
| `evidence.level.e2` | From a Levav 28 scenario |
| `evidence.level.e3` | Verified real work |
| `evidence.level.e4` | Confirmed outcome |
| `evidence.provenance.recorded` | Recorded {recordedAt}. The work happened {occurredAt}. |
| `evidence.provenance.actor` | Recorded by {actor}, who was your {relationship}. |
| `evidence.provenance.system` | Recorded automatically by Levav. |
| `evidence.eligibility.none` | This does not affect your readiness. It is a record of what you told Levav, not an observation of your work. |
| `evidence.eligibility.some` | This can inform: {dimensions}. |
| `evidence.status.withdrawn` | Withdrawn. Kept as history and no longer counted. |
| `evidence.status.superseded` | Replaced by a later record. Kept as history. |
| `evidence.status.disputed` | Disputed. Not counting while this is unresolved. |
| `evidence.export.action` | Export my evidence |
| `evidence.export.notice` | The file contains your personal data. Store it somewhere you control. |
| `evidence.access.unavailable.title` | Levav is not recording who views your readiness data yet |
| `evidence.access.unavailable.body` | Access logging is not in place. No record is being kept of who has viewed protected readiness data, and none exists for any earlier period. Treat the absence of records here as "not measured", never as "nobody has looked". |

### Disputes (WP-0203)

| Key | Value |
|---|---|
| `dispute.action` | This record is not accurate |
| `dispute.title` | Dispute this record |
| `dispute.body` | Tell us what is wrong. The record stops counting towards your readiness as soon as you submit this. |
| `dispute.visibility.notice` | {actor} will be able to see that you disputed this, and what you wrote. |
| `dispute.category.didnothappen` | This work did not happen |
| `dispute.category.inaccurate` | Some details are wrong |
| `dispute.category.unfair` | The description of my work is unfair |
| `dispute.category.wrongperson` | This is not about me |
| `dispute.category.other` | Something else |
| `dispute.statement.label` | What is wrong with this record? |
| `dispute.submitted.title` | Your dispute has been recorded |
| `dispute.submitted.body` | This record has stopped counting towards your readiness. It has not been deleted, and neither has your dispute. |
| `dispute.pending.notice` | Levav does not yet have a review process for disputes. This record will stay uncounted until one exists. We will not guess at a resolution. |
| `dispute.notdisputable` | This record cannot be disputed. It has already been disputed, withdrawn or replaced. |
| `dispute.resolved.upheld` | Reviewed and kept. This record counts again. |
| `dispute.resolved.corrected` | Corrected. The original is kept as history and the corrected record counts instead. |
| `dispute.resolved.withdrawn` | Withdrawn by {actor}. Kept as history and no longer counted. |

**Prohibited across these surfaces:** "no access recorded", "no disputes found", any resolution timeline Levav cannot honour, any implication that disputing harms the member's standing, and any display of rubric content, anchors or weights (SEC-011).

## 14. Levav Impact — dashboards, navigation and application

Extends §6. Governed by `LEVAV_IMPACT_SPEC.md`.

### Member navigation and Personal Home card

| Key | Value |
|---|---|
| `impact.nav.label` | Impact |
| `impact.discovery.title` | Contribution opportunities |
| `impact.discovery.subtitle` | Use your professional skills where they are needed, and build a verified record of what you delivered. |
| `impact.discovery.empty` | No opportunities match what you are looking for yet. Widen your skills or location filters, or check back — organisations publish new work regularly. |
| `impact.home.card.title` | Impact |
| `impact.home.card.none` | Contribute your professional skills to organisations doing work that matters. |
| `impact.home.card.none.action` | Find contribution opportunities |
| `impact.home.card.applied` | You applied to {opportunity} at {organisation} on {date}. |
| `impact.home.card.active` | {opportunity} at {organisation} · {hoursLogged} of up to {hoursCeiling} hours |
| `impact.home.card.awaiting` | {organisation} has not yet verified your contribution to {opportunity}. |
| `impact.home.card.verified` | {organisation} verified your contribution to {opportunity}. |
| `impact.home.card.verified.action` | Add to my profile |
| `impact.mycontributions.title` | My contributions |
| `impact.mycontributions.empty` | You have not contributed through Levav yet. Verified contributions appear here and can be shown on your profile. |

### Application

| Key | Value |
|---|---|
| `impact.apply.title` | Apply to contribute |
| `impact.apply.shared` | {organisation} will see your name, headline, public profile and the skills relevant to this opportunity. |
| `impact.apply.availability` | When are you available? |
| `impact.apply.message` | Anything you want to add (optional) |
| `impact.apply.message.help` | Leaving this blank does not count against your application. |
| `impact.apply.ceiling` | This asks for up to {hours} hours over {duration}. The organisation cannot ask you for more. |
| `impact.apply.action` | Send application |
| `impact.apply.incomplete` | Your profile is incomplete. You can add these details now or apply as you are. |
| `impact.apply.submitted` | Your application has been sent to {organisation}. |
| `impact.apply.noresponse` | {organisation} has not responded in {days} days. You can withdraw this application if you would rather not wait. |
| `impact.apply.declined` | {organisation} did not take this application forward. This is not recorded anywhere on your profile and does not affect your readiness. |
| `impact.apply.withdraw` | Withdraw application |

### Placement

| Key | Value |
|---|---|
| `impact.placement.supervisor` | Supervised and verified by {name}, {role} at {organisation} |
| `impact.placement.hours` | {logged} of up to {ceiling} hours |
| `impact.placement.outputs.title` | What you are delivering |
| `impact.placement.submit` | Submit outputs |
| `impact.placement.withdraw` | Withdraw from this placement |
| `impact.placement.withdraw.notice` | You can withdraw at any time. It is not recorded on your profile and does not affect your readiness. |
| `impact.placement.ended` | {organisation} ended this placement on {date}. Reason given: {reason} |
| `impact.placement.report` | Report a problem with this placement |

### Organisation dashboard

| Key | Value |
|---|---|
| `org.impact.nav.label` | Impact |
| `org.impact.dashboard.title` | Impact programme |
| `org.impact.action.applicants` | {count} applicants waiting for a decision · oldest {days} days |
| `org.impact.action.verify` | {count} placements waiting for your verification · oldest {days} days |
| `org.impact.action.ending` | {count} placements end this week |
| `org.impact.action.unfilled` | {count} opportunities are open with no applicants |
| `org.impact.summary.note` | These figures count verified contributions only. |
| `org.impact.opportunities.empty` | You have not published any contribution opportunities yet. |
| `org.impact.opportunities.create` | Create an opportunity |
| `org.impact.publish.unverified` | Your organisation must be verified before you can publish contribution opportunities. |
| `org.impact.publish.ceiling.required` | Set a maximum number of hours and an end date. Contribution opportunities cannot be open-ended. |
| `org.impact.publish.toolarge` | This exceeds what Levav accepts as a contribution opportunity. Work at this scale should be paid — post it as QuickWork or a job. |
| `org.impact.publish.outputs.required` | Describe what will exist when this work is done. This is what your supervisor will verify. |
| `org.impact.publish.supervisor.required` | Name the person who will supervise and verify this work. |
| `org.impact.verify.title` | Verify this contribution |
| `org.impact.verify.body` | Confirm only what you observed. The contributor can dispute anything inaccurate. |
| `org.impact.verify.outputs` | Which of the expected outputs were delivered? |
| `org.impact.verify.hours` | Hours confirmed |
| `org.impact.outcomes.activity` | Activity — what was done |
| `org.impact.outcomes.output` | Outputs — what now exists |
| `org.impact.outcomes.outcome` | Outcomes — what changed, as measured by your organisation |
| `org.impact.outcomes.basis` | Publish how you measure this outcome. Levav shows your basis alongside the claim. |
| `org.impact.outcomes.nobasis` | No measurement basis published. Levav will show this as unmeasured. |

**Prohibited across these surfaces:** contributor leaderboards, hour badges, "top volunteer", any ranking of contributors, any suggestion that contributing improves hiring chances at that organisation, and any employment vocabulary (salary, hire, position, staff, probation, full-time).

## 15. Feed and network — composer, engagement, profile, notifications

Extends §7. Governed by `FEED_AND_NETWORK_SPEC.md`.

### Composer

| Key | Value |
|---|---|
| `feed.compose.open` | Share something |
| `feed.compose.placeholder` | Share something useful about your work |
| `feed.compose.visibility` | Who can see this |
| `feed.compose.attach.work` | Attach verified work |
| `feed.compose.attach.help` | Choose from your own verified records. Levav never attaches anything for you. |
| `feed.compose.media.compressed` | Image compressed to {size} for faster loading. |
| `feed.compose.draft.saved` | Draft saved on this device |
| `feed.compose.draft.restored` | We restored your unsent draft. |
| `feed.compose.action` | Post |
| `feed.compose.posting` | Posting |
| `feed.compose.failed` | Your post did not send. It is saved — try again when you have a connection. |

### Post card and engagement

| Key | Value |
|---|---|
| `feed.card.author.org` | {name} · {orgType} |
| `feed.card.edited` | Edited |
| `feed.card.verified.quickwork` | Verified QuickWork completion |
| `feed.card.verified.impact` | Verified contribution |
| `feed.card.verified.learn` | Learn achievement |
| `feed.card.verified.levav28` | Levav 28 milestone |
| `feed.card.verified.note` | Levav verified this work item. The rest of this post is the author's own. |
| `feed.card.media.tap` | Tap to load image |
| `feed.card.media.failed` | This image did not load. |
| `feed.action.comment` | Comment |
| `feed.action.reply` | Reply |
| `feed.action.share` | Share with a comment |
| `feed.action.copylink` | Copy link |
| `feed.action.edit` | Edit post |
| `feed.action.delete` | Delete post |
| `feed.delete.confirm` | Delete this post? It will be removed from feeds. If it was attached as verified work evidence, that record is kept. |
| `feed.comment.placeholder` | Add a comment |
| `feed.comment.empty` | No comments yet. |

### Views and discovery

| Key | Value |
|---|---|
| `feed.view.following.empty.title` | You are not following anyone yet |
| `feed.view.following.empty.body` | Follow people and organisations in your field, and their work appears here. |
| `feed.view.following.empty.action` | Find people to follow |
| `feed.view.foryou.note` | Suggested from your career context, skills and follows. Your readiness data is never used to rank what you see. |
| `feed.view.opportunities.empty` | No opportunities match your profile yet. |
| `feed.end.reached` | You are up to date. |
| `feed.loadmore` | Load more |

### Profile and network

| Key | Value |
|---|---|
| `profile.follow` | Follow |
| `profile.following` | Following |
| `profile.followers.count` | {count} followers |
| `profile.following.count` | {count} following |
| `profile.cover.empty` | Add a cover image |
| `profile.photo.empty` | Add a profile photo |
| `profile.featured.title` | Featured |
| `profile.activity.title` | Activity |
| `profile.activity.empty` | {name} has not posted yet. |
| `profile.share` | Share this profile |

### Notifications

| Key | Value |
|---|---|
| `notifications.title` | Notifications |
| `notifications.empty` | Nothing new. |
| `notifications.markread` | Mark all as read |
| `notifications.follow` | {name} followed you |
| `notifications.comment` | {name} commented on your post |
| `notifications.reply` | {name} replied to your comment |
| `notifications.mention` | {name} mentioned you |
| `notifications.org.post` | {org} posted an update |
| `notifications.settings` | Choose what Levav notifies you about |

### Safety

| Key | Value |
|---|---|
| `feed.report.title` | Report this |
| `feed.report.body` | Tell us what is wrong. A moderator will review it. The author is not told who reported it. |
| `feed.report.submitted` | Thank you. A moderator will review this. |
| `feed.block.confirm` | Block {name}? You will not see each other's posts, comments or profiles. |
| `feed.block.done` | You blocked {name}. You can undo this in privacy settings. |
| `feed.mute.confirm` | Mute {name}? You will stop seeing their posts. They are not told. |
| `feed.blocked.empty` | You have not blocked or muted anyone. |

### What is New

| Key | Value |
|---|---|
| `whatsnew.title` | What is New |
| `whatsnew.section.levav` | From Levav |
| `whatsnew.section.workforce` | Workforce and careers |
| `whatsnew.source` | Source: {publisher} |
| `whatsnew.source.action` | Read the original |
| `whatsnew.ai.label` | Summary drafted by Levav AI from the linked article. Read the original for the full account. |

**Prohibited across these surfaces:** "trending", "viral", "top creator", "influencer", engagement counts displayed next to any readiness value, follower counts on cards, streaks, "you're on a roll", any prompt pressuring a member to post, and any suggestion that posting affects readiness or hiring.

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
