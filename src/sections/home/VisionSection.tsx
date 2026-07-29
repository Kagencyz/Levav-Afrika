import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  MOMENT 5 — THE VISION  "How does it strengthen Africa?"     ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const visionCities = [
  { name: 'Lagos', top: '52%', left: '46%' },
  { name: 'Nairobi', top: '56%', left: '62%' },
  { name: 'Accra', top: '50%', left: '40%' },
  { name: 'Cairo', top: '32%', left: '56%' },
  { name: 'Cape Town', top: '82%', left: '54%' },
  { name: 'Kigali', top: '60%', left: '58%' },
];

const visionStats = [
  { value: 50000, suffix: '+', label: 'Talents by 2030' },
  { value: 2, suffix: 'B+', label: 'Economic Value', prefix: '$' },
  { value: 45, suffix: '+', label: 'Countries' },
];

export default function VisionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-28 sm:py-40 px-4 overflow-hidden">
      {/* Africa silhouette — radial gradient */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          className="w-[90vw] h-[90vw] max-w-[800px] max-h-[800px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse 55% 60% at 52% 48%, rgba(126,59,237,0.12) 0%, rgba(198,255,52,0.06) 40%, transparent 70%)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.5 }}
        />
      </div>

      {/* Glowing city dots */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {visionCities.map((city, i) => (
          <motion.div
            key={city.name}
            className="absolute"
            style={{ top: city.top, left: city.left }}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
          >
            <motion.div
              className="relative"
              animate={{
                boxShadow: [
                  '0 0 8px rgba(198,255,52,0.3)',
                  '0 0 24px rgba(198,255,52,0.6)',
                  '0 0 8px rgba(198,255,52,0.3)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-[#C6FF34]" />
              {/* Ripple */}
              <motion.div
                className="absolute inset-0 rounded-full border border-[#C6FF34]/30"
                animate={{
                  scale: [1, 2.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            </motion.div>
            {/* City label */}
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-wider text-white/40 whitespace-nowrap">
              {city.name}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Section label */}
        <motion.span
          className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF34] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          THE VISION
        </motion.span>

        {/* Headline */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-display"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Building Africa&apos;s{' '}
          <span className="gradient-text">Human Capital</span>
          <br />
          <span className="text-[#C6FF34]">Operating System&trade;</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="mx-auto max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed mb-14 font-body"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Every talent activated. Every capability developed. Every contribution
          valued. Every opportunity created.
        </motion.p>

        {/* Animated counters */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          {visionStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2 font-display">
                <AnimatedCounter
                  target={stat.value}
                  duration={2.5}
                  suffix={stat.suffix}
                  prefix={stat.prefix || ''}
                />
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <Link
            to="/auth?mode=signup"
            className="btn-lime inline-flex items-center gap-2 text-sm font-medium px-8 py-3"
          >
            Create a Free Account
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/employers"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white border border-white/[0.12] hover:bg-white/[0.05] hover:border-[#C6FF34]/30 transition-all"
          >
            Become an Employer Partner
          </Link>
        </motion.div>

        {/* Footer tagline */}
        <motion.div
          className="border-t border-white/[0.06] pt-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Build for Africa. Build for people. Build for generations.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
