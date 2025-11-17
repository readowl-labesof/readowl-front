import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Acesso negado. Apenas administradores." }, { status: 403 });
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, image: true, role: true, description: true, createdAt: true, emailVerified: true },
      orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error("Erro ao buscar usuários:", e);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
