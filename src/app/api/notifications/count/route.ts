import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ unread: 0 });
  try {
    const unread = await prisma.notification.count({ where: { userId: session.user.id, checked: false } });
    return NextResponse.json({ unread });
  } catch {
    return NextResponse.json({ unread: 0 });
  }
}
