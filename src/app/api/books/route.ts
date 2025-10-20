import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    if (!authorId) {
      return NextResponse.json({ error: "authorId is required" }, { status: 400 });
    }

    const books = await prisma.book.findMany({
      where: {
        authorId: authorId,
      },
      select: {
        id: true,
        title: true,
        synopsis: true,
        coverUrl: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}