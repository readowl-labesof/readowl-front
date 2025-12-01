import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

async function findBookAndChapter(slug: string, chapterSlug: string) {
  // Narrowed selects to reduce payload
  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true, authorId: true } });
  if (!book) return { book: null, chapter: null } as const;
  const chapters = await prisma.chapter.findMany({ where: { bookId: book.id }, select: { id: true, title: true, totalViews: true } });
  const chapter = chapters.find((c) => slugify(c.title) === chapterSlug) || null;
  return { book, chapter } as const;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string; chapterId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  const role = session?.user?.role;
  const { slug, chapterId } = await ctx.params;
  const { book, chapter } = await findBookAndChapter(slug, chapterId);
  if (!book || !chapter) return NextResponse.json({ error: 'Livro/capítulo não encontrado' }, { status: 404 });

  // Authorization: only the author of the book or an ADMIN can see per-chapter view counts
  const isOwner = !!userId && userId === book.authorId;
  const isAdmin = role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Return denormalized aggregate
  return NextResponse.json({ count: chapter.totalViews || 0 });
}
