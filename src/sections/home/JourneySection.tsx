import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  MOMENT 2 — THE JOURNEY  "How does it work?"                 ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const journeySteps = [
  { num: '01', title: 'Potential', desc: 'Raw talent exists across the continent' },
  { num: '02', title: 'Capability', desc: 'Levav 28\u2122 transforms potential into skill' },
  { num: '03', title: 'Contribution', desc: 'QuickWork\u2122 and Impact\u2122 create value' },
  { num: '04', title: 'Opportunity', desc: 'The marketplace connects talent with need' },
  { num: '05', title: 'Prosperity', desc: 'Meaningful work generates income' },
  { num: '06', title: 'Development', desc: 'Individual growth drives national growth' },
];

export default function JourneySection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="relative py-28 sm:py-36 px-4 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF34] mb-4">
            THE JOURNEY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
            From <span className="gradient-text">Potential</span> to Development
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-body">
            A six-step transformation pathway that turns raw talent into workforce-ready capability.
          </p>
        </motion.div>

        {/* Desktop: horizontal path */}
        <div className="hidden lg:block mt-20">
          <div className="relative">
            {/* Gradient connecting line */}
            <div className="absolute top-[28px] left-[8%] right-[8%] h-[2px]">
              <motion.div
                className="h-full rounded-full origin-left"
                style={{
                  background: 'linear-gradient(90deg, #C6FF34, #7E3BED)',
                }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>

            {/* Nodes */}
            <div className="relative flex justify-between">
              {journeySteps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="flex flex-col items-center text-center group cursor-default"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
                >
                  {/* Numbered circle */}
                  <div className="relative mb-5">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#000] border-2 border-[#C6FF34]/40 group-hover:border-[#C6FF34] transition-colors duration-300">
                      <span className="text-sm font-bold gradient-text font-display">
                        {step.num}
                      </span>
                    </div>
                    {/* Pulse ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[#C6FF34]/20"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    {step.title}
                  </h3>

                  {/* Tooltip description */}
                  <p className="text-xs text-white/40 max-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical path */}
        <div className="lg:hidden mt-16 relative">
          {/* Vertical line */}
          <div className="absolute left-[21px] top-0 bottom-0 w-[2px]">
            <motion.div
              className="h-full rounded-full origin-top"
              style={{
                background: 'linear-gradient(180deg, #C6FF34, #7E3BED)',
              }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </div>

          <div className="space-y-8">
            {journeySteps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex items-start gap-5 ml-1"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#000] border-2 border-[#C6FF34]/40 shrink-0">
                  <span className="text-xs font-bold gradient-text font-display">
                    {step.num}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
