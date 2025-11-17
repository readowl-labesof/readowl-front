import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true, totalViews: true } });
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
  // Use denormalized aggregate for performance
  return NextResponse.json({ count: book.totalViews || 0 });
}
