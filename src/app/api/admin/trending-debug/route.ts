import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import type { Prisma, Status } from '@prisma/client';

// Admin-only endpoint to inspect trending score breakdown for a filtered set of books.
// Query params:
//   genres, status, dateFrom, dateTo, minRating (same semantics as search API)
//   pViews=98, pRatings=95, pComments=95 (optional overrides for percentile caps)
// Returns per-book: views14d, ratings14d {count, avg, power}, comments14d, normalized components, caps, final score.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pViews = Math.max(0, Math.min(100, Number(searchParams.get('pViews') || '98')));
  const pRatings = Math.max(0, Math.min(100, Number(searchParams.get('pRatings') || '95')));
  const pComments = Math.max(0, Math.min(100, Number(searchParams.get('pComments') || '95')));

  const where: Prisma.BookWhereInput = {};
  const statusesParam = searchParams.get('status') || '';
  const statuses = statusesParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) as Status[];
  if (statuses.length) where.status = { in: statuses };
  const genresParam = searchParams.get('genres') || '';
  const genres = genresParam.split(',').map(s => s.trim()).filter(Boolean);
  if (genres.length) {
    const andArr = Array.isArray(where.AND) ? where.AND : (where.AND ? [where.AND] : []);
    where.AND = [...andArr, ...genres.map(g => ({ genres: { some: { name: g } } }))];
  }

  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const candidateIds = await prisma.book.findMany({ where, select: { id: true, title: true } });
  const candidateSet = new Set(candidateIds.map(r => r.id));

  const viewsAgg = await prisma.$queryRaw<Array<{ bookId: string; views: bigint }>>`
    SELECT c."bookId" as "bookId", COUNT(DISTINCT v."userId")::bigint as views
    FROM "ChapterView" v
    JOIN "Chapter" c ON v."chapterId" = c."id"
    WHERE v."createdAt" >= ${cutoff}
    GROUP BY c."bookId";
  `;
  const ratingsAgg = await prisma.$queryRaw<Array<{ bookId: string; ratings: bigint; avg: number }>>`
    SELECT br."bookId" as "bookId", COUNT(*)::bigint as ratings, AVG(br."score")::float as avg
    FROM "BookRating" br
    WHERE br."createdAt" >= ${cutoff}
    GROUP BY br."bookId";
  `;
  const commentsAgg = await prisma.$queryRaw<Array<{ bookId: string; comments: bigint }>>`
    SELECT c."bookId" as "bookId", COUNT(*)::bigint as comments
    FROM "Comment" c
    WHERE c."createdAt" >= ${cutoff}
    GROUP BY c."bookId";
  `;

  const filter = <T extends { bookId: string }>(arr: T[]) => arr.filter(x => candidateSet.has(x.bookId));
  const vArr = filter(viewsAgg);
  const rArr = filter(ratingsAgg);
  const cArr = filter(commentsAgg);
  const vMap = new Map(vArr.map(x => [x.bookId, Number(x.views)]));
  const rMap = new Map(rArr.map(x => [x.bookId, { count: Number(x.ratings), avg: Number(x.avg), power: Number(x.ratings) * Number(x.avg) }]));
  const cMap = new Map(cArr.map(x => [x.bookId, Number(x.comments)]));

  // helpers
  const percentile = (arr: number[], p: number) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor((p / 100) * (sorted.length - 1));
    return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
  };
  const normalize = (val: number, min: number, max: number) => (max > min ? (val - min) / (max - min) : 0);
  const min = (arr: number[]) => (arr.length ? Math.min(...arr) : 0);
  const max = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);

  const vValsRaw = Array.from(vMap.values());
  const rValsRaw = Array.from(rMap.values()).map(x => x.power);
  const cValsRaw = Array.from(cMap.values());
  const vCap = percentile(vValsRaw, pViews);
  const rCap = percentile(rValsRaw, pRatings);
  const cCap = percentile(cValsRaw, pComments);
  const vVals = vValsRaw.map(x => Math.min(x, vCap || x));
  const rVals = rValsRaw.map(x => Math.min(x, rCap || x));
  const cVals = cValsRaw.map(x => Math.min(x, cCap || x));
  const vMin = min(vVals), vMax = max(vVals);
  const rMin = min(rVals), rMax = max(rVals);
  const cMin = min(cVals), cMax = max(cVals);
  const weights = { views: 0.2, ratings: 0.45, comments: 0.35 };

  const allIds = new Set<string>([...candidateSet, ...vMap.keys(), ...rMap.keys(), ...cMap.keys()]);
  const breakdown = Array.from(allIds).map(id => {
    const vRaw = Math.min(vMap.get(id) || 0, vCap || (vMap.get(id) || 0));
    const rPower = Math.min(rMap.get(id)?.power || 0, rCap || (rMap.get(id)?.power || 0));
    const cRaw = Math.min(cMap.get(id) || 0, cCap || (cMap.get(id) || 0));
    const sv = normalize(vRaw, vMin, vMax);
    const sr = normalize(rPower, rMin, rMax);
    const sc = normalize(cRaw, cMin, cMax);
    const score = sv * weights.views + sr * weights.ratings + sc * weights.comments;
    return {
      id,
      title: candidateIds.find(b => b.id === id)?.title || '',
      views14d: vMap.get(id) || 0,
      ratings14d: { count: rMap.get(id)?.count || 0, avg: rMap.get(id)?.avg || 0 },
      comments14d: cMap.get(id) || 0,
      score,
    };
  });

  breakdown.sort((a, b) => b.score - a.score);

  return NextResponse.json({ cutoff, count: breakdown.length, breakdown });
}
