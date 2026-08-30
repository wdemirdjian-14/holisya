export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const [clients, appointments, giftCards, subscriptions, promos, blogPosts, contacts, testimonials, services] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, credits: true, role: true, source: true, resetToken: true, createdAt: true } }),
      prisma.appointment.findMany({ orderBy: { date: 'desc' }, include: { user: { select: { firstName: true, lastName: true, email: true } }, payments: { orderBy: { createdAt: 'desc' } } } }),
      prisma.giftCard.findMany({ orderBy: { createdAt: 'desc' }, include: { purchasedBy: { select: { firstName: true, lastName: true, email: true } }, receivedBy: { select: { firstName: true, lastName: true, email: true } } } }),
      prisma.subscription.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, email: true } } } }),
      prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    const revenue = (giftCards ?? []).reduce((sum: number, gc: any) => sum + (gc?.amount ?? 0), 0) + (subscriptions ?? []).reduce((sum: number, s: any) => sum + (s?.priceMonthly ?? 0), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // CA réel encaissé (à partir des paiements enregistrés)
    const allPayments = (appointments ?? []).flatMap((a: any) => a.payments ?? []);
    const realRevenue = allPayments.reduce((s: number, p: any) => s + (p?.amount ?? 0), 0);
    const realRevenueThisMonth = allPayments.filter((p: any) => new Date(p.createdAt) >= startOfMonth).reduce((s: number, p: any) => s + (p?.amount ?? 0), 0);

    // RDV du mois
    const appointmentsThisMonth = (appointments ?? []).filter((a: any) => a?.date && new Date(a.date) >= startOfMonth).length;

    // Soins les plus demandés
    const serviceCounts: Record<string, number> = {};
    (appointments ?? []).forEach((a: any) => { const k = a?.serviceType || 'Autre'; serviceCounts[k] = (serviceCounts[k] ?? 0) + 1; });
    const topServices = Object.entries(serviceCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Clients inactifs (aucun RDV depuis 90 jours)
    const lastApptByUser: Record<string, number> = {};
    (appointments ?? []).forEach((a: any) => {
      const uid = a?.userId; if (!uid || !a?.date) return;
      const t = new Date(a.date).getTime();
      if (!lastApptByUser[uid] || t > lastApptByUser[uid]) lastApptByUser[uid] = t;
    });
    const userClients = (clients ?? []).filter((c: any) => c?.role === 'USER');
    const inactiveClients = userClients.filter((c: any) => !lastApptByUser[c.id] || lastApptByUser[c.id] < ninetyDaysAgo.getTime()).length;

    const stats = {
      revenue,
      realRevenue,
      realRevenueThisMonth,
      appointmentsThisMonth,
      topServices,
      inactiveClients,
      totalClients: userClients.length,
      totalAppointments: (appointments ?? []).length,
      totalGiftCards: (giftCards ?? []).length,
      activeSubscriptions: (subscriptions ?? []).filter((s: any) => s?.status === 'ACTIVE').length,
      monthlyRevenue: [],
      serviceBreakdown: [],
    };

    return NextResponse.json({ stats, clients, appointments, giftCards, subscriptions, promos, blogPosts, contacts, testimonials, services });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
