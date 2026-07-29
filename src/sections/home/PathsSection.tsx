import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import {
  Briefcase,
  Zap,
  Flame,
  Users,
  Send,
  Heart,
  GraduationCap,
  Globe,
  ArrowRight,
} from 'lucide-react';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  PATHS — "What brings you to Levav?"                          ║
   ║  Upgrade brief §2.1: route each visitor to the right signup.  ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const paths = [
  {
    icon: Briefcase,
    color: '#C6FF34',
    title: 'Find Jobs',
    desc: 'Verified full-time and part-time roles matched to your profile.',
    goal: 'find-job',
  },
  {
    icon: Zap,
    color: '#C6FF34',
    title: 'Find QuickWork™',
    desc: 'Gigs and freelance projects. Stay active, keep earning.',
    goal: 'find-quickwork',
  },
  {
    icon: Flame,
    color: '#C6FF34',
    title: 'Develop Through Levav 28™',
    desc: 'A 28-day transformation pathway built for your situation.',
    goal: 'develop',
  },
  {
    icon: GraduationCap,
    color: '#C6FF34',
    title: 'Explore Courses',
    desc: 'Programmes and cohorts that close your real skill gaps.',
    goal: 'learn',
  },
  {
    icon: Users,
    color: '#7E3BED',
    title: 'Hire Talent',
    desc: 'Workforce-ready professionals with evidence, not just CVs.',
    goal: 'hire',
  },
  {
    icon: Send,
    color: '#7E3BED',
    title: 'Post QuickWork™',
    desc: 'Post a verified gig and get matched with capable talent.',
    goal: 'post-quickwork',
  },
  {
    icon: Heart,
    color: '#7E3BED',
    title: 'Post Volunteer Opportunities',
    desc: 'Verified organisations offering meaningful service roles.',
    goal: 'post-volunteer',
  },
  {
    icon: Globe,
    color: '#7E3BED',
    title: 'Join the Professional Community',
    desc: 'Follow, share, and grow with professionals across Africa.',
    goal: 'community',
  },
];

export default function PathsSection() {
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
            CHOOSE YOUR PATH
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
            What brings you to <span className="gradient-text">Levav</span>?
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-body">
            One free account. Every path starts the same way — tell us your goal
            and we take you to the right place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paths.map((path, i) => (
            <motion.div
              key={path.goal}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
            >
              <Link
                to={`/auth?mode=signup&goal=${path.goal}`}
                className="group glass glass-hover rounded-2xl p-5 h-full flex flex-col min-h-[172px]"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${path.color}15`,
                    color: path.color,
                    border: `1px solid ${path.color}30`,
                  }}
                >
                  <path.icon size={22} strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#C6FF34] transition-colors">
                  {path.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed flex-1">
                  {path.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40 group-hover:text-[#C6FF34] transition-colors mt-3">
                  Get started free
                  <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
