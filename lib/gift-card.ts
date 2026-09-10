import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';
import { giftCardRedeemedEmail } from '@/lib/emails';

export async function deductGiftCardBalance(opts: { id?: string; code?: string; amount: number }) {
  if (!opts.id && !opts.code) throw new Error('Carte cadeau requise');
  if (!opts.amount || opts.amount <= 0) throw new Error('Montant invalide');

  const giftCard = opts.id
    ? await prisma.giftCard.findUnique({ where: { id: opts.id } })
    : await prisma.giftCard.findUnique({ where: { code: opts.code } });

  if (!giftCard) throw new Error('Carte cadeau introuvable');
  if (giftCard.status === 'EXPIRED') throw new Error('Carte cadeau expirée');
  if (giftCard.status === 'USED' || giftCard.remainingAmount <= 0) throw new Error('Carte cadeau déjà entièrement utilisée');
  if (opts.amount > giftCard.remainingAmount) throw new Error(`Montant supérieur au solde disponible (${giftCard.remainingAmount}€)`);

  const newRemaining = Math.round((giftCard.remainingAmount - opts.amount) * 100) / 100;
  const newStatus = newRemaining <= 0 ? 'USED' : 'PARTIALLY_USED';

  const updated = await prisma.giftCard.update({ where: { id: giftCard.id }, data: { remainingAmount: newRemaining, status: newStatus } });

  // Email confirmant l'encaissement de la carte cadeau.
  try {
    let to = giftCard.recipientEmail;
    if (!to && giftCard.purchasedById) {
      const buyer = await prisma.user.findUnique({ where: { id: giftCard.purchasedById }, select: { email: true } });
      to = buyer?.email ?? '';
    }
    if (to) {
      await sendNotificationEmail({
        subject: 'Votre carte cadeau Holisya a été utilisée',
        recipientEmail: to,
        replyTo: 'contact@holisya.fr',
        body: giftCardRedeemedEmail({ amount: opts.amount, code: giftCard.code, remaining: newRemaining }),
      });
    }
  } catch (e) { console.error('gift card redeemed email error', e); }

  return updated;
}
