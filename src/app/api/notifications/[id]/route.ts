import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const checked = typeof body?.checked === "boolean" ? body.checked : undefined;
  if (typeof checked !== "boolean") return NextResponse.json({ error: "Missing 'checked' boolean" }, { status: 400 });
  try {
    const updated = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { checked },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, id, checked });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const del = await prisma.notification.deleteMany({ where: { id, userId: session.user.id } });
    if (del.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
