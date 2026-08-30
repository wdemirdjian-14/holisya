import { prisma } from '@/lib/db';

// Paliers de fidélité (seuil de points, nom, avantage).
export const LOYALTY_TIERS = [
  { min: 0, name: 'Découverte', perk: 'Bienvenue chez Holisya' },
  { min: 100, name: 'Fidèle', perk: '-5% sur les cartes cadeaux' },
  { min: 300, name: 'Privilège', perk: 'Un soin découverte offert' },
  { min: 600, name: 'Prestige', perk: 'Accès prioritaire + surprises' },
];

export function tierFor(points: number) {
  let current = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) if (points >= t.min) current = t;
  const idx = LOYALTY_TIERS.indexOf(current);
  const next = LOYALTY_TIERS[idx + 1] ?? null;
  return { current, next, toNext: next ? next.min - points : 0 };
}

// 1 point par euro dépensé.
export const POINTS_PER_EURO = 1;
// Crédits offerts au parrain quand le filleul effectue son 1er paiement.
export const REFERRAL_REWARD_CREDITS = 2;
export const REFERRAL_REWARD_POINTS = 50;

export async function awardLoyaltyPoints(userId: string, points: number, reason: string) {
  if (!userId || !points) return;
  await prisma.loyaltyTransaction.create({ data: { userId, points, reason } });
  await prisma.user.update({ where: { id: userId }, data: { loyaltyPoints: { increment: points } } });
}

function genCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
  return c;
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = genCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch { /* collision, retry */ }
  }
  return '';
}

// À appeler à chaque encaissement : attribue les points et déclenche la
// récompense de parrainage au premier paiement du filleul.
export async function onPaymentRecorded(userId: string, amount: number) {
  if (!userId) return;
  const points = Math.round((amount ?? 0) * POINTS_PER_EURO);
  if (points > 0) await awardLoyaltyPoints(userId, points, 'Soin en institut');

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referredById: true, referralRewarded: true } });
  if (user?.referredById && !user.referralRewarded) {
    await prisma.user.update({ where: { id: userId }, data: { referralRewarded: true } });
    await prisma.user.update({ where: { id: user.referredById }, data: { credits: { increment: REFERRAL_REWARD_CREDITS } } }).catch(() => {});
    await awardLoyaltyPoints(user.referredById, REFERRAL_REWARD_POINTS, 'Parrainage récompensé');
  }
}
