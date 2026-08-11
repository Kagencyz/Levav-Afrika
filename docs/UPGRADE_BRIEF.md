# LEVAV™ Platform Upgrade Brief

> Markdown conversion of `Levav_Platform_Upgrade_Brief_for_Claude.docx` (received 2026-07-29).
> Covers: onboarding, landing pages, personalised routing, social feeds, opportunities,
> messaging, Levav 28, and role-based dashboards. Gap analysis: `docs/UPGRADE_GAP_REPORT.md`.

## 1. Purpose of This Upgrade Brief

Claude already understands the Levav product, its vision, core modules, and the work completed so far. This document does not redefine Levav. It provides the next set of product upgrades that must be incorporated into the existing build.

**Primary instruction to Claude:** Inspect the current implementation first. Preserve what already works. Add these upgrades into the existing architecture, design system, routes, database, and user journeys without duplicating features or rebuilding the platform from the beginning.

## 2. Public Landing Page Upgrade

The public landing page must explain the main ways a person or organisation can use Levav and guide each visitor toward the correct signup path.

### 2.1 Main landing page calls to action

- Create a Free Account
- Find Jobs
- Find QuickWork
- Develop Through Levav 28
- Hire Talent
- Post QuickWork
- Post Volunteer Opportunities
- Explore Courses
- Join the Professional Community

Creating a personal account must be free. The page should communicate this clearly without making the experience feel limited or temporary.

### 2.2 Landing page sections

- A strong hero section with one primary Create a Free Account action.
- A simple choice between developing as talent, finding work, hiring talent, posting quick work, and posting volunteer opportunities.
- A preview of the professional feed.
- A preview of verified jobs, gigs, volunteer openings, and courses.
- A short explanation of Levav 28 for employed and unemployed users.
- A preview of the Levav ID, WRI, work evidence, and professional profile.
- A section for employers and organisations.
- Trust signals such as verification, protected data, verified opportunities, and real work evidence.
- A final signup call to action.

## 3. Signup and Personalised Routing

The signup flow should begin with one free account. After identity verification, Levav should ask what the user wants to do and route the user into the right onboarding and workspace.

### 3.1 Initial signup choices

- Develop myself professionally
- Find a full-time or part-time job
- Find QuickWork or freelance gigs
- Hire talent for an organisation
- Post a quick job or gig
- Find volunteer opportunities
- Post volunteer opportunities for an organisation
- Learn through courses and programmes
- Build my professional network and community

Users may select more than one goal. The system should identify a primary path for the first experience while keeping all eligible features available.

### 3.2 Personal status selection

- Employed
- Unemployed
- Self-employed
- Freelancing
- Studying
- Volunteering
- Changing careers
- Returning to work
- Running an organisation or business

### 3.3 Routing examples

| User Choice | First Destination | Next Action |
|---|---|---|
| Develop myself professionally | Personal dashboard | Complete profile and receive a Levav 28 pathway |
| Find a job | Talent onboarding | Complete work profile, readiness inputs, and opportunity preferences |
| Find QuickWork | QuickWork talent onboarding | Add skills, availability, rates, and work evidence |
| Hire talent | Employer setup | Create or join an employer organisation and complete company onboarding |
| Post QuickWork | QuickWork client setup | Create a client profile and submit the first gig for verification |
| Find volunteer opportunities | Volunteer preferences | Choose causes, availability, skills, and location |
| Post volunteer opportunities | Organisation setup | Verify the organisation and create an opening |
| Join the community | Professional feed | Complete a minimum public profile and choose people or topics to follow |

## 4. First Login Experience

The first login must feel guided. It should not send every new user to the same empty dashboard.

- Welcome the user by name.
- Confirm the user's primary goal and current status.
- Show a short progress checklist.
- Ask only the information needed for the selected path.
- Create the correct personal or organisational workspace.
- Recommend the first people, organisations, opportunities, courses, or communities to follow.
- Show the first practical action, such as starting Levav 28, completing the profile, applying for an opportunity, posting a gig, or publishing a professional introduction.

## 5. Logged-In Home and Main Feed

After onboarding, the default logged-in landing page should be a personalised home feed. The feed should combine professional community activity, opportunities, learning, development, and relevant platform updates.

**Feed direction:** The experience may borrow familiar interaction patterns from LinkedIn, but it should remain distinctly Levav. Its purpose is professional growth, trusted opportunity, work evidence, collaboration, learning, and credible relationships.

### 5.1 Content shown in the feed

- Posts from people the user follows.
- Posts from employers, organisations, mentors, leaders, and communities the user follows.
- Recommended professional posts based on industry, skills, goals, and interests.
- Verified job opportunities.
- Verified QuickWork gigs.
- Verified volunteer opportunities.
- Courses, cohorts, workshops, and learning programmes.
- Levav 28 milestones and work samples shared with permission.
- Professional achievements, completed projects, certifications, placements, and service records.
- Career advice, leadership insights, industry updates, and practical learning.
- Suggested people, organisations, communities, and mentors to follow.

### 5.2 Feed interactions

- Follow and unfollow people, employers, organisations, mentors, leaders, and communities.
- Like or react to posts.
- Comment on posts.
- Reply to comments.
- Mention another user or organisation.
- Save a post.
- Share a post within Levav or through an external link where allowed.
- Report inappropriate, fraudulent, misleading, or unsafe content.
- Send a private message from an eligible profile or post context.
- Open a job, gig, volunteer role, or course directly from the feed.

### 5.3 Talent-to-talent interaction

Talent users should be able to follow one another, learn from one another, comment on professional work, share progress, recommend useful resources, join communities, and build trusted professional relationships.

- Following should not require mutual approval.
- Connections may be added later for relationships that require mutual acceptance.
- Users should control who may message them.
- Users should control which profile sections and activities are public.
- Endorsements must be tied to a real skill, project, role, collaboration, service record, or verified relationship where possible.

### 5.4 Feed ranking principles

- Relevance to the user's career, goals, industry, skills, and location.
- People and organisations the user has chosen to follow.
- Credibility and verification.
- Usefulness and professional value.
- Freshness.
- Trusted engagement from relevant users.
- Opportunity fit.
- Learning value.
- User safety and content quality.

The feed should not reward empty engagement, spam, repeated promotional posts, or misleading opportunities.

## 6. Post Creation

Eligible users should be able to create:

- Text posts.
- Image posts.
- Document and portfolio posts.
- Project updates.
- Professional lessons and reflections.
- Career milestones.
- Levav 28 progress posts.
- Work samples.
- Opportunity posts created through the correct verified listing workflow.
- Course and programme promotions created by approved providers.
- Organisation and employer updates.

Jobs, QuickWork gigs, volunteer openings, and paid course promotions should not be created as ordinary unverified posts. They must use the correct listing form, pass the required checks, and then appear as structured cards in the feed.

## 7. Messaging and Communication

Levav should support private messaging so users can continue relevant professional conversations inside the platform.

- One-to-one private messages.
- Employer-to-candidate messages within an application or invitation context.
- QuickWork client-to-talent messages within a proposal or assignment.
- Organisation-to-volunteer messages within an application or active placement.
- Group messages for Levav 28 teams, cohorts, projects, and communities.
- Message requests for users who do not follow one another.
- Blocking, reporting, attachment controls, and anti-spam protection.
- Clear limits on unsolicited employer, client, and promotional messages.

## 8. Courses in the Feed

Courses and development programmes should be discoverable inside the feed, opportunity areas, and personalised recommendations.

- Course cards should show provider, title, level, duration, delivery mode, price or free status, and enrolment action.
- Only approved providers should receive structured promotional course cards.
- Course recommendations should reflect the user's goals, WRI gaps, Levav 28 progress, target role, and saved interests.
- The broader Skills Marketplace remains Coming Soon unless separately approved for full implementation.
- Current course discovery can use a controlled catalogue and promotional feed cards without launching the full marketplace.

## 9. Levav 28 Upgrade

Levav 28 must remain available to people who are employed and people who are seeking work. The user's onboarding status should determine the challenge pathway.

| User Status | Levav 28 Experience |
|---|---|
| Unemployed | A mock office or realistic simulation based on the target profession, industry, and level. |
| Employed | Challenges connected to the current role, responsibilities, workplace habits, growth goals, and leadership level. |
| Self-employed | Challenges around clients, delivery, systems, pricing, productivity, growth, and professional discipline. |
| Freelancing | Challenges around proposals, communication, delivery, portfolio, time management, and client service. |
| Student | Career discovery, workplace readiness, communication, projects, teamwork, and portfolio development. |
| Career transition | Skills-gap work, practical assignments, portfolio development, networking, and transition planning. |

### 9.1 Levav 28 workspace

- Daily challenge feed.
- Personal goals and pathway.
- Mock office or current-work context.
- Tasks, deadlines, expected outputs, and assessment criteria.
- AI manager, colleague, client, or stakeholder simulations where useful.
- Private team or cohort collaboration.
- Evidence submission.
- AI, peer, mentor, or colleague feedback.
- Progress, streaks, readiness development, and recommendations.
- Optional sharing of suitable milestones to the professional feed.

## 10. Opportunity Feeds and Verification

Jobs, QuickWork gigs, volunteer openings, internships, apprenticeships, and approved courses should appear in dedicated feeds and in the personalised home feed when relevant.

- Every structured opportunity must have a publisher.
- The publisher must complete the appropriate identity, employer, client, provider, or organisation verification.
- Listings should move through draft, submitted, under review, approved, published, expired, suspended, or rejected states.
- Users should see a verification badge and clear publisher details.
- Users should be able to save, share, report, apply, propose, enrol, or express interest based on the opportunity type.
- The system should detect duplicate, misleading, unpaid, unsafe, or suspicious listings.
- High-risk listings should require manual review.

## 11. Updated Workspace Structure

| Workspace | Who Uses It | Main Upgrade |
|---|---|---|
| Personal Home | Every individual | Personalised feed, recommendations, profile progress, notifications |
| Talent | Professionals and job seekers | Jobs, applications, Levav ID, CV, WRI, work evidence |
| Levav 28 | All enrolled users | Adaptive pathway, mock office, employed pathway, teams, challenges |
| QuickWork Talent | Gig workers and freelancers | Gig feed, proposals, assignments, ratings, payments |
| QuickWork Client | Individuals and businesses | Post verified gigs, invite talent, manage delivery and payment |
| Employer | Hiring organisations | Jobs, matches, pipelines, messages, teams, analytics |
| Volunteer | People seeking service roles | Volunteer feed, applications, commitments, service record |
| Organisation | Approved organisations | Post and manage volunteer openings, participants, updates, outcomes |
| Community | Eligible users | Posts, follows, comments, communities, endorsements, messaging |
| Admin | Levav team | Verification, moderation, support, audit, reporting |

## 12. CV, Levav ID, WRI, and Work Evidence

Keep the traditional CV. It remains useful for portability and employers who still require it. The Levav ID should become the living professional record, while the WRI measures readiness and work evidence shows actual ability.

- Allow users to upload an existing CV.
- Extract structured profile information and ask the user to confirm it.
- Allow Levav to generate a clean CV from the profile.
- Use Levav 28, QuickWork, volunteering, projects, courses, references, and endorsements to enrich the Levav ID.
- Keep WRI results separate but connected to the profile.
- Give users privacy controls over every sensitive profile section.
- Let employers view only the information permitted by the user and the relevant recruitment stage.

## 13. Notification System

- New follower.
- New comment or reply.
- Reaction to a post.
- Private message or message request.
- Relevant job, gig, volunteer role, or course.
- Application or proposal update.
- Invitation from an employer, client, organisation, mentor, team, or community.
- Levav 28 challenge, deadline, feedback, or team activity.
- Profile view where privacy settings permit.
- Verification, moderation, or account update.

## 14. Safety and Privacy Requirements

- Users must control profile visibility, messaging permissions, following, blocking, and public activity.
- Candidate contact details must not be broadly exposed.
- Private messages require anti-spam, reporting, and moderation controls.
- Employment and Levav 28 users must be warned not to upload confidential workplace data.
- Paid work, volunteer work, and assessments must be clearly distinguished.
- Listings and course promotions must use structured verification rather than ordinary posts.
- The system must keep tenant and user data isolated through server-side permissions and database policies.
- Sensitive actions should be recorded in audit logs.

## 15. Claude Implementation Instructions

- Review the current landing page, signup, onboarding, routing, dashboards, feed components, messaging, and database schema.
- Create a gap report against this upgrade brief.
- Do not replace working Levav features that already meet these requirements.
- Implement one free personal account as the entry point.
- Add goal-based and status-based onboarding.
- Route users to the correct first experience and workspace.
- Make the personalised home feed the main logged-in landing page after onboarding.
- Build social interactions with clear privacy, moderation, and permission rules.
- Use structured, verified objects for jobs, gigs, volunteer openings, and course promotions.
- Connect Levav 28 pathways to the user's employment status and career context.
- Use feature flags for incomplete modules.
- Keep the Skills Marketplace marked Coming Soon.
- Add tests, loading states, empty states, error states, mobile layouts, database policies, and documentation for each completed upgrade.

## 16. Immediate Upgrade Order

1. Revise the public landing page and calls to action.
2. Create the free signup and preference selection flow.
3. Implement personalised onboarding and routing.
4. Create the logged-in home feed.
5. Add follow, react, comment, save, share, report, and message interactions.
6. Add structured opportunity and course cards to the feed.
7. Complete role-based workspace switching.
8. Upgrade Levav 28 for employed and unemployed pathways.
9. Complete QuickWork client, QuickWork talent, employer, volunteer, and organisation flows.
10. Add verification, moderation, privacy, notification, and audit controls.

## 17. Expected Result

A new user should be able to arrive on the Levav landing page, understand the available paths, create a free account, select personal goals and current status, complete a relevant onboarding flow, and enter a personalised home feed.

From that feed, the user should be able to follow people and organisations, interact with professional posts, receive relevant jobs, QuickWork gigs, volunteer opportunities and courses, send or receive permitted messages, access the correct workspaces, and begin a Levav 28 pathway designed for the user's real situation.
