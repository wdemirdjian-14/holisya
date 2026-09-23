export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const email = String(data?.email ?? '').trim().toLowerCase();
    const list = String(data?.list ?? 'antibes').trim() || 'antibes';
    const source = String(data?.source ?? 'popup').trim() || 'popup';
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });

    // N'ouvre PAS de compte client : simple entrée dans la liste newsletter.
    await prisma.newsletterSubscriber.upsert({
      where: { email_list: { email, list } },
      update: {},
      create: { email, list, source },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('newsletter subscribe error', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
