"use client";
import { motion } from "framer-motion";
import React from "react";

type Props = { children: React.ReactNode; className?: string };

export default function QuoteBlock({ children, className }: Props) {
  return (
    <motion.blockquote
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45 }}
      className={`border-l-4 border-readowl-purple bg-readowl-purple-dark/10 text-white/90 italic text-lg rounded-r-xl px-6 py-4 my-6 ${className ?? ""}`}
    >
      {children}
    </motion.blockquote>
  );
}
