import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ParticleFieldProps {
  count?: number;
  density?: 'low' | 'medium' | 'high';
}

const COLORS = ['#C6FF34', '#7E3BED', '#FFFFFF', '#C6FF34', '#7E3BED'];

export default function ParticleField({
  count = 35,
  density = 'low',
}: ParticleFieldProps) {
  const densityMultiplier = useMemo(() => {
    switch (density) {
      case 'high':
        return 1.5;
      case 'medium':
        return 1;
      case 'low':
      default:
        return 0.7;
    }
  }, [density]);

  const particles = useMemo(() => {
    const total = Math.floor(count * densityMultiplier);
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, [count, densityMultiplier]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: 0,
          }}
          animate={{
            y: ['100vh', '-10vh'],
            opacity: [0, particle.opacity, particle.opacity, 0],
            scale: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Ambient gradient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(198,255,52,0.03) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(126,59,237,0.03) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
