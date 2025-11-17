import Navbar from '@/components/ui/navbar/Navbar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import type { Prisma } from '@prisma/client';
import Link from 'next/link';
import { ShieldUser, ThumbsUp, MessageSquareReply } from 'lucide-react';

// Mapeamento das razões de denúncia para português
const REPORT_LABELS: Record<string, string> = {
  INCONVENIENT_CONTENT: 'Conteúdo inconveniente',
  THREAT_OR_INTIMIDATION: 'Ameaça, intimidação ou abordagem imprópria',
  RISK_TO_INTEGRITY: 'Risco à integridade física ou emocional',
  INAPPROPRIATE_SEXUAL_CONTENT: 'Material sexual inadequado',
  OFFENSIVE_OR_DISCRIMINATORY: 'Discurso ofensivo ou discriminatório',
  VIOLENCE_OR_EXPLOITATION: 'Ato violento ou exploração de vulneráveis',
  PROHIBITED_ITEMS: 'Divulgação de itens proibidos',
  FRAUD_OR_SUSPICIOUS_ACTIVITY: 'Tentativa de engano ou atividade suspeita',
  MISLEADING_INFORMATION: 'Informação duvidosa ou enganosa',
};

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!me || me.role !== 'ADMIN') redirect('/user?error=access-denied');

  type ReportWithComment = Prisma.CommentReportGetPayload<{ include: { comment: { select: { id: true, content: true, createdAt: true, user: { select: { id: true, name: true, image: true, role: true } }, book: { select: { title: true, slug: true } }, chapter: { select: { title: true } }, _count: { select: { likes: true, replies: true } } } } } }>;

  const reports: ReportWithComment[] = await prisma.commentReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      comment: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, name: true, image: true, role: true } },
          book: { select: { title: true, slug: true } },
          chapter: { select: { title: true } },
          _count: { select: { likes: true, replies: true } },
        }
      }
    }
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-16 px-4 md:px-8">
        <h1 className="text-2xl font-semibold text-white mb-4">Lista de denúncias</h1>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-readowl-purple-extralight">Nenhuma denúncia registrada.</p>
          ) : reports.map((r) => {
            const bookSlug = r.comment.book?.slug || slugify(r.comment.book?.title || '');
            const chapterSlug = r.comment.chapter ? slugify(r.comment.chapter.title) : null;
            const href = chapterSlug
              ? `/library/books/${bookSlug}/${chapterSlug}#comment-${r.comment.id}`
              : `/library/books/${bookSlug}#comment-${r.comment.id}`;
            return (
              <div key={r.id} className="rounded-md bg-readowl-purple-extradark/90 border border-readowl-purple-light/20 p-4 text-white">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-0">
                    {r.comment.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.comment.user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-readowl-purple text-white flex items-center justify-center">{(r.comment.user.name || '?').charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-white">
                      <span className="font-semibold truncate">{r.comment.user.name || 'Usuário'}</span>
                      {r.comment.user.role === 'ADMIN' && (
                        <span className="inline-flex items-center justify-center rounded-full bg-readowl-purple-medium text-white w-5 h-5" title="Administrador">
                          <ShieldUser size={14} />
                        </span>
                      )}
                      <span className="ml-auto text-xs text-white/70">{new Date(r.comment.createdAt).toLocaleDateString('pt-BR')} às {new Date(r.comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="mt-2 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: r.comment.content }} />
                    <div className="mt-2 flex items-center gap-4 text-white/80 text-sm">
                      <div className="inline-flex items-center gap-1"><ThumbsUp size={18} strokeWidth={2.5} /> <span>{r.comment._count.likes}</span></div>
                      <div className="inline-flex items-center gap-1"><MessageSquareReply size={18} strokeWidth={2.5} /> <span>{r.comment._count.replies}</span></div>
                    </div>
                    <div className="mt-3 text-xs text-white/60">Motivo da denúncia: <span className="text-white font-medium">{REPORT_LABELS[r.type] ?? r.type.replace(/_/g, ' ')}</span></div>
                    <div className="text-xs text-white/60">Denunciado em: {new Date(r.createdAt).toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="flex-none">
                    <Link href={href} className="px-3 py-1 bg-readowl-purple text-white rounded hover:bg-readowl-purple-medium">Ver contexto</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
