import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ReactionType as PrismaReactionType } from '@prisma/client';

// Normalize reaction types for client mapping
const reactionTypes = ['JOY','LOVE','FEAR','SADNESS','ANGER'] as const;
export type ReactionType = typeof reactionTypes[number];

function emptyCounts() {
  return { JOY: 0, LOVE: 0, FEAR: 0, SADNESS: 0, ANGER: 0 } as Record<ReactionType, number>;
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });

  // Aggregate counts per reaction type
  const grouped = await prisma.reaction.groupBy({ by: ['type'], where: { bookId: book.id }, _count: { _all: true } });
  const counts = emptyCounts();
  for (const g of grouped) counts[g.type as ReactionType] = g._count._all;

  // User selection (if authenticated)
  const session = await getServerSession(authOptions);
  let userReaction: ReactionType | null = null;
  if (session?.user?.id) {
    const existing = await prisma.reaction.findUnique({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } }, select: { type: true } });
    if (existing) userReaction = existing.type as ReactionType;
  }
  return NextResponse.json({ counts, userReaction });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Autenticação requerida' }, { status: 401 });
  const { slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
  let body: { reaction?: string } = {};
  try { body = await req.json(); } catch {}
  const reaction = body.reaction?.toUpperCase();
  if (!reaction || !reactionTypes.includes(reaction as ReactionType)) {
    return NextResponse.json({ error: 'Reação inválida' }, { status: 400 });
  }
  const previous = await prisma.reaction.findUnique({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } }, select: { type: true } });
  const rType = reaction as ReactionType;
  await prisma.reaction.upsert({
    where: { userId_bookId: { userId: session.user.id, bookId: book.id } },
    update: { type: rType as PrismaReactionType },
    create: { userId: session.user.id, bookId: book.id, type: rType as PrismaReactionType },
  });
  const grouped = await prisma.reaction.groupBy({ by: ['type'], where: { bookId: book.id }, _count: { _all: true } });
  const counts = emptyCounts();
  for (const g of grouped) counts[g.type as ReactionType] = g._count._all;
  return NextResponse.json({ counts, userReaction: reaction, previous: previous?.type || null });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Autenticação requerida' }, { status: 401 });
  const { slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
  const existing = await prisma.reaction.findUnique({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } }, select: { type: true } });
  if (existing) {
    await prisma.reaction.delete({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } } });
  }
  // Recompute counts
  const grouped = await prisma.reaction.groupBy({ by: ['type'], where: { bookId: book.id }, _count: { _all: true } });
  const counts = emptyCounts();
  for (const g of grouped) counts[g.type as ReactionType] = g._count._all;
  return NextResponse.json({ counts, userReaction: null, previous: existing?.type || null });
}

export const dynamic = 'force-dynamic';
