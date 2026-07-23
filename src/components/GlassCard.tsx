import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass rounded-2xl font-body',
        hover && 'glass-hover cursor-pointer',
        glow && 'glass-glow',
        className
      )}
      onClick={onClick}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -2,
            }
          : undefined
      }
      transition={{
        duration: 0.3,
        ease: [0.19, 1, 0.22, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
