import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        blocked: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      blocked: user.blocked,
      name: user.name
    });
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}