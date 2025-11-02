"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  _count: { comments: number; chapters: number };
};

export default function SearchResults() {
  const params = useSearchParams();
  const query = (params?.get('q') || params?.get('query') || '').trim();
  const [items, setItems] = useState<BookListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let ignore = false;
    setItems([]);
    setCursor(null);
    setHasMore(false);
    setError(null);
    if (!query) return;
    const load = async () => {
      setLoading(true);
      try {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&take=20`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { items: ApiItem[]; page: { nextCursor: string | null; hasMore: boolean } } = await res.json();
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
        }));
        setItems(mapped);
        setCursor(data.page.nextCursor);
        setHasMore(data.page.hasMore);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : 'Erro ao buscar');
      } finally {
        if (!ignore) setLoading(false);
      }
    }; 
    load();
    return () => { ignore = true; };
  }, [query]);

  const loadMore = async () => {
    if (!query || !cursor || loading) return;
    setLoading(true);
    try {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&take=20&cursor=${encodeURIComponent(cursor)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { items: ApiItem[]; page: { nextCursor: string | null; hasMore: boolean } } = await res.json();
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
      }));
      setItems((prev) => [...prev, ...mapped]);
      setCursor(data.page.nextCursor);
      setHasMore(data.page.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao buscar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl w-full mx-auto px-3 sm:px-6 mt-6">
      {query === '' && (
        <p className="text-white/70">Digite um termo na busca.</p>
      )}
      {query && (
        <>
          <h2 className="text-white font-ptserif text-xl">Resultados para &quot;{query}&quot;</h2>
          {error && <p className="text-red-400 mt-3">{error}</p>}
          <div className="mt-4 flex flex-col gap-4">
            {items.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
          <div className="mt-6 flex justify-center">
            {hasMore && (
              <button onClick={loadMore} disabled={loading} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded shadow disabled:opacity-50">
                {loading ? 'Carregando...' : 'Carregar mais'}
              </button>
            )}
            {!hasMore && items.length > 0 && (
              <p className="text-white/60 text-sm">Fim dos resultados</p>
            )}
            {!loading && items.length === 0 && !error && (
              <p className="text-white/70">Nenhum resultado.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
