import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  MOMENT 4 — HUMAN STORIES  "How does it change lives?"       ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const stories = [
  {
    name: 'Amara',
    location: 'Kenya',
    role: 'UX Designer',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&h=400',
    quote: 'From unemployed to UX Designer at a pan-African fintech. Levav\u2122 didn\'t just teach me skills — it revealed who I already was.',
    highlight: 'UX Designer at pan-African fintech',
  },
  {
    name: 'Kofi',
    location: 'Ghana',
    role: 'Team Lead',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400',
    quote: 'Levav 28\u2122 helped me discover my leadership voice. I entered as a quiet developer and emerged as someone who could rally a team.',
    highlight: 'Engineering Team Lead',
  },
  {
    name: 'Zara',
    location: 'Nigeria',
    role: 'Data Scientist',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&h=400',
    quote: 'QuickWork\u2122 funded my data science certification. The projects I took on paid for my courses — and built my portfolio at the same time.',
    highlight: 'Data Scientist',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
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

export default function HumanStoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-28 sm:py-36 px-4 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C6FF34] mb-4">
            HUMAN STORIES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
            Real Stories. <span className="text-white">Real Impact.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-body">
            These are not testimonials. These are transformation stories from across the continent.
          </p>
        </motion.div>

        {/* Story cards */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {stories.map((story, i) => (
            <motion.div
              key={story.name}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group"
            >
              <div
                className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-white/[0.10] ${
                  i % 2 === 0 ? '' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex flex-col md:flex-row ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  {/* Image */}
                  <div className="md:w-[280px] lg:w-[320px] shrink-0">
                    <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
                      <img
                        src={story.photo}
                        alt={story.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000]/60 via-transparent to-transparent md:hidden" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center relative">
                    {/* Large quote mark */}
                    <span className="absolute top-4 left-4 md:top-6 md:left-8 text-6xl md:text-8xl font-display text-[#C6FF34]/10 leading-none select-none">
                      &ldquo;
                    </span>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20">
                          {story.highlight}
                        </span>
                        <span className="text-xs text-white/40 uppercase tracking-wider">
                          {story.location}
                        </span>
                      </div>

                      <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 italic font-body">
                        &ldquo;{story.quote}&rdquo;
                      </p>

                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {story.name}
                          </h4>
                          <p className="text-xs text-white/40">
                            {story.location}
                          </p>
                        </div>
                      </div>
                    </div>
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
