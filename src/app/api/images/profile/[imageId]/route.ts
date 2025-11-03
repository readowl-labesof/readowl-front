import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ imageId?: string }> }) {
  const { imageId } = await params;
  if (!imageId) return new Response('Not found', { status: 404 });

  const rec = await prisma.profileImage.findUnique({ where: { id: imageId }, select: { imageData: true, mimeType: true, updatedAt: true } });
  if (!rec) return new Response('Not found', { status: 404 });

  const bytes = Buffer.from(rec.imageData, 'base64');
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': rec.mimeType || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Length': String(bytes.length),
      'Last-Modified': rec.updatedAt.toUTCString(),
    },
  });
}
