"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BOOK_GENRES_MASTER, BOOK_STATUS_LABEL, type BookStatus } from '@/types/book';
import { ArrowDownUp, Search as SearchIcon, Filter as FilterIcon, Tags, CheckSquare, XCircle, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import ButtonWithIcon from '@/components/ui/button/ButtonWithIcon';

type SortOption =
  | 'trending'
  | 'topRated14d'
  | 'mostViewedTotal'
  | 'mostCommented'
  | 'chaptersCount'
  | 'mostFollowed'
  | 'alpha'
  | 'oldest';

const sortLabels: Record<SortOption, string> = {
  trending: 'Em destaque',
  topRated14d: 'Mais avaliados',
  mostViewedTotal: 'Mais visualizados',
  mostCommented: 'Mais comentados',
  mostFollowed: 'Mais seguidos',
  chaptersCount: 'Mais capítulos',
  alpha: 'Nome',
  oldest: 'Data de criação',
};

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const queryParam = (params?.get('q') || params?.get('query') || '').trim();
  const statusParam = (params?.get('status') || '').trim().toUpperCase() as BookStatus | '';
  const sortParam = ((params?.get('sort') || '') as SortOption) || 'trending';
  const genresParam = (params?.get('genres') || '').trim();

  const [q, setQ] = useState(queryParam);
  const [status, setStatus] = useState<BookStatus | ''>(statusParam || '');
  const [sort, setSort] = useState<SortOption>(sortParam);
  const orderParam = (params?.get('order') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const [order, setOrder] = useState<'asc' | 'desc'>(orderParam);
  const [genreFilter, setGenreFilter] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => genresParam ? genresParam.split(',').filter(Boolean) : []);
  // removed genresMode (any/all)

  useEffect(() => {
    setQ(queryParam);
  }, [queryParam]);
  useEffect(() => { setStatus(statusParam || ''); }, [statusParam]);
  useEffect(() => { setSort(sortParam); }, [sortParam]);
  useEffect(() => { setOrder(orderParam); }, [orderParam]);
  useEffect(() => { setSelectedGenres(genresParam ? genresParam.split(',').filter(Boolean) : []); }, [genresParam]);

  // Restore from localStorage if URL lacks params
  useEffect(() => {
    try {
      // Only when params missing
      const ls = window.localStorage.getItem('searchFilters');
      if (!ls) return;
      const saved = JSON.parse(ls) as { status?: BookStatus; sort?: SortOption; order?: 'asc' | 'desc'; genres?: string[] };
      const sp = new URLSearchParams(params?.toString());
      let changed = false;
      if (!sp.get('status') && saved.status) { sp.set('status', saved.status); changed = true; }
      if (!sp.get('sort') && saved.sort) { sp.set('sort', saved.sort); changed = true; }
      if (!sp.get('order') && saved.order) { sp.set('order', saved.order); changed = true; }
      if (!sp.get('genres') && saved.genres?.length) { sp.set('genres', saved.genres.join(',')); changed = true; }
  // genresMode removed
      if (changed) router.replace(`${pathname}?${sp.toString()}`);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGenres = useMemo(
    () => BOOK_GENRES_MASTER.filter(g => g.toLowerCase().includes(genreFilter.toLowerCase())),
    [genreFilter]
  );

  // Debounced push/replace for search
  useEffect(() => {
    const id = setTimeout(() => {
      const sp = new URLSearchParams(params?.toString());
      if (q.trim()) {
        sp.set('query', q.trim());
        sp.delete('q'); // normalize to `query`
      } else {
        sp.delete('query');
        sp.delete('q');
      }
      sp.delete('cursor');
      router.replace(`${pathname}?${sp.toString()}`);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const updateParam = useCallback((key: string, value?: string) => {
    const sp = new URLSearchParams(params?.toString());
    if (value && value.length) sp.set(key, value); else sp.delete(key);
    sp.set('page', '1');
    router.replace(`${pathname}?${sp.toString()}`);
  }, [params, pathname, router]);

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => (prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]));
  };

  const onStatusChange = (v: string) => {
    const norm = (v || '').toUpperCase();
    setStatus((norm as BookStatus) || '');
    updateParam('status', norm || undefined);
  };

  const onSortChange = (v: SortOption) => {
    setSort(v);
    updateParam('sort', v);
  };

  const toggleOrder = () => {
    const next = order === 'asc' ? 'desc' as const : 'asc' as const;
    setOrder(next);
    updateParam('order', next);
  };

  // removed onGenresModeChange

  // Persist in localStorage
  useEffect(() => {
    try {
      const payload = { status, sort, order, genres: selectedGenres };
      window.localStorage.setItem('searchFilters', JSON.stringify(payload));
    } catch {}
  }, [status, sort, order, selectedGenres]);

  const selectAllGenres = () => {
    const next = Array.from(new Set(filteredGenres));
    setSelectedGenres(next);
  };

  const clearAllGenres = () => {
    setSelectedGenres([]);
  };

  const clearSearch = () => {
    try { window.localStorage.removeItem('searchFilters'); } catch {}
    const sp = new URLSearchParams();
    sp.set('sort', 'trending');
    sp.set('order', 'desc');
    sp.set('page', '1');
    router.replace(`${pathname}?${sp.toString()}`);
  };

  // Sync selectedGenres to URL after state updates to avoid router updates during render
  useEffect(() => {
    const current = (params?.get('genres') || '').trim();
    const next = selectedGenres.join(',');
    if (current === next) return;
    const sp = new URLSearchParams(params?.toString());
    if (next) sp.set('genres', next); else sp.delete('genres');
    sp.delete('cursor');
    router.replace(`${pathname}?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 mt-4">
      <div className="bg-readowl-purple-medium/90 backdrop-blur border border-readowl-purple shadow-xl overflow-hidden">
        {/* Top search bar */}
        <div className="p-3 sm:p-4 border-b border-white/10">
          <form role="search" onSubmit={(e) => e.preventDefault()} className="group flex items-center bg-white/95 focus-within:ring-2 ring-offset-0 ring-readowl-purple-light/60 overflow-hidden transition-all duration-300 w-full shadow-sm">
            <input
              name="q"
              placeholder="Pesquisar pelo título..."
              className="bg-transparent px-4 py-2 sm:py-2.5 text-sm sm:text-base text-readowl-purple-dark placeholder:text-readowl-purple-dark/60 focus:outline-none w-full"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="px-3 text-readowl-purple-dark/70">
              <SearchIcon className="w-5 h-5" />
            </div>
          </form>
        </div>


        {/* Bottom area: dropdowns (full width) + genres below */}
        <div className="p-3 sm:p-4 flex flex-col gap-4">
          {/* Status + Sort in two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <FilterIcon className="w-4 h-4 opacity-80" aria-hidden />
              Status
            </label>
            <select
              value={status || ''}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-white text-readowl-purple-dark px-3 py-2 text-sm border-2 border-white/60 focus:ring-2 focus:ring-readowl-purple-dark"
            >
              <option value="">Todos</option>
              {/* Order: COMPLETED, ONGOING, HIATUS, PAUSED with labels */}
              {(['COMPLETED','ONGOING','HIATUS','PAUSED'] as BookStatus[]).map((s) => (
                <option key={s} value={s}>{BOOK_STATUS_LABEL[s]}</option>
              ))}
            </select>
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 opacity-80" aria-hidden />
              Ordenação
            </label>
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-white text-readowl-purple-dark px-3 py-2 text-sm border-2 border-white/60 focus:ring-2 focus:ring-readowl-purple-dark"
              >
                {(([
                  'trending',
                  'topRated14d',
                  'mostViewedTotal',
                  'mostCommented',
                  'mostFollowed',
                  'chaptersCount',
                  'alpha',
                  'oldest',
                ]) as SortOption[]).map((k) => (
                  <option key={k} value={k}>{sortLabels[k]}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={toggleOrder}
                className="inline-flex items-center justify-center w-10 h-10 bg-white text-readowl-purple-dark border-2 border-white/60 hover:bg-white/90"
                title={order === 'asc' ? 'Ordenar crescente' : 'Ordenar decrescente'}
                aria-label="Alternar ordem"
              >
                {order === 'asc' ? <ArrowUpAZ className="w-5 h-5" /> : <ArrowDownAZ className="w-5 h-5" />}
              </button>
            </div>
            </div>
          </div>

          {/* Genres full width */}
          <div className="w-full">
            <label className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Tags className="w-4 h-4 opacity-80" aria-hidden />
              Gêneros
            </label>
            <div className="w-full bg-readowl-purple-extradark/70 border border-white/10 p-3 max-h-48 overflow-y-auto">
              <div className="relative">
                <input
                  type="text"
                  value={genreFilter}
                  onChange={e => setGenreFilter(e.target.value)}
                  placeholder="Buscar gênero..."
                  className="w-full bg-white border-2 border-white/60 focus:ring-2 focus:ring-readowl-purple-dark pl-4 pr-4 py-2 text-sm text-readowl-purple placeholder-readowl-purple/50 mb-3"
                />
              </div>
              {/* Select all / Clear all buttons */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={selectAllGenres}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-white/15 text-white rounded border border-white/20 hover:bg-white/25"
                >
                  <CheckSquare className="w-4 h-4" />
                  Selecionar todos
                </button>
                <button
                  type="button"
                  onClick={clearAllGenres}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-white/15 text-white rounded border border-white/20 hover:bg-white/25"
                >
                  <XCircle className="w-4 h-4" />
                  Limpar seleção
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {filteredGenres.map(g => {
                  const id = `genre-${g}`;
                  const checked = selectedGenres.includes(g);
                  return (
                    <label key={g} htmlFor={id} className={`flex items-center justify-center px-2 py-1 cursor-pointer text-[11px] font-medium select-none transition border border-white/10 whitespace-pre-line text-center leading-tight min-h-[34px] ${checked ? 'bg-readowl-purple-extradark text-white ring-2 ring-white/30' : 'bg-readowl-purple-light text-white/90 hover:bg-readowl-purple-dark'}`}>
                      <input id={id} type="checkbox" checked={checked} onChange={() => toggleGenre(g)} className="hidden" />
                      {g}
                    </label>
                  );
                })}
                {filteredGenres.length === 0 && (<span className="text-xs text-white/80 col-span-full">Nenhum gênero encontrado</span>)}
              </div>
            </div>
          </div>

          {/* Clear search button under genres */}
          <div className="w-full flex justify-center">
            <ButtonWithIcon variant="secondary" onClick={clearSearch}>
              Limpar pesquisa
            </ButtonWithIcon>
          </div>
        </div>
      </div>
    </div>
  );
}
