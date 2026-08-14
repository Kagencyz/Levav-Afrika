import { describe, it, expect, beforeEach } from 'vitest';

/**
 * levavData persists through the browser localStorage API, but the test
 * environment runs under plain Node (see vite.config.ts), which has no
 * localStorage global. This is a minimal in-memory stand-in — just enough
 * of the Storage interface for the functions under test — reset before
 * every test so posts/applications from one test never leak into another.
 */
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();
});

const {
  postGig,
  getPostedGigs,
  postOpportunity,
  getPostedOpportunities,
  toggleOpportunityStatus,
  applyToOpportunity,
  getImpactApplicants,
  updateApplicantStatus,
  createPost,
  getUserPosts,
  toggleLike,
  getSeedLikeOverrides,
  addComment,
  getSeedCommentOverrides,
  getFollowing,
  toggleFollow,
  FEED_POSTS,
} = await import('./levavData');

describe('QuickWork: postGig', () => {
  it('adds a new gig to the front of the posted list', () => {
    expect(getPostedGigs()).toEqual([]);
    const gig = postGig({
      title: 'Landing page redesign',
      description: 'Refresh the hero section',
      category: 'Design',
      skills: ['Figma', 'UI Design'],
      budget: 'ZMW 2,500',
      duration: '3 days',
      location: 'Remote',
      employer: 'Acme Startup',
    });
    expect(gig.status).toBe('open');
    expect(gig.isClientPosted).toBe(true);
    expect(getPostedGigs()).toHaveLength(1);
    expect(getPostedGigs()[0].id).toBe(gig.id);
  });

  it('keeps newest posted gig first', () => {
    const first = postGig({
      title: 'First gig', description: 'd', category: 'Design', skills: [],
      budget: 'ZMW 1,000', duration: '1 day', location: 'Remote', employer: 'A',
    });
    const second = postGig({
      title: 'Second gig', description: 'd', category: 'Design', skills: [],
      budget: 'ZMW 1,000', duration: '1 day', location: 'Remote', employer: 'A',
    });
    const posted = getPostedGigs();
    expect(posted[0].id).toBe(second.id);
    expect(posted[1].id).toBe(first.id);
  });
});

describe('Impact: postOpportunity / toggleOpportunityStatus', () => {
  it('posts an opportunity as open by default', () => {
    const opp = postOpportunity({
      organization: 'Lusaka Youth Coders', type: 'Technology', location: 'Lusaka',
      description: 'Mentor youth coding bootcamps', hoursRequired: 5, skills: ['Teaching'],
      commitment: 'Weekly',
    });
    expect(opp.status).toBe('open');
    expect(opp.isOrgPosted).toBe(true);
    expect(getPostedOpportunities()).toHaveLength(1);
  });

  it('toggles status between open and closed', () => {
    const opp = postOpportunity({
      organization: 'Org', type: 'Education', location: 'Lusaka', description: 'd',
      hoursRequired: 2, skills: [], commitment: 'One-time',
    });
    toggleOpportunityStatus(opp.id);
    expect(getPostedOpportunities().find((o) => o.id === opp.id)?.status).toBe('closed');
    toggleOpportunityStatus(opp.id);
    expect(getPostedOpportunities().find((o) => o.id === opp.id)?.status).toBe('open');
  });

  it('is a no-op for an unknown opportunity id', () => {
    expect(() => toggleOpportunityStatus('does-not-exist')).not.toThrow();
    expect(getPostedOpportunities()).toEqual([]);
  });
});

describe('Impact: applyToOpportunity / updateApplicantStatus', () => {
  it('records an application as pending', () => {
    const applicant = applyToOpportunity({
      opportunityId: 'imp-1', applicantUserId: 'user-1', applicantName: 'Jane Doe',
      message: 'I would love to help', hoursCommitted: 4,
    });
    expect(applicant.status).toBe('pending');
    expect(getImpactApplicants()).toHaveLength(1);
  });

  it('updates an applicant to accepted then completed', () => {
    const applicant = applyToOpportunity({
      opportunityId: 'imp-1', applicantUserId: 'user-1', applicantName: 'Jane Doe',
      message: 'msg', hoursCommitted: 4,
    });
    updateApplicantStatus(applicant.id, 'accepted');
    expect(getImpactApplicants()[0].status).toBe('accepted');
    updateApplicantStatus(applicant.id, 'completed');
    expect(getImpactApplicants()[0].status).toBe('completed');
  });
});

describe('Feed: createPost', () => {
  it('derives initials from the author name', () => {
    const post = createPost({ authorId: 'u1', authorName: 'Grace Lungu', body: 'Hello feed' });
    expect(post.authorInitials).toBe('GL');
    expect(getUserPosts()).toHaveLength(1);
  });

  it('falls back to "?" initials for an empty name', () => {
    const post = createPost({ authorId: 'u1', authorName: '', body: 'Hello' });
    expect(post.authorInitials).toBe('?');
  });

  it('newest post appears first', () => {
    createPost({ authorId: 'u1', authorName: 'A B', body: 'first' });
    createPost({ authorId: 'u1', authorName: 'A B', body: 'second' });
    expect(getUserPosts()[0].body).toBe('second');
  });
});

describe('Feed: toggleLike', () => {
  it('toggles a like on a user-created post', () => {
    const post = createPost({ authorId: 'author-1', authorName: 'A B', body: 'hi' });
    toggleLike(post.id, 'liker-1');
    expect(getUserPosts()[0].likedBy).toContain('liker-1');
    toggleLike(post.id, 'liker-1');
    expect(getUserPosts()[0].likedBy).not.toContain('liker-1');
  });

  it('tracks likes on seed posts via an override map, without mutating seed data', () => {
    const seedPost = FEED_POSTS[0];
    const originalLikedBy = [...seedPost.likedBy];
    toggleLike(seedPost.id, 'new-liker');
    expect(getSeedLikeOverrides()[seedPost.id]).toContain('new-liker');
    // The exported seed constant itself must stay untouched.
    expect(seedPost.likedBy).toEqual(originalLikedBy);
  });

  it('toggling a seed like twice removes it from the override', () => {
    const seedPost = FEED_POSTS[1];
    toggleLike(seedPost.id, 'toggler');
    toggleLike(seedPost.id, 'toggler');
    expect(getSeedLikeOverrides()[seedPost.id]).not.toContain('toggler');
  });
});

describe('Feed: addComment', () => {
  it('adds a comment to a user-created post', () => {
    const post = createPost({ authorId: 'author-1', authorName: 'A B', body: 'hi' });
    addComment(post.id, { authorId: 'c1', authorName: 'Commenter', body: 'Nice!' });
    expect(getUserPosts()[0].comments).toHaveLength(1);
    expect(getUserPosts()[0].comments[0].body).toBe('Nice!');
  });

  it('adds a comment to a seed post via an override, without mutating seed data', () => {
    const seedPost = FEED_POSTS[0];
    const originalCount = seedPost.comments.length;
    addComment(seedPost.id, { authorId: 'c1', authorName: 'Commenter', body: 'Great work' });
    expect(getSeedCommentOverrides()[seedPost.id]).toHaveLength(1);
    expect(seedPost.comments).toHaveLength(originalCount);
  });
});

describe('Feed: follow / unfollow', () => {
  it('toggles an author id in and out of the following list', () => {
    expect(getFollowing()).toEqual([]);
    toggleFollow('author-1');
    expect(getFollowing()).toContain('author-1');
    toggleFollow('author-1');
    expect(getFollowing()).not.toContain('author-1');
  });
});
