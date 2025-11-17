import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function findBookBySlug(slug: string) {
  return prisma.book.findUnique({ where: { slug }, select: { id: true } });
}

// GET /api/books/:slug/chapters/views?slugs=a,b,c
// Returns { items: { [chapterSlug: string]: number } }
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const book = await findBookBySlug(slug);
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });

  const url = new URL(req.url);
  const list = url.searchParams.get('slugs') || '';
  const slugs = list.split(',').map(s => s.trim()).filter(Boolean);
  if (slugs.length === 0) return NextResponse.json({ items: {} }, { headers: { 'Cache-Control': 'public, max-age=5, s-maxage=60' } });

  // Map slugs to titles (we currently slugify from title). To avoid N+1, fetch only needed.
  // Since we don't store chapter.slug yet, we approximate by fetching titles for the book
  // and matching in memory. For large books, this is still O(N) on server but only one query.
  const chapters = await prisma.chapter.findMany({
    where: { bookId: book.id },
    select: { title: true, totalViews: true },
  });
  const { slugify } = await import('@/lib/slug');
  const bySlug: Record<string, number> = {};
  for (const ch of chapters) {
    const s = slugify(ch.title);
    if (slugs.includes(s)) bySlug[s] = ch.totalViews || 0;
  }
  return NextResponse.json({ items: bySlug }, { headers: { 'Cache-Control': 'public, max-age=5, s-maxage=60' } });
}
