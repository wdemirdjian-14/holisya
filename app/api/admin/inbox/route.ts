export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mailboxConfigured, syncMailbox } from '@/lib/mailbox';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as any)?.role === 'ADMIN';
}

// Liste des mails reçus (boîte de réception de l'admin).
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const kind = req.nextUrl.searchParams.get('kind') ?? 'all';
    const where: any = kind === 'all' ? {} : kind === 'other' ? { kind: { in: ['autoreply', 'promo', 'planity', 'internal'] } } : { kind };
    const [messages, unread, unreadBounces] = await Promise.all([
      prisma.inboxMessage.findMany({ where, orderBy: { receivedAt: 'desc' }, take: 200 }),
      prisma.inboxMessage.count({ where: { read: false } }),
      prisma.inboxMessage.count({ where: { read: false, kind: 'bounce' } }),
    ]);
    return NextResponse.json({ configured: mailboxConfigured(), messages, unread, unreadBounces });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

// « Vérifier maintenant » : lit la boîte mail immédiatement.
export async function POST() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    if (!mailboxConfigured()) return NextResponse.json({ error: 'Boîte mail non configurée sur le serveur (IMAP_HOST, IMAP_USER, IMAP_PASSWORD)' }, { status: 400 });
    const result = await syncMailbox(prisma);
    return NextResponse.json(result);
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Connexion à la boîte mail impossible' }, { status: 500 }); }
}

// Marquer lu / non lu (un message, ou tout).
export async function PUT(req: NextRequest) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { id, all, read } = await req.json();
    if (all) await prisma.inboxMessage.updateMany({ where: { read: false }, data: { read: true } });
    else if (id) await prisma.inboxMessage.update({ where: { id }, data: { read: read !== false } });
    else return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
