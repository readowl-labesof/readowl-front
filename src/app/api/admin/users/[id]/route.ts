import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// 📝 EDITAR usuário (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Verificar se está logado
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// 🗑️ EXCLUIR usuário (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Verificar se está logado
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é administrador
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ 
        error: "Acesso negado. Apenas administradores podem excluir usuários." 
      }, { status: 403 });
    }

    // 🛡️ PROTEÇÃO: Não pode excluir a si mesmo
    if (id === session.user.id) {
      return NextResponse.json({ 
        error: "Você não pode excluir sua própria conta" 
      }, { status: 400 });
    }

    // Verificar se usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Excluir usuário do banco
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}