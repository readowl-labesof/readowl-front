import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma, Status } from '@prisma/client';
import { stripHtmlToText } from '@/lib/sanitize';

type SortKey = 'relevance' | 'popularity' | 'rating' | 'newest' | 'oldest' | 'alpha';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Accept both `q` and `query` for convenience
  const qRaw = (searchParams.get('q') || searchParams.get('query') || '').trim();
  const q = qRaw.slice(0, 100); // guard
  const genresParam = searchParams.get('genres') || '';
  const statusesParam = searchParams.get('status') || '';
  const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom') as string) : undefined;
  const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo') as string) : undefined;
  const minRating = Number(searchParams.get('minRating') || '0');
  const sort = (searchParams.get('sort') as SortKey) || (q ? 'relevance' : 'popularity');
  const take = Math.min(Math.max(Number(searchParams.get('take') || '20'), 5), 50);
  const cursor = searchParams.get('cursor') || undefined;

  const genres = genresParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const statuses = statusesParam
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean) as Array<Status>;

  // Where clause
  const where: Prisma.BookWhereInput = {};

  if (q) {
    // Title-only search (case-insensitive). We keep it simple here, but we also implement a fallback below for accent-insensitive search.
    where.title = { contains: q, mode: 'insensitive' };
  }
  if (genres.length) {
    where.genres = { some: { name: { in: genres } } };
  }
  if (statuses.length) {
    where.status = { in: statuses };
  }
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }
  if (!isNaN(minRating) && minRating > 0) {
    where.ratingAvg = { gte: Math.min(5, Math.max(0, minRating)) };
  }

  // Order by
  const orderBy: Prisma.BookOrderByWithRelationInput[] = [];
  if (q && sort === 'relevance') {
    // Approximate relevance: prioritize higher rating, more views, newer
    // (For robust relevance, switch to raw SQL with weighted CASE or pg_trgm)
    orderBy.push({ ratingAvg: 'desc' }, { views: 'desc' }, { createdAt: 'desc' });
  } else if (sort === 'popularity') {
    orderBy.push({ views: 'desc' }, { ratingAvg: 'desc' });
  } else if (sort === 'rating') {
    orderBy.push({ ratingAvg: 'desc' }, { views: 'desc' });
  } else if (sort === 'newest') {
    orderBy.push({ createdAt: 'desc' });
  } else if (sort === 'oldest') {
    orderBy.push({ createdAt: 'asc' });
  } else if (sort === 'alpha') {
    orderBy.push({ title: 'asc' });
  } else {
    orderBy.push({ views: 'desc' });
  }
  // Stable tie-breaker
  orderBy.push({ id: 'asc' });

  const queryArgs: Prisma.BookFindManyArgs = {
    where,
    orderBy,
    take: take + 1, // fetch one extra to detect next cursor
    select: {
      id: true,
      slug: true,
      title: true,
      synopsis: true,
      coverUrl: true,
      views: true,
      totalViews: true,
      ratingAvg: true,
      status: true,
      createdAt: true,
      author: { select: { name: true } },
      genres: { select: { name: true } },
      _count: { select: { comments: true, chapters: true } },
    },
  };
  if (cursor) {
    queryArgs.cursor = { id: cursor };
    queryArgs.skip = 1;
  }

  let [itemsRaw, totalExact] = await Promise.all([
    prisma.book.findMany(queryArgs),
    prisma.book.count({ where }),
  ]);

  // Fallback: if there is a query and we found nothing, try a very lightweight accent-insensitive search using a raw SQL contains with translate.
  // Note: This is a best-effort fallback without requiring the unaccent extension; for best results, enable unaccent and use ILIKE with unaccented columns or pg_trgm.
  if (q && itemsRaw.length === 0) {
    const norm = q.toLowerCase();
    const translated = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM "Book" WHERE translate(lower(title), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC') LIKE '%' || translate(lower($1), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC') || '%' ORDER BY "createdAt" DESC LIMIT $2 OFFSET 0`,
      norm,
      take + 1
    );
    if (translated.length > 0) {
      const ids = translated.map((r) => r.id);
      // Fetch the full records with the same select/order
      const select = (queryArgs as Prisma.BookFindManyArgs).select;
      itemsRaw = await prisma.book.findMany({
        where: { id: { in: ids } },
        orderBy,
        take: take + 1,
        select: select!,
      });
      totalExact = await prisma.book.count({ where: { id: { in: ids } } });
    }
  }

  const hasMore = itemsRaw.length > take;
  const itemsRawSliced = hasMore ? itemsRaw.slice(0, take) : itemsRaw;
  const items = itemsRawSliced.map((b) => ({
    ...b,
    synopsis: b.synopsis ? stripHtmlToText(b.synopsis) : b.synopsis,
  }));
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return NextResponse.json(
    {
      items,
      page: { take, cursor: cursor || null, nextCursor, hasMore },
      totalApprox: Math.min(totalExact, 5000),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60',
      },
    }
  );
}
