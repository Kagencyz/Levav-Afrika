import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  className,
  align = 'center',
}: SectionHeaderProps) {
  return (
    <motion.div
      className={cn(
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
    >
      <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C6FF34] mb-4 font-body">
        {label}
      </span>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
        {title.split(' ').map((word, i) => {
          const isAccent =
            word.toLowerCase().includes('intelligence') ||
            word.toLowerCase().includes('future') ||
            word.toLowerCase().includes('talent') ||
            word.toLowerCase().includes('potential') ||
            word.toLowerCase().includes('impact');
          return (
            <span key={i}>
              {isAccent ? (
                <span className="gradient-text">{word}</span>
              ) : (
                word
              )}{' '}
            </span>
          );
        })}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed font-body">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
