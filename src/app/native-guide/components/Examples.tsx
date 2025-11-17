"use client";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import React from "react";

type Props = { children: React.ReactNode; className?: string };

export function GoodExample({ children, className }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-100 px-4 py-3 flex items-start gap-3 ${className ?? ""}`}
    >
      <CheckCircle2 className="text-emerald-300 mt-0.5" size={20} />
      <div className="text-sm leading-relaxed">{children}</div>
    </motion.div>
  );
}

export function BadExample({ children, className }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`rounded-xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 flex items-start gap-3 ${className ?? ""}`}
    >
      <XCircle className="text-red-300 mt-0.5" size={20} />
      <div className="text-sm leading-relaxed">{children}</div>
    </motion.div>
  );
}
