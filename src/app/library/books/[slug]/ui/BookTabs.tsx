"use client";
import React from 'react';
import CommentInput from '@/components/comment/CommentInput';
import CommentsList, { type CommentDto } from '@/components/comment/CommentsList';
import SelectableIconButton from '@/components/ui/button/SelectableIconButton';
import { BookText, MessageSquareText } from 'lucide-react';
import VolumeSection from './VolumeSection';
import ChapterCard from './ChapterCard';
import Modal from '@/components/ui/modal/Modal';
import ButtonWithIcon from '@/components/ui/button/ButtonWithIcon';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import VolumeCreateInput from '@/components/volume/VolumeCreateInput';
import { slugify } from '@/lib/slug';

type Tab = 'chapters' | 'comments';

type VolumeDto = { id: string; title: string };
type ChapterDto = { id: string; title: string; content?: string; createdAt: string; volumeId: string | null };
type PageInfo = { take: number; skip: number; hasMore: boolean };

export default function BookTabs({ canManage: canManageProp }: { canManage?: boolean } = {}) {
  const { data: session } = useSession();
  const params = useParams<{ slug: string }>();
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const slug = (params?.slug as string) || '';
  const [tab, setTab] = React.useState<Tab>(() => (search?.get('tab') === 'comments' ? 'comments' : 'chapters'));
  const [loading, setLoading] = React.useState(true);
  const [volumes, setVolumes] = React.useState<VolumeDto[]>([]);
  const [chapters, setChapters] = React.useState<ChapterDto[]>([]);
  const [page, setPage] = React.useState<PageInfo>({ take: 50, skip: 0, hasMore: false });
  const [newVolumeTitle, setNewVolumeTitle] = React.useState('');
  const [chapterViewsBySlug, setChapterViewsBySlug] = React.useState<Record<string, number>>({});
  const [comments, setComments] = React.useState<CommentDto[]>([]);
  const [commentsCount, setCommentsCount] = React.useState(0);
  const canManage = typeof canManageProp === 'boolean' ? canManageProp : (!!session?.user && session.user.role === 'ADMIN');
  const router = useRouter();

  // Ensure the book index view opens at the top on first load
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  // Modals state for destructive actions
  const [volumeToDelete, setVolumeToDelete] = React.useState<VolumeDto | null>(null);
  const [chapterToDelete, setChapterToDelete] = React.useState<ChapterDto | null>(null);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const [v, c, co] = await Promise.all([
          fetch(`/api/books/${slug}/volumes`).then(r => r.ok ? r.json() : Promise.reject(r)),
          fetch(`/api/books/${slug}/chapters?take=${page.take}&skip=${page.skip}`).then(r => r.ok ? r.json() : Promise.reject(r)),
          fetch(`/api/books/${slug}/comments`).then(r => r.ok ? r.json() : Promise.reject(r)),
        ]);
        if (ignore) return;
        setVolumes((v.volumes || []).sort((a: VolumeDto, b: VolumeDto) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })));
        const list = (c.chapters || []).sort((a: ChapterDto, b: ChapterDto) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
        setChapters(list);
  if (c.page) setPage(c.page as PageInfo);
        // Batch-fetch per-chapter views for owner/admin to avoid N calls
        if (canManage) {
          const slugs = list.map((x: ChapterDto) => slugify(x.title)).join(',');
          try {
            const res = await fetch(`/api/books/${slug}/chapters/views?slugs=${encodeURIComponent(slugs)}`);
            const data = await res.json().catch(() => ({}));
            setChapterViewsBySlug(data?.items || {});
          } catch { setChapterViewsBySlug({}); }
        } else {
          setChapterViewsBySlug({});
        }
        setComments(co.comments || []);
        setCommentsCount((co.comments || []).length + (co.comments || []).reduce((acc: number, it: CommentDto) => acc + (it.replies?.length || 0), 0));
      } catch { }
      finally { if (!ignore) setLoading(false); }
    }
    if (slug) load();
    return () => { ignore = true; };
  }, [slug, canManage, page.take, page.skip]);

  async function refetchAll() {
    setLoading(true);
    try {
      const [v, c, co] = await Promise.all([
        fetch(`/api/books/${slug}/volumes`).then(r => r.ok ? r.json() : Promise.reject(r)),
        fetch(`/api/books/${slug}/chapters?take=${page.take}&skip=${page.skip}`).then(r => r.ok ? r.json() : Promise.reject(r)),
        fetch(`/api/books/${slug}/comments`).then(r => r.ok ? r.json() : Promise.reject(r)),
      ]);
      setVolumes((v.volumes || []).sort((a: VolumeDto, b: VolumeDto) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })));
      const list = (c.chapters || []).sort((a: ChapterDto, b: ChapterDto) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
      setChapters(list);
  if (c.page) setPage(c.page as PageInfo);
      if (canManage) {
        const slugs = list.map((x: ChapterDto) => slugify(x.title)).join(',');
        try {
          const res = await fetch(`/api/books/${slug}/chapters/views?slugs=${encodeURIComponent(slugs)}`);
          const data = await res.json().catch(() => ({}));
          setChapterViewsBySlug(data?.items || {});
        } catch { setChapterViewsBySlug({}); }
      } else {
        setChapterViewsBySlug({});
      }
      setComments(co.comments || []);
      setCommentsCount((co.comments || []).length + (co.comments || []).reduce((acc: number, it: CommentDto) => acc + (it.replies?.length || 0), 0));
    } finally {
      setLoading(false);
    }
  }

  async function createVolume() {
    const title = newVolumeTitle.trim();
    if (!title) return;
    try {
      const res = await fetch(`/api/books/${slug}/volumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json().catch(() => null);
      const vol: VolumeDto | null = data?.volume ? { id: data.volume.id, title: data.volume.title } : null;
      if (vol) {
        setVolumes((prev) => [...prev, vol].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })));
        setNewVolumeTitle('');
      } else {
        await refetchAll();
        setNewVolumeTitle('');
      }
    } catch {
      await refetchAll();
    }
  }

  return (
    <div className=" bg-readowl-purple-dark/10 border-2 text-white border-readowl-purple shadow-md p-3">
      <div className="flex justify-center gap-3">
        <SelectableIconButton
          icon={<BookText size={18} />}
          size="sm"
          fullWidth={false}
          selected={tab === 'chapters'}
          toggleOnClick={false}
          onClick={() => setTab('chapters')}
        >
          Capítulos
        </SelectableIconButton>
        <SelectableIconButton
          icon={<MessageSquareText size={18} />}
          size="sm"
          fullWidth={false}
          selected={tab === 'comments'}
          toggleOnClick={false}
          onClick={() => setTab('comments')}
        >
          Comentários
        </SelectableIconButton>
      </div>
      <div className="p-4 min-h-[120px]">
        {tab === 'chapters' ? (
          loading ? (
            <div className="text-white/80">Carregando…</div>
          ) : (
            <div>
              {/* Counters */}
              <div className="flex items-center justify-between text-white/90 mb-2">
                <div className="text-sm">{volumes.length} volume{volumes.length === 1 ? '' : 's'} · {chapters.length} capítulo{chapters.length === 1 ? '' : 's'}</div>
                {/* Words total omitted for performance when content is not loaded */}
              </div>
              {/* Create volume (owner/admin) */}
              {canManage && (
                <div className="mb-3">
                  <VolumeCreateInput value={newVolumeTitle} onChange={setNewVolumeTitle} onSubmit={createVolume} />
                </div>
              )}
              {/* Pagination controls removed as requested */}
              {/* Volume sections */}
              <div className="space-y-3">
                {volumes.map(v => (
                  <VolumeSection
                    key={v.id}
                    title={v.title}
                    volumeId={v.id}
                    chapters={chapters.filter(c => c.volumeId === v.id)}
                    slug={slug}
                    chapterViewsBySlug={chapterViewsBySlug}
                    canManage={canManage}
                    onRename={async (id, newTitle) => {
                      await fetch(`/api/books/${slug}/volumes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle }) });
                      setVolumes(prev => prev.map(x => x.id === id ? { ...x, title: newTitle } : x).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })));
                    }}
                    onDelete={(id) => {
                      const v = volumes.find(x => x.id === id) || null;
                      setVolumeToDelete(v);
                    }}
                    onEditChapter={(chapterId) => {
                      const ch = chapters.find(c => c.id === chapterId);
                      if (!ch) return;
                      const chapSlug = slugify(ch.title);
                      router.push(`/library/books/${slug}/${chapSlug}/edit-chapter`);
                    }}
                    onDeleteChapter={(chapterId) => {
                      const ch = chapters.find(c => c.id === chapterId) || null;
                      setChapterToDelete(ch);
                    }}
                  />
                ))}
                {/* Chapters without volume */}
                    {chapters.filter(c => !c.volumeId).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {chapters.filter(c => !c.volumeId).map((c: ChapterDto) => {
                      const s = slugify(c.title);
                      const v = chapterViewsBySlug[s] ?? null;
                      return (
                        <ChapterCard
                          key={c.id}
                          slug={slug}
                          chapter={c}
                          standalone
                          canManage={canManage}
                          initialViews={v}
                          onEditChapter={(id) => { const ch = chapters.find(x => x.id === id); if (!ch) return; router.push(`/library/books/${slug}/${slugify(ch.title)}/edit-chapter`); }}
                          onDeleteChapter={(id) => { const ch = chapters.find(x => x.id === id) || null; setChapterToDelete(ch); }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              {canManage && (
                <div className="mt-4 bg-white rounded-md shadow p-4 text-readowl-purple">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Deseja publicar um novo capítulo?</p>
                      <p className="text-sm text-readowl-purple/80">Adicione mais conteúdo à sua obra.</p>
                    </div>
                    <ButtonWithIcon
                      variant="primary"
                      onClick={() => router.push(`/library/books/${slug}/post-chapter`)}
                      icon={<BookText size={18} />}
                    >Postar capítulo</ButtonWithIcon>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div>
            <label className="block mb-2 font-semibold">Deixe um comentário:</label>
            <CommentInput onSubmit={async (html) => {
              await fetch(`/api/books/${slug}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: html }) });
              await refetchAll();
            }} />
            <div className="mt-4">
              <CommentsList
                comments={comments}
                total={commentsCount}
                likeApi={async (id, willLike) => {
                  const res = await fetch(`/api/books/${slug}/comments/${id}/like`, { method: willLike ? 'POST' : 'DELETE' });
                  const data = await res.json().catch(() => ({}));
                  return Number(data?.count || 0);
                }}
                reportApi={async (id, type) => {
                  await fetch(`/api/books/${slug}/comments/${id}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
                }}
                // Edit: only comment owner (admins cannot edit others' comments)
                canEdit={(c: CommentDto) => !!session?.user?.id && session.user.id === c.user?.id}
                // Delete: comment owner or admin, OR book owner (canManage)
                canDelete={() => !!session?.user?.id && (session.user.role === 'ADMIN' || canManage)}
                // Back-compat: not used when canEdit/canDelete provided
                canEditDelete={() => false}
                onReply={async (parentId, html) => {
                  await fetch(`/api/books/${slug}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: html, parentId }) });
                  await refetchAll();
                }}
                onEdit={async (id, html) => {
                  await fetch(`/api/books/${slug}/comments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: html }) });
                  await refetchAll();
                }}
                onDelete={async (id) => {
                  await fetch(`/api/books/${slug}/comments/${id}`, { method: 'DELETE' });
                  await refetchAll();
                }}
                headerClassName="text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete volume */}
      <Modal
        open={!!volumeToDelete}
        onClose={() => setVolumeToDelete(null)}
        title="Excluir volume?"
        widthClass="max-w-md"
      >
        <p>Os capítulos dentro deste volume serão movidos para &quot;Sem volume&quot;. Deseja continuar?</p>
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={() => setVolumeToDelete(null)} className="px-3 py-1 border border-readowl-purple/30 text-white/90">Cancelar</button>
          <button
            className="px-3 py-1 bg-red-700 text-white"
            onClick={async () => {
              if (!volumeToDelete) return;
              await fetch(`/api/books/${slug}/volumes/${volumeToDelete.id}`, { method: 'DELETE' });
              setVolumeToDelete(null);
              await refetchAll();
            }}
          >
            Excluir
          </button>
        </div>
      </Modal>

      {/* Confirm delete chapter */}
      <Modal
        open={!!chapterToDelete}
        onClose={() => setChapterToDelete(null)}
        title="Excluir capítulo?"
        widthClass="max-w-md"
      >
        <p>Tem certeza que deseja excluir este capítulo?</p>
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={() => setChapterToDelete(null)} className="px-3 py-1 border border-readowl-purple/30 text-white/90">Cancelar</button>
          <button
            className="px-3 py-1 bg-red-700 text-white"
            onClick={async () => {
              if (!chapterToDelete) return;
              await fetch(`/api/books/${slug}/chapters/${chapterToDelete.id}`, { method: 'DELETE' });
              setChapterToDelete(null);
              await refetchAll();
            }}
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
}
