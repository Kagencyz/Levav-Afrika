import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Bookmark,
  Briefcase,
  Zap,
  HandHeart,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  FEED PREVIEW — the professional community + verified         ║
   ║  opportunities. Upgrade brief §2.2. Static preview only —     ║
   ║  the real feed ships with the social core (see gap report).   ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const previewPosts = [
  {
    initials: 'GL',
    name: 'Grace Lungu',
    meta: 'Product Designer · Lusaka',
    body: 'Day 21 of Levav 28™: shipped my first full case study. The mock-office brief pushed me harder than any tutorial ever has.',
    tag: 'Levav 28™ milestone',
    likes: 128,
    comments: 24,
  },
  {
    initials: 'KM',
    name: 'Kofi Mensah',
    meta: 'Engineering Team Lead · Accra',
    body: 'We hired two engineers through Levav last quarter. The difference: we saw real work evidence before the first interview.',
    tag: 'Hiring insight',
    likes: 342,
    comments: 57,
  },
];

const previewOpportunities = [
  { icon: Briefcase, color: '#C6FF34', type: 'Job', title: 'Frontend Engineer', publisher: 'Pan-African Fintech' },
  { icon: Zap, color: '#C6FF34', type: 'QuickWork™', title: 'Logo & brand refresh', publisher: 'Kigali Retail Co.' },
  { icon: HandHeart, color: '#7E3BED', type: 'Volunteer', title: 'Digital literacy mentor', publisher: 'Lusaka Youth NGO' },
  { icon: GraduationCap, color: '#7E3BED', type: 'Course', title: 'Data Analysis Foundations', publisher: 'Levav Learn partner' },
];

export default function FeedPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF34] mb-4">
            THE COMMUNITY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
            A professional feed built on{' '}
            <span className="gradient-text">real work</span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-body">
            Follow professionals and organisations, share progress, and find
            verified opportunities — no noise, no fake listings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
          {/* Feed posts preview */}
          <div className="lg:col-span-3 space-y-4">
            {previewPosts.map((post, i) => (
              <motion.div
                key={post.name}
                className="glass rounded-2xl p-5 sm:p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6FF34]/25 to-[#7E3BED]/25 flex items-center justify-center text-xs font-bold text-[#C6FF34] shrink-0">
                    {post.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white truncate">{post.name}</span>
                      <BadgeCheck size={14} className="text-[#C6FF34] shrink-0" />
                    </div>
                    <span className="text-xs text-white/40">{post.meta}</span>
                  </div>
                </div>
                <p className="text-sm text-white/75 leading-relaxed mb-3">{post.body}</p>
                <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-[#7E3BED] bg-[#7E3BED]/10 border border-[#7E3BED]/25 rounded-md px-2 py-0.5 mb-3">
                  {post.tag}
                </span>
                <div className="flex items-center gap-5 text-white/40 text-xs border-t border-white/[0.06] pt-3">
                  <span className="inline-flex items-center gap-1.5"><Heart size={14} /> {post.likes}</span>
                  <span className="inline-flex items-center gap-1.5"><MessageCircle size={14} /> {post.comments}</span>
                  <span className="inline-flex items-center gap-1.5 ml-auto"><Bookmark size={14} /> Save</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Verified opportunities preview */}
          <motion.div
            className="lg:col-span-2 glass rounded-2xl p-5"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck size={16} className="text-[#C6FF34]" />
              <h3 className="text-sm font-semibold text-white font-display">
                Verified opportunities
              </h3>
            </div>
            <div className="space-y-3">
              {previewOpportunities.map((op) => (
                <div
                  key={op.title}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-3"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${op.color}15`, color: op.color, border: `1px solid ${op.color}30` }}
                  >
                    <op.icon size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">{op.title}</div>
                    <div className="text-[10px] text-white/40 truncate">{op.publisher}</div>
                  </div>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-white/40 shrink-0">
                    {op.type}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/35 leading-relaxed mt-4">
              Every listing has a verified publisher and passes review before it
              reaches your feed.
            </p>
            <Link
              to="/auth?mode=signup&goal=community"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C6FF34] mt-3 hover:gap-2.5 transition-all"
            >
              Join the community free
              <ArrowRight size={12} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
