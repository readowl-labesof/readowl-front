"use client";
import React from 'react';

export default function ViewsCountClient({ slug, initialCount }: { slug: string; initialCount?: number }) {
  const [count, setCount] = React.useState<number | null>(typeof initialCount === 'number' ? initialCount : null);
  // Keep a stable ref for initial count to avoid effect dependency warnings
  const initialRef = React.useRef<number | undefined>(initialCount);
  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const t0 = performance.now();
        const res = await fetch(`/api/books/${slug}/views`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const t1 = performance.now();
        if (!ignore) {
          setCount(Number(data?.count || 0));
          // Dev perf log
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[ViewsCountClient] Fetched book views for ${slug} in ${(t1 - t0).toFixed(1)}ms`, { initialCount: initialRef.current, apiCount: data?.count });
          }
        }
      } catch {}
    })();
    return () => { ignore = true; };
  }, [slug]);

  return <>{count !== null ? count.toLocaleString('pt-BR') : '0'}</>;
}
