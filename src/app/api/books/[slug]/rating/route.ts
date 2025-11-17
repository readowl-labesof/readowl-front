import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
async function findBookBySlug(slug: string) {
  return prisma.book.findUnique({ where: { slug }, select: { id: true, ratingAvg: true, ratingCount: true, ratingSum: true } });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const session = await getServerSession(authOptions);
  const book = await findBookBySlug(slug);
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [my] = await Promise.all([
    session?.user?.id ? prisma.bookRating.findUnique({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } } }) : null,
  ]);
  const count = book.ratingCount || 0;
  const avg = count > 0 ? Number(book.ratingAvg) : null;
  const myScore = my?.score || 0;
  return NextResponse.json({ avg, count, myScore });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null) as { score?: number } | null;
  const score = body?.score;
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: 'Score inválido' }, { status: 400 });
  }
  const book = await findBookBySlug(slug);
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.bookRating.findUnique({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } } });
  await prisma.$transaction(async (tx) => {
    if (!existing) {
      await tx.bookRating.create({ data: { userId: session.user.id, bookId: book.id, score } });
      await tx.book.update({
        where: { id: book.id },
        data: {
          ratingSum: { increment: score },
          ratingCount: { increment: 1 },
          // ratingAvg will be recomputed from sum/count via raw SQL below if needed
        },
      });
    } else {
      const delta = score - existing.score;
      await tx.bookRating.update({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } }, data: { score } });
      await tx.book.update({ where: { id: book.id }, data: { ratingSum: { increment: delta } } });
    }
    // Recompute average precisely using updated sums to avoid drift
    await tx.$executeRawUnsafe(`UPDATE "Book" SET "ratingAvg" = CASE WHEN "ratingCount" > 0 THEN ("ratingSum"::double precision / "ratingCount") ELSE 0 END WHERE id = $1`, book.id);
  });
  const updated = await prisma.book.findUnique({ where: { id: book.id }, select: { ratingAvg: true, ratingCount: true } });
  const count = updated?.ratingCount || 0;
  const avg = count > 0 ? Number(updated?.ratingAvg) : null;
  return NextResponse.json({ ok: true, avg, count, myScore: score });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const book = await findBookBySlug(slug);
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.bookRating.findUnique({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } } });
  if (!existing) return NextResponse.json({ ok: true, avg: (book.ratingCount ? Number(book.ratingAvg) : null), count: book.ratingCount || 0, myScore: 0 });
  await prisma.$transaction(async (tx) => {
    await tx.bookRating.delete({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } } });
    await tx.book.update({
      where: { id: book.id },
      data: {
        ratingSum: { decrement: existing.score },
        ratingCount: { decrement: 1 },
      },
    });
    await tx.$executeRawUnsafe(`UPDATE "Book" SET "ratingAvg" = CASE WHEN "ratingCount" > 0 THEN ("ratingSum"::double precision / "ratingCount") ELSE 0 END WHERE id = $1`, book.id);
  });
  const updated = await prisma.book.findUnique({ where: { id: book.id }, select: { ratingAvg: true, ratingCount: true } });
  const count = updated?.ratingCount || 0;
  const avg = count > 0 ? Number(updated?.ratingAvg) : null;
  return NextResponse.json({ ok: true, avg, count, myScore: 0 });
}
