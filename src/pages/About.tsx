import { motion } from 'framer-motion';
import { Target, Eye, Heart, Rocket, Shield, Globe } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import SectionHeader from '@/components/SectionHeader';

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We exist to unlock Africa\'s human potential at scale, creating pathways from potential to prosperity.',
  },
  {
    icon: Eye,
    title: 'Radical Transparency',
    description: 'Open metrics, verified credentials, and honest communication build the trust our ecosystem runs on.',
  },
  {
    icon: Heart,
    title: 'Talent-First',
    description: 'Every decision prioritizes the dignity, growth, and success of African professionals.',
  },
  {
    icon: Rocket,
    title: 'Relentless Innovation',
    description: 'We continuously push boundaries in workforce intelligence, verification, and connectivity.',
  },
  {
    icon: Shield,
    title: 'Trust & Verification',
    description: 'Our Levav ID system ensures every credential, skill, and identity claim is authentic.',
  },
  {
    icon: Globe,
    title: 'Pan-African Unity',
    description: 'We bridge borders, languages, and markets to create a unified African talent ecosystem.',
  },
];

const team = [
  { name: 'Dr. Yemi Ogunlesi', role: 'Founder & CEO', initials: 'YO' },
  { name: 'Nadia Mbeki', role: 'Chief Product Officer', initials: 'NM' },
  { name: 'Kofi Addo', role: 'Chief Technology Officer', initials: 'KA' },
  { name: 'Amara Nwosu', role: 'Head of Talent', initials: 'AN' },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 py-20 text-center">
        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C6FF34] mb-4">
              About Us
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Building Africa&apos;s{' '}
              <span className="gradient-text">Talent Infrastructure</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A0A0A0] max-w-2xl mx-auto">
              Levav&trade; Talent Afrika is the operating system for African human potential.
              We combine AI-powered matching, verified credentials, and pan-African connectivity
              to transform how talent and opportunity find each other.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="glass rounded-2xl p-8 sm:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-sm sm:text-base text-[#A0A0A0] leading-relaxed">
              <p>
                Levav&trade; was born from a simple observation: Africa has the world&apos;s youngest,
                fastest-growing workforce, yet the infrastructure to connect that talent with
                global opportunity remains fragmented and inefficient.
              </p>
              <p>
                Founded in 2023, we set out to build the workforce intelligence ecosystem that
                Africa deserves. One that understands local context, verifies real skills, and
                creates pathways from potential to prosperity.
              </p>
              <p>
                Today, Levav&trade; connects thousands of verified professionals with employers
                across 28 African countries and beyond. But we&apos;re just getting started.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            label="Values"
            title="What We Stand For"
            subtitle="The principles that guide every decision we make and every feature we build."
          />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <GlassCard className="p-6 h-full" glow>
                  <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#C6FF34]/10 text-[#C6FF34]">
                    <val.icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{val.title}</h3>
                  <p className="text-sm text-[#A0A0A0] leading-relaxed">{val.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            label="Team"
            title="Meet the Leadership"
            subtitle="Driven by a shared vision to unlock Africa's human potential."
          />
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center text-xl font-bold text-black mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="text-base font-semibold text-white">{member.name}</h3>
                <p className="text-xs text-[#A0A0A0]">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
