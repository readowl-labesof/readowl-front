import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { compare, hash } from 'bcrypt';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  description: z.string().max(500).nullable().optional(),
  // Optional password change
  newPassword: z.string().min(8).max(100).optional(),
  currentPassword: z.string().min(1).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parse = updateSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { name, email, description, newPassword, currentPassword } = parse.data;

  // Load user
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // If email change, ensure uniqueness
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email já está em uso' }, { status: 409 });
  }

  // Handle password change: only for users with password (non-Google) and when newPassword provided
  let passwordUpdate: { password?: string; credentialVersion?: number } = {};
  if (newPassword) {
    if (!user.password) {
      return NextResponse.json({ error: 'Esta conta não suporta troca de senha' }, { status: 400 });
    }
    if (!currentPassword) {
      return NextResponse.json({ error: 'Senha atual necessária' }, { status: 400 });
    }
    const ok = await compare(currentPassword, user.password);
    if (!ok) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
    const passwordHashed = await hash(newPassword, 10);
    passwordUpdate = { password: passwordHashed, credentialVersion: (user.credentialVersion ?? 0) + 1 };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name ?? user.name,
      email: email ?? user.email,
      description: description === undefined ? user.description : description,
      ...passwordUpdate,
    },
    select: { id: true, name: true, email: true, image: true, description: true },
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Cascade delete will remove related data per schema relations.
  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ ok: true });
}
