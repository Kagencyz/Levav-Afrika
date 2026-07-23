import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Globe,
  Award,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  HandHeart,
  TreePine,
  School,
  Stethoscope,
} from "lucide-react";

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

/* ───────────────────── Pillars ───────────────────── */
const pillars = [
  {
    icon: Heart,
    title: "Service",
    color: "#C6FF34",
    desc: "We believe that true leadership begins with service. Every Levav talent is encouraged to contribute their skills to community projects, non-profits, and causes that matter. Through service, we build empathy, understanding, and lasting change.",
    impact: "12,000+ service hours contributed",
  },
  {
    icon: Users,
    title: "Leadership",
    color: "#7E3BED",
    desc: "Africa needs a new generation of leaders — not just in government, but in business, technology, arts, and community organizing. Our leadership development programs identify and nurture emerging leaders across all disciplines.",
    impact: "500+ leadership fellows trained",
  },
  {
    icon: Globe,
    title: "Community",
    color: "#C6FF34",
    desc: "We are stronger together. Levav Impact builds communities of practice where talent connects, collaborates, and lifts each other up. From local meetups to pan-African networks, community is the foundation of everything we do.",
    impact: "85 active community chapters",
  },
  {
    icon: Award,
    title: "Legacy",
    color: "#7E3BED",
    desc: "The work we do today shapes the Africa of tomorrow. We are committed to building lasting impact — programs, institutions, and movements that will continue to serve the continent long after our direct involvement ends.",
    impact: "30+ sustainable programs launched",
  },
];

/* ───────────────────── Partner Types ───────────────────── */
const partnerTypes = [
  { icon: HandHeart, label: "Non-Governmental Organizations (NGOs)" },
  { icon: TrendingUp, label: "Social Enterprises" },
  { icon: School, label: "Educational Institutions" },
  { icon: Stethoscope, label: "Healthcare Organizations" },
  { icon: TreePine, label: "Environmental Initiatives" },
  { icon: Users, label: "Community-Based Organizations" },
];

/* ───────────────────── Hero ───────────────────── */
function Hero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black pt-20">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #C6FF34 0%, transparent 70%)" }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          <Heart className="w-4 h-4 text-[#C6FF34]" />
          <span className="text-[#C6FF34] text-sm font-medium">Levav Impact</span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
        >
          <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
            Contribution
          </span>{" "}
          Matters
        </motion.h1>

        <motion.p
          className="text-[#A0A0A0] text-lg sm:text-xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.19, 1, 0.22, 1] }}
        >
          At Levav, we believe that capability must be matched with contribution.
          Our impact programs connect talent to the causes and communities that need them most.
        </motion.p>
      </div>
    </section>
  );
}

/* ───────────────────── Pillars ───────────────────── */
function Pillars() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          <span className="text-[#7E3BED] text-sm font-medium tracking-wider uppercase mb-4 block">
            Four Pillars
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
            The Foundation of Impact
          </h2>
          <p className="text-[#A0A0A0] text-lg max-w-2xl mx-auto">
            Our impact work is organized around four core pillars that guide every initiative we undertake.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 hover:border-white/[0.12] transition-all group"
              variants={scaleUp}
              custom={i}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${pillar.color}15` }}
              >
                <pillar.icon className="w-7 h-7" style={{ color: pillar.color }} />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-3">{pillar.title}</h3>
              <p className="text-[#A0A0A0] text-[15px] leading-relaxed mb-5">{pillar.desc}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C6FF34]" />
                <span className="text-[#C6FF34] text-sm font-medium">{pillar.impact}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── ImpactPartner ───────────────────── */
function ImpactPartner() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      <div
        className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="text-[#C6FF34] text-sm font-medium tracking-wider uppercase mb-4 block">
              Partner With Us
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-6">
              Become an{" "}
              <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
                Impact Partner
              </span>
            </h2>
            <p className="text-[#A0A0A0] text-lg leading-relaxed mb-8">
              We collaborate with organizations that share our commitment to African development.
              Whether you need skilled volunteers, project support, or strategic partnership,
              Levav Impact can connect you with verified talent ready to contribute.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors"
            >
              Partner With Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right - Partner Types */}
          <motion.div
            className="flex-1 w-full"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8">
              <h3 className="text-white text-lg font-semibold mb-6">
                We Partner With
              </h3>
              <div className="space-y-4">
                {partnerTypes.map((pt, i) => (
                  <motion.div
                    key={pt.label}
                    className="flex items-center gap-4"
                    variants={fadeUp}
                    custom={i}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#C6FF34]/10 flex items-center justify-center flex-shrink-0">
                      <pt.icon className="w-5 h-5 text-[#C6FF34]" />
                    </div>
                    <span className="text-[#A0A0A0] text-[15px]">{pt.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Stats ───────────────────── */
function Stats() {
  const stats = [
    { value: "12,000+", label: "Impact Hours" },
    { value: "500+", label: "Leadership Fellows" },
    { value: "85", label: "Community Chapters" },
    { value: "30+", label: "Sustainable Programs" },
  ];

  return (
    <section className="relative py-16 border-y border-white/[0.06] bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              variants={fadeUp}
              custom={i}
            >
              <div className="text-3xl sm:text-4xl font-display text-white mb-2">
                {stat.value}
              </div>
              <p className="text-[#666666] text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── Page ───────────────────── */
export default function Impact() {
  return (
    <main className="bg-black min-h-screen">
      <Hero />
      <Stats />
      <Pillars />
      <ImpactPartner />
    </main>
  );
}
