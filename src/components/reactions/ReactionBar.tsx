"use client";
import React from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { reactionMetas } from './reactionConfig';
import type { ReactionType } from '@/app/api/books/[slug]/reactions/route';
import { useRouter } from 'next/navigation';

interface ReactionBarProps {
  slug: string; // book slug
  dark?: boolean; // theme from parent
}

interface CountsResponse {
  counts: Record<ReactionType, number>;
  userReaction: ReactionType | null;
}

export default function ReactionBar({ slug, dark }: ReactionBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [counts, setCounts] = React.useState<Record<ReactionType, number>>(() => {
    return reactionMetas.reduce<Record<ReactionType, number>>((acc, m) => { acc[m.type] = 0; return acc; }, {} as Record<ReactionType, number>);
  });
  const [selected, setSelected] = React.useState<ReactionType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await fetch(`/api/books/${slug}/reactions`, { cache: 'no-store' });
        if (!r.ok) return;
        const data: CountsResponse = await r.json();
        if (!ignore) {
          setCounts((prev) => data.counts || prev);
          setSelected(data.userReaction);
        }
      } catch {}
    })();
    return () => { ignore = true; };
  }, [slug]);

  async function handleClick(meta: { type: ReactionType }) {
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }
    if (loading) return;
    const next = meta.type;
    if (selected === next) return; // already selected
    setError(null);
    setLoading(true);
    // Optimistic update
    setCounts((prev) => {
      const cpy = { ...prev };
      if (selected) cpy[selected] = Math.max(0, cpy[selected] - 1);
      cpy[next] = (cpy[next] || 0) + 1;
      return cpy;
    });
    setSelected(next);
    try {
      const r = await fetch(`/api/books/${slug}/reactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reaction: next }) });
      if (!r.ok) throw new Error('Falha ao registrar reação');
      const data: CountsResponse & { previous?: ReactionType | null } = await r.json();
      setCounts(data.counts);
      setSelected(data.userReaction);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`relative rounded-md p-4 md:p-6 mt-6 font-ptserif ${dark ? 'bg-readowl-purple-extradark text-white' : 'bg-readowl-purple-extralight text-readowl-purple-extradark'} shadow-md`}>      
      <h3 className="text-center font-bold text-xl mb-4 tracking-wide">DEIXE UMA REAÇÃO AO CAPÍTULO</h3>
      <div className="flex flex-wrap md:flex-nowrap items-stretch justify-center gap-4">
        {reactionMetas.map((meta) => {
          const isSel = selected === meta.type;
          return (
            <button
              key={meta.type}
              onClick={() => handleClick(meta)}
              disabled={loading}
              className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-xl border border-transparent ${meta.color} ${meta.hover} transition-all duration-300 ease-out shadow-sm hover:shadow-lg focus:outline-none ${isSel ? `ring-4 ${meta.ring} scale-105 shadow-xl` : 'hover:scale-105'} active:scale-95`}
            >
              <div className="w-14 h-14 flex items-center justify-center">
                <Image src={meta.image} alt={meta.label} width={56} height={56} className={`object-contain drop-shadow-sm ${isSel ? 'animate-pulse' : 'group-hover:animate-bounce'}`} />
              </div>
              <div className={`mt-1 text-sm font-semibold ${dark ? 'text-white' : 'text-readowl-purple-extradark'}`}>{counts[meta.type] ?? 0}</div>
              <span className="sr-only">{meta.label}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}
      {session?.user?.id ? (
        <p className="mt-4 text-center text-xs opacity-70">Sua reação pode ser alterada a qualquer momento.</p>
      ) : (
        <p className="mt-4 text-center text-xs opacity-70">Faça login para reagir.</p>
      )}
    </div>
  );
}
