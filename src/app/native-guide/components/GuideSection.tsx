"use client";
import React from "react";
import AnimatedCard from "./AnimatedCard";
import { BookOpen, AlignLeft, MessageSquareQuote, RotateCcw, Volume2 } from "lucide-react";

type GuideSectionProps = {
  id: string;
  title: string;
  /** icon is a string key, mapped internally to lucide components to avoid passing functions across server->client boundary */
  icon?: string;
  children: React.ReactNode;
};

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOpen size={22} />,
  paragraphs: <AlignLeft size={22} />,
  quote: <MessageSquareQuote size={22} />,
  rewind: <RotateCcw size={22} />,
  sound: <Volume2 size={22} />,
};

export default function GuideSection({ id, title, icon, children }: GuideSectionProps) {
  return (
    <AnimatedCard className="p-6 md:p-8">
      <section id={id} aria-label={title} className="prose-premium max-w-none">
        <div className="flex items-center gap-3 mb-4">
          {icon && iconMap[icon] && (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-white shadow">
              {iconMap[icon]}
            </span>
          )}
          <h2 className="m-0 text-2xl md:text-3xl font-extrabold tracking-tight text-white">{title}</h2>
        </div>
        <div className="text-white/90 leading-relaxed space-y-5">{children}</div>
      </section>
    </AnimatedCard>
  );
}
