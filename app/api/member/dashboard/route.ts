export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensureReferralCode, tierFor, LOYALTY_TIERS } from '@/lib/loyalty';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const [profile, appointments, giftCards, subscriptions, wellness] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, photoUrl: true, carePreferences: true, credits: true, role: true, loyaltyPoints: true, referralCode: true, createdAt: true } }),
      prisma.appointment.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 10 }),
      prisma.giftCard.findMany({ where: { OR: [{ purchasedById: userId }, { receivedById: userId }] }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.wellnessEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    let referralCode = profile?.referralCode ?? '';
    if (!referralCode) referralCode = await ensureReferralCode(userId).catch(() => '');

    const points = profile?.loyaltyPoints ?? 0;
    const loyalty = { points, ...tierFor(points), tiers: LOYALTY_TIERS };

    return NextResponse.json({ profile: { ...profile, referralCode }, appointments, giftCards, subscriptions, wellness, loyalty, referralCode });
  } catch (error: any) {
    console.error('Member dashboard error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
