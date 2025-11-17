import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { $Enums } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { slugify } from '@/lib/slug';

// Categories must match ReportType enum in Prisma
const ALLOWED: Record<string, true> = {
  INCONVENIENT_CONTENT: true,
  THREAT_OR_INTIMIDATION: true,
  RISK_TO_INTEGRITY: true,
  INAPPROPRIATE_SEXUAL_CONTENT: true,
  OFFENSIVE_OR_DISCRIMINATORY: true,
  VIOLENCE_OR_EXPLOITATION: true,
  PROHIBITED_ITEMS: true,
  FRAUD_OR_SUSPICIOUS_ACTIVITY: true,
  MISLEADING_INFORMATION: true,
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string; commentId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const { slug, commentId } = await ctx.params;

  // Validate comment belongs to the slug (book or chapter comment still has book)
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { user: { select: { id: true } }, book: { select: { title: true } } },
  });
  if (!comment) return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
  if (!comment.book || slugify(comment.book.title) !== slug) {
    return NextResponse.json({ error: 'Comentário não pertence a este livro' }, { status: 400 });
  }
  // Users cannot report their own comments
  if (comment.user.id === session.user.id) return NextResponse.json({ error: 'Não é permitido denunciar o próprio comentário' }, { status: 400 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const type = String((body as Record<string, unknown>)?.type || '').toUpperCase();
  if (!ALLOWED[type]) return NextResponse.json({ error: 'Tipo de denúncia inválido' }, { status: 400 });

  const created = await prisma.commentReport.create({ data: { commentId, type: type as $Enums.ReportType } });
  return NextResponse.json({ report: { id: created.id, type, createdAt: created.createdAt } }, { status: 201 });
}
