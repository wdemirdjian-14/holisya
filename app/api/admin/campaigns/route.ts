export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function admin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as any)?.role === 'ADMIN';
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const campaigns = await prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ campaigns });
}

// Pause / reprise / annulation d'une campagne.
export async function PUT(req: NextRequest) {
  if (!(await admin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const { id, action } = await req.json();
  if (!id || !['pause', 'resume', 'cancel'].includes(action)) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  const camp = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!camp) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });

  if (action === 'pause') {
    await prisma.emailCampaign.update({ where: { id }, data: { status: 'paused' } });
  } else if (action === 'resume') {
    const remaining = await prisma.emailQueueItem.count({ where: { campaignId: id, status: 'pending' } });
    await prisma.emailCampaign.update({ where: { id }, data: { status: remaining > 0 ? 'sending' : 'done' } });
  } else if (action === 'cancel') {
    await prisma.emailQueueItem.updateMany({ where: { campaignId: id, status: 'pending' }, data: { status: 'skipped', error: 'annulée' } });
    await prisma.emailCampaign.update({ where: { id }, data: { status: 'done' } });
  }
  return NextResponse.json({ success: true });
}
