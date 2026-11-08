export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getBookingSettings } from '@/lib/booking-server';
import { PLANITY_URL } from '@/lib/config';

export async function GET() {
  try {
    const settings = await getBookingSettings();
    const services = settings.onlineBookingEnabled
      ? await prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, description: true, duration: true, price: true, category: true, imageUrl: true } })
      : [];
    // Exemption éventuelle de la cliente connectée (cliente de confiance : ni empreinte ni paiement).
    let cardExempt = false;
    try {
      const session = await getServerSession(authOptions);
      const uid = (session?.user as any)?.id;
      if (uid) {
        const u = await prisma.user.findUnique({ where: { id: uid }, select: { exemptCardImprint: true } });
        cardExempt = !!u?.exemptCardImprint;
      }
    } catch {}
    return NextResponse.json({
      enabled: settings.onlineBookingEnabled,
      subscriptionsEnabled: (settings as any).subscriptionsEnabled ?? false,
      requireCardImprint: settings.requireCardImprint,
      allowOnlinePayment: (settings as any).allowOnlinePayment ?? false,
      cardExempt,
      maxAdvanceDays: settings.maxAdvanceDays,
      planityMode: settings.planityMode,
      planityUrl: settings.planityUrl || PLANITY_URL,
      services,
    });
  } catch (error: any) { console.error(error); return NextResponse.json({ enabled: false, subscriptionsEnabled: false, planityMode: false, planityUrl: PLANITY_URL, services: [] }); }
}
