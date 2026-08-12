/**
 * Levav Data Store
 * Central data models for Levav 28™, Learn, QuickWork™, and Impact.
 * All data persists to localStorage for static deployment.
 */

import { safeJSONParse } from './safeJSON';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface Levav28Day {
  day: number;
  title: string;
  subtitle: string;
  phase: 'CONFRONT' | 'DISSECT' | 'OWN' | 'EXECUTE';
  tasks: Levav28Task[];
  quote: string;
}

export interface Levav28Task {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'reflection' | 'quiz' | 'upload' | 'external';
  completed: boolean;
  actionUrl?: string; // e.g., '/quickwork', '/learn', '/impact'
  actionLabel?: string;
}

export interface LearnCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorRole: string;
  championId?: string;
  category: string;
  duration: string;
  lessons: LearnLesson[];
  thumbnail: string;
  enrolled: boolean;
  completed: boolean;
  progress: number; // 0-100
}

export interface LearnLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz' | 'project';
  content: string; // markdown/html content
  completed: boolean;
  videoUrl?: string;
}

export interface QuickWorkGig {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: string;
  duration: string;
  location: string;
  employer: string;
  employerRating: number;
  postedAt: string;
  deadline: string;
  applicants: number;
  status: 'open' | 'in-progress' | 'completed' | 'closed';
  applied?: boolean;
  completed?: boolean;
  reviewed?: boolean;
  myRating?: number;
  /** True for gigs posted by a client/startup through the app, as opposed
   *  to the seeded catalogue — lets the UI show "New" instead of a rating
   *  history that doesn't exist yet. */
  isClientPosted?: boolean;
}

export interface ImpactOpportunity {
  id: string;
  organization: string;
  type: string;
  location: string;
  description: string;
  hoursRequired: number;
  skills: string[];
  logo: string;
  isOrgPosted?: boolean;
  commitment?: string;
  status?: 'open' | 'closed';
  postedAt?: string;
}

export interface ImpactApplicant {
  id: string;
  opportunityId: string;
  applicantUserId: string;
  applicantName: string;
  message: string;
  hoursCommitted: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  appliedAt: string;
}

export type FeedMood = 'milestone' | 'launch' | 'learning' | 'community' | 'idea' | 'quickwin';

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorMeta: string; // role · city, e.g. "Product Designer · Lusaka"
  verified?: boolean;
  body: string;
  moodIcon?: FeedMood; // an icon key resolved to a lucide icon in the UI — no image uploads
  tag?: string;
  likedBy: string[];
  comments: FeedComment[];
  createdAt: string;
  isSeed?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// LEVAV 28™ — 28-Day Transformation Program
// ═══════════════════════════════════════════════════════════════

export const LEVAV28_DAYS: Levav28Day[] = [
  {
    day: 1,
    title: 'Meet Yourself',
    subtitle: 'Honest self-assessment. Who are you really?',
    phase: 'CONFRONT',
    quote: 'The first step to transformation is seeing yourself clearly.',
    tasks: [
      { id: 'd1t1', title: 'Complete your Levav ID profile', description: 'Fill in all profile fields — be honest about your current skills and gaps.', type: 'action', completed: false, actionUrl: '/dashboard', actionLabel: 'Go to Profile' },
      { id: 'd1t2', title: 'Rate yourself honestly', description: 'Rate your confidence, communication, and leadership on a scale of 1-10. No one sees this but you.', type: 'reflection', completed: false },
      { id: 'd1t3', title: 'Write your "before" statement', description: 'Describe where you are today professionally. What are you struggling with? What do you want to change?', type: 'reflection', completed: false },
    ],
  },
  {
    day: 2,
    title: 'The Mirror',
    subtitle: 'CONFRONT your gaps. No excuses.',
    phase: 'CONFRONT',
    quote: 'You cannot change what you refuse to confront.',
    tasks: [
      { id: 'd2t1', title: 'Identify your top 3 skill gaps', description: 'Research 3 roles you want. List the skills you are missing for each.', type: 'reflection', completed: false },
      { id: 'd2t2', title: 'Take the Skill Gap Assessment', description: 'Complete a short assessment to identify your weakest areas.', type: 'quiz', completed: false, actionUrl: '/skill-gap', actionLabel: 'Start Assessment' },
      { id: 'd2t3', title: 'Share one gap with the community', description: 'Post in your cohort channel about one skill gap. Vulnerability builds connection.', type: 'external', completed: false },
    ],
  },
  {
    day: 3,
    title: 'First Step',
    subtitle: 'Pick up your first QuickWork™.',
    phase: 'CONFRONT',
    quote: 'Capability is proven through action, not intention.',
    tasks: [
      { id: 'd3t1', title: 'Browse QuickWork™ gigs', description: 'Look through available gigs and find one that matches your current skills.', type: 'action', completed: false, actionUrl: '/quickwork', actionLabel: 'Browse Gigs' },
      { id: 'd3t2', title: 'Apply to your first gig', description: 'Submit a thoughtful application. Explain why you are the right person.', type: 'action', completed: false },
      { id: 'd3t3', title: 'Set your work schedule', description: 'Block out time on your calendar for gig work. Treat it like a real job.', type: 'reflection', completed: false },
    ],
  },
  {
    day: 4,
    title: 'Learn Something',
    subtitle: 'Start your first lesson.',
    phase: 'CONFRONT',
    quote: 'The day you stop learning is the day you stop growing.',
    tasks: [
      { id: 'd4t1', title: 'Enroll in a Learn course', description: 'Find a course in your field and enroll. Commit to finishing it.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Browse Courses' },
      { id: 'd4t2', title: 'Complete Lesson 1', description: 'Finish the first lesson of your chosen course. Take notes.', type: 'action', completed: false },
      { id: 'd4t3', title: 'Share one key takeaway', description: 'Post one thing you learned in your cohort channel.', type: 'external', completed: false },
    ],
  },
  {
    day: 5,
    title: 'Give Back',
    subtitle: 'Volunteer at a Levav Impact™ partner.',
    phase: 'CONFRONT',
    quote: 'True leadership begins with service.',
    tasks: [
      { id: 'd5t1', title: 'Find an Impact opportunity', description: 'Browse NGOs and community organizations that need your skills.', type: 'action', completed: false, actionUrl: '/impact', actionLabel: 'Find Opportunities' },
      { id: 'd5t2', title: 'Apply to volunteer', description: 'Submit a volunteer application. Even 2 hours counts.', type: 'action', completed: false },
      { id: 'd5t3', title: 'Document your commitment', description: 'Write a short post about why you chose this cause.', type: 'reflection', completed: false },
    ],
  },
  {
    day: 6,
    title: 'The Grind',
    subtitle: 'CONFRONT the hard work.',
    phase: 'CONFRONT',
    quote: 'There is no shortcut to any place worth going.',
    tasks: [
      { id: 'd6t1', title: 'Work on your gig', description: 'Spend at least 2 hours on your QuickWork™ gig. Deliver something.', type: 'action', completed: false },
      { id: 'd6t2', title: 'Complete Lesson 2', description: 'Continue your learning journey. Finish the next lesson.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Continue Learning' },
      { id: 'd6t3', title: 'Track your time', description: 'Log your hours honestly. Accountability is a skill.', type: 'reflection', completed: false },
    ],
  },
  {
    day: 7,
    title: 'Week 1 Checkpoint',
    subtitle: 'Review. Reflect. Recalibrate.',
    phase: 'CONFRONT',
    quote: 'Progress is measured by the distance between who you were and who you are becoming.',
    tasks: [
      { id: 'd7t1', title: 'Complete the Week 1 review', description: 'Answer reflection questions about your first week.', type: 'quiz', completed: false },
      { id: 'd7t2', title: 'Review your progress', description: 'Review the work you completed this week.', type: 'action', completed: false, actionUrl: '/dashboard', actionLabel: 'View progress' },
      { id: 'd7t3', title: 'Celebrate small wins', description: 'Share one win from this week with your cohort. You have earned it.', type: 'external', completed: false },
    ],
  },
  // Week 2: DISSECT (Days 8-14)
  {
    day: 8, title: 'Deep Dive', subtitle: 'DISSECT your craft.', phase: 'DISSECT',
    quote: 'Mastery requires understanding the details.',
    tasks: [
      { id: 'd8t1', title: 'Complete Lesson 3', description: 'Push through the hard parts of your course.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Continue Course' },
      { id: 'd8t2', title: 'Submit gig milestone', description: 'Send your employer a progress update. Communication builds trust.', type: 'action', completed: false },
      { id: 'd8t3', title: 'Study a champion\'s journey', description: 'Read or watch a Levav Champion\'s story. What can you learn?', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Browse Champions' },
    ],
  },
  {
    day: 9, title: 'Feedback Loop', subtitle: 'DISSECT your performance.', phase: 'DISSECT',
    quote: 'Feedback is the breakfast of champions.',
    tasks: [
      { id: 'd9t1', title: 'Request feedback on your gig', description: 'Ask your employer for honest feedback on your work so far.', type: 'action', completed: false },
      { id: 'd9t2', title: 'Reflect on the feedback', description: 'Write down what you heard. What will you do differently?', type: 'reflection', completed: false },
      { id: 'd9t3', title: 'Join a peer review session', description: 'Attend a cohort peer review call. Give and receive feedback.', type: 'external', completed: false },
    ],
  },
  {
    day: 10, title: 'Skill Sprint', subtitle: 'DISSECT and sharpen.', phase: 'DISSECT',
    quote: 'A sharp blade cuts better. A sharp skill opens more doors.',
    tasks: [
      { id: 'd10t1', title: 'Complete a course project', description: 'Finish a hands-on project from your Learn course.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Go to Course' },
      { id: 'd10t2', title: 'Complete your volunteer hours', description: 'Finish your committed volunteer hours at the NGO.', type: 'action', completed: false },
      { id: 'd10t3', title: 'Update your portfolio', description: 'Add your new project to your Levav profile.', type: 'action', completed: false, actionUrl: '/dashboard', actionLabel: 'Update Profile' },
    ],
  },
  {
    day: 11, title: 'Network', subtitle: 'DISSECT your connections.', phase: 'DISSECT',
    quote: 'Your network is your net worth.',
    tasks: [
      { id: 'd11t1', title: 'Reach out to a champion', description: 'Send a thoughtful message to a Levav Champion in your field.', type: 'action', completed: false },
      { id: 'd11t2', title: 'Attend a virtual event', description: 'Join a Levav community event or webinar.', type: 'external', completed: false },
      { id: 'd11t3', title: 'Help someone in your cohort', description: 'Answer a question or share a resource with a fellow learner.', type: 'external', completed: false },
    ],
  },
  {
    day: 12, title: 'Deliver', subtitle: 'DISSECT your work quality.', phase: 'DISSECT',
    quote: 'Excellence is not an act, but a habit.',
    tasks: [
      { id: 'd12t1', title: 'Submit your completed gig', description: 'Deliver your final work to the employer. Make it excellent.', type: 'action', completed: false },
      { id: 'd12t2', title: 'Request a review', description: 'Ask your employer to leave a review of your work.', type: 'action', completed: false },
      { id: 'd12t3', title: 'Document what you learned', description: 'Write a case study about your gig experience. What worked? What did not?', type: 'reflection', completed: false },
    ],
  },
  {
    day: 13, title: 'Double Down', subtitle: 'DISSECT your weaknesses.', phase: 'DISSECT',
    quote: 'The obstacle is the way.',
    tasks: [
      { id: 'd13t1', title: 'Apply for a second gig', description: 'Now that you have experience, apply for a more challenging gig.', type: 'action', completed: false, actionUrl: '/quickwork', actionLabel: 'Browse More Gigs' },
      { id: 'd13t2', title: 'Start a second course', description: 'Begin learning in a complementary skill area.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Find a Course' },
      { id: 'd13t3', title: 'Reassess your skill gaps', description: 'Take the skill gap assessment again. Have you improved?', type: 'quiz', completed: false, actionUrl: '/skill-gap', actionLabel: 'Re-take Assessment' },
    ],
  },
  {
    day: 14, title: 'Week 2 Checkpoint', subtitle: 'DISSECT your progress.', phase: 'DISSECT',
    quote: 'Two weeks of consistent effort create momentum.',
    tasks: [
      { id: 'd14t1', title: 'Complete Week 2 review', description: 'Reflect on your growth over the past two weeks.', type: 'quiz', completed: false },
      { id: 'd14t2', title: 'Celebrate with your cohort', description: 'Share your biggest win from Week 2.', type: 'external', completed: false },
      { id: 'd14t3', title: 'Plan Week 3 goals', description: 'Set specific, measurable goals for the next phase.', type: 'reflection', completed: false },
    ],
  },
  // Week 3: OWN (Days 15-21)
  {
    day: 15, title: 'Take Ownership', subtitle: 'OWN your path.', phase: 'OWN',
    quote: 'The moment you take ownership is the moment your transformation accelerates.',
    tasks: [
      { id: 'd15t1', title: 'Create something original', description: 'Build a small project, write an article, or create a design entirely your own.', type: 'action', completed: false },
      { id: 'd15t2', title: 'Complete your first course', description: 'Finish the Learn course you started. Claim your certificate.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Finish Course' },
      { id: 'd15t3', title: 'Write your OWN manifesto', description: 'Write 3 paragraphs about who you are becoming. No limits.', type: 'reflection', completed: false },
    ],
  },
  {
    day: 16, title: 'Teach', subtitle: 'OWN by teaching others.', phase: 'OWN',
    quote: 'The best way to learn is to teach.',
    tasks: [
      { id: 'd16t1', title: 'Mentor a new cohort member', description: 'Help someone who is behind you in the program.', type: 'external', completed: false },
      { id: 'd16t2', title: 'Share your knowledge', description: 'Create a short post or video teaching one thing you have learned.', type: 'action', completed: false },
      { id: 'd16t3', title: 'Complete your second gig', description: 'Deliver excellent work on your second QuickWork™ gig.', type: 'action', completed: false },
    ],
  },
  {
    day: 17, title: 'Build', subtitle: 'OWN your portfolio.', phase: 'OWN',
    quote: 'Show, do not tell. Your portfolio is your proof.',
    tasks: [
      { id: 'd17t1', title: 'Polish your Levav profile', description: 'Add all your completed work, reviews, and certificates.', type: 'action', completed: false, actionUrl: '/dashboard', actionLabel: 'Update Profile' },
      { id: 'd17t2', title: 'Complete another volunteer session', description: 'Return to your Impact partner. Consistency matters.', type: 'action', completed: false, actionUrl: '/impact', actionLabel: 'Find Volunteer Work' },
      { id: 'd17t3', title: 'Get a positive review', description: 'Earn a 4+ star review on your completed work.', type: 'action', completed: false },
    ],
  },
  {
    day: 18, title: 'Specialize', subtitle: 'OWN your niche.', phase: 'OWN',
    quote: 'A specialist is worth 10 generalists.',
    tasks: [
      { id: 'd18t1', title: 'Choose your specialization', description: 'Decide on one area to become exceptional at.', type: 'reflection', completed: false },
      { id: 'd18t2', title: 'Deep-dive course', description: 'Start an advanced course in your specialization.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Browse Advanced Courses' },
      { id: 'd18t3', title: 'Apply to a premium gig', description: 'Apply for a higher-budget gig in your specialty area.', type: 'action', completed: false, actionUrl: '/quickwork', actionLabel: 'Find Premium Gigs' },
    ],
  },
  {
    day: 19, title: 'Lead', subtitle: 'OWN your influence.', phase: 'OWN',
    quote: 'Leadership is not a title. It is an action.',
    tasks: [
      { id: 'd19t1', title: 'Lead a cohort discussion', description: 'Facilitate a group discussion or study session.', type: 'external', completed: false },
      { id: 'd19t2', title: 'Volunteer as a team lead', description: 'Take a leadership role in your Impact project.', type: 'action', completed: false, actionUrl: '/impact', actionLabel: 'Find Leadership Role' },
      { id: 'd19t3', title: 'Request a recommendation', description: 'Ask someone you have worked with to write you a recommendation.', type: 'action', completed: false },
    ],
  },
  {
    day: 20, title: 'Iterate', subtitle: 'OWN your improvement.', phase: 'OWN',
    quote: 'Iteration is the engine of excellence.',
    tasks: [
      { id: 'd20t1', title: 'Complete another course module', description: 'Keep learning. Momentum compounds.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Continue Learning' },
      { id: 'd20t2', title: 'Deliver another gig milestone', description: 'Consistent delivery builds your reputation.', type: 'action', completed: false },
      { id: 'd20t3', title: 'Reflect on your transformation', description: 'Compare yourself today to Day 1. What has changed?', type: 'reflection', completed: false },
    ],
  },
  {
    day: 21, title: 'Week 3 Checkpoint', subtitle: 'OWN your progress.', phase: 'OWN',
    quote: 'Three weeks of ownership makes you a different person.',
    tasks: [
      { id: 'd21t1', title: 'Complete Week 3 review', description: 'Assess your progress across all dimensions.', type: 'quiz', completed: false },
      { id: 'd21t2', title: 'Review your progress', description: 'Review the work you completed this week.', type: 'action', completed: false, actionUrl: '/dashboard', actionLabel: 'View progress' },
      { id: 'd21t3', title: 'Plan your EXECUTE phase', description: 'Set goals for the final week of transformation.', type: 'reflection', completed: false },
    ],
  },
  // Week 4: EXECUTE (Days 22-28)
  {
    day: 22, title: 'The Sprint', subtitle: 'EXECUTE with everything you have.', phase: 'EXECUTE',
    quote: 'The final week is where champions are made.',
    tasks: [
      { id: 'd22t1', title: 'Pick up an urgent gig', description: 'Find a gig with a tight deadline. Test yourself under pressure.', type: 'action', completed: false, actionUrl: '/quickwork', actionLabel: 'Find Urgent Gigs' },
      { id: 'd22t2', title: 'Accelerate your learning', description: 'Complete two lessons in one day. Sprint mode.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Accelerate Learning' },
      { id: 'd22t3', title: 'Help someone complete a challenge', description: 'Support a struggling cohort member. Teaching reinforces learning.', type: 'external', completed: false },
    ],
  },
  {
    day: 23, title: 'Excellence', subtitle: 'EXECUTE at your highest level.', phase: 'EXECUTE',
    quote: 'Excellence is the gradual result of always striving to do better.',
    tasks: [
      { id: 'd23t1', title: 'Deliver exceptional work', description: 'Go above and beyond on your current gig. Make the client say "wow".', type: 'action', completed: false },
      { id: 'd23t2', title: 'Complete your specialization course', description: 'Finish your advanced course. Claim your certificate.', type: 'action', completed: false, actionUrl: '/learn', actionLabel: 'Complete Course' },
      { id: 'd23t3', title: 'Document your best work', description: 'Create a showcase of your best deliverables from the program.', type: 'action', completed: false },
    ],
  },
  {
    day: 24, title: 'Legacy', subtitle: 'EXECUTE for impact.', phase: 'EXECUTE',
    quote: 'Leave every place better than you found it.',
    tasks: [
      { id: 'd24t1', title: 'Complete your Impact project', description: 'Deliver your volunteer project. Document the impact.', type: 'action', completed: false, actionUrl: '/impact', actionLabel: 'Complete Project' },
      { id: 'd24t2', title: 'Get a 5-star review', description: 'Earn a top review by delivering outstanding work.', type: 'action', completed: false },
      { id: 'd24t3', title: 'Write an impact report', description: 'Document what your volunteer work achieved for the community.', type: 'reflection', completed: false },
    ],
  },
  {
    day: 25, title: 'Showcase', subtitle: 'EXECUTE your presentation.', phase: 'EXECUTE',
    quote: 'If people do not know what you can do, you might as well not do it.',
    tasks: [
      { id: 'd25t1', title: 'Create your portfolio showcase', description: 'Compile your best work into a presentable portfolio.', type: 'action', completed: false, actionUrl: '/dashboard', actionLabel: 'Build Portfolio' },
      { id: 'd25t2', title: 'Record a 2-minute intro video', description: 'Create a short video introducing yourself and your skills.', type: 'upload', completed: false },
      { id: 'd25t3', title: 'Share your portfolio', description: 'Post your portfolio in the community for feedback.', type: 'external', completed: false },
    ],
  },
  {
    day: 26, title: 'Connect', subtitle: 'EXECUTE your network.', phase: 'EXECUTE',
    quote: 'Opportunities do not happen. You create them.',
    tasks: [
      { id: 'd26t1', title: 'Apply to 3 opportunities', description: 'Apply to real jobs or gigs using your new profile and portfolio.', type: 'action', completed: false, actionUrl: '/opportunities', actionLabel: 'Browse Opportunities' },
      { id: 'd26t2', title: 'Attend a networking event', description: 'Join a Levav networking event. Make 3 new connections.', type: 'external', completed: false },
      { id: 'd26t3', title: 'Follow up with a champion', description: 'Revisit a champion connection. Share what you have built.', type: 'action', completed: false },
    ],
  },
  {
    day: 27, title: 'Final Push', subtitle: 'EXECUTE the last mile.', phase: 'EXECUTE',
    quote: 'The last mile is always the hardest. That is why most people never finish.',
    tasks: [
      { id: 'd27t1', title: 'Complete all pending tasks', description: 'Go back and finish any incomplete tasks from previous days.', type: 'action', completed: false },
      { id: 'd27t2', title: 'Deliver final gig work', description: 'Complete all outstanding gig deliverables.', type: 'action', completed: false },
      { id: 'd27t3', title: 'Write your transformation story', description: 'Document your full 28-day journey. This is your story.', type: 'reflection', completed: false },
    ],
  },
  {
    day: 28, title: 'Levav Graduate',
    subtitle: 'You are not the same person who started.',
    phase: 'EXECUTE',
    quote: 'The person who finishes Day 28 is not the same person who started Day 1.',
    tasks: [
      { id: 'd28t1', title: 'Complete the Final Assessment', description: 'Demonstrate everything you have learned in the final assessment.', type: 'quiz', completed: false },
      { id: 'd28t2', title: 'Claim your Levav 28™ Certificate', description: 'Download your certificate of completion. You earned it.', type: 'action', completed: false },
      { id: 'd28t3', title: 'Write your "after" statement', description: 'Compare to your Day 1 statement. Celebrate the transformation.', type: 'reflection', completed: false },
      { id: 'd28t4', title: 'Become a mentor', description: 'Commit to helping the next cohort. Leadership is service.', type: 'external', completed: false },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// LEARN — Courses with Lessons
// ═══════════════════════════════════════════════════════════════

export const LEARN_COURSES: LearnCourse[] = [
  {
    id: 'prof-dev-101',
    title: 'Professional Development Fundamentals',
    description: 'Master the core skills every African professional needs: communication, time management, and workplace etiquette.',
    instructor: 'Dr. Amina Okafor',
    instructorRole: 'Leadership Coach & Levav Champion',
    category: 'Professional Development',
    duration: '6 lessons • 4 hours',
    thumbnail: '📘',
    enrolled: false,
    completed: false,
    progress: 0,
    lessons: [
      { id: 'pd-l1', title: 'The African Professional Identity', duration: '35 min', type: 'video', completed: false, content: 'Understanding what it means to be a professional in the African context. We explore workplace culture, expectations, and how to position yourself for success.' },
      { id: 'pd-l2', title: 'Communication That Moves People', duration: '40 min', type: 'video', completed: false, content: 'Learn to communicate clearly, persuasively, and professionally. Covers email writing, presentations, and difficult conversations.' },
      { id: 'pd-l3', title: 'Time Management for High Performers', duration: '30 min', type: 'article', completed: false, content: 'Practical frameworks for managing your time, prioritizing tasks, and delivering consistently. Includes the Eisenhower Matrix and Pomodoro technique adapted for African work contexts.' },
      { id: 'pd-l4', title: 'Building Your Professional Network', duration: '45 min', type: 'video', completed: false, content: 'Networking strategies that work in African business contexts. From LinkedIn to local professional associations.' },
      { id: 'pd-l5', title: 'Financial Literacy for Professionals', duration: '50 min', type: 'video', completed: false, content: 'Personal finance, budgeting, negotiating salaries, and understanding benefits packages in African markets.' },
      { id: 'pd-l6', title: 'Capstone: Your Professional Plan', duration: '20 min', type: 'project', completed: false, content: 'Create a 12-month professional development plan with specific goals, milestones, and accountability measures.' },
    ],
  },
  {
    id: 'ux-design-101',
    title: 'UX Design for African Markets',
    description: 'Learn to design user experiences that work for African users — from low-bandwidth considerations to mobile-first design patterns.',
    instructor: 'Amara Nwosu',
    instructorRole: 'Senior UX Designer & Levav Champion',
    category: 'Skills Development',
    duration: '8 lessons • 6 hours',
    thumbnail: '🎨',
    enrolled: false,
    completed: false,
    progress: 0,
    lessons: [
      { id: 'ux-l1', title: 'UX Principles for African Users', duration: '45 min', type: 'video', completed: false, content: 'Understanding the unique needs, constraints, and opportunities of designing for African users.' },
      { id: 'ux-l2', title: 'Research Methods That Work Here', duration: '50 min', type: 'video', completed: false, content: 'User research techniques adapted for African contexts — from community interviews to remote usability testing.' },
      { id: 'ux-l3', title: 'Wireframing and Prototyping', duration: '40 min', type: 'article', completed: false, content: 'Tools and techniques for creating effective wireframes and prototypes. Focus on low-fidelity approaches that work with limited resources.' },
      { id: 'ux-l4', title: 'Mobile-First Design Patterns', duration: '45 min', type: 'video', completed: false, content: 'Designing for mobile devices with small screens, limited data, and varying connectivity.' },
      { id: 'ux-l5', title: 'Accessibility in African Contexts', duration: '35 min', type: 'article', completed: false, content: 'Making your designs accessible to users with disabilities, low literacy, and limited tech experience.' },
      { id: 'ux-l6', title: 'Design Systems for Scale', duration: '40 min', type: 'video', completed: false, content: 'Building reusable design systems that can scale across teams and products.' },
      { id: 'ux-l7', title: 'Portfolio Project: Redesign a Local App', duration: '60 min', type: 'project', completed: false, content: 'Complete a full UX redesign of a popular African app. Document your process from research to final prototype.' },
      { id: 'ux-l8', title: 'Getting Hired as a UX Designer', duration: '30 min', type: 'video', completed: false, content: 'Building a UX portfolio, preparing for interviews, and landing your first UX role in Africa.' },
    ],
  },
  {
    id: 'data-science-101',
    title: 'Data Science for African Problems',
    description: 'Learn data analysis and machine learning by solving real problems facing African communities and businesses.',
    instructor: 'Zara Mensah',
    instructorRole: 'Data Scientist & Levav Champion',
    category: 'Skills Development',
    duration: '10 lessons • 8 hours',
    thumbnail: '📊',
    enrolled: false,
    completed: false,
    progress: 0,
    lessons: [
      { id: 'ds-l1', title: 'Data Thinking for Africa', duration: '40 min', type: 'video', completed: false, content: 'Introduction to data science with African case studies. Learn how data is transforming agriculture, health, and finance across the continent.' },
      { id: 'ds-l2', title: 'Python for Data Analysis', duration: '50 min', type: 'video', completed: false, content: 'Python fundamentals with a focus on data manipulation libraries: Pandas, NumPy, and Matplotlib.' },
      { id: 'ds-l3', title: 'Data Collection in Low-Resource Settings', duration: '45 min', type: 'article', completed: false, content: 'Techniques for collecting quality data when infrastructure is limited. Mobile surveys, satellite data, and creative data sources.' },
      { id: 'ds-l4', title: 'Cleaning Messy Real-World Data', duration: '55 min', type: 'video', completed: false, content: 'Data cleaning techniques for the messy, incomplete datasets common in African contexts.' },
      { id: 'ds-l5', title: 'Visualization That Tells Stories', duration: '40 min', type: 'video', completed: false, content: 'Creating compelling data visualizations that communicate insights to non-technical audiences.' },
      { id: 'ds-l6', title: 'Introduction to Machine Learning', duration: '60 min', type: 'video', completed: false, content: 'ML fundamentals: supervised vs unsupervised learning, model training, and evaluation.' },
      { id: 'ds-l7', title: 'Project: Predict Crop Yields', duration: '45 min', type: 'project', completed: false, content: 'Build a machine learning model to predict crop yields using weather and soil data.' },
      { id: 'ds-l8', title: 'Ethical AI for Africa', duration: '35 min', type: 'article', completed: false, content: 'Understanding bias, fairness, and ethics in AI systems deployed in African contexts.' },
      { id: 'ds-l9', title: 'Deploying Models in Production', duration: '50 min', type: 'video', completed: false, content: 'Taking your ML model from notebook to production. Cloud deployment and API creation.' },
      { id: 'ds-l10', title: 'Building a Data Science Career', duration: '30 min', type: 'video', completed: false, content: 'Portfolio building, interview preparation, and career paths in African data science.' },
    ],
  },
  {
    id: 'champion-leadership',
    title: 'Champion Leadership Program',
    description: 'Develop the leadership skills Africa needs. Learn from Levav Champions who have built successful careers and businesses.',
    instructor: 'Kofi Asante',
    instructorRole: 'Executive Coach & Levav Champion',
    category: 'Leadership Training',
    duration: '8 lessons • 6 hours',
    thumbnail: '👑',
    enrolled: false,
    completed: false,
    progress: 0,
    lessons: [
      { id: 'cl-l1', title: 'The African Leader\'s Mindset', duration: '40 min', type: 'video', completed: false, content: 'What makes African leaders different? Explore servant leadership, ubuntu philosophy, and leading with purpose.' },
      { id: 'cl-l2', title: 'Building High-Performance Teams', duration: '50 min', type: 'video', completed: false, content: 'How to recruit, motivate, and retain talent in African teams. Cultural considerations and practical strategies.' },
      { id: 'cl-l3', title: 'Strategic Thinking', duration: '45 min', type: 'article', completed: false, content: 'Frameworks for strategic planning and decision-making. From vision to execution.' },
      { id: 'cl-l4', title: 'Leading Through Crisis', duration: '40 min', type: 'video', completed: false, content: 'Crisis management lessons from African business leaders. Adaptability, resilience, and communication under pressure.' },
      { id: 'cl-l5', title: 'Mentoring the Next Generation', duration: '35 min', type: 'video', completed: false, content: 'How to be an effective mentor. Structuring mentorship relationships and creating impact.' },
      { id: 'cl-l6', title: 'Building Your Personal Brand', duration: '45 min', type: 'article', completed: false, content: 'Positioning yourself as a thought leader. Content creation, speaking, and community building.' },
      { id: 'cl-l7', title: 'Project: Design a Leadership Initiative', duration: '30 min', type: 'project', completed: false, content: 'Create a plan for a leadership initiative in your community or organization.' },
      { id: 'cl-l8', title: 'Becoming a Levav Champion', duration: '25 min', type: 'video', completed: false, content: 'The path to becoming a Levav Champion. Requirements, expectations, and the application process.' },
    ],
  },
  {
    id: 'web-dev-101',
    title: 'Full-Stack Web Development',
    description: 'Build modern web applications from scratch. Covers HTML, CSS, JavaScript, React, and backend fundamentals.',
    instructor: 'Tendai Moyo',
    instructorRole: 'Senior Developer & Levav Champion',
    category: 'Skills Development',
    duration: '12 lessons • 10 hours',
    thumbnail: '💻',
    enrolled: false,
    completed: false,
    progress: 0,
    lessons: [
      { id: 'wd-l1', title: 'Web Development Fundamentals', duration: '45 min', type: 'video', completed: false, content: 'How the web works. HTTP, browsers, servers, and the request-response cycle.' },
      { id: 'wd-l2', title: 'HTML & CSS Mastery', duration: '60 min', type: 'video', completed: false, content: 'Building responsive, accessible web pages with modern HTML5 and CSS3.' },
      { id: 'wd-l3', title: 'JavaScript Deep Dive', duration: '55 min', type: 'video', completed: false, content: 'JavaScript fundamentals: variables, functions, DOM manipulation, and async programming.' },
      { id: 'wd-l4', title: 'React for Beginners', duration: '50 min', type: 'video', completed: false, content: 'Building interactive UIs with React. Components, state, props, and hooks.' },
      { id: 'wd-l5', title: 'Building REST APIs', duration: '45 min', type: 'article', completed: false, content: 'Creating backend APIs with Node.js and Express. Routing, middleware, and error handling.' },
      { id: 'wd-l6', title: 'Database Design', duration: '40 min', type: 'video', completed: false, content: 'Designing databases with PostgreSQL. Schema design, relationships, and queries.' },
      { id: 'wd-l7', title: 'Authentication & Security', duration: '50 min', type: 'video', completed: false, content: 'Implementing user authentication, JWT tokens, and security best practices.' },
      { id: 'wd-l8', title: 'Deploying to the Cloud', duration: '35 min', type: 'article', completed: false, content: 'Deploying your web app to AWS, Vercel, or Netlify. CI/CD basics.' },
      { id: 'wd-l9', title: 'Project: Build a Portfolio Site', duration: '45 min', type: 'project', completed: false, content: 'Build and deploy your own portfolio website from scratch.' },
      { id: 'wd-l10', title: 'Mobile-First Development', duration: '30 min', type: 'video', completed: false, content: 'Designing and building websites that work perfectly on mobile devices.' },
      { id: 'wd-l11', title: 'Performance Optimization', duration: '35 min', type: 'article', completed: false, content: 'Making your web app fast. Lazy loading, code splitting, and caching strategies.' },
      { id: 'wd-l12', title: 'Getting Your First Dev Job', duration: '30 min', type: 'video', completed: false, content: 'Interview preparation, portfolio reviews, and job search strategies for African developers.' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// QUICKWORK™ — Gig Marketplace Data
// ═══════════════════════════════════════════════════════════════

export const QUICKWORK_GIGS: QuickWorkGig[] = [
  {
    id: 'qw-1', title: 'Design a Landing Page', description: 'Create a beautiful, responsive landing page for a Zambian fintech startup. Must work on mobile and low-bandwidth connections.', category: 'Design', skills: ['Web Design', 'Figma', 'CSS'], budget: 'ZMW 2,500', duration: '3-5 days', location: 'Remote', employer: 'FinVentures Zambia', employerRating: 4.8, postedAt: '2 days ago', deadline: '5 days', applicants: 8, status: 'open',
  },
  {
    id: 'qw-2', title: 'Social Media Content Calendar', description: 'Create a 30-day social media content calendar for an agricultural NGO targeting smallholder farmers in East Africa.', category: 'Marketing', skills: ['Social Media Management', 'Content Writing'], budget: 'KES 15,000', duration: '2-3 days', location: 'Remote', employer: 'GreenHarvest NGO', employerRating: 4.6, postedAt: '1 day ago', deadline: '4 days', applicants: 12, status: 'open',
  },
  {
    id: 'qw-3', title: 'Mobile App UI Design', description: 'Design the UI for a health-tech app that connects patients with doctors in rural Nigeria. 15 screens total.', category: 'Design', skills: ['UI/UX Design', 'Mobile Design'], budget: '\u20A6120,000', duration: '7-10 days', location: 'Remote', employer: 'HealthBridge NG', employerRating: 4.9, postedAt: '3 days ago', deadline: '10 days', applicants: 5, status: 'open',
  },
  {
    id: 'qw-4', title: 'Data Entry & Analysis', description: 'Clean and analyze survey data from 500 respondents for a youth employment study in Ghana.', category: 'Data', skills: ['Data Analysis', 'Excel', 'SPSS'], budget: 'GHS 3,500', duration: '5-7 days', location: 'Remote', employer: 'YouthWorks Ghana', employerRating: 4.5, postedAt: '4 days ago', deadline: '8 days', applicants: 20, status: 'open',
  },
  {
    id: 'qw-5', title: 'Write Product Descriptions', description: 'Write 50 compelling product descriptions for an e-commerce platform selling African artisan goods.', category: 'Writing', skills: ['Content Writing', 'Copywriting'], budget: 'USD 200', duration: '3-4 days', location: 'Remote', employer: 'AfriCraft Marketplace', employerRating: 4.7, postedAt: '1 day ago', deadline: '5 days', applicants: 15, status: 'open',
  },
  {
    id: 'qw-6', title: 'Translate Website to Swahili', description: 'Translate a 20-page website from English to Swahili. Must maintain brand voice and cultural relevance.', category: 'Translation', skills: ['Translation', 'Swahili'], budget: 'KES 25,000', duration: '5-7 days', location: 'Remote', employer: 'SokoTech Kenya', employerRating: 4.4, postedAt: '2 days ago', deadline: '7 days', applicants: 9, status: 'open',
  },
  {
    id: 'qw-7', title: 'Build a Chatbot', description: 'Create a simple FAQ chatbot for a university admissions office. Must handle English and French queries.', category: 'Development', skills: ['Software Development', 'NLP'], budget: 'CFA 150,000', duration: '10-14 days', location: 'Remote', employer: 'Université de Dakar', employerRating: 4.8, postedAt: '5 days ago', deadline: '14 days', applicants: 6, status: 'open',
  },
  {
    id: 'qw-8', title: 'Event Photography', description: 'Photograph a 2-day tech conference in Kigali. Deliver 100 edited photos within 48 hours.', category: 'Creative', skills: ['Photography', 'Photo Editing'], budget: 'RWF 80,000', duration: '2 days + editing', location: 'Kigali, Rwanda', employer: 'Kigali Tech Hub', employerRating: 4.9, postedAt: '1 day ago', deadline: '3 days', applicants: 4, status: 'open',
  },
  {
    id: 'qw-9', title: 'Create Training Videos', description: 'Produce 5 short training videos (5-10 min each) on financial literacy for rural communities.', category: 'Creative', skills: ['Videography', 'Content Creation'], budget: 'TZS 500,000', duration: '7-10 days', location: 'Dar es Salaam, Tanzania', employer: 'Tanzania Financial Inclusion', employerRating: 4.6, postedAt: '3 days ago', deadline: '10 days', applicants: 7, status: 'open',
  },
  {
    id: 'qw-10', title: 'Database Migration', description: 'Migrate a MySQL database to PostgreSQL for a growing logistics company. Must maintain data integrity.', category: 'Development', skills: ['Software Development', 'Database Design'], budget: 'EGP 8,000', duration: '5-7 days', location: 'Remote', employer: 'Nile Logistics', employerRating: 4.7, postedAt: '2 days ago', deadline: '7 days', applicants: 3, status: 'open',
  },
  {
    id: 'qw-11', title: 'Brand Identity Design', description: 'Create a complete brand identity package (logo, colors, typography) for a new organic food startup.', category: 'Design', skills: ['Graphic Design', 'Branding'], budget: 'ZMW 4,000', duration: '7-10 days', location: 'Remote', employer: 'Zambia Organics', employerRating: 4.5, postedAt: '4 days ago', deadline: '10 days', applicants: 11, status: 'open',
  },
  {
    id: 'qw-12', title: 'Customer Support Setup', description: 'Set up a customer support system (Zendesk or similar) for an e-commerce company. Train 3 staff members.', category: 'Operations', skills: ['Operations', 'Customer Service'], budget: 'USD 350', duration: '5-7 days', location: 'Remote', employer: 'ShopAfrica', employerRating: 4.3, postedAt: '6 days ago', deadline: '10 days', applicants: 8, status: 'open',
  },
];

// ═══════════════════════════════════════════════════════════════
// IMPACT — Volunteer Opportunities
// ═══════════════════════════════════════════════════════════════

export const IMPACT_OPPORTUNITIES: ImpactOpportunity[] = [
  {
    id: 'imp-1', organization: 'Teach For Zambia', type: 'Education', location: 'Lusaka & Copperbelt', description: 'Volunteer as a tutor for underprivileged students in government schools. Subjects: Mathematics, Science, English.', hoursRequired: 4, skills: ['Teaching', 'Mentoring'], logo: '📚',
  },
  {
    id: 'imp-2', organization: 'Green Africa Initiative', type: 'Environment', location: 'Nairobi, Kenya', description: 'Help plant trees, clean waterways, and educate communities on sustainable farming practices.', hoursRequired: 6, skills: ['Community Organizing', 'Agriculture'], logo: '🌱',
  },
  {
    id: 'imp-3', organization: 'Tech4Good Ghana', type: 'Technology', location: 'Accra, Ghana', description: 'Teach basic computer skills to youth in underserved communities. Curriculum provided.', hoursRequired: 3, skills: ['Software Development', 'Teaching'], logo: '💻',
  },
  {
    id: 'imp-4', organization: 'MamaCare Nigeria', type: 'Healthcare', location: 'Lagos, Nigeria', description: 'Assist with maternal health outreach programs. Help register expectant mothers for prenatal care.', hoursRequired: 5, skills: ['Healthcare', 'Community Organizing'], logo: '🏥',
  },
  {
    id: 'imp-5', organization: 'Youth Leadership Rwanda', type: 'Leadership', location: 'Kigali, Rwanda', description: 'Mentor young entrepreneurs through a 12-week business development program.', hoursRequired: 2, skills: ['Business Analysis', 'Mentoring'], logo: '🌟',
  },
  {
    id: 'imp-6', organization: 'Water For All Senegal', type: 'Infrastructure', location: 'Dakar, Senegal', description: 'Help map water access points and document community needs for clean water infrastructure.', hoursRequired: 8, skills: ['Data Analysis', 'Project Management'], logo: '💧',
  },
];

// ═══════════════════════════════════════════════════════════════
// FEED — professional community feed
// ═══════════════════════════════════════════════════════════════

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'feed-1', authorId: 'seed-grace', authorName: 'Grace Lungu', authorInitials: 'GL',
    authorMeta: 'Product Designer · Lusaka', verified: true,
    body: 'Day 21 of Levav 28™: shipped my first full case study. The mock-office brief pushed me harder than any tutorial ever has. Grateful for the cohort that kept me accountable.',
    tag: 'Levav 28™ milestone', moodIcon: 'milestone',
    likedBy: ['seed-kofi', 'seed-amara'], comments: [
      { id: 'c-1', authorId: 'seed-kofi', authorName: 'Kofi Mensah', body: 'This is excellent work, Grace. The layout system alone shows real range.', createdAt: '2026-07-25T09:00:00.000Z' },
    ], createdAt: '2026-07-24T14:00:00.000Z', isSeed: true,
  },
  {
    id: 'feed-2', authorId: 'seed-kofi', authorName: 'Kofi Mensah', authorInitials: 'KM',
    authorMeta: 'Engineering Team Lead · Accra', verified: true,
    body: 'We hired two engineers through Levav last quarter. The difference: we saw real work evidence before the first interview. No more resumes that say everything and prove nothing.',
    tag: 'Hiring insight',
    likedBy: ['seed-grace', 'seed-amara', 'seed-thandiwe'], comments: [], createdAt: '2026-07-23T11:30:00.000Z', isSeed: true,
  },
  {
    id: 'feed-3', authorId: 'seed-amara', authorName: 'Amara Okafor', authorInitials: 'AO',
    authorMeta: 'Founder, Riverbend Studio · Lagos', verified: true,
    body: 'Posted a QuickWork gig on a Tuesday morning. Had three qualified applicants by lunch. This is what hiring for short-term expertise should feel like — no agencies, no three-week back-and-forth.',
    tag: 'QuickWork™ win', moodIcon: 'quickwin',
    likedBy: ['seed-kofi'], comments: [], createdAt: '2026-07-22T08:15:00.000Z', isSeed: true,
  },
  {
    id: 'feed-4', authorId: 'seed-thandiwe', authorName: 'Thandiwe Banda', authorInitials: 'TB',
    authorMeta: 'Volunteer Coordinator, Teach For Zambia · Lusaka',
    body: 'Six new tutors joined us this month through Levav Impact. Watching a first-year computer science student explain fractions to a room of ten-year-olds with this much patience — that\'s leadership too.',
    tag: 'Community', moodIcon: 'learning',
    likedBy: ['seed-grace', 'seed-kofi', 'seed-amara'], comments: [
      { id: 'c-2', authorId: 'seed-grace', authorName: 'Grace Lungu', body: 'This made my morning. Thank you for the work you do.', createdAt: '2026-07-21T16:00:00.000Z' },
    ], createdAt: '2026-07-20T13:45:00.000Z', isSeed: true,
  },
  {
    id: 'feed-5', authorId: 'seed-chidi', authorName: 'Chidi Eze', authorInitials: 'CE',
    authorMeta: 'Backend Engineer · Nairobi',
    body: 'Capable and available, not idle — took that QuickWork line personally. Picked up a 3-day API integration project between contracts instead of waiting around. Got paid and received a review.',
    tag: 'QuickWork™ win',
    likedBy: ['seed-amara', 'seed-thandiwe'], comments: [], createdAt: '2026-07-19T10:20:00.000Z', isSeed: true,
  },
  {
    id: 'feed-6', authorId: 'seed-fatima', authorName: 'Fatima Diallo', authorInitials: 'FD',
    authorMeta: 'Data Analyst · Dakar', verified: true,
    body: 'Reminder for anyone building in public: your Levav ID isn\'t a resume, it\'s a record of what you\'ve actually done. Every gig, every course, every volunteer hour compounds. Show up today.',
    tag: 'Motivation', moodIcon: 'community',
    likedBy: ['seed-grace', 'seed-chidi', 'seed-kofi', 'seed-amara'], comments: [], createdAt: '2026-07-18T07:00:00.000Z', isSeed: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// LOCALSTORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

const LS_KEYS = {
  levav28Progress: 'levav28_progress',
  levav28CurrentDay: 'levav28_current_day',
  learnProgress: 'learn_progress',
  quickworkApplications: 'quickwork_applications',
  quickworkMyGigs: 'quickwork_my_gigs',
  quickworkPostedGigs: 'quickwork_posted_gigs',
  impactPostedOpportunities: 'impact_posted_opportunities',
  impactApplicants: 'impact_applicants',
  feedPosts: 'feed_posts',
  feedFollowing: 'feed_following',
  contentStudio: 'content_studio',
};

// ─── Levav 28 Progress ───
export function getLevav28Progress(): Record<string, boolean> {
  return safeJSONParse(LS_KEYS.levav28Progress, {});
}

export function saveLevav28TaskCompletion(day: number, taskId: string, completed: boolean) {
  const progress = getLevav28Progress();
  progress[taskId] = completed;
  localStorage.setItem(LS_KEYS.levav28Progress, JSON.stringify(progress));
}

export function getCurrentDay(): number {
  const saved = localStorage.getItem(LS_KEYS.levav28CurrentDay);
  return saved ? parseInt(saved, 10) : 1;
}

export function setCurrentDay(day: number) {
  localStorage.setItem(LS_KEYS.levav28CurrentDay, String(day));
}

export function isDayUnlocked(day: number): boolean {
  if (day === 1) return true;
  const progress = getLevav28Progress();
  // Day N is unlocked if all tasks in Day N-1 are completed
  const prevDay = LEVAV28_DAYS[day - 2]; // 0-indexed
  if (!prevDay) return false;
  return prevDay.tasks.every((t) => progress[t.id]);
}

export function isDayCompleted(day: number): boolean {
  const progress = getLevav28Progress();
  const dayData = LEVAV28_DAYS[day - 1];
  if (!dayData) return false;
  return dayData.tasks.every((t) => progress[t.id]);
}

// ─── Learn Progress ───
export function getLearnProgress(): Record<string, { enrolled: boolean; completed: boolean; progress: number; lessonProgress: Record<string, boolean> }> {
  return safeJSONParse(LS_KEYS.learnProgress, {});
}

export function saveLessonCompletion(courseId: string, lessonId: string) {
  const progress = getLearnProgress();
  if (!progress[courseId]) {
    progress[courseId] = { enrolled: true, completed: false, progress: 0, lessonProgress: {} };
  }
  progress[courseId].lessonProgress[lessonId] = true;

  // Recalculate course progress
  const course = LEARN_COURSES.find((c) => c.id === courseId);
  if (course) {
    const completedLessons = Object.values(progress[courseId].lessonProgress).filter(Boolean).length;
    progress[courseId].progress = Math.round((completedLessons / course.lessons.length) * 100);
    progress[courseId].completed = progress[courseId].progress === 100;
  }

  localStorage.setItem(LS_KEYS.learnProgress, JSON.stringify(progress));
}

export function enrollInCourse(courseId: string) {
  const progress = getLearnProgress();
  if (!progress[courseId]) {
    progress[courseId] = { enrolled: true, completed: false, progress: 0, lessonProgress: {} };
  }
  localStorage.setItem(LS_KEYS.learnProgress, JSON.stringify(progress));
}

// ─── QuickWork Progress ───
export function getQuickworkApplications(): string[] {
  return safeJSONParse(LS_KEYS.quickworkApplications, []);
}

export function applyToGig(gigId: string) {
  const apps = getQuickworkApplications();
  if (!apps.includes(gigId)) {
    apps.push(gigId);
    localStorage.setItem(LS_KEYS.quickworkApplications, JSON.stringify(apps));
  }
}

export function getMyGigs(): { gigId: string; status: 'applied' | 'in-progress' | 'completed' | 'reviewed'; clientRating?: number }[] {
  return safeJSONParse(LS_KEYS.quickworkMyGigs, []);
}

export function updateGigStatus(gigId: string, status: 'applied' | 'in-progress' | 'completed' | 'reviewed', clientRating?: number) {
  const gigs = getMyGigs();
  const existing = gigs.find((g) => g.gigId === gigId);
  if (existing) {
    existing.status = status;
    if (clientRating !== undefined) existing.clientRating = clientRating;
  } else {
    gigs.push({ gigId, status, clientRating });
  }
  localStorage.setItem(LS_KEYS.quickworkMyGigs, JSON.stringify(gigs));
}

// ─── QuickWork Client: post a gig ───
// Client-side/localStorage for now, matching the rest of the prototype —
// this is the QuickWork Client half of brief §11 ("post verified gigs,
// invite talent, manage delivery"). Verification/payment stays out of
// scope until the real backend milestone; this makes the *posting* flow
// real so a startup can actually list short-term work today.
export function getPostedGigs(): QuickWorkGig[] {
  return safeJSONParse<QuickWorkGig[]>(LS_KEYS.quickworkPostedGigs, []);
}

export function postGig(input: {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: string;
  duration: string;
  location: string;
  employer: string;
}): QuickWorkGig {
  const gig: QuickWorkGig = {
    id: `qw-user-${Date.now()}`,
    title: input.title,
    description: input.description,
    category: input.category,
    skills: input.skills,
    budget: input.budget,
    duration: input.duration,
    location: input.location,
    employer: input.employer,
    employerRating: 0,
    postedAt: 'Just now',
    deadline: '',
    applicants: 0,
    status: 'open',
    isClientPosted: true,
  };
  const posted = getPostedGigs();
  posted.unshift(gig);
  localStorage.setItem(LS_KEYS.quickworkPostedGigs, JSON.stringify(posted));
  return gig;
}

// ─── Levav Impact: organization-posted opportunities ───
// Same client-side/localStorage pattern as postGig — makes the *posting*
// side of Impact real (an NGO can list an opportunity and manage
// applicants today) without waiting on the real backend/verified-NGO
// milestone described in docs/CHAMPION_NGO_REVENUE_SHARE.md.
export function getPostedOpportunities(): ImpactOpportunity[] {
  return safeJSONParse<ImpactOpportunity[]>(LS_KEYS.impactPostedOpportunities, []);
}

export function postOpportunity(input: {
  organization: string;
  type: string;
  location: string;
  description: string;
  hoursRequired: number;
  skills: string[];
  commitment: string;
}): ImpactOpportunity {
  const opportunity: ImpactOpportunity = {
    id: `imp-user-${Date.now()}`,
    organization: input.organization,
    type: input.type,
    location: input.location,
    description: input.description,
    hoursRequired: input.hoursRequired,
    skills: input.skills,
    logo: '🤝',
    isOrgPosted: true,
    commitment: input.commitment,
    status: 'open',
    postedAt: 'Just now',
  };
  const posted = getPostedOpportunities();
  posted.unshift(opportunity);
  localStorage.setItem(LS_KEYS.impactPostedOpportunities, JSON.stringify(posted));
  return opportunity;
}

export function toggleOpportunityStatus(opportunityId: string) {
  const posted = getPostedOpportunities();
  const opportunity = posted.find((o) => o.id === opportunityId);
  if (opportunity) {
    opportunity.status = opportunity.status === 'closed' ? 'open' : 'closed';
    localStorage.setItem(LS_KEYS.impactPostedOpportunities, JSON.stringify(posted));
  }
}

export function getImpactApplicants(): ImpactApplicant[] {
  return safeJSONParse<ImpactApplicant[]>(LS_KEYS.impactApplicants, []);
}

export function applyToOpportunity(input: {
  opportunityId: string;
  applicantUserId: string;
  applicantName: string;
  message: string;
  hoursCommitted: number;
}): ImpactApplicant {
  const applicant: ImpactApplicant = {
    id: `imp-app-${Date.now()}`,
    opportunityId: input.opportunityId,
    applicantUserId: input.applicantUserId,
    applicantName: input.applicantName,
    message: input.message,
    hoursCommitted: input.hoursCommitted,
    status: 'pending',
    appliedAt: new Date().toISOString(),
  };
  const applicants = getImpactApplicants();
  applicants.unshift(applicant);
  localStorage.setItem(LS_KEYS.impactApplicants, JSON.stringify(applicants));
  return applicant;
}

export function updateApplicantStatus(applicantId: string, status: ImpactApplicant['status']) {
  const applicants = getImpactApplicants();
  const applicant = applicants.find((a) => a.id === applicantId);
  if (applicant) {
    applicant.status = status;
    localStorage.setItem(LS_KEYS.impactApplicants, JSON.stringify(applicants));
  }
}

// ─── Feed: posts, likes, comments, follows ───
// Same client-side/localStorage pattern as the rest of this prototype.
// User-created posts persist alongside the seed catalogue so the feed
// feels populated from day one without pretending seed authors are real.
export function getUserPosts(): FeedPost[] {
  return safeJSONParse<FeedPost[]>(LS_KEYS.feedPosts, []);
}

export function createPost(input: {
  authorId: string;
  authorName: string;
  body: string;
  moodIcon?: FeedMood;
  tag?: string;
}): FeedPost {
  const initials = input.authorName
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
  const post: FeedPost = {
    id: `feed-user-${Date.now()}`,
    authorId: input.authorId,
    authorName: input.authorName,
    authorInitials: initials,
    authorMeta: 'Levav member',
    body: input.body,
    moodIcon: input.moodIcon,
    tag: input.tag,
    likedBy: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  const posts = getUserPosts();
  posts.unshift(post);
  localStorage.setItem(LS_KEYS.feedPosts, JSON.stringify(posts));
  return post;
}

export function toggleLike(postId: string, userId: string) {
  const userPosts = getUserPosts();
  const target = userPosts.find((p) => p.id === postId);
  if (target) {
    target.likedBy = target.likedBy.includes(userId)
      ? target.likedBy.filter((id) => id !== userId)
      : [...target.likedBy, userId];
    localStorage.setItem(LS_KEYS.feedPosts, JSON.stringify(userPosts));
    return target;
  }
  // Seed posts are read-only data, so their like state is tracked
  // separately, keyed by post id, rather than mutating the constant.
  const seedLikes = safeJSONParse<Record<string, string[]>>(LS_KEYS.feedPosts + '_seed_likes', {});
  const current = seedLikes[postId] || FEED_POSTS.find((p) => p.id === postId)?.likedBy || [];
  seedLikes[postId] = current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId];
  localStorage.setItem(LS_KEYS.feedPosts + '_seed_likes', JSON.stringify(seedLikes));
  return null;
}

export function getSeedLikeOverrides(): Record<string, string[]> {
  return safeJSONParse<Record<string, string[]>>(LS_KEYS.feedPosts + '_seed_likes', {});
}

export function addComment(postId: string, comment: { authorId: string; authorName: string; body: string }) {
  const newComment: FeedComment = {
    id: `comment-${Date.now()}`,
    authorId: comment.authorId,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: new Date().toISOString(),
  };
  const userPosts = getUserPosts();
  const target = userPosts.find((p) => p.id === postId);
  if (target) {
    target.comments.push(newComment);
    localStorage.setItem(LS_KEYS.feedPosts, JSON.stringify(userPosts));
    return newComment;
  }
  const seedComments = safeJSONParse<Record<string, FeedComment[]>>(LS_KEYS.feedPosts + '_seed_comments', {});
  seedComments[postId] = [...(seedComments[postId] || []), newComment];
  localStorage.setItem(LS_KEYS.feedPosts + '_seed_comments', JSON.stringify(seedComments));
  return newComment;
}

export function getSeedCommentOverrides(): Record<string, FeedComment[]> {
  return safeJSONParse<Record<string, FeedComment[]>>(LS_KEYS.feedPosts + '_seed_comments', {});
}

export function getFollowing(): string[] {
  return safeJSONParse<string[]>(LS_KEYS.feedFollowing, []);
}

export function toggleFollow(authorId: string) {
  const following = getFollowing();
  const next = following.includes(authorId)
    ? following.filter((id) => id !== authorId)
    : [...following, authorId];
  localStorage.setItem(LS_KEYS.feedFollowing, JSON.stringify(next));
  return next;
}
