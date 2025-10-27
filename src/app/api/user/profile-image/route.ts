import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { imageData } = await request.json();
    
    if (!imageData || !imageData.startsWith('data:image/')) {
      return NextResponse.json({ error: "Imagem inválida" }, { status: 400 });
    }

    // Verificar tamanho (máximo 1MB em base64)
    if (imageData.length > 1.4 * 1024 * 1024) {
      return NextResponse.json({ error: "Imagem muito grande (máximo 1MB)" }, { status: 400 });
    }

    const mimeType = imageData.split(';')[0].split(':')[1];
    const profileImage = await prisma.profileImage.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        imageData: imageData,
        mimeType: mimeType,
      },
      update: {
        imageData: imageData,
        mimeType: mimeType,
      },
    });

    // Atualizar campo image do usuário com a URL da imagem
    const imageUrl = `/api/images/profile/${profileImage.id}`;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    const responseData = { 
      success: true, 
      imageId: profileImage.id,
      imageUrl: imageUrl
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}