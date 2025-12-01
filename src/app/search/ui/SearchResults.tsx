"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import BookCard, { type BookListItem } from '@/components/book/BookCard';
import type { BookStatus } from '@/types/book';

type ApiItem = {
  id: string;
  slug: string | null;
  title: string;
  synopsis: string | null;
  coverUrl: string | null;
  views: number;
  totalViews: number;
  ratingAvg: number;
  status: string;
  createdAt: string;
  author: { name: string | null } | null;
  genres: { name: string }[];
  _count: { comments: number; chapters: number; followers?: number };
};

export default function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = (params?.get('q') || params?.get('query') || '').trim();
  const status = (params?.get('status') || '').trim();
  const sort = (params?.get('sort') || 'trending').trim();
  const order = ((params?.get('order') || 'desc').toLowerCase() === 'asc') ? 'asc' : 'desc';
  const page = Math.max(1, Number(params?.get('page') || '1'));
  const pageSize = Math.max(1, Number(params?.get('pageSize') || '10'));
  const genres = (params?.get('genres') || '').trim();
  // genresMode removed
  const [items, setItems] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;
    setItems([]);
    setTotal(0);
    setTotalPages(1);
    setError(null);
    const load = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (query) qs.set('q', query);
        if (status) qs.set('status', status);
        if (genres) qs.set('genres', genres);
        if (sort) qs.set('sort', sort);
        if (order) qs.set('order', order);
        qs.set('page', String(page));
        qs.set('pageSize', String(pageSize));
        const res = await fetch(`/api/search?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { items: ApiItem[]; page: { page: number; pageSize: number; total: number; totalPages: number } } = await res.json();
        if (ignore) return;
  const mapped = data.items.map<BookListItem>((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          synopsis: b.synopsis,
          coverUrl: b.coverUrl ?? undefined,
          views: b.totalViews ?? b.views,
          ratingAvg: b.ratingAvg,
          status: b.status as BookStatus,
          createdAt: b.createdAt,
          author: b.author,
          genres: b.genres,
          commentsCount: b._count?.comments,
          chaptersCount: b._count?.chapters,
      followersCount: b._count?.followers,
        }));
        // server handles all sorts now
        setItems(mapped);
        setTotal(data.page.total);
        setTotalPages(data.page.totalPages);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : 'Erro ao buscar');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [query, status, genres, sort, order, page, pageSize]);

  const goToPage = (next: number) => {
    const sp = new URLSearchParams(params?.toString());
    sp.set('page', String(Math.max(1, Math.min(next, totalPages))));
    router.replace(`${pathname}?${sp.toString()}`);
  };

  return (
    <section className="max-w-7xl w-full mx-auto px-3 sm:px-6 mt-6">
      {
        <>
          <h2 className="text-white font-ptserif text-xl">Resultados {query ? <>para &quot;{query}&quot;</> : ''}</h2>
          {error && <p className="text-red-400 mt-3">{error}</p>}
          <div className="mt-4 flex flex-col gap-4">
            {items.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
          <div className="mt-6 flex flex-col items-center gap-3 pb-6">
            <div className="text-white/70 text-sm">Página {page} de {totalPages} • {total} resultados</div>
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(page - 1)} disabled={loading || page <= 1} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded disabled:opacity-50">Anterior</button>
              <button onClick={() => goToPage(page + 1)} disabled={loading || page >= totalPages} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded disabled:opacity-50">Próxima</button>
            </div>
            {!loading && items.length === 0 && !error && (
              <p className="text-white/70">Nenhum resultado.</p>
            )}
          </div>
        </>
      }
    </section>
  );
}
