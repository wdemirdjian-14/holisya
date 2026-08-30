export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase?.() ?? '' } });
    if (!user) return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 });
  }
}
