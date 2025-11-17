"use client";
import { motion, type Variants } from "framer-motion";
import clsx from "clsx";
import React from "react";

type AnimatedCardProps = {
  children: React.ReactNode;
  className?: string;
};

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.68, 0.43, 1.01] } },
};

export default function AnimatedCard({ children, className }: AnimatedCardProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={variants}
      className={clsx(
        "rounded-2xl bg-readowl-purple-dark/20 border border-white/10 backdrop-blur-md mb-6 p-6 md:p-8",
        "shadow-md hover:shadow-xl transition-shadow duration-300",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}
