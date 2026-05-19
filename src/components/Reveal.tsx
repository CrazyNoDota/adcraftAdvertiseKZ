'use client';

import { motion, useReducedMotion } from 'motion/react';
import { createElement, type ReactNode } from 'react';

type Tag = 'div' | 'section' | 'li' | 'header' | 'article';

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: Tag;
};

/**
 * Fades + slides children in once they scroll into view.
 * No-ops for users who prefer reduced motion.
 */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div' }: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  if (reduced) {
    return createElement(as, { className }, children);
  }
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
