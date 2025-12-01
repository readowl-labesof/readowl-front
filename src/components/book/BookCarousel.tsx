"use client";
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import clsx from "clsx";
import { BookMarked, ChevronLeft, ChevronRight, Book } from "lucide-react";
import { slugify } from "@/lib/slug";

// Minimal data shape
export interface CarouselBook { id: string; title: string; coverUrl: string | null; slug?: string }
// Public API (kept stable)
interface BookCarouselProps { books: CarouselBook[]; title: string; icon?: React.ReactNode; itemsPerView?: number; emptyMessage?: string; storageKey?: string; rightAction?: React.ReactNode }

// Placeholder when no cover
const NoCover = (
    <div className="w-full h-full flex items-center justify-center bg-readowl-purple-extralight text-readowl-purple-medium">
        <Book size={36} />
    </div>
);

function smooth(el: HTMLElement, left: number, reduced: boolean) {
    el.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
}

export const BookCarousel: React.FC<BookCarouselProps> = ({
    books,
    title,
    icon = <BookMarked size={20} />,
    itemsPerView = 5,
    emptyMessage = "Nenhuma obra registrada.",
    storageKey,
    rightAction,
}) => {
    // Refs
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const sectionRef = useRef<HTMLElement | null>(null);
    const didInitRef = useRef(false);
    const idleTimer = useRef<number | null>(null);

    // State
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [cardWidth, setCardWidth] = useState(0);
    const [gap, setGap] = useState(18);
    const [visibleCount, setVisibleCount] = useState(itemsPerView);
    const [peekPrev, setPeekPrev] = useState(24);
    const [peekNext, setPeekNext] = useState(20);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const [isScrollable, setIsScrollable] = useState(false);

    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Loop and clone logic
    const loopEnabled = books.length > visibleCount + 1;
    const cloneCount = loopEnabled ? Math.min(books.length, visibleCount + 2) : 0;
    const dataset = useMemo(() => {
        if (!loopEnabled) return books;
        const left = books.slice(books.length - cloneCount);
        const right = books.slice(0, cloneCount);
        return [...left, ...books, ...right];
    }, [books, loopEnabled, cloneCount]);

    // Layout computation (ResizeObserver + window resize)
    const computeLayout = useCallback(() => {
        const el = scrollRef.current; if (!el) return;
        const w = el.clientWidth;
        let target = itemsPerView;
        if (w < 420) target = Math.min(3, itemsPerView);
        else if (w < 640) target = Math.min(3, itemsPerView);
        else if (w < 900) target = Math.min(4, itemsPerView);
        else target = itemsPerView;
        const baseGap = w < 480 ? 10 : w < 640 ? 14 : w < 900 ? 18 : 22;
        const available = w - baseGap * (target - 1) - 4;
        const raw = available / target;
        const clamped = Math.max(100, Math.min(raw, 190));
        setCardWidth(clamped);
        setGap(baseGap);
        setVisibleCount(target);
        const prev = Math.round(clamped * (w < 480 ? 0.18 : w < 768 ? 0.22 : 0.26));
        const next = Math.round(clamped * (w < 480 ? 0.18 : w < 768 ? 0.2 : 0.24));
        setPeekPrev(prev);
        setPeekNext(next);
    }, [itemsPerView]);

    useEffect(() => {
        computeLayout();
        const ro = new ResizeObserver(() => computeLayout());
        if (scrollRef.current) ro.observe(scrollRef.current);
        const onResize = () => computeLayout();
        window.addEventListener("resize", onResize);
        return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
    }, [computeLayout]);

    const snap = useMemo(() => cardWidth + gap, [cardWidth, gap]);

    // Helpers to map dataset index -> real index
    const mapToReal = useCallback((i: number) => {
        if (!loopEnabled) return i;
        if (i < cloneCount) return (books.length - cloneCount + i) % books.length;
        if (i >= cloneCount + books.length) return (i - (cloneCount + books.length)) % books.length;
        return i - cloneCount;
    }, [loopEnabled, cloneCount, books.length]);

    const normalizeIfOutOfClones = useCallback(() => {
        if (!loopEnabled || !scrollRef.current) return;
        const el = scrollRef.current;
        const base = cloneCount * snap;
        const min = 0;
        const max = base + (books.length - 1) * snap;
        const l = el.scrollLeft + peekPrev;
        if (l < min + snap * 0.5) el.scrollLeft = base + (books.length - 1) * snap - peekPrev;
        else if (l > max + snap * 0.5) el.scrollLeft = base - peekPrev;
    }, [loopEnabled, cloneCount, snap, books.length, peekPrev]);

    const updateStateFromScroll = useCallback(() => {
        const el = scrollRef.current; if (!el || snap <= 0) return;
        normalizeIfOutOfClones();
        const scrollable = books.length > visibleCount;
        setIsScrollable(scrollable);
        if (scrollable && loopEnabled) { setCanPrev(true); setCanNext(true); }
        else { setCanPrev(el.scrollLeft > 4); setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4); }
        // Active index by right-edge alignment + peek
        const base = loopEnabled ? cloneCount * snap : 0;
        const normLeft = el.scrollLeft - base + peekPrev;
        const idx = Math.round(normLeft / snap);
        const clamped = Math.min(books.length - 1, Math.max(0, idx));
        if (clamped !== activeIndex) setActiveIndex(clamped);
    }, [books.length, visibleCount, loopEnabled, cloneCount, snap, peekPrev, activeIndex, normalizeIfOutOfClones]);

    useEffect(() => { updateStateFromScroll(); }, [books.length, snap, updateStateFromScroll]);

    // Scroll controls
    const scrollBy = useCallback((dir: number) => {
        const el = scrollRef.current; if (!el || snap <= 0) return;
        if (loopEnabled) {
            const base = cloneCount * snap;
            const idx = Math.round((el.scrollLeft - base + peekPrev) / snap);
            if (dir > 0 && idx >= books.length - 1) el.scrollLeft = el.scrollLeft - books.length * snap;
            else if (dir < 0 && idx <= 0) el.scrollLeft = el.scrollLeft + books.length * snap;
        }
        smooth(el, el.scrollLeft + dir * snap, reduced);
    }, [loopEnabled, cloneCount, snap, peekPrev, books.length, reduced]);

    const scrollToIndex = useCallback((index: number) => {
        const el = scrollRef.current; if (!el || snap <= 0) return;
        if (loopEnabled) {
            const base = cloneCount * snap;
            const cur = Math.round((el.scrollLeft - base + peekPrev) / snap);
            if (cur === books.length - 1 && index === 0) el.scrollLeft = el.scrollLeft - books.length * snap;
            if (cur === 0 && index === books.length - 1) el.scrollLeft = el.scrollLeft + books.length * snap;
            smooth(el, base + index * snap - peekPrev, reduced);
        } else {
            smooth(el, index * snap - peekPrev, reduced);
        }
    }, [loopEnabled, cloneCount, snap, peekPrev, books.length, reduced]);

    // Keyboard nav on section
    useEffect(() => {
        const sec = sectionRef.current; if (!sec) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") { e.preventDefault(); scrollBy(-1); }
            else if (e.key === "ArrowRight") { e.preventDefault(); scrollBy(1); }
        };
        sec.addEventListener("keydown", onKey);
        return () => sec.removeEventListener("keydown", onKey);
    }, [scrollBy]);

    // Pointer drag + Shift+Wheel horizontal
    useEffect(() => {
        const el = scrollRef.current; if (!el) return;
        let isDown = false, startX = 0, startY = 0, startLeft = 0, didDrag = false;
        const THRESH = 6;
        const onDown = (e: PointerEvent) => {
            if (!isScrollable) return;
            if (e.button !== 0) return;
            isDown = true; didDrag = false;
            startX = e.clientX; startY = e.clientY; startLeft = el.scrollLeft;
            el.setPointerCapture(e.pointerId);
            setPaused(true);
        };
        const onMove = (e: PointerEvent) => {
            if (!isDown) return;
            const dx = e.clientX - startX, dy = e.clientY - startY;
            if (!didDrag && Math.abs(dx) < THRESH && Math.abs(dy) < THRESH) return;
            if (!didDrag) { didDrag = true; el.classList.add("dragging"); }
            e.preventDefault();
            el.scrollLeft = startLeft - dx; updateStateFromScroll();
        };
        const onUp = (e: PointerEvent) => {
            if (!isDown) return; isDown = false;
            el.releasePointerCapture(e.pointerId); el.classList.remove("dragging");
            if (didDrag) {
                // snap to nearest
                const base = loopEnabled ? cloneCount * snap : 0;
                const idx = Math.round((el.scrollLeft - base + peekPrev) / snap);
                smooth(el, base + idx * snap - peekPrev, reduced);
            } else {
                // not a drag: click-through
                const node = document.elementFromPoint(e.clientX, e.clientY) as Element | null;
                const anchor = node?.closest("a"); if (anchor && el.contains(anchor)) (anchor as HTMLAnchorElement).click();
            }
            if (idleTimer.current) window.clearTimeout(idleTimer.current);
            idleTimer.current = window.setTimeout(() => setPaused(false), 3000);
        };
        const onWheel = (e: WheelEvent) => {
            if (!e.shiftKey) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY; updateStateFromScroll();
            setPaused(true);
            if (idleTimer.current) window.clearTimeout(idleTimer.current);
            idleTimer.current = window.setTimeout(() => setPaused(false), 3000);
        };
        el.addEventListener("pointerdown", onDown, { passive: true });
        el.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        el.addEventListener("scroll", updateStateFromScroll, { passive: true });
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            el.removeEventListener("pointerdown", onDown);
            el.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            el.removeEventListener("scroll", updateStateFromScroll);
            el.removeEventListener("wheel", onWheel);
        };
    }, [isScrollable, loopEnabled, cloneCount, snap, peekPrev, reduced, updateStateFromScroll]);

    // Autoplay (respects reduced motion)
    useEffect(() => {
        if (reduced) return; if (books.length <= 1) return; if (paused) return;
        const id = setInterval(() => scrollBy(1), 4000);
        return () => clearInterval(id);
    }, [books.length, paused, reduced, scrollBy]);

    // Pause on hover
    useEffect(() => {
        const el = scrollRef.current; if (!el) return;
        const enter = () => setPaused(true);
        const leave = () => setPaused(false);
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); };
    }, []);

    // Center on initial index (persisted)
    useEffect(() => {
        const el = scrollRef.current; if (!el || snap <= 0) return;
        if (didInitRef.current) return;
        let initial = 0;
        try { const key = `bookCarousel:${storageKey || title}`; const saved = localStorage.getItem(key); if (saved) initial = Math.max(0, Math.min(books.length - 1, parseInt(saved, 10) || 0)); } catch {}
        if (loopEnabled) {
            const base = cloneCount * snap; el.scrollLeft = base + initial * snap - peekPrev;
        } else {
            el.scrollLeft = initial * snap - peekPrev;
        }
        didInitRef.current = true;
    }, [books.length, snap, peekPrev, loopEnabled, cloneCount, storageKey, title]);

    // Persist active index
    useEffect(() => {
        try { localStorage.setItem(`bookCarousel:${storageKey || title}`, String(activeIndex)); } catch {}
    }, [activeIndex, storageKey, title]);

    const clamp3: React.CSSProperties = { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" };

        // Use a deterministic id for SSR hydration: based on title/storageKey
        const carouselId = useMemo(() => {
            const base = (storageKey || title || '').replace(/\W+/g, '');
            return `carousel-${base}`;
        }, [storageKey, title]);

    return (
        <section ref={sectionRef} tabIndex={0} aria-roledescription="carousel" aria-label={title} className="mt-8 w-full">
            <div className="relative">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center bg-readowl-purple-medium px-6 sm:px-8 py-2 text-white font-ptserif text-lg select-none shadow mx-auto max-w-full">
                    <div />
                    <div className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 inline-flex items-center justify-center">{icon}</span>
                        <h2 className="text-sm sm:text-base md:text-lg font-ptserif tracking-wide">{title}</h2>
                    </div>
                    <div className="flex items-center justify-end">
                        {rightAction}
                    </div>
                </div>
            </div>

            {books.length === 0 && (
                <div className="text-sm text-readowl-purple-extralight mt-6 px-2">{emptyMessage}</div>
            )}

            {books.length > 0 && (
                <div className="relative mt-5">
                    <button
                        aria-controls={carouselId}
                        aria-label="Anterior"
                        disabled={!canPrev}
                        onClick={() => scrollBy(-1)}
                        className={clsx(
                            "absolute z-20 left-0 top-1/2 -translate-y-1/2 pl-1 pr-2 py-2 text-readowl-purple-dark transition active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-readowl-purple",
                            !canPrev && "opacity-30 cursor-not-allowed"
                        )}
                    >
                        <ChevronLeft className="w-7 h-7 pointer-events-none select-none text-readowl-purple-medium" />
                    </button>

                    <div
                        id={carouselId}
                        ref={scrollRef}
                        className={clsx(
                            "hide-scrollbar relative mx-9 flex overflow-x-auto scroll-smooth select-none",
                            isScrollable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                        )}
                        style={{ gap, paddingLeft: peekPrev, paddingRight: peekNext }}
                    >
                        {dataset.map((b, i) => {
                            const real = mapToReal(i);
                            const isActive = real === activeIndex;
                            return (
                                <Link
                                    key={`${b.id}-${i}`}
                                    href={`/library/books/${b.slug ?? slugify(b.title)}`}
                                    aria-label={b.title}
                                    onClick={() => {
                                        setPaused(true);
                                        if (idleTimer.current) window.clearTimeout(idleTimer.current);
                                        idleTimer.current = window.setTimeout(() => setPaused(false), 3000);
                                    }}
                                    className={clsx(
                                        "group relative flex-shrink-0 overflow-hidden shadow-md ring-1 ring-readowl-purple-light/40 hover:ring-readowl-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-readowl-purple-dark transition-transform duration-300",
                                        isActive ? "opacity-100" : "opacity-95"
                                    )}
                                    style={{ width: cardWidth, aspectRatio: "3 / 4" }}
                                >
                                    {b.coverUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={b.coverUrl}
                                            alt={b.title}
                                            draggable={false}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                                            loading="lazy"
                                        />
                                    ) : (
                                        NoCover
                                    )}
                                    <div className="absolute inset-0 flex flex-col justify-end">
                                        <div className="pointer-events-none mt-auto w-full px-2 pb-1 pt-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                                            <p title={b.title} className="text-[11px] sm:text-xs font-medium text-white leading-snug drop-shadow-md text-center" style={clamp3}>
                                                {b.title}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <button
                        aria-controls={carouselId}
                        aria-label="Próximo"
                        disabled={!canNext}
                        onClick={() => scrollBy(1)}
                        className={clsx(
                            "absolute z-20 right-0 top-1/2 -translate-y-1/2 pr-1 pl-2 py-2 text-readowl-purple-dark transition active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-readowl-purple",
                            !canNext && "opacity-30 cursor-not-allowed"
                        )}
                    >
                        <ChevronRight className="w-7 h-7 pointer-events-none select-none text-readowl-purple-medium" />
                    </button>
                </div>
            )}

                    {books.length > 0 && (() => {
                        // Number of distinct windows you can view (first index of each window)
                        // If you can't scroll (books <= visibleCount), don't render bullets
                        const pages = Math.max(0, books.length - visibleCount + 1);
                        if (!isScrollable || pages <= 1) return null;
                        const page = Math.min(pages - 1, activeIndex);
                return (
                    <div className="mt-4 flex justify-center gap-2 flex-wrap" aria-label="Indicadores de posição">
                                {Array.from({ length: pages }).map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Ir para posição ${i + 1}`}
                                aria-current={i === page}
                                        onClick={() => scrollToIndex(i)}
                                className={clsx("h-2.5 transition-all", i === page ? "bg-readowl-purple w-5" : "bg-readowl-purple-light/50 w-2 hover:bg-readowl-purple-light/80")}
                            />
                        ))}
                    </div>
                );
            })()}

            <style jsx global>{`
                .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { scroll-snap-type: x mandatory; }
                .hide-scrollbar > a { scroll-snap-align: start; }
                .hide-scrollbar.dragging { cursor: grabbing; }
                .hide-scrollbar > a { transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1); }
                @media (prefers-reduced-motion: reduce) { .hide-scrollbar > a { transition: none; } }
            `}</style>
        </section>
    );
};

export default BookCarousel;
