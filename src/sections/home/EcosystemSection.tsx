import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import { Flame, Zap, Heart, Star, ArrowRight } from 'lucide-react';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  MOMENT 3 — THE ECOSYSTEM  "Why is it different?"            ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const ecosystemItems = [
  {
    icon: Flame,
    color: '#C6FF34',
    title: 'Levav 28\u2122',
    tagline: '28 days. One transformed professional.',
    desc: 'Not onboarding. Not a course. A 28-day transformation system using CONFRONT\u2122, DISSECT\u2122, OWN\u2122, EXECUTE\u2122 to unlock professional capability.',
    link: '/learn',
  },
  {
    icon: Zap,
    color: '#C6FF34',
    title: 'QuickWork\u2122',
    tagline: 'Project-based opportunities. Immediate income.',
    desc: 'No capable person should remain idle. QuickWork\u2122 creates pathways for people to stay active, productive, and earning while they grow.',
    link: '/opportunities',
  },
  {
    icon: Heart,
    color: '#7E3BED',
    title: 'Levav Impact\u2122',
    tagline: 'Volunteer. Contribute. Build experience.',
    desc: 'Structured opportunities for community contribution. Contribution develops character. Responsibility develops leadership.',
    link: '/impact',
  },
  {
    icon: Star,
    color: '#7E3BED',
    title: 'WRI\u2122',
    tagline: 'Workforce Readiness Index\u2122. Your true score.',
    desc: 'Intelligence beyond the CV. WRI\u2122 evaluates reliability, critical thinking, initiative, and contribution — the real indicators of readiness.',
    link: '/talent',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] },
  },
};

export default function EcosystemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-28 sm:py-36 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF34] mb-4">
            THE ECOSYSTEM
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
            Four Pillars. <span className="text-[#C6FF34]">One Purpose.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-body">
            An integrated ecosystem designed to identify, transform, activate, and elevate African talent.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {ecosystemItems.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group cursor-pointer"
            >
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-7 h-full transition-all duration-300 group-hover:border-[#C6FF34]/30 group-hover:shadow-[0_0_30px_rgba(198,255,52,0.08)]">
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <item.icon size={24} strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#C6FF34] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p
                      className="text-[11px] font-medium uppercase tracking-wider mb-3"
                      style={{ color: item.color }}
                    >
                      {item.tagline}
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">
                      {item.desc}
                    </p>
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-[#C6FF34] transition-colors duration-300"
                    >
                      Learn more
                      <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
