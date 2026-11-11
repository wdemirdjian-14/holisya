export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { onPaymentRecorded } from '@/lib/loyalty';

// Débite la carte enregistrée en empreinte (no-show / annulation tardive).
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { appointmentId, amount } = await req.json();
    if (!appointmentId || !amount || amount <= 0) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });

    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt) return NextResponse.json({ error: 'RDV introuvable' }, { status: 404 });
    if (!appt.imprintSetupId) return NextResponse.json({ error: 'Aucune empreinte bancaire sur ce RDV' }, { status: 400 });
    if (appt.onlinePaymentRef) return NextResponse.json({ error: 'Ce RDV a déjà été débité / payé en ligne' }, { status: 409 });

    const si = await stripe.setupIntents.retrieve(appt.imprintSetupId);
    const paymentMethod = typeof si.payment_method === 'string' ? si.payment_method : (si.payment_method as any)?.id ?? '';
    const customer = typeof si.customer === 'string' ? si.customer : (si.customer as any)?.id ?? undefined;
    if (!paymentMethod) return NextResponse.json({ error: 'Carte de l\'empreinte introuvable' }, { status: 400 });

    let pi;
    try {
      pi = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100),
        currency: 'eur',
        customer,
        payment_method: paymentMethod,
        off_session: true,
        confirm: true,
        description: `Absence / annulation tardive — ${appt.serviceType ?? 'Soin'}`,
        metadata: { type: 'noshow_charge', appointmentId: appt.id },
      });
    } catch (e: any) {
      // Carte refusée / authentification requise : on remonte un message clair.
      const msg = e?.raw?.message || e?.message || 'Paiement refusé par la banque';
      return NextResponse.json({ error: `Débit impossible : ${msg}` }, { status: 402 });
    }

    if (pi.status !== 'succeeded') return NextResponse.json({ error: `Paiement non abouti (${pi.status})` }, { status: 402 });

    await prisma.appointment.update({ where: { id: appt.id }, data: { onlinePaymentRef: pi.id } });
    await prisma.payment.create({ data: { appointmentId: appt.id, method: 'CARD', amount: Number(amount), notes: 'Débit empreinte (absence / annulation tardive)' } });
    if (appt.userId) await onPaymentRecorded(appt.userId, Number(amount)).catch((e) => console.error('loyalty error', e));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Charge imprint error:', error);
    return NextResponse.json({ error: error?.message ?? 'Erreur' }, { status: 500 });
  }
}
