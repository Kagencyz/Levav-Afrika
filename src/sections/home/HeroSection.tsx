import { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowRight, ChevronDown, Users, Globe, CheckCircle, Layers } from 'lucide-react';

/* Lazy-load the shader so Three.js doesn't block homepage initial render */
const ShaderAnimation = lazy(() =>
  import('@/components/ui/shader-animation').then((m) => ({
    default: m.ShaderAnimation,
  }))
);

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  MOMENT 1 — THE HERO  "Why does Levav exist?"                ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const heroStats = [
  { value: '2,500+', label: 'Talents', Icon: Users },
  { value: '45+', label: 'Countries', Icon: Globe },
  { value: '98%', label: 'Completion', Icon: CheckCircle },
  { value: '150+', label: 'Categories', Icon: Layers },
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
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
  },
};

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const [isVisible, setIsVisible] = useState(true);

  /* IntersectionObserver: pause WebGL shader when not visible */
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4"
    >
      {/* Live WebGL Shader Background */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-black" />
          }
        >
          <div className="absolute inset-0">
            <ShaderAnimation isVisible={isVisible} />
          </div>
        </Suspense>
      </div>

      {/* Dark overlay gradient for text readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Floating stat panels — 4 corners */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {[
          { stat: heroStats[0], top: '16%', left: '5%', delay: 0 },
          { stat: heroStats[1], top: '14%', right: '6%', delay: 0.15 },
          { stat: heroStats[2], bottom: '20%', left: '7%', delay: 0.3 },
          { stat: heroStats[3], bottom: '18%', right: '5%', delay: 0.45 },
        ].map(({ stat, delay, ...pos }, i) => (
          <motion.div
            key={stat.label}
            className="absolute pointer-events-auto"
            style={pos}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.9 + delay }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="glass rounded-2xl px-6 py-4 min-w-[160px] text-center">
                <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center justify-center mx-auto mb-2.5">
                  <stat.Icon size={20} className="text-[#C6FF34]" strokeWidth={2} />
                </div>
                <div className="text-2xl font-bold gradient-text font-display">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-1">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Main hero content */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* Label */}
        <motion.div variants={itemVariants}>
          <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[#C6FF34] mb-6 break-words max-w-full">
            Africa&apos;s Workforce Intelligence Ecosystem&trade;
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] sm:leading-[1.08] mb-6 font-display break-words"
          variants={itemVariants}
        >
          <span className="text-white">Transforming </span>
          <span className="gradient-text">Potential</span>
          <br className="hidden sm:block" />
          <span className="text-white"> into </span>
          <span className="text-[#C6FF34]">Capability</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto max-w-xl text-base sm:text-lg leading-relaxed text-white/60 mb-10 font-body"
          variants={itemVariants}
        >
          Capability into contribution. Contribution into opportunity.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          variants={itemVariants}
        >
          <Link
            to="/onboarding"
            className="btn-lime inline-flex items-center gap-2 text-sm font-medium"
          >
            Start Your Levav 28&trade; Journey
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/employers"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white border border-white/[0.12] hover:bg-white/[0.05] hover:border-[#C6FF34]/30 transition-all"
          >
            Hire Workforce-Ready Talent
          </Link>
        </motion.div>

        {/* Mobile stats */}
        <div className="lg:hidden grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl px-4 py-3 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center justify-center mx-auto mb-1.5">
                <stat.Icon size={16} className="text-[#C6FF34]" strokeWidth={2} />
              </div>
              <div className="text-xl font-bold gradient-text font-display">
                {stat.value}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
