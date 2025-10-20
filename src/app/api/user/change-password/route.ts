import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { compare, hash } from "bcrypt";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (!currentUser.password) {
      return NextResponse.json({ 
        error: "Usuário autenticado via OAuth não pode alterar senha" 
      }, { status: 400 });
    }

    // Verificar senha atual
    const isValidPassword = await compare(validatedData.currentPassword, currentUser.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    // Hash da nova senha
    const hashedNewPassword = await hash(validatedData.newPassword, 12);

    // Atualizar senha e incrementar credentialVersion para forçar re-login
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        credentialVersion: (currentUser.credentialVersion || 0) + 1,
      },
    });

    return NextResponse.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}