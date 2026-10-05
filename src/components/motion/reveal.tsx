"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { EASE_OUT } from "@/lib/ease";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds, useful for lists of siblings. */
  delay?: number;
  /** Vertical travel distance in pixels before settling. */
  distance?: number;
}

/** Fades and slides content up once it scrolls into view. */
export const Reveal = ({
  children,
  className,
  delay = 0,
  distance = 24,
}: RevealProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: distance }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
