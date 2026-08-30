export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';
import { renderTemplate, withUnsubscribeFooter } from '@/lib/email-template';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    const recipientIds: string[] = Array.isArray(data?.recipientIds) ? data.recipientIds : [];
    if (recipientIds.length === 0) return NextResponse.json({ error: 'Aucun destinataire sélectionné' }, { status: 400 });
    if (!data?.subject || !data?.body) return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });

    const recipients = await prisma.user.findMany({ where: { id: { in: recipientIds } } });
    const appUrl = process.env.NEXTAUTH_URL ?? '';

    let sent = 0;
    let skippedOptOut = 0;
    let failed = 0;

    for (const user of recipients) {
      if (user.emailOptOut) { skippedOptOut += 1; continue; }

      let unsubscribeToken = user.unsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = crypto.randomBytes(24).toString('hex');
        await prisma.user.update({ where: { id: user.id }, data: { unsubscribeToken } });
      }

      const vars = { prenom: user.firstName ?? '', nom: user.lastName ?? '', email: user.email ?? '' };
      const subject = renderTemplate(data.subject, vars);
      const renderedBody = renderTemplate(data.body, vars);
      const unsubscribeUrl = `${appUrl}/desinscription?token=${unsubscribeToken}`;
      const finalBody = withUnsubscribeFooter(renderedBody, unsubscribeUrl);

      const result = await sendNotificationEmail({ subject, body: finalBody, recipientEmail: user.email });
      const success = result?.success !== false;
      if (success) sent += 1; else failed += 1;

      await prisma.emailLog.create({
        data: {
          recipientEmail: user.email,
          recipientName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
          subject,
          templateId: data?.templateId ?? '',
          status: success ? 'SENT' : 'FAILED',
          error: success ? '' : 'Échec envoi SMTP',
        },
      });
    }

    return NextResponse.json({ sent, failed, skippedOptOut, total: recipients.length });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Erreur envoi' }, { status: 500 });
  }
}
