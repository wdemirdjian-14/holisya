export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') ?? 'clients';
    let csv = '';
    if (type === 'clients') {
      const users = await prisma.user.findMany({ select: { email: true, firstName: true, lastName: true, phone: true, credits: true, createdAt: true } });
      csv = 'Email,Prénom,Nom,Téléphone,Crédits,Inscription\n' + (users ?? []).map((u: any) => `${u?.email ?? ''},${u?.firstName ?? ''},${u?.lastName ?? ''},${u?.phone ?? ''},${u?.credits ?? 0},${u?.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : ''}`).join('\n');
    } else if (type === 'appointments') {
      const apts = await prisma.appointment.findMany({ include: { user: { select: { email: true, firstName: true, lastName: true } } } });
      csv = 'Client,Email,Soin,Date,Statut\n' + (apts ?? []).map((a: any) => `${a?.user?.firstName ?? ''} ${a?.user?.lastName ?? ''},${a?.user?.email ?? ''},${a?.serviceType ?? ''},${a?.date ? new Date(a.date).toLocaleString('fr-FR') : ''},${a?.status ?? ''}`).join('\n');
    }
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=${type}_export.csv` } });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
