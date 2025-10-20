"use client";
import Image from 'next/image';
import React from 'react';
 

type Props = { bookId: string; slug: string };

function starSrc(score: number) {
    switch (score) {
        case 1: return '/img/svg/book/aval/star1.svg';
        case 2: return '/img/svg/book/aval/star2.svg';
        case 3: return '/img/svg/book/aval/star3.svg';
        case 4: return '/img/svg/book/aval/star4.svg';
        case 5: return '/img/svg/book/aval/star5.svg';
        default: return '/img/svg/book/aval/star.svg';
    }
}

export default function RatingBox({ bookId, slug }: Props) {
    const [myScore, setMyScore] = React.useState<number>(0);
    const [hover, setHover] = React.useState<number>(0);
    const [avg, setAvg] = React.useState<number | null>(null);
    const [count, setCount] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(false);

    // slug is provided by server page to avoid brittle parsing

    // Initial fetch
    React.useEffect(() => {
        if (!slug) return;
        fetch(`/api/books/${slug}/rating`).then(r => r.ok ? r.json() : Promise.reject(r)).then((data: { avg: number|null; count: number; myScore: number }) => {
            setAvg(data.avg);
            setCount(data.count);
            setMyScore(data.myScore || 0);
        }).catch(() => {});
    }, [slug]);

    const display = hover || myScore;

    async function setRating(nextScore: number) {
        if (!slug || loading) return;
        setLoading(true);
        const prevMy = myScore;
        
        const isToggleOff = prevMy === nextScore; // clicking same star removes rating
        // optimistic
        const newMy = isToggleOff ? 0 : nextScore;
        if (isToggleOff) {
            // Clear hover so UI returns to default star sprites immediately
            setHover(0);
        }
        setMyScore(newMy);
        try {
            let res: Response;
            if (isToggleOff) {
                res = await fetch(`/api/books/${slug}/rating`, { method: 'DELETE' });
            } else {
                res = await fetch(`/api/books/${slug}/rating`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: nextScore }) });
            }
            if (res.status === 401) {
                // revert and send user to login
                setMyScore(prevMy);
                window.location.href = '/login';
                return;
            }
            if (!res.ok) {
                setMyScore(prevMy);
                return;
            }
            const data = await res.json().catch(() => null) as { avg?: number|null; count?: number; myScore?: number } | null;
            if (data) {
                if (typeof data.avg !== 'undefined') setAvg(data.avg ?? null);
                if (typeof data.count === 'number') setCount(data.count);
                if (typeof data.myScore === 'number') setMyScore(data.myScore);
                // notify header to refresh rating summary if needed in the future
                try {
                    window.dispatchEvent(new CustomEvent('book:rating:updated', { detail: { slug, avg: data.avg, count: data.count } }));
                } catch {}
            }
        } finally {
            setLoading(false);
        }
    }

    return (
    <div className="relative bg-readowl-purple-light border-2 text-white border-readowl-purple shadow-md p-4 text-center" data-bookid={bookId}>
            <div className="mb-2 text-white font-bold text-4xl">AVALIE ESTA OBRA</div>
            <div className="inline-flex items-center gap-3 select-none">
                {Array.from({ length: 5 }).map((_, i) => {
                    const idx = i + 1;
                    // For our sprite approach, render starN (1..5) only once per state based on display
                    // and default 'star' for positions beyond display
                    const src = display >= idx ? starSrc(display) : starSrc(0);
                    return (
                        <button
                            key={idx}
                            aria-label={`Avaliar ${idx} ${idx === 1 ? 'estrela' : 'estrelas'}`}
                            onMouseEnter={() => setHover(idx)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(idx)}
                            className="transition-transform duration-150 ease-out hover:scale-110 active:scale-95"
                        >
                            <Image src={src} alt={`${idx}`} width={90} height={90} className="transition-all duration-150 hover:brightness-110" />
                        </button>
                    );
                })}
            </div>
            <div className="mt-2 text-readowl-purple-extradark text-xl">
                {avg != null ? `${(avg * 20).toFixed(2)}% em ${count} avaliações` : '—'}
            </div>
        </div>
    );
}
