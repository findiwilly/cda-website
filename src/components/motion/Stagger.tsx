"use client";

import { motion, type Variants } from "motion/react";
import {
  fadeUp,
  staggerParent,
  staggerParentLoose,
  viewportOnce,
} from "@/lib/motion-tokens";

export function Stagger({
  children,
  className,
  loose = false,
}: {
  children: React.ReactNode;
  className?: string;
  loose?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={loose ? staggerParentLoose : staggerParent}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
