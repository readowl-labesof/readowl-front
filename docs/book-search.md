# Book Search: Design, Implementation and Usage

This document explains the end-to-end process for implementing the book search feature in the Readowl Next.js app: goals, design choices, API/DB concerns, UI components, sanitization, pagination, and troubleshooting. It reflects the latest behavior: title-only search with accent-insensitive fallback, totalViews in results, and card hierarchy as per the visual spec.

## Goals

- Fast, predictable search strictly by book title.
- Case- and accent-insensitive (ex: "ceu" should find "Céu").
- Compact payload for listing cards (author, genres, counters, coverUrl, synopsis text-only).
- Cursor-based pagination for reliable "Carregar mais".
- Reusable card with required hierarchy and palette.

## Architecture overview

Data flow:

```
Navbar (form) -> /search?query=... -> Search page (client) -> SearchResults ->
  fetch /api/search?q=... -> Prisma/SQL -> response (synopsis plain text) ->
  map to BookCard props -> render stacked cards
```

Main pieces:
- API route: `src/app/api/search/route.ts`
- UI page: `src/app/search/page.tsx` (Client Component, wrapped with `<Suspense>`)
- Results: `src/app/search/ui/SearchResults.tsx` (client-side fetching from `/api/search`, cursor)
- Card: `src/components/book/BookCard.tsx` (visual hierarchy + icons)
- Sanitization helpers: `src/lib/sanitize.ts`

## Requirements mapping (current behavior)

- Title-only search: `where.title = { contains: q, mode: 'insensitive' }`.
- Accent-insensitive fallback: If zero results, performs `translate(lower(title)) LIKE '%' || translate(lower($1)) || '%'` via raw SQL to normalize diacritics, then re-fetches books by IDs using Prisma with the same `select/orderBy`.
- Synopsis w/o HTML: server strips tags using `stripHtmlToText` before returning (defense-in-depth on the card too).
- Counters: API selects `_count.comments`, `_count.chapters` and `totalViews`; client maps `views = totalViews ?? views` so Eye shows the aggregate.
- Pagination: Cursor-based using `take + 1` strategy.
- Palette/Icons: card uses `readowl-purple` (outer), `readowl-light` (title strip, hover `readowl-hover`, border `readowl-purple`), and `readowl-dark` (body). Icons in white: User2, Eye, Star, BookText, SquareText (aliased), Bookmark (optional), Tags.

## API details

File: `src/app/api/search/route.ts`

Accepted query params:
- `q` or `query`: search text (trimmed, max 100 chars)
- `take`: page size [5..50], default 20
- `cursor`: last item id for pagination
- `sort`: optional (`relevance`, `popularity`, `rating`, `newest`, `oldest`, `alpha`)

Selection & ordering:
- `select` includes: `id, slug, title, synopsis, coverUrl, views, totalViews, ratingAvg, status, createdAt, author.name, genres.name, _count{comments, chapters}`
- `orderBy` prioritizes rating/views/createdAt depending on `sort` (and adds a tie-breaker on `id`)

Accent-insensitive fallback:
- When `q` is present and `findMany` returns 0, it executes a parameterized `$queryRawUnsafe` to match by `translate(lower(title)) LIKE ...`. This covers diacritics without requiring Postgres extensions. For best performance and relevance, see Indexing below.

Output contract:

```jsonc
{
  "items": [
    {
      "id": "...",
      "slug": "...",
      "title": "...",
      "synopsis": "Plain text (no HTML)",
      "coverUrl": "...",
      "views": 0,           // legacy
      "totalViews": 12345,  // aggregate for listing
      "ratingAvg": 4.6,
      "status": "ONGOING",
      "createdAt": "2025-11-02T...",
      "author": { "name": "..." },
      "genres": [{ "name": "Fantasia" }, ...],
      "_count": { "comments": 10, "chapters": 65 }
    }
  ],
  "page": { "take": 20, "cursor": null, "nextCursor": "id", "hasMore": true },
  "totalApprox": 5000
}
```

Security/Performance notes:
- Inputs clamped: `q` max 100 chars; `take` 5..50.
- `select` avoids heavy payloads (joins limited to names + counts).
- Fallback uses parameterized raw SQL only when needed; consider moving to `unaccent`/`pg_trgm` for robustness.

## UI: Search page and results

- `src/app/search/page.tsx` is a Client Component to support `useSearchParams`; wrapped in `<Suspense>` to satisfy Next.js constraints.
- Redirect behavior happens on client for unauthenticated users.
- `src/app/search/ui/SearchResults.tsx`:
  - Reads `q|query`, fetches `/api/search`, maps results to `BookCard` props.
  - Uses cursor to implement "Carregar mais"; handles loading/empty/error states.
  - Ensures cards are stacked one per row (`flex flex-col gap-4`).

## UI: BookCard component

File: `src/components/book/BookCard.tsx`

Hierarchy (matches spec):

```
<div class="readowl-purple">  // bg-readowl-purple
  <div class="capa-esquerda"/>         // left cover (thumb)
  <a class="titulo-botao"/>            // bg-readowl-light hover:bg-readowl-hover ring-readowl-purple
  <div class="readowl-dark corpo">     // bg-readowl-dark + white text
    <div class="detalhes-livro">       // row
      User2 | Eye | Star | BookText | SquareText | Bookmark?
    </div>
    <div class="sinopse"/>             // plain text (clamped)
    <div class="generos"> Tags + list
  </div>
</div>
```

Props (`BookListItem`):
- `id, slug, title, synopsis (plain), coverUrl, views (mapped from totalViews), ratingAvg`
- `author: { name }`, `genres: { name }[]`
- Optional counters: `chaptersCount`, `commentsCount`, `followersCount`

Accessibility & UX:
- The title button has focus rings; icons have titles; long texts clamp to prevent overflow.

## Sanitization

- `stripHtmlToText` in `src/lib/sanitize.ts` strips HTML to produce clean synopsis text.
- Applied in the API response (primary) and in the Card (defensive).

## Pagination

- API returns `take + 1` to set `hasMore` w/o extra queries.
- Client keeps `cursor` and Appends results; disables controls while loading.

## SSR/CSR decisions

- Search page is a Client Component due to router hooks; wrapped in `<Suspense>`.
- Navbar uses `/search?query=...`; API also accepts `q` for compatibility.

## Indexing & DB tips (accent-insensitive)

For high volume datasets, consider one of:

1) Postgres `unaccent` + `ILIKE`:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
-- Optionally, create an index on unaccented lower(title)
CREATE INDEX IF NOT EXISTS idx_book_title_unaccent
  ON "Book" (unaccent(lower(title)));
```

2) `pg_trgm` for similarity/ranking:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_book_title_trgm
  ON "Book" USING gin (lower(title) gin_trgm_ops);
```

3) Functional index compatible with current fallback (translate map):

```sql
CREATE INDEX IF NOT EXISTS idx_book_title_translate
  ON "Book" (
    translate(lower(title), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
                               'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')
  );
```

Then adapt the API to query using the same functional expression to benefit from the index.

## How to run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Authentication:
- Search page redirects to login on client if unauthenticated (NextAuth).

## Testing checklist

- Typing "ceu" finds titles with "Céu".
- Cards show: author, totalViews (Eye), rating, chapters (BookText), comments (SquareText), optional followers (Bookmark), synopsis (plain), genres (Tags).
- "Carregar mais" appends new results without duplicates.
- Synopsis never shows raw HTML.
- Keyboard navigation: title button focusable; hover/active states visible.

## Troubleshooting

- Cards vazios: verifique `/api/search` e o parâmetro (`q` vs `query`).
- HTML na sinopse: garanta que a API está aplicando `stripHtmlToText`.
- Acentos não batem: habilite `unaccent`/`pg_trgm` e crie índices conforme a seção acima.
- Aviso `useSearchParams()`: certifique-se de que `/search/page.tsx` é Client e está dentro de `<Suspense>`.

## Future improvements

- Migrar fallback para `unaccent` + `ILIKE` ou `pg_trgm` com ranking (ts_rank) para relevância real.
- Endpoint/denormalização para `followersCount` no card.
- Filtros adicionais (status, gênero) e ordenação visível no UI.
- Pré-carregar métricas denormalizadas (ex.: materialized view) para homepage/listagens.
