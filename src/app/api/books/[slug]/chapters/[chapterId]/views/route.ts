import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

async function findBookBySlug(slug: string) {
  const all = await prisma.book.findMany({ select: { id: true, title: true } });
  return all.find((b) => slugify(b.title) === slug) || null;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string; chapterId: string }> }) {
  const { slug, chapterId } = await ctx.params;
  const book = await findBookBySlug(slug);
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });

  const chapter = await prisma.chapter.findFirst({ where: { id: chapterId, bookId: book.id }, select: { id: true } });
  if (!chapter) return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 });

  try {
    const count = await prisma.chapterView.count({ where: { chapterId } });
    return NextResponse.json({ chapterId, views: count });
  } catch {
    const rows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count FROM "ChapterView" WHERE "chapterId" = ${chapterId}
    `;
    const count = rows.length ? Number(rows[0].count) : 0;
    return NextResponse.json({ chapterId, views: count });
  }
}
