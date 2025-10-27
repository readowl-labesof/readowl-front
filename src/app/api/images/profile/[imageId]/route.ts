import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest, 
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    
    const image = await prisma.profileImage.findUnique({
      where: { id: imageId },
      select: { imageData: true, mimeType: true }
    });

    if (!image) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
    }

    const base64Data = image.imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': buffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO AO SERVIR IMAGEM:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}