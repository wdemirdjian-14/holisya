import { prisma } from '@/lib/db';

// Un membre est "premium" s'il a un abonnement actif non expiré.
export async function isPremiumUser(userId: string): Promise<boolean> {
  if (!userId) return false;
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
  });
  return !!sub;
}

// Accès à une vidéo précise : admin, premium, achat individuel, ou vidéo gratuite.
export async function userHasVideoAccess(opts: { userId: string; role?: string; video: { id: string; isPremiumOnly: boolean; priceCents: number } }): Promise<boolean> {
  const { userId, role, video } = opts;
  if (role === 'ADMIN') return true;
  if (!userId) return false;
  if (!video.isPremiumOnly && video.priceCents === 0) return true;
  if (await isPremiumUser(userId)) return true;
  const access = await prisma.videoAccess.findUnique({ where: { userId_videoId: { userId, videoId: video.id } } });
  return !!access;
}
