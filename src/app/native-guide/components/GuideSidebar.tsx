"use client";
import React from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

type Item = { id: string; label: string };

function useActiveId(ids: string[]): string | null {
  const [active, setActive] = React.useState<string | null>(null);
  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(id);
          });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: [0, 1] },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);
  return active;
}

export default function GuideSidebar({ items }: { items: Item[] }) {
  const active = useActiveId(items.map((i) => i.id));
  const [open, setOpen] = React.useState(false);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
    setOpen(false);
  }

  return (
    <>
      {/* Mobile trigger */}
      <div className="md:hidden sticky top-16 z-30 -mx-4 px-4">
        <button
          aria-label="Abrir navegação do guia"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between bg-readowl-purple-dark/40 border border-white/10 rounded-xl px-4 py-3 text-white hover:bg-readowl-purple-dark/60 transition"
        >
          <span className="font-medium">Navegação</span>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <motion.aside
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="md:hidden bg-readowl-purple-dark/95 border-y border-white/10 backdrop-blur-xl -mx-4 px-4 py-3"
        >
          <nav aria-label="Seções do guia" className="flex gap-2 overflow-x-auto">
            {items.map((it) => {
              const isActive = active === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => scrollTo(it.id)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                    isActive
                      ? "bg-white text-readowl-purple-dark font-semibold"
                      : "bg-white/10 text-white/90 hover:bg-white/15"
                  }`}
                >
                  {it.label}
                </button>
              );
            })}
          </nav>
        </motion.aside>
      )}

      {/* Desktop floating sidebar (md+) */}
      <aside aria-hidden className="hidden md:block" />
      <nav
        aria-label="Seções do guia"
        className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-2"
      >
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => scrollTo(it.id)}
              title={it.label}
              aria-current={isActive ? "true" : undefined}
              className={`px-3 py-2 rounded-xl text-sm text-left transition border shadow-lg backdrop-blur-md ${
                isActive
                  ? "bg-white text-readowl-purple-dark border-white/70"
                  : "bg-white/10 text-white/90 hover:bg-white/20 border-white/20"
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
