import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// GET /api/notifications?cursor=isoString&limit=20
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([], { status: 200 });
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 50);
  const cursor = searchParams.get("cursor");
  const createdAtCursor = cursor ? new Date(cursor) : null;

  const where = { userId: session.user.id } as const;
  type NotifSelected = {
    id: string;
    userId: string;
    type: "BOOK_COMMENT" | "CHAPTER_COMMENT" | "COMMENT_REPLY" | "NEW_CHAPTER";
    bookId: string | null;
    chapterId: string | null;
    commentId: string | null;
    replyId: string | null;
    createdAt: Date;
    checked: boolean;
    bookTitle: string | null;
    bookCoverUrl: string | null;
    chapterTitle: string | null;
    authorName: string | null;
    commenterName: string | null;
    commentContent: string | null;
    replyContent: string | null;
    originalComment: string | null;
    chapterSnippet: string | null;
    book: { slug: string | null } | null;
  };
  const baseSelect = {
    id: true,
    userId: true,
    type: true,
    bookId: true,
    chapterId: true,
    commentId: true,
    replyId: true,
    createdAt: true,
    checked: true,
    bookTitle: true,
    bookCoverUrl: true,
    chapterTitle: true,
    authorName: true,
    commenterName: true,
    commentContent: true,
    replyContent: true,
    originalComment: true,
    chapterSnippet: true,
    book: { select: { slug: true } },
  } as const;

  const items: NotifSelected[] = await prisma.notification
    .findMany({
      where,
      select: baseSelect,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(createdAtCursor
        ? { cursor: { createdAt: createdAtCursor, id: "" as unknown as string }, skip: 1 }
        : {}),
    })
    .catch(() => [] as NotifSelected[]);

  // Fallback pagination without compound cursor (id not known): keyset via timestamp only
  const list =
    Array.isArray(items) && items.length > 0
      ? items
      : await prisma.notification.findMany({
          where: createdAtCursor ? { ...where, createdAt: { lt: createdAtCursor } } : where,
          select: baseSelect,
          orderBy: { createdAt: "desc" },
          take: limit + 1,
        }) as unknown as NotifSelected[];

  const hasMore = list.length > limit;
  const pageItems = hasMore ? list.slice(0, limit) : list;
  const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.createdAt?.toISOString?.() : null;
  // Map to flatten relation and expose bookSlug
  const mapped = pageItems.map((n) => {
    const { book, ...rest } = n;
    return { ...rest, bookSlug: book?.slug } as Omit<NotifSelected, "book"> & { bookSlug?: string | null };
  });
  return NextResponse.json({ items: mapped, nextCursor });
}

// PATCH /api/notifications  body: { ids?: string[]; allSelected?: boolean; checked: boolean }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ids: string[] | undefined = Array.isArray(body?.ids) ? body.ids : undefined;
  const allSelected: boolean = !!body?.allSelected;
  const checked: boolean | undefined = typeof body?.checked === "boolean" ? body.checked : undefined;
  if (typeof checked !== "boolean") return NextResponse.json({ error: "Missing 'checked' boolean" }, { status: 400 });
  try {
    const where = ids && ids.length > 0
      ? { id: { in: ids }, userId: session.user.id }
      : allSelected
      ? { userId: session.user.id }
      : { id: "__none__", userId: session.user.id };
    const res = await prisma.notification.updateMany({ where, data: { checked } });
    return NextResponse.json({ ok: true, count: res.count });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/notifications  body: { ids?: string[]; allSelected?: boolean }
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ids: string[] | undefined = Array.isArray(body?.ids) ? body.ids : undefined;
  const allSelected: boolean = !!body?.allSelected;
  try {
    const where = ids && ids.length > 0
      ? { id: { in: ids }, userId: session.user.id }
      : allSelected
      ? { userId: session.user.id }
      : { id: "__none__", userId: session.user.id };
    const res = await prisma.notification.deleteMany({ where });
    return NextResponse.json({ ok: true, count: res.count });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
