import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se está autenticado
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar usuário atual para verificar se é admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    // Verificar se é administrador
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ 
        error: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." 
      }, { status: 403 });
    }

    // Buscar todos os usuários (excluindo senha)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        description: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: [
        { role: 'desc' }, // ADMINs primeiro
        { createdAt: 'desc' }, // Mais recentes primeiro
      ],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}