"use client";
import React from "react";
import { motion } from "framer-motion";

type Props = { sidebar: React.ReactNode; children: React.ReactNode };

export default function GuideLayout({ sidebar, children }: Props) {
  return (
    <div className="min-h-screen text-white">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-24 pb-10 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 md:p-10 shadow-xl">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Guia de Narrativa</h1>
          </div>
        </div>
      </motion.header>

      <main className="px-4 pb-16">
        <div className="max-w-6xl mx-auto gap-6">
          {sidebar}
          <div className="mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
