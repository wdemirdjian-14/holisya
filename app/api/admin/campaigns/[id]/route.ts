export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const id = params?.id;
  const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const [pending, sent, failed, skipped, next, failedList] = await Promise.all([
    prisma.emailQueueItem.count({ where: { campaignId: id, status: 'pending' } }),
    prisma.emailQueueItem.count({ where: { campaignId: id, status: 'sent' } }),
    prisma.emailQueueItem.count({ where: { campaignId: id, status: 'failed' } }),
    prisma.emailQueueItem.count({ where: { campaignId: id, status: 'skipped' } }),
    prisma.emailQueueItem.findFirst({ where: { campaignId: id, status: 'pending' }, orderBy: { scheduledFor: 'asc' }, select: { scheduledFor: true } }),
    prisma.emailQueueItem.findMany({ where: { campaignId: id, status: 'failed' }, select: { email: true }, take: 100 }),
  ]);

  return NextResponse.json({ campaign, counts: { pending, sent, failed, skipped }, nextScheduled: next?.scheduledFor ?? null, failedList: failedList.map((f) => f.email) });
}
