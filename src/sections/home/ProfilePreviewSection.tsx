import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import {
  BadgeCheck,
  FileText,
  FolderCheck,
  ArrowRight,
  ShieldCheck,
  Lock,
  FileCheck2,
} from 'lucide-react';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  PROFILE PREVIEW — Levav ID™, work evidence, CV               ║
   ║  + employer section + trust signals. Upgrade brief §2.2.      ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const evidence = [
  'Levav 28™ · Day 28 capstone project',
  'QuickWork™ · Completed work',
  'Levav Impact™ · Service contribution',
];

const trustSignals = [
  { icon: BadgeCheck, title: 'Verified opportunities', desc: 'Every listing has an identified, verified publisher.' },
  { icon: Lock, title: 'Protected data', desc: 'You control what each employer sees, at every stage.' },
  { icon: ShieldCheck, title: 'Verified identity', desc: 'Real people, real organisations — checked, not assumed.' },
  { icon: FileCheck2, title: 'Real work evidence', desc: 'Ability shown through actual work, not claims.' },
];

export default function ProfilePreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-20">
          {/* Copy side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF34] mb-4">
              YOUR LIVING RECORD
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight font-display">
              More than a CV. <br />
              <span className="gradient-text">A Levav ID&trade;</span>
            </h2>
            <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-6 font-body">
              Keep your traditional CV — and grow beyond it. Your Levav ID&trade;
              is intended to become a living professional record where work evidence
              shows what you can actually do.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <FileText size={16} className="text-[#C6FF34] mt-0.5 shrink-0" />
                Upload your CV once — Levav builds your structured profile from it.
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <FolderCheck size={16} className="text-[#C6FF34] mt-0.5 shrink-0" />
                Levav 28&trade;, QuickWork&trade;, volunteering, and courses enrich it automatically.
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <Lock size={16} className="text-[#C6FF34] mt-0.5 shrink-0" />
                You decide which sections employers can see, and when.
              </li>
            </ul>
            <Link
              to="/auth?mode=signup&goal=develop"
              className="btn-lime inline-flex items-center gap-2 text-sm font-medium"
            >
              Build Your Levav ID&trade;
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Profile card mock */}
          <motion.div
            className="glass glass-specular rounded-2xl p-6 sm:p-7"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C6FF34]/25 to-[#7E3BED]/25 flex items-center justify-center text-base font-bold text-[#C6FF34]">
                MM
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-white font-display truncate">Mutale Mwanza</span>
                  <BadgeCheck size={16} className="text-[#C6FF34] shrink-0" />
                </div>
                <span className="text-xs text-white/45">Software Developer · Lusaka, Zambia</span>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-4">
              <div className="text-[10px] uppercase tracking-wider text-white/35 mb-2.5">
                Work evidence
              </div>
              <div className="space-y-2">
                {evidence.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/65">
                    <FolderCheck size={13} className="text-[#7E3BED] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Employers + trust signals */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display">
            For employers and <span className="text-[#7E3BED]">organisations</span>
          </h3>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed mb-6 font-body">
            Hire from evidence, post verified QuickWork&trade; projects, or publish
            volunteer opportunities — with pipelines, teams, and analytics built in.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=signup&goal=hire"
              className="btn-lime inline-flex items-center gap-2 text-sm font-medium"
            >
              Hire Talent
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/auth?mode=signup&goal=post-quickwork"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white border border-white/[0.12] hover:bg-white/[0.05] hover:border-[#7E3BED]/40 transition-all"
            >
              Post QuickWork&trade;
            </Link>
            <Link
              to="/auth?mode=signup&goal=post-volunteer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white border border-white/[0.12] hover:bg-white/[0.05] hover:border-[#7E3BED]/40 transition-all"
            >
              Post Volunteer Roles
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustSignals.map((signal, i) => (
            <motion.div
              key={signal.title}
              className="glass rounded-2xl p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center justify-center mx-auto mb-3">
                <signal.icon size={19} strokeWidth={2} className="text-[#C6FF34]" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{signal.title}</h4>
              <p className="text-xs text-white/45 leading-relaxed">{signal.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
