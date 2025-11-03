import Link from 'next/link';
import { slugify } from '@/lib/slug';
import { BookStatus } from '@/types/book';
import { stripHtmlToText } from '@/lib/sanitize';
import { BookOpen, Star, Eye, Bookmark, User2, Tags, BookText, MessageSquareText as SquareText } from 'lucide-react';

export type BookListItem = {
  id: string;
  slug?: string | null;
  title: string;
  synopsis?: string | null;
  coverUrl?: string | null;
  views?: number | null;
  ratingAvg?: number | null;
  status?: BookStatus;
  createdAt?: string | Date;
  author?: { name?: string | null } | null;
  genres?: { name: string }[];
  followersCount?: number; // optional precomputed
  commentsCount?: number;  // optional precomputed
  chaptersCount?: number;  // optional precomputed
};

const clamp2: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const clamp3: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export function BookCard({ book }: { book: BookListItem }) {
  const href = `/library/books/${book.slug ?? slugify(book.title)}`;
  const rating = typeof book.ratingAvg === 'number' ? book.ratingAvg.toFixed(1) : '—';
  const author = book.author?.name || 'Autor desconhecido';
  const genres = (book.genres || []).map(g => g.name).join(', ');
  const synopsisText = book.synopsis ? stripHtmlToText(book.synopsis) : '';

  return (
    <article className="rounded-2xl overflow-hidden bg-readowl-purple shadow-lg ring-1 ring-readowl-purple/60 text-white">
      <div className="flex gap-3 p-3">
        <div className="w-[92px] sm:w-[110px] md:w-[120px] shrink-0 aspect-[3/4] rounded-md overflow-hidden bg-readowl-purple-extralight/20 ring-1 ring-readowl-purple/40">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-readowl-purple-light">Sem capa</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* Title button strip */}
          <Link
            href={href}
            className="w-full inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-readowl-purple-light border-2 border-readowl-purple-extradark/80 hover:bg-readowl-purple-hover text-white font-ptserif text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <BookOpen size={18} />
            <span className="leading-tight" style={clamp2}>
              {book.title}</span>
          </Link>

          {/* Dark body */}
          <div className="mt-2 rounded-md bg-readowl-purple-extradark text-white p-3">
            {/* Horizontal stats row */}
            <div className="flex items-center gap-4 text-xs sm:text-sm flex-wrap text-white">
              <span className="inline-flex items-center gap-1" title="Autor"><User2 size={16} /> {author}</span>
              {typeof book.views === 'number' && (
                <span className="inline-flex items-center gap-1" title="Visualizações"><Eye size={16} /> {book.views.toLocaleString('pt-BR')}</span>
              )}
              <span className="inline-flex items-center gap-1" title="Avaliação média"><Star size={16} /> {rating}</span>
              {typeof book.chaptersCount === 'number' && (
                <span className="inline-flex items-center gap-1" title="Capítulos"><BookText size={16} /> {book.chaptersCount}</span>
              )}
              {typeof book.commentsCount === 'number' && (
                <span className="inline-flex items-center gap-1" title="Comentários"><SquareText size={16} /> {book.commentsCount}</span>
              )}
              {typeof book.followersCount === 'number' && (
                <span className="inline-flex items-center gap-1" title="Seguidores"><Bookmark size={16} /> {book.followersCount}</span>
              )}
            </div>

            {/* Synopsis */}
            {synopsisText && (
              <p className="mt-2 text-xs sm:text-sm text-white leading-relaxed" style={clamp3}>{synopsisText}</p>
            )}

            {/* Genres */}
            {genres && (
              <div className="mt-2 text-xs sm:text-sm text-white flex items-center gap-2">
                <Tags size={16} />
                <span className="truncate" title={genres}>{genres}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
