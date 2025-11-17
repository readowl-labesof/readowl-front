import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function parseDataUrl(dataUrl: string): { mime: string; data: string } | null {
  const m = /^data:(.+);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], data: m[2] };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { imageData } = (await req.json().catch(() => ({}))) as { imageData?: string };
  if (!imageData) return NextResponse.json({ error: 'Missing imageData' }, { status: 400 });

  const parsed = parseDataUrl(imageData);
  if (!parsed) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });

  // Rough size check ~1MB
  const approxBytes = (parsed.data.length * 3) / 4;
  if (approxBytes > 1 * 1024 * 1024) return NextResponse.json({ error: 'Imagem muito grande (máximo 1MB)' }, { status: 400 });

  // Basic mime allow-list
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(parsed.mime)) return NextResponse.json({ error: 'Tipo de imagem não suportado' }, { status: 400 });

  const userId = session.user.id;

  // Upsert profile image
  const rec = await prisma.profileImage.upsert({
    where: { userId },
    update: { imageData: parsed.data, mimeType: parsed.mime },
    create: { userId, imageData: parsed.data, mimeType: parsed.mime },
    select: { id: true },
  });

  const imageUrl = `/api/images/profile/${rec.id}`;

  await prisma.user.update({ where: { id: userId }, data: { image: imageUrl } });

  return NextResponse.json({ imageId: rec.id, imageUrl });
}
