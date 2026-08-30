export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyAdmins } from '@/lib/notify';

// Récupère les infos minimales d'un rendez-vous à partir de son jeton d'avis.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t');
  if (!token) return NextResponse.json({ error: 'Jeton manquant' }, { status: 400 });
  const appt = await prisma.appointment.findUnique({ where: { reviewToken: token }, include: { user: { select: { firstName: true } } } });
  if (!appt) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
  return NextResponse.json({ firstName: appt.user?.firstName ?? '', serviceType: appt.serviceType, alreadyReviewed: !!appt.reviewedAt });
}

// Enregistre l'avis. Note >= 4 : on invite vers Google. Sinon : retour privé.
export async function POST(req: NextRequest) {
  try {
    const d = await req.json();
    const token = d?.token;
    const rating = Math.min(5, Math.max(1, parseInt(d?.rating ?? '0')));
    if (!token || !rating) return NextResponse.json({ error: 'Note requise' }, { status: 400 });

    const appt = await prisma.appointment.findUnique({ where: { reviewToken: token }, include: { user: { select: { firstName: true, lastName: true } } } });
    if (!appt) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
    if (appt.reviewedAt) return NextResponse.json({ error: 'Avis déjà enregistré', already: true }, { status: 400 });

    const name = `${appt.user?.firstName ?? ''} ${(appt.user?.lastName ?? '').charAt(0)}.`.trim();
    await prisma.testimonial.create({
      data: { name: name || 'Cliente', rating, comment: (d?.comment ?? '').slice(0, 1000), serviceType: appt.serviceType ?? '', isApproved: false },
    });
    await prisma.appointment.update({ where: { id: appt.id }, data: { reviewedAt: new Date() } });

    await notifyAdmins({ type: 'review', title: `Nouvel avis ${rating}★`, body: `${name}${d?.comment ? ' — ' + String(d.comment).slice(0, 80) : ''}`, url: '/admin' });

    const googleReviewUrl = rating >= 4 ? (process.env.GOOGLE_REVIEW_URL ?? '') : '';
    return NextResponse.json({ success: true, rating, googleReviewUrl });
  } catch (error: any) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
