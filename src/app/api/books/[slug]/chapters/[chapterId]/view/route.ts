import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { isLikelyBot } from '@/lib/bot';
import { rateLimit } from '@/lib/rateLimitRedis';
import { acquireOnce } from '@/lib/dedupeCache';

async function findBookBySlug(slug: string) {
  const all = await prisma.book.findMany({ select: { id: true, title: true, authorId: true } });
  return all.find((b) => slugify(b.title) === slug) || null;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string; chapterId: string }> }) {
  const { slug, chapterId } = await ctx.params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  // Bot/User-Agent filter
  const userAgent = req.headers.get('user-agent') || undefined;
  if (isLikelyBot(userAgent)) return NextResponse.json({ skipped: true, reason: 'bot' }, { status: 202 });

  // Rate limit per IP/session to protect endpoint (10 req / 30s)
  const rate = await rateLimit(req, 'views', 30, 10);
  if (!rate.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: new Headers({ 'X-RateLimit-Reset': String(Math.floor(rate.resetAt / 1000)) }) });

  const book = await findBookBySlug(slug);
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });

  // Skip counting author's own views
  if (userId && userId === book.authorId) return NextResponse.json({ skipped: true, reason: 'author' }, { status: 202 });

  // Ensure chapter belongs to book
  const chapter = await prisma.chapter.findFirst({ where: { id: chapterId, bookId: book.id }, select: { id: true } });
  if (!chapter) return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 });

  // Dedupe check: by user for the same chapter within 2 minutes
  try {
    // Double-check in DB for safety (in case cache missed)
    const since = new Date(Date.now() - 2 * 60 * 1000);
    try {
      const existing = await prisma.chapterView.findFirst({
        where: { chapterId, createdAt: { gte: since }, userId },
        select: { id: true },
      });
      if (existing) return NextResponse.json({ skipped: true, reason: 'duplicate-db' }, { status: 202 });
  } catch {
      // Fallback using raw SQL if delegate is missing for any reason
      const res = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "ChapterView"
        WHERE "chapterId" = ${chapterId}
          AND "createdAt" >= ${since}
          AND "userId" = ${userId}
        LIMIT 1
      `;
      if (res.length > 0) return NextResponse.json({ skipped: true, reason: 'duplicate-db' }, { status: 202 });
    }

    // Acquire dedupe key for the 2-minute window before inserting to avoid races
    const dedupeKey = `chview:${chapterId}:${userId}`;
    const acquired = await acquireOnce(dedupeKey, 2 * 60 * 1000);
    if (!acquired) return NextResponse.json({ skipped: true, reason: 'duplicate-window' }, { status: 202 });

    try {
      await prisma.chapterView.create({
        data: {
          chapterId,
          userId,
        },
      });
  } catch {
      const rid = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
      await prisma.$executeRaw`
        INSERT INTO "ChapterView" ("id","chapterId","userId","createdAt")
        VALUES (${rid}, ${chapterId}, ${userId}, NOW())
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Chapter view error:', e);
    return NextResponse.json({ error: 'Erro ao registrar visualização' }, { status: 500 });
  }
}
