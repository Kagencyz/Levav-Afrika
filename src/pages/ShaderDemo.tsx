import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function ShaderDemo() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Shader Background */}
      <div className="absolute inset-0 z-0">
        <ShaderAnimation />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Nav */}
        <motion.nav
          className="flex items-center justify-between px-6 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#C6FF34] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#C6FF34]" />
            <span className="text-[#C6FF34] text-xs font-medium tracking-wider uppercase">
              WebGL Experience
            </span>
          </div>
        </motion.nav>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            className="text-center max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <h1
              className="font-display text-6xl sm:text-8xl lg:text-9xl text-white leading-[0.9] tracking-tighter mb-6"
              style={{
                textShadow: '0 0 80px rgba(126,59,237,0.3)',
              }}
            >
              The Future
              <br />
              <span className="bg-gradient-to-r from-[#C6FF34] via-white to-[#7E3BED] bg-clip-text text-transparent">
                of Work
              </span>
            </h1>

            <motion.p
              className="text-white/50 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Africa&apos;s Workforce Intelligence Ecosystem — powered by WebGL,
              driven by data, built for every profession.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <Link
                to="/onboarding"
                className="btn-lime inline-flex items-center gap-2 text-sm font-medium"
              >
                <Sparkles size={16} />
                Start Your Levav 28&trade; Journey
              </Link>
              <Link
                to="/talent"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all text-sm"
              >
                Explore Talent
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          className="px-6 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: '2,500+', label: 'Verified Talents' },
              { value: '45+', label: 'Countries' },
              { value: '150+', label: 'Skill Categories' },
              { value: '98%', label: 'Completion Rate' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1, duration: 0.5 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-[#C6FF34] font-display">
                  {stat.value}
                </div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
