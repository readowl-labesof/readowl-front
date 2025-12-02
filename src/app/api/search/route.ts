import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma, Status } from '@prisma/client';
import { stripHtmlToText } from '@/lib/sanitize';

type SortKey =
  | 'trending'           // Em destaque (14 dias, pesos)
  | 'topRated'           // all-time weighted avg + count*avg
  | 'mostRatedTotal'     // all-time: ratingCount * ratingAvg
  | 'mostViewedTotal'    // visualizações totais
  | 'mostCommented'      // comentários (all-time)
  | 'chaptersCount'      // número de capítulos
  | 'mostFollowed'       // seguidores (all-time)
  | 'alpha'              // nome (asc)
  | 'oldest'             // data de criação asc
  | 'relevance';         // fallback quando há q

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
  const sort = (searchParams.get('sort') as SortKey) || 'trending';
  const orderParam = (searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '10')));
  const take = pageSize; // keep legacy var for internal use

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
    // all: require ALL selected genres via AND of some
    const andArr = Array.isArray(where.AND) ? where.AND : (where.AND ? [where.AND] : []);
    where.AND = [
      ...andArr,
      ...genres.map((g) => ({ genres: { some: { name: g } } })),
    ];
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

  // Sorting strategy
  const orderBy: Prisma.BookOrderByWithRelationInput[] = [];
  if (sort === 'alpha') {
    orderBy.push({ title: orderParam }, { id: 'asc' });
  } else if (sort === 'oldest') {
    orderBy.push({ createdAt: orderParam }, { id: 'asc' });
  } else if (sort === 'mostViewedTotal') {
    // use denormalized totalViews field
    // Primary by total views; tie/fallback lists all books oldest→newest deterministically
    orderBy.push({ totalViews: orderParam }, { createdAt: 'asc' }, { id: 'asc' });
  } else if (sort === 'relevance' && q) {
    orderBy.push({ ratingAvg: 'desc' }, { totalViews: 'desc' }, { createdAt: 'desc' }, { id: 'asc' });
  } else {
    // For complex sorts (trending, topRated14d, mostCommented, chaptersCount, mostFollowed), we'll fetch
    // base set and re-rank in memory for now (simple, acceptable for small page sizes). This keeps the
    // API stable without introducing raw SQL joins here. We still apply a deterministic orderBy fallback.
    orderBy.push({ createdAt: 'desc' }, { id: 'asc' });
  }

  const bookSelect = {
    id: true,
    slug: true,
    title: true,
    synopsis: true,
    coverUrl: true,
    views: true,
    totalViews: true,
    ratingCount: true,
    ratingAvg: true,
    status: true,
    createdAt: true,
    author: { select: { name: true } },
    genres: { select: { name: true } },
    _count: { select: { comments: true, chapters: true, followers: true } },
  } satisfies Prisma.BookSelect;

  type BookRow = Prisma.BookGetPayload<{ select: typeof bookSelect }>;

  const queryArgs: Prisma.BookFindManyArgs = {
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: take,
    select: bookSelect,
  };

  let itemsRaw: BookRow[];
  let totalExact: number;
  [itemsRaw, totalExact] = await Promise.all([
    prisma.book.findMany(queryArgs) as unknown as Promise<BookRow[]>,
    prisma.book.count({ where }),
  ]);

  // Fallback: if there is ONLY a text query (no extra filters) and nothing was found,
  // try a lightweight accent-insensitive search using a raw SQL translate LIKE.
  // IMPORTANT: Do NOT run this fallback when additional filters (genres/status/date/minRating)
  // are present, otherwise we'd ignore those constraints and show unrelated results.
  const hasExtraFilters = genres.length > 0 || statuses.length > 0 || !!dateFrom || !!dateTo || (!isNaN(minRating) && minRating > 0);
  if (q && totalExact === 0 && !hasExtraFilters) {
    const norm = q.toLowerCase();
    const offset = (page - 1) * pageSize;
    const translated = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM "Book" WHERE translate(lower(title), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC') LIKE '%' || translate(lower($1), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC') || '%' ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`,
      norm,
      pageSize,
      offset
    );
    if (translated.length > 0) {
      const ids = translated.map((r) => r.id);
      // Fetch the full records with the same select/order
      itemsRaw = await prisma.book.findMany({
        where: { id: { in: ids } },
        orderBy,
        take: pageSize,
        select: bookSelect,
      }) as unknown as BookRow[];
      // total count for fallback needs a separate count over all matches
      const allTranslated = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM "Book" WHERE translate(lower(title), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC') LIKE '%' || translate(lower($1), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC') || '%'`,
        norm
      );
      totalExact = allTranslated.length;
    }
  }

  // Complex sorts: compute ordered ids using aggregates
  let complexOrderedIds: string[] | null = null;
  let complexBaseIds: string[] | null = null; // ids produced by aggregate scoring before fallback
  if (['trending', 'mostRatedTotal', 'mostCommented', 'chaptersCount', 'mostFollowed', 'topRated'].includes(sort)) {
    // establish candidate set based on filters to avoid expensive global ranking when possible
    const candidateIds = await prisma.book.findMany({ where, select: { id: true } }).then(rows => rows.map(r => r.id));
    const candidateSet = new Set(candidateIds);
    // createdAt map for tie-breaks across all aggregated sorts
    const createdAtRows = await prisma.book.findMany({ where: { id: { in: candidateIds } }, select: { id: true, createdAt: true } });
    const createdAtMap = new Map(createdAtRows.map(r => [r.id, r.createdAt]));
    const applyCandidates = (arr: Array<{ bookId: string; score?: number; cnt?: bigint; WR?: number }>) =>
      (candidateIds.length ? arr.filter(x => candidateSet.has(x.bookId)) : arr);
    const compareByCreated = (aId: string, bId: string) => {
      const ca = createdAtMap.get(aId)?.getTime() || 0;
      const cb = createdAtMap.get(bId)?.getTime() || 0;
      // For descending modes we prefer older first (ASC). For ascending, newer first (DESC).
      return orderParam === 'asc' ? (cb - ca) : (ca - cb);
    };
    const offset = (page - 1) * pageSize;
    // For some sorts we force DESC; for others we compute multiplier inline when sorting
    if (sort === 'trending' || sort === 'mostCommented') {
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      // views unique users per book in last 14 days
      const viewsAgg = await prisma.$queryRaw<Array<{ bookId: string; views: bigint }>>`
        SELECT c."bookId" as "bookId", COUNT(DISTINCT v."userId")::bigint as views
        FROM "ChapterView" v
        JOIN "Chapter" c ON v."chapterId" = c."id"
        WHERE v."createdAt" >= ${cutoff}
        GROUP BY c."bookId";
      `;
      // trending uses 14d ratings; mostCommented does not rely on ratings but we still collect for unified maps
      const ratingsAgg = await prisma.$queryRaw<Array<{ bookId: string; ratings: bigint; avg: number }>>`
        SELECT br."bookId" as "bookId", COUNT(*)::bigint as ratings, AVG(br."score")::float as avg
        FROM "BookRating" br
        WHERE br."createdAt" >= ${cutoff}
        GROUP BY br."bookId";
      `;
      // comments: timeframe depends on sort
      const commentsAgg = sort === 'mostCommented'
        // all-time comments INCLUDING author interactions; count index (chapterId null) and chapter comments via bookId
        ? await prisma.$queryRaw<Array<{ bookId: string; comments: bigint }>>`
            SELECT c."bookId" as "bookId", COUNT(*)::bigint as comments
            FROM "Comment" c
            GROUP BY c."bookId";
          `
        // trending context (14d) INCLUDING author
        : await prisma.$queryRaw<Array<{ bookId: string; comments: bigint }>>`
            SELECT c."bookId" as "bookId", COUNT(*)::bigint as comments
            FROM "Comment" c
            WHERE c."createdAt" >= ${cutoff}
            GROUP BY c."bookId";
          `;
      const vArr = applyCandidates(viewsAgg.map(v => ({ bookId: v.bookId, cnt: v.views })));
      const rArr = applyCandidates(ratingsAgg.map(r => ({ bookId: r.bookId, WR: Number(r.ratings) * r.avg })));
      const cArr = applyCandidates(commentsAgg.map(c => ({ bookId: c.bookId, cnt: c.comments })));
      const vMap = new Map(vArr.map(x => [x.bookId, Number(x.cnt || 0)]));
      const rMap = new Map(rArr.map(x => [x.bookId, Number(x.WR || 0)]));
      const cMap = new Map(cArr.map(x => [x.bookId, Number(x.cnt || 0)]));
      if (sort === 'mostCommented') {
        // Include ALL candidates with zero counts so ascending order places zeros first
        const rows = candidateIds.map(id => ({ bookId: id, cnt: BigInt(cMap.get(id) || 0) }));
        // Sort by comment count according to orderParam; tie-break by createdAt ASC (older first)
        rows.sort((a, b) => {
          const d = (Number(b.cnt) - Number(a.cnt)) * (orderParam === 'asc' ? -1 : 1);
          if (d !== 0) return d;
          return compareByCreated(a.bookId, b.bookId);
        });
        complexBaseIds = rows.map(x => x.bookId);
        const remaining = await prisma.book.findMany({
          where: { AND: [where, { id: { notIn: complexBaseIds } }] },
          select: { id: true },
          orderBy: { createdAt: 'asc' },
        });
        const combined = [...complexBaseIds, ...remaining.map(r => r.id)];
        complexOrderedIds = combined.slice(offset, offset + pageSize);
      } else if (sort === 'trending') {
        // Normalize + weighted like Home page, with percentile caps
        const values = (m: Map<string, number>) => Array.from(m.values());
        // Normalization: standard min-max. If range collapses (min==max) but max>0, treat any positive value as 1 and zero as 0
        const normalize = (val: number, min: number, max: number) => {
          if (max > min) return (val - min) / (max - min);
          if (max > 0) return val > 0 ? 1 : 0;
          return 0;
        };
        const percentile = (arr: number[], p: number) => {
          if (!arr.length) return 0;
          const sorted = [...arr].sort((a, b) => a - b);
          const idx = Math.floor((p / 100) * (sorted.length - 1));
          return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
        };
        const vValsRaw = values(vMap); const rValsRaw = values(rMap); const cValsRaw = values(cMap);
        const vCap = percentile(vValsRaw, 98);
        const rCap = percentile(rValsRaw, 95);
        const cCap = percentile(cValsRaw, 95);
        const vVals = vValsRaw.map(x => Math.min(x, vCap || x));
        const rVals = rValsRaw.map(x => Math.min(x, rCap || x));
        const cVals = cValsRaw.map(x => Math.min(x, cCap || x));
        const min = (arr: number[]) => (arr.length ? Math.min(...arr) : 0);
        const max = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);
        const vMin = min(vVals), vMax = max(vVals);
        const rMin = min(rVals), rMax = max(rVals);
        const cMin = min(cVals), cMax = max(cVals);
        const weights = { views: 0.2, ratings: 0.45, comments: 0.35 };
        const candidateIdsSet = new Set<string>([...vMap.keys(), ...rMap.keys(), ...cMap.keys()].filter(id => candidateIds.length ? candidateSet.has(id) : true));
        const scores = Array.from(candidateIdsSet).map(id => {
          const vRaw = Math.min(vMap.get(id) || 0, vCap || (vMap.get(id) || 0));
          const rRaw = Math.min(rMap.get(id) || 0, rCap || (rMap.get(id) || 0));
          const cRaw = Math.min(cMap.get(id) || 0, cCap || (cMap.get(id) || 0));
          const sv = normalize(vRaw, vMin, vMax);
          const sr = normalize(rRaw, rMin, rMax);
          const sc = normalize(cRaw, cMin, cMax);
          return { bookId: id, score: sv * weights.views + sr * weights.ratings + sc * weights.comments };
        });
        // For descending: exclude zero-score items from scored list (they will appear via fallback).
        // For ascending: include zeros so they lead the list, tie-break by createdAt DESC (newest first).
        const scoredRows = orderParam === 'desc' ? scores.filter(s => s.score > 0) : scores;
        scoredRows.sort((a, b) => {
          const d = (b.score - a.score) * (orderParam === 'asc' ? -1 : 1);
          if (d !== 0) return d;
          return compareByCreated(a.bookId, b.bookId);
        });
        complexBaseIds = scoredRows.map(x => x.bookId);
        const remaining = await prisma.book.findMany({
          where: { AND: [where, { id: { notIn: complexBaseIds } }] },
          select: { id: true },
          orderBy: { createdAt: 'asc' },
        });
        const combined = [...complexBaseIds, ...remaining.map(r => r.id)];
        complexOrderedIds = combined.slice(offset, offset + pageSize);
      }
  } else if (sort === 'topRated') {
      // Renamed semantics: now all-time top rated with recency removed (only trending is 14d).
      // Apply same weighting as mostRatedTotal: 0.6 avg + 0.4 capped power(count*avg).
      const candidates = await prisma.book.findMany({ where, select: { id: true, ratingCount: true, ratingAvg: true, createdAt: true } });
      const rawAvg = candidates.map(b => Math.max(0, Math.min(5, b.ratingAvg || 0)));
      const rawPower = candidates.map(b => (Math.max(0, b.ratingCount || 0) * Math.max(0, Math.min(5, b.ratingAvg || 0))));
      const minAvg = rawAvg.length ? Math.min(...rawAvg) : 0;
      const maxAvg = rawAvg.length ? Math.max(...rawAvg) : 0;
      const sortedPower = [...rawPower].sort((a, b) => a - b);
      const p95Idx = sortedPower.length ? Math.floor(0.95 * (sortedPower.length - 1)) : 0;
      const powerCap = sortedPower[p95Idx] || 0;
      const cappedPower = rawPower.map(v => Math.min(v, powerCap || v));
      const minPower = cappedPower.length ? Math.min(...cappedPower) : 0;
      const maxPower = cappedPower.length ? Math.max(...cappedPower) : 0;
      const norm = (val: number, min: number, max: number) => (max > min ? (val - min) / (max - min) : 0);
      const AVG_W = 0.6;
      const POWER_W = 0.4;
      const rows = candidates.map(b => {
        const avg = Math.max(0, Math.min(5, b.ratingAvg || 0));
        const powerRaw = Math.max(0, b.ratingCount || 0) * avg;
        const power = Math.min(powerRaw, powerCap || powerRaw);
        const score = norm(avg, minAvg, maxAvg) * AVG_W + norm(power, minPower, maxPower) * POWER_W;
        return { bookId: b.id, score };
      });
      rows.sort((a, b) => {
        const d = (b.score - a.score) * (orderParam === 'asc' ? -1 : 1);
        if (d !== 0) return d;
        const ca = createdAtMap.get(a.bookId)?.getTime() || 0;
        const cb = createdAtMap.get(b.bookId)?.getTime() || 0;
        return ca - cb;
      });
      complexBaseIds = rows.map(x => x.bookId);
      const remaining = await prisma.book.findMany({
        where: { AND: [where, { id: { notIn: complexBaseIds } }] },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      const combined = [...complexBaseIds, ...remaining.map(r => r.id)];
      complexOrderedIds = combined.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  } else if (sort === 'mostRatedTotal') {
      // All-time "Mais avaliados" weighting average more than volume.
      // Score formula:
      //   score = 0.6 * norm(ratingAvg) + 0.4 * norm(min(ratingCount * ratingAvg, cap_95th))
      // Rationale:
      //   - ratingAvg (quality) drives majority of score.
      //   - ratingCount * ratingAvg adds stability for consistently rated books.
      //   - 95th percentile cap on (count*avg) prevents extremely high volume from eclipsing quality.
      const candidates = await prisma.book.findMany({ where, select: { id: true, ratingCount: true, ratingAvg: true, createdAt: true } });
      const rawAvg = candidates.map(b => Math.max(0, Math.min(5, b.ratingAvg || 0)));
      const rawPower = candidates.map(b => (Math.max(0, b.ratingCount || 0) * Math.max(0, Math.min(5, b.ratingAvg || 0))));
      const minAvg = rawAvg.length ? Math.min(...rawAvg) : 0;
      const maxAvg = rawAvg.length ? Math.max(...rawAvg) : 0;
      const sortedPower = [...rawPower].sort((a, b) => a - b);
      const p95Idx = sortedPower.length ? Math.floor(0.95 * (sortedPower.length - 1)) : 0;
      const powerCap = sortedPower[p95Idx] || 0;
      const cappedPower = rawPower.map(v => Math.min(v, powerCap || v));
      const minPower = cappedPower.length ? Math.min(...cappedPower) : 0;
      const maxPower = cappedPower.length ? Math.max(...cappedPower) : 0;
      const norm = (val: number, min: number, max: number) => (max > min ? (val - min) / (max - min) : 0);
      const AVG_W = 0.6;
      const POWER_W = 0.4;
      const rows = candidates.map(b => {
        const avg = Math.max(0, Math.min(5, b.ratingAvg || 0));
        const powerRaw = Math.max(0, b.ratingCount || 0) * avg;
        const power = Math.min(powerRaw, powerCap || powerRaw);
        const score = norm(avg, minAvg, maxAvg) * AVG_W + norm(power, minPower, maxPower) * POWER_W;
        return { bookId: b.id, score };
      });
      rows.sort((a, b) => {
        const d = (b.score - a.score) * (orderParam === 'asc' ? -1 : 1);
        if (d !== 0) return d;
        const ca = createdAtMap.get(a.bookId)?.getTime() || 0;
        const cb = createdAtMap.get(b.bookId)?.getTime() || 0;
        return ca - cb;
      });
      complexBaseIds = rows.map(x => x.bookId);
      const remaining = await prisma.book.findMany({
        where: { AND: [where, { id: { notIn: complexBaseIds } }] },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      const combined = [...complexBaseIds, ...remaining.map(r => r.id)];
      complexOrderedIds = combined.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  } else if (sort === 'chaptersCount') {
      const chAgg = await prisma.$queryRaw<Array<{ bookId: string; cnt: bigint }>>`
        SELECT "bookId", COUNT(*)::bigint as cnt FROM "Chapter" GROUP BY "bookId";
      `;
      // Include all candidates with zero chapters for proper ascending behavior
      const chMap = new Map(applyCandidates(chAgg.map(x => ({ bookId: x.bookId, cnt: x.cnt }))).map(x => [x.bookId, Number(x.cnt)]));
      const rows = candidateIds.map(id => ({ bookId: id, cnt: BigInt(chMap.get(id) || 0) }));
      rows.sort((a, b) => {
        const d = (Number(b.cnt) - Number(a.cnt)) * (orderParam === 'asc' ? -1 : 1);
        if (d !== 0) return d;
        return compareByCreated(a.bookId, b.bookId);
      });
      complexBaseIds = rows.map(x => x.bookId);
      // Append books with zero chapters (or not in agg) by createdAt ASC
      const remaining = await prisma.book.findMany({
        where: { AND: [where, { id: { notIn: complexBaseIds } }] },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      const combined = [...complexBaseIds, ...remaining.map(r => r.id)];
      complexOrderedIds = combined.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  } else if (sort === 'mostFollowed') {
      const flAgg = await prisma.$queryRaw<Array<{ bookId: string; cnt: bigint }>>`
        SELECT "bookId", COUNT(*)::bigint as cnt FROM "BookFollow" GROUP BY "bookId";
      `;
      // Include all candidates with zero followers for proper ascending behavior
      const flMap = new Map(applyCandidates(flAgg.map(x => ({ bookId: x.bookId, cnt: x.cnt }))).map(x => [x.bookId, Number(x.cnt)]));
      const rows = candidateIds.map(id => ({ bookId: id, cnt: BigInt(flMap.get(id) || 0) }));
      rows.sort((a, b) => {
        const d = (Number(b.cnt) - Number(a.cnt)) * (orderParam === 'asc' ? -1 : 1);
        if (d !== 0) return d;
        return compareByCreated(a.bookId, b.bookId);
      });
      complexBaseIds = rows.map(x => x.bookId);
      // Append remaining books (including with zero followers) by createdAt ASC
      const remaining = await prisma.book.findMany({
        where: { AND: [where, { id: { notIn: complexBaseIds } }] },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      const combined = [...complexBaseIds, ...remaining.map(r => r.id)];
      complexOrderedIds = combined.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    }
  }

  if (complexOrderedIds) {
    const books = await prisma.book.findMany({ where: { id: { in: complexOrderedIds } }, select: bookSelect });
    const map = new Map(books.map(b => [b.id, b]));
    itemsRaw = complexOrderedIds.map(id => map.get(id)).filter((b): b is BookRow => Boolean(b));
  }

  // Debug mode: return metrics per item to help analyze incorrect ordering
  const debug = (searchParams.get('debug') || 'false').toLowerCase() === 'true';
  const items = itemsRaw.map((b) => ({
    ...b,
    synopsis: b.synopsis ? stripHtmlToText(b.synopsis) : b.synopsis,
    ...(debug && sort === 'mostCommented' ? { debug: { comments: b._count.comments, createdAt: b.createdAt } } : {}),
    ...(debug && sort === 'trending' ? { debug: { totalViews: b.totalViews, ratingAvg: b.ratingAvg, ratingCount: b.ratingCount, comments: b._count.comments, createdAt: b.createdAt } } : {}),
    ...(debug && sort === 'topRated' ? { debug: { ratingAvg: b.ratingAvg, ratingCount: b.ratingCount, createdAt: b.createdAt } } : {}),
    ...(debug && sort === 'mostRatedTotal' ? { debug: { ratingAvg: b.ratingAvg, ratingCount: b.ratingCount, createdAt: b.createdAt } } : {}),
  }));
  // Simplified debug list: id, title, and relevant metrics for non-trending sorts
  let debugList: Array<Record<string, unknown>> | undefined;
  if (debug) {
    if (sort === 'mostCommented') {
      debugList = items.map(i => ({ id: i.id, title: i.title, comments: i._count.comments }));
    } else if (sort === 'chaptersCount') {
      debugList = items.map(i => ({ id: i.id, title: i.title, chapters: i._count.chapters }));
    } else if (sort === 'mostFollowed') {
      debugList = items.map(i => ({ id: i.id, title: i.title, followers: i._count.followers }));
    } else if (sort === 'topRated' || sort === 'mostRatedTotal') {
      // Recompute simplified score over current page for transparency
      const avgs = items.map(i => Math.max(0, Math.min(5, i.ratingAvg || 0)));
      const powers = items.map(i => (Math.max(0, i.ratingCount || 0) * Math.max(0, Math.min(5, i.ratingAvg || 0))));
      const minAvg = avgs.length ? Math.min(...avgs) : 0;
      const maxAvg = avgs.length ? Math.max(...avgs) : 0;
      const sortedPower = [...powers].sort((a, b) => a - b);
      const p95Idx = sortedPower.length ? Math.floor(0.95 * (sortedPower.length - 1)) : 0;
      const powerCap = sortedPower[p95Idx] || 0;
      const cappedPower = powers.map(v => Math.min(v, powerCap || v));
      const minPower = cappedPower.length ? Math.min(...cappedPower) : 0;
      const maxPower = cappedPower.length ? Math.max(...cappedPower) : 0;
      const norm = (val: number, min: number, max: number) => (max > min ? (val - min) / (max - min) : 0);
      const AVG_W = 0.6;
      const POWER_W = 0.4;
      debugList = items.map((i, idx) => ({
        id: i.id,
        title: i.title,
        ratingAvg: i.ratingAvg || 0,
        ratingCount: i.ratingCount || 0,
        score: norm(avgs[idx], minAvg, maxAvg) * AVG_W + norm(cappedPower[idx], minPower, maxPower) * POWER_W,
      }));
    }
  }
  const totalPages = Math.max(1, Math.ceil(totalExact / pageSize));

  return NextResponse.json(
    {
  items,
  ...(debugList ? { debug: debugList } : {}),
      page: { page, pageSize, total: totalExact, totalPages },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60',
      },
    }
  );
}
