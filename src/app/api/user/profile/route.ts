import { NextRequest, NextResponse } from "next/server";
import { getServerSession, unstable_getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { compare, hash } from "bcrypt";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  description: z.string().optional(),
  image: z.string().optional(),
  currentPassword: z.string().optional(), // Campo opcional sem validação de tamanho mínimo
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await unstable_getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, description, image, currentPassword } = body;

    const validatedData = updateProfileSchema.parse({
      name,
      email,
      description,
      image,
      currentPassword,
    });

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se é usuário do Google (não tem senha)
    const isGoogleUser = !currentUser.password;
    
    // Verificar senha atual apenas para usuários que não são do Google
    if (currentUser.password && !isGoogleUser) {
      if (!validatedData.currentPassword) {
        return NextResponse.json({ error: "Senha atual é obrigatória" }, { status: 400 });
      }
      const isValidPassword = await compare(validatedData.currentPassword, currentUser.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
      }
    }

    // Verificar se email já está em uso por outro usuário
    if (validatedData.email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingUser) {
        return NextResponse.json({ error: "Email já está em uso" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        description: validatedData.description,
        ...(validatedData.image && { image: validatedData.image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
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

export async function DELETE() {
  try {
    const session = await unstable_getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Deletar usuário (Prisma irá fazer cascade delete automaticamente)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ message: "Conta deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}