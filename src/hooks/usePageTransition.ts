import type { Variants, Transition } from 'framer-motion';

const defaultTransition: Transition = {
  duration: 0.4,
  ease: [0.19, 1, 0.22, 1],
};

export function usePageTransition() {
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  const fadeUpVariants: Variants = {
    initial: {
      opacity: 0,
      y: 30,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  const staggerContainer: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const staggerItem: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: defaultTransition,
    },
  };

  return {
    pageVariants,
    fadeUpVariants,
    staggerContainer,
    staggerItem,
    transition: defaultTransition,
  };
}
