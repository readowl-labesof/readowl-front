import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { createBookSchema, normalizeCreateBookInput } from '@/types/book';
import { sanitizeSynopsisHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/slug';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = createBookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
  }
  const { title, synopsis, releaseFrequency, coverUrl, genres } = normalizeCreateBookInput(parsed.data);
  const cleanSynopsis = sanitizeSynopsisHtml(synopsis);

  // Generate a human-readable, unique slug for fast lookups
  async function generateUniqueSlug(rawTitle: string): Promise<string> {
    const MAX = 220;
    let base = slugify(rawTitle).slice(0, MAX).replace(/-+$/g, '');
    if (!base) base = 'livro';
    // Try base, then base-2, base-3, ... until unique
    let candidate = base;
    let counter = 2;
    // Small safety cap to avoid infinite loops
    while (true) {
      const exists = await prisma.book.findUnique({ where: { slug: candidate } });
      if (!exists) return candidate;
      const suffix = `-${counter}`;
      const allowed = MAX - suffix.length;
      const trimmed = base.length > allowed ? base.slice(0, allowed).replace(/-+$/g, '') : base;
      candidate = `${trimmed}${suffix}`;
      counter++;
      if (counter > 9999) {
        // Fallback: append a short random fragment to ensure uniqueness
        const rnd = Math.random().toString(36).slice(2, 8);
        const tail = `-${rnd}`;
        return `${base.slice(0, MAX - tail.length)}${tail}`;
      }
    }
  }

  try {
    const slug = await generateUniqueSlug(title);
    const book = await prisma.book.create({
      data: {
        title,
        slug,
        synopsis: cleanSynopsis,
        releaseFrequency: releaseFrequency || null,
        coverUrl: coverUrl || null,
        authorId: session.user.id,
        genres: {
          connectOrCreate: genres.map(name => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { genres: true },
    });
  return NextResponse.json({ book }, { status: 201 });
  } catch (e) {
    console.error('[BOOK_CREATE]', (e as Error).message);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
