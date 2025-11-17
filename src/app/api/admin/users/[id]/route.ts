import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// Next.js App Router route handlers receive a plain params object; avoid wrapping in Promise.
export async function PATCH(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });

    // Verificar se é administrador
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ 
        error: "Acesso negado. Apenas administradores podem editar usuários." 
      }, { status: 403 });
    }

    // Pegar dados do body
    const { name, description, role, blocked } = await request.json();

    // Validar role se foi enviado
    if (role && !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Role inválido" }, { status: 400 });
    }

    // Validar blocked se foi enviado
    if (blocked !== undefined && typeof blocked !== 'boolean') {
      return NextResponse.json({ error: "Status de bloqueio inválido" }, { status: 400 });
    }

    // Verificar se usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Atualizar usuário no banco
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(role !== undefined && { role }),
        ...(blocked !== undefined && { blocked }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        role: true,
        blocked: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Erro ao atualizar usuário:", e);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    if (id === session.user.id) return NextResponse.json({ error: "Você não pode excluir sua própria conta" }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (e) {
    console.error("Erro ao excluir usuário:", e);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
