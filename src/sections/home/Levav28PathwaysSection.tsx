import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import {
  Building2,
  Compass,
  Rocket,
  PenTool,
  BookOpen,
  Repeat,
  ArrowRight,
} from 'lucide-react';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  LEVAV 28 PATHWAYS — employed AND unemployed users            ║
   ║  Upgrade brief §2.2 + §9: the pathway adapts to your status.  ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const primaryPathways = [
  {
    icon: Compass,
    title: 'Seeking work',
    desc: 'A mock office — a realistic simulation of your target profession, industry, and level. Build the evidence employers actually trust, before you’re hired.',
  },
  {
    icon: Building2,
    title: 'Currently employed',
    desc: 'Challenges connected to your real role, responsibilities, workplace habits, and leadership growth. Develop in the job, not just for the next one.',
  },
];

const otherPathways = [
  { icon: Rocket, label: 'Self-employed' },
  { icon: PenTool, label: 'Freelancing' },
  { icon: BookOpen, label: 'Studying' },
  { icon: Repeat, label: 'Changing careers' },
];

export default function Levav28PathwaysSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF34] mb-4">
            LEVAV 28&trade;
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
            It meets you <span className="text-[#C6FF34]">where you are</span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-body">
            Levav 28&trade; is not one course for everyone. Your employment status
            shapes a 28-day pathway built around your real situation.
          </p>
        </motion.div>

        {/* Two primary pathways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {primaryPathways.map((p, i) => (
            <motion.div
              key={p.title}
              className="glass glass-specular rounded-2xl p-7"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/25 flex items-center justify-center mb-5">
                <p.icon size={24} strokeWidth={2} className="text-[#C6FF34]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">{p.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Other status pathways */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {otherPathways.map((p) => (
            <div
              key={p.label}
              className="glass rounded-xl px-4 py-3.5 flex items-center gap-3"
            >
              <p.icon size={16} strokeWidth={2} className="text-[#7E3BED] shrink-0" />
              <span className="text-xs font-medium text-white/70">{p.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <Link
            to="/auth?mode=signup&goal=develop"
            className="btn-lime inline-flex items-center gap-2 text-sm font-medium"
          >
            Develop Through Levav 28&trade;
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
