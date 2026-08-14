/**
 * Feed — the professional community feed. Follow people, share progress,
 * see verified wins from across the continent. Deliberately light: no
 * image uploads, no algorithmic ranking, no infinite-scroll trickery —
 * a simple reverse-chronological feed of real posts.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Send,
  BadgeCheck,
  UserPlus,
  UserCheck,
  Sparkles,
  Globe,
  Trophy,
  Rocket,
  BookOpen,
  Globe2,
  Lightbulb,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { StableTextarea } from '@/components/StableInputs';
import {
  FEED_POSTS,
  getUserPosts,
  createPost,
  toggleLike,
  getSeedLikeOverrides,
  addComment,
  getSeedCommentOverrides,
  getFollowing,
  toggleFollow,
} from '@/lib/levavData';
import type { FeedPost, FeedComment, FeedMood } from '@/lib/levavData';
import { useAuth } from '@/hooks/useAuth';

type FilterTab = 'for-you' | 'following';

/* Professional, vector iconography for post "mood" instead of raw emoji —
   matches the icon-badge treatment used across QuickWork/Impact rather
   than an oversized emoji standing in for a photo. */
const MOOD_OPTIONS: { key: FeedMood; label: string; icon: LucideIcon }[] = [
  { key: 'milestone', label: 'Milestone', icon: Trophy },
  { key: 'launch', label: 'Launch', icon: Rocket },
  { key: 'learning', label: 'Learning', icon: BookOpen },
  { key: 'community', label: 'Community', icon: Globe2 },
  { key: 'idea', label: 'Idea', icon: Lightbulb },
  { key: 'quickwin', label: 'Quick Win', icon: Zap },
];
const MOOD_MAP: Record<FeedMood, { label: string; icon: LucideIcon }> = MOOD_OPTIONS.reduce(
  (acc, m) => ({ ...acc, [m.key]: { label: m.label, icon: m.icon } }),
  {} as Record<FeedMood, { label: string; icon: LucideIcon }>
);
const POST_TAGS = ['Milestone', 'Hiring insight', 'QuickWork™ win', 'Community', 'Motivation'];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

/* ───────────────────── Post Card ───────────────────── */
function PostCard({
  post,
  currentUserId,
  isFollowing,
  isOwnPost,
  onToggleLike,
  onToggleFollow,
  onAddComment,
}: {
  post: FeedPost;
  currentUserId: string;
  isFollowing: boolean;
  isOwnPost: boolean;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (authorId: string) => void;
  onAddComment: (postId: string, body: string) => void;
}) {
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [commentDraft, setCommentDraft] = React.useState('');
  const liked = post.likedBy.includes(currentUserId);

  const submitComment = () => {
    if (!commentDraft.trim()) return;
    onAddComment(post.id, commentDraft.trim());
    setCommentDraft('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6FF34]/25 to-[#7E3BED]/25 flex items-center justify-center text-xs font-bold text-[#C6FF34] shrink-0 font-body">
            {post.authorInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white truncate font-body">{post.authorName}</span>
              {post.verified && <BadgeCheck size={14} className="text-[#C6FF34] shrink-0" />}
            </div>
            <span className="text-xs text-white/40 font-body">
              {post.authorMeta} · {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>
        {!isOwnPost && (
          <button
            onClick={() => onToggleFollow(post.authorId)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-body ${
              isFollowing
                ? 'bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white'
                : 'bg-[#C6FF34]/10 border border-[#C6FF34]/25 text-[#C6FF34] hover:bg-[#C6FF34]/20'
            }`}
          >
            {isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <p className="text-sm text-white/75 leading-relaxed mb-3 whitespace-pre-wrap font-body">{post.body}</p>

      {(post.tag || post.moodIcon) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.moodIcon && MOOD_MAP[post.moodIcon] && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#C6FF34] bg-[#C6FF34]/10 border border-[#C6FF34]/25 rounded-md px-2 py-0.5">
              {React.createElement(MOOD_MAP[post.moodIcon].icon, { size: 11 })}
              {MOOD_MAP[post.moodIcon].label}
            </span>
          )}
          {post.tag && (
            <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-[#7E3BED] bg-[#7E3BED]/10 border border-[#7E3BED]/25 rounded-md px-2 py-0.5">
              {post.tag}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-5 text-white/40 text-xs border-t border-white/[0.06] pt-3">
        <button
          onClick={() => onToggleLike(post.id)}
          className={`inline-flex items-center gap-1.5 transition-colors font-body ${liked ? 'text-[#C6FF34]' : 'hover:text-white/70'}`}
        >
          <Heart size={14} fill={liked ? '#C6FF34' : 'none'} />
          {post.likedBy.length}
        </button>
        <button
          onClick={() => setCommentsOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 hover:text-white/70 transition-colors font-body"
        >
          <MessageCircle size={14} />
          {post.comments.length}
        </button>
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/60 shrink-0 font-body">
                    {c.authorName.charAt(0)}
                  </div>
                  <div className="min-w-0 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 flex-1">
                    <span className="text-xs font-semibold text-white font-body">{c.authorName}</span>
                    <p className="text-xs text-white/60 font-body">{c.body}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <StableTextarea
                  value={commentDraft}
                  onValueChange={setCommentDraft}
                  placeholder="Write a comment..."
                  rows={1}
                  className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 resize-none transition-colors font-body"
                />
                <button
                  onClick={submitComment}
                  className="p-2 bg-[#C6FF34] text-black rounded-lg hover:bg-[#d4ff5c] transition-all shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────────────── Page ───────────────────── */
export default function Feed() {
  const { user } = useAuth();
  const myId = user ? String(user.id) : 'guest';
  const myName = user?.name || user?.firstName || 'A Levav member';

  const [refreshKey, setRefreshKey] = React.useState(0);
  const [filterTab, setFilterTab] = React.useState<FilterTab>('for-you');
  const [postBody, setPostBody] = React.useState('');
  const [postMood, setPostMood] = React.useState<FeedMood | undefined>(undefined);
  const [postTag, setPostTag] = React.useState<string | undefined>(undefined);

  const userPosts = React.useMemo(() => getUserPosts(), [refreshKey]);
  const seedLikeOverrides = React.useMemo(() => getSeedLikeOverrides(), [refreshKey]);
  const seedCommentOverrides = React.useMemo(() => getSeedCommentOverrides(), [refreshKey]);
  const following = React.useMemo(() => getFollowing(), [refreshKey]);

  const allPosts = React.useMemo(() => {
    const mergedSeed = FEED_POSTS.map((p) => ({
      ...p,
      likedBy: seedLikeOverrides[p.id] ?? p.likedBy,
      comments: [...p.comments, ...(seedCommentOverrides[p.id] || [])],
    }));
    return [...userPosts, ...mergedSeed].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [userPosts, seedLikeOverrides, seedCommentOverrides]);

  const visiblePosts = React.useMemo(() => {
    if (filterTab === 'for-you') return allPosts;
    return allPosts.filter((p) => following.includes(p.authorId));
  }, [allPosts, filterTab, following]);

  const suggestedAuthors = React.useMemo(() => {
    const seen = new Map<string, { authorId: string; authorName: string; authorInitials: string; authorMeta: string; verified?: boolean }>();
    for (const p of FEED_POSTS) {
      if (p.authorId !== myId && !seen.has(p.authorId)) {
        seen.set(p.authorId, { authorId: p.authorId, authorName: p.authorName, authorInitials: p.authorInitials, authorMeta: p.authorMeta, verified: p.verified });
      }
    }
    return Array.from(seen.values()).slice(0, 5);
  }, [myId]);

  const handleToggleLike = React.useCallback(
    (postId: string) => {
      toggleLike(postId, myId);
      setRefreshKey((k) => k + 1);
    },
    [myId]
  );

  const handleToggleFollow = React.useCallback((authorId: string) => {
    toggleFollow(authorId);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleAddComment = React.useCallback(
    (postId: string, body: string) => {
      addComment(postId, { authorId: myId, authorName: myName, body });
      setRefreshKey((k) => k + 1);
    },
    [myId, myName]
  );

  const handlePost = React.useCallback(() => {
    if (!postBody.trim()) return;
    createPost({
      authorId: myId,
      authorName: myName,
      body: postBody.trim(),
      moodIcon: postMood,
      tag: postTag,
    });
    setPostBody('');
    setPostMood(undefined);
    setPostTag(undefined);
    setRefreshKey((k) => k + 1);
  }, [postBody, postMood, postTag, myId, myName]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <section className="relative overflow-hidden pt-12 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#C6FF34]/[0.03] blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C6FF34] mb-3 font-body">
            <Globe size={14} />
            The Community
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight font-display">
            Real work. Real people. <span className="gradient-text">Real Africa.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#A0A0A0] max-w-xl leading-relaxed font-body">
            Follow the people building alongside you, share your own progress, and see verified wins from across the continent.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Composer */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6FF34]/25 to-[#7E3BED]/25 flex items-center justify-center text-xs font-bold text-[#C6FF34] shrink-0 font-body">
              {myName.charAt(0).toUpperCase()}
            </div>
            <StableTextarea
              value={postBody}
              onValueChange={setPostBody}
              placeholder="Share a win, a lesson, or what you're working on..."
              rows={2}
              className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 resize-none transition-colors font-body"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.key}
                type="button"
                title={mood.label}
                aria-label={mood.label}
                aria-pressed={postMood === mood.key}
                onClick={() => setPostMood(postMood === mood.key ? undefined : mood.key)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  postMood === mood.key
                    ? 'bg-[#C6FF34]/20 border border-[#C6FF34]/40 text-[#C6FF34]'
                    : 'bg-white/[0.03] border border-white/[0.06] text-[#A0A0A0] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <mood.icon size={15} strokeWidth={2} />
              </button>
            ))}
            <span className="w-px h-5 bg-white/[0.08] mx-1" />
            {POST_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setPostTag(postTag === tag ? undefined : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all font-body ${
                  postTag === tag
                    ? 'bg-[#7E3BED]/20 border border-[#7E3BED]/40 text-[#A070F0]'
                    : 'bg-white/[0.03] border border-white/[0.06] text-[#A0A0A0] hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={!postBody.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-body"
            >
              <Send size={14} />
              Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-2">
              {(['for-you', 'following'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all font-body ${
                    filterTab === tab
                      ? 'bg-[#C6FF34] text-black'
                      : 'bg-white/[0.03] border border-white/[0.06] text-[#A0A0A0] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {tab === 'for-you' ? 'For You' : 'Following'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="popLayout">
              {visiblePosts.length > 0 ? (
                visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={myId}
                    isFollowing={following.includes(post.authorId)}
                    isOwnPost={post.authorId === myId}
                    onToggleLike={handleToggleLike}
                    onToggleFollow={handleToggleFollow}
                    onAddComment={handleAddComment}
                  />
                ))
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#666666] mx-auto mb-4">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 font-display">Nobody here yet</h3>
                  <p className="text-[#666666] text-sm max-w-sm mx-auto font-body">
                    Follow a few people from "For You" to build your feed.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-5 sticky top-24">
              <h3 className="text-sm font-semibold text-white font-display mb-4">People to Follow</h3>
              <div className="space-y-3">
                {suggestedAuthors.map((author) => {
                  const isFollowing = following.includes(author.authorId);
                  return (
                    <div key={author.authorId} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C6FF34]/25 to-[#7E3BED]/25 flex items-center justify-center text-[11px] font-bold text-[#C6FF34] shrink-0 font-body">
                        {author.authorInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-white truncate font-body">{author.authorName}</span>
                          {author.verified && <BadgeCheck size={11} className="text-[#C6FF34] shrink-0" />}
                        </div>
                        <span className="text-[10px] text-white/40 truncate block font-body">{author.authorMeta}</span>
                      </div>
                      <button
                        onClick={() => handleToggleFollow(author.authorId)}
                        className={`shrink-0 p-1.5 rounded-lg transition-all ${
                          isFollowing ? 'bg-white/[0.05] text-white/60' : 'bg-[#C6FF34]/10 text-[#C6FF34] hover:bg-[#C6FF34]/20'
                        }`}
                      >
                        {isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
