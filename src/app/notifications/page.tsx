"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/navbar/Navbar";
import { BreadcrumbAuto } from "@/components/ui/navbar/Breadcrumb";
import NotificationCard, { type Notification } from "@/components/ui/notifications/NotificationCard";
import { CheckSquare, Trash2, Bell } from "lucide-react";
import NotificationSkeleton from "@/components/ui/notifications/NotificationSkeleton";
import Modal from "@/components/ui/modal/Modal";
import { slugify } from "@/lib/slug";

// Simulação: buscar notificações do backend
type RawNotification = {
    id: string;
    type?: string; // BOOK_COMMENT | CHAPTER_COMMENT | COMMENT_REPLY | NEW_CHAPTER
    bookSlug?: string | null;
    bookCoverUrl?: string;
    bookTitle?: string;
    chapterTitle?: string;
    authorName?: string;
    commenterName?: string;
    commentContent?: string;
    replyContent?: string;
    originalComment?: string;
    chapterSnippet?: string;
    createdAt: string;
    checked?: boolean;
};
type FetchResult = { items: RawNotification[]; nextCursor: string | null };
async function fetchNotifications(cursor?: string, limit = 10): Promise<{ items: Notification[]; nextCursor: string | null }> {
    const url = `/api/notifications${cursor ? `?cursor=${encodeURIComponent(cursor)}&limit=${limit}` : `?limit=${limit}`}`;
    const res = await fetch(url);
    const data: FetchResult | RawNotification[] = await res.json();
    const arr: RawNotification[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    const nextCursor = Array.isArray(data) ? (arr.length ? arr[arr.length - 1].createdAt : null) : (data as FetchResult).nextCursor || null;
    const items: Notification[] = arr.map((n) => ({
        id: n.id,
        type: n.type as Notification["type"],
        bookSlug: n.bookSlug ?? null,
        bookCoverUrl: n.bookCoverUrl || "",
        bookTitle: n.bookTitle || "",
        chapterTitle: n.chapterTitle,
        authorName: n.authorName || n.commenterName || "",
        commenterName: n.commenterName,
        commentContent: n.commentContent,
        replyContent: n.replyContent,
        originalComment: n.originalComment,
        chapterSnippet: n.chapterSnippet,
        createdAt: n.createdAt,
        checked: false,
        read: n.checked ?? false ? true : false,
    }));
    return { items, nextCursor };
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [deleteAll, setDeleteAll] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchNotifications(undefined, 10).then(({ items, nextCursor }) => {
            if (!mounted) return;
            setNotifications(items);
            setCursor(nextCursor);
            setHasMore(!!nextCursor);
            setLoading(false);
        }).catch(() => setLoading(false));
        return () => { mounted = false; };
    }, []);

    const loadMore = async () => {
        if (!hasMore || loading) return;
        setLoading(true);
        try {
            const { items, nextCursor } = await fetchNotifications(cursor || undefined, 10);
            setNotifications((prev) => [...prev, ...items]);
            setCursor(nextCursor);
            setHasMore(!!nextCursor);
        } finally {
            setLoading(false);
        }
    };

    // Infinite scroll via IntersectionObserver
    useEffect(() => {
        const sentinel = document.getElementById('notif-sentinel');
        if (!sentinel) return;
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    loadMore();
                }
            }
        }, { rootMargin: '200px' });
        io.observe(sentinel);
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursor, hasMore]);

    const handleCheck = (id: string, checked: boolean) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };
    const handleDelete = (id: string) => {
        setSelected(new Set([id]));
        setDeleteAll(false);
        setShowModal(true);
    };
    const handleDeleteAll = () => {
        setDeleteAll(true);
        setShowModal(true);
    };
    const handleMarkReadBulk = async () => {
        const ids = Array.from(selected);
        if (ids.length === 0) return;
        // optimistic
        setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
        await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, checked: true }) }).catch(() => {});
        setSelected(new Set());
    };
    const confirmDelete = async () => {
        const ids = Array.from(selected);
        // optimistic ui
        setNotifications(n => n.filter(noti => !selected.has(noti.id)));
        // backend
        await fetch('/api/notifications', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) }).catch(() => {});
        setSelected(new Set());
        setShowModal(false);
        setDeleteAll(false);
    };
    const cancelDelete = () => {
        setShowModal(false);
        setDeleteAll(false);
    };
    const handleSelectAll = () => {
        setSelected(new Set(notifications.map(n => n.id)));
    };

    async function navigateFromCard(n: Notification) {
        // mark as read optimistically on click
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
        fetch(`/api/notifications/${n.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checked: true }) }).catch(() => {});
        // BOOK_COMMENT -> livro na aba de comentários
        if (n.type === "BOOK_COMMENT") {
            if (n.bookSlug) router.push(`/library/books/${n.bookSlug}?tab=comments`);
            else if (n.bookTitle) router.push(`/library/books/${slugify(n.bookTitle)}?tab=comments`);
            return;
        }
        // CHAPTER_COMMENT -> capítulo comentado (na mesma página o CommentsList é exibido)
        if (n.type === "CHAPTER_COMMENT") {
            if (n.bookSlug && n.chapterTitle) router.push(`/library/books/${n.bookSlug}/${slugify(n.chapterTitle)}?tab=comments`);
            else if (n.bookTitle && n.chapterTitle) router.push(`/library/books/${slugify(n.bookTitle)}/${slugify(n.chapterTitle)}?tab=comments`);
            return;
        }
        // NEW_CHAPTER -> vai direto para o capítulo lançado
        if (n.type === "NEW_CHAPTER") {
            if (n.bookSlug && n.chapterTitle) router.push(`/library/books/${n.bookSlug}/${slugify(n.chapterTitle)}`);
            else if (n.bookTitle && n.chapterTitle) router.push(`/library/books/${slugify(n.bookTitle)}/${slugify(n.chapterTitle)}`);
            return;
        }
    }

    return (
        <>
            <Navbar />
            <div className="w-full flex justify-center mt-14 sm:mt-16">
                <BreadcrumbAuto anchor="static" base="/home" labelMap={{ notifications: "Notificações" }} />
            </div>
            <main className="min-h-screen flex flex-col items-center">
                <div className="w-full max-w-3xl mx-auto px-2 py-6">
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded bg-white border border-readowl-purple/30 shadow hover:bg-readowl-purple-extralight/60 transition text-readowl-purple-extradark font-semibold"
                            onClick={handleSelectAll}
                            aria-label="Selecionar tudo"
                        >
                            <CheckSquare size={20} /> Selecionar tudo
                        </button>
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded bg-white border border-readowl-purple/30 shadow hover:bg-readowl-purple-extralight/60 transition text-readowl-purple-extradark font-semibold disabled:opacity-50"
                            onClick={handleMarkReadBulk}
                            disabled={selected.size === 0}
                            aria-label="Marcar como lidas"
                        >
                            Marcar como lidas
                        </button>
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded bg-white border border-red-200 shadow hover:bg-red-50 transition text-red-600 font-semibold disabled:opacity-50"
                            onClick={handleDeleteAll}
                            disabled={selected.size === 0}
                            aria-label="Excluir selecionados"
                        >
                            <Trash2 size={20} /> Excluir selecionados
                        </button>
                    </div>
                    {/* Render cards de notificações */}
                    <div>
                        {notifications.length === 0 && loading ? (
                            <>
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                            </>
                        ) : notifications.length === 0 && !loading ? (
                            <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-2">
                                <Bell className="text-readowl-purple" size={28} />
                                <div className="font-semibold text-readowl-purple-extradark">Nenhuma notificação</div>
                                <div className="text-sm">Você verá aqui comentários, respostas e lançamentos.</div>
                            </div>
                        ) : (
                            <>
                                {/* Group by Hoje / Esta semana / Anteriores */}
                                {(() => {
                                    const now = new Date();
                                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                    const startOfWeek = new Date(startOfToday);
                                    // Monday as first day of week
                                    const day = startOfWeek.getDay();
                                    const diff = (day === 0 ? -6 : 1) - day; // move to Monday
                                    startOfWeek.setDate(startOfWeek.getDate() + diff);
                                    const today: Notification[] = [];
                                    const week: Notification[] = [];
                                    const older: Notification[] = [];
                                    for (const n of notifications) {
                                        const d = new Date(n.createdAt);
                                        if (d >= startOfToday) today.push(n);
                                        else if (d >= startOfWeek) week.push(n);
                                        else older.push(n);
                                    }
                                    const Section = ({ title, items }: { title: string; items: Notification[] }) => (
                                        items.length ? (
                                            <section className="mb-4">
                                                <h3 className="text-sm font-semibold text-readowl-purple-extradark/80 mb-2">{title}</h3>
                                                {items.map(noti => (
                                                    <NotificationCard
                                                        key={noti.id}
                                                        notification={{ ...noti, checked: selected.has(noti.id) }}
                                                        onCheck={handleCheck}
                                                        onDelete={handleDelete}
                                                        onClick={() => navigateFromCard(noti)}
                                                    />
                                                ))}
                                            </section>
                                        ) : null
                                    );
                                    return (
                                        <>
                                            <Section title="Hoje" items={today} />
                                            <Section title="Esta semana" items={week} />
                                            <Section title="Anteriores" items={older} />
                                        </>
                                    );
                                })()}
                                {loading && (
                                    <>
                                        <NotificationSkeleton />
                                        <NotificationSkeleton />
                                    </>
                                )}
                                {/* Sentinel for infinite scroll */}
                                {hasMore && <div id="notif-sentinel" className="h-1" />}
                            </>
                        )}
                    </div>
                </div>
                {/* Modal de confirmação */}
                <Modal
                  open={showModal}
                  onClose={cancelDelete}
                  title="Confirmar exclusão"
                  widthClass="max-w-sm"
                >
                  <p>
                    Tem certeza que deseja excluir {deleteAll ? "todas as notificações selecionadas" : "esta notificação"}? Essa ação não pode ser desfeita.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 rounded bg-white border border-readowl-purple/30 text-readowl-purple-extradark" onClick={cancelDelete}>Cancelar</button>
                    <button className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Excluir</button>
                  </div>
                </Modal>
            </main>
        </>
    );
}