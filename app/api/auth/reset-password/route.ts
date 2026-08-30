export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 });
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gte: new Date() } } });
    if (!user) return NextResponse.json({ error: 'Lien expiré ou invalide' }, { status: 400 });
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
