import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

async function findBookBySlug(slug: string) {
  const all = await prisma.book.findMany({ select: { id: true, title: true } });
  return all.find((b) => slugify(b.title) === slug) || null;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const book = await findBookBySlug(slug);
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });

  // Sum all views for chapters belonging to this book
  try {
    const total = await prisma.chapterView.count({ where: { chapter: { bookId: book.id } } });
    return NextResponse.json({ bookId: book.id, totalViews: total });
  } catch {
    const rows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count
      FROM "ChapterView" cv
      JOIN "Chapter" c ON c.id = cv."chapterId"
      WHERE c."bookId" = ${book.id}
    `;
    const total = rows.length ? Number(rows[0].count) : 0;
    return NextResponse.json({ bookId: book.id, totalViews: total });
  }
}
