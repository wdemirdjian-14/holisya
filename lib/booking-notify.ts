import { prisma } from '@/lib/db';
import { notifyAdmins, notifyUser } from '@/lib/notify';
import { sendNotificationEmail } from '@/lib/notifications';
import { appointmentEmail, emailShell, emailButton } from '@/lib/emails';
import { SITE_URL, BUSINESS } from '@/lib/business';

// Notifie admin + cliente et envoie les emails liés à une réservation.
export async function notifyBookingCreated(apptId: string) {
  const appt = await prisma.appointment.findUnique({ where: { id: apptId }, include: { user: { select: { email: true, firstName: true, lastName: true, phone: true } } } });
  if (!appt) return;
  const name = `${appt.user?.firstName ?? ''} ${appt.user?.lastName ?? ''}`.trim();
  const email = appt.user?.email ?? '';
  const phone = appt.user?.phone ?? '';
  const when = new Date(appt.date).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const confirmed = appt.status === 'CONFIRMED';

  await notifyAdmins({ type: 'booking', title: 'Nouvelle réservation en ligne', body: `${name || email} — ${appt.serviceType} · ${when}`, url: '/admin' });
  await notifyUser(appt.userId, { type: 'appointment', title: confirmed ? 'Rendez-vous confirmé' : 'Demande de rendez-vous enregistrée', body: `${appt.serviceType} — ${when}`, url: '/espace-membre/rendez-vous' });

  // Email de confirmation à la cliente.
  if (email) {
    await sendNotificationEmail({
      subject: confirmed ? 'Votre rendez-vous Holisya est confirmé 🌸' : 'Votre demande de rendez-vous Holisya 🌸',
      recipientEmail: email,
      replyTo: 'contact@holisya.fr',
      body: appointmentEmail({ confirmed, serviceType: appt.serviceType ?? 'Soin', whenLabel: when }),
    });
  }

  // Email d'alerte aux administratrices (Lamyae + contact + autres admins).
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true } });
    const adminEmails = Array.from(new Set([...admins.map((a) => a.email).filter(Boolean), BUSINESS.email])).filter(Boolean) as string[];
    const inner = `
      <p style="color:#3B312D;">Une nouvelle réservation vient d'être enregistrée sur le site ${confirmed ? '<strong>(confirmée)</strong>' : '<strong>(à confirmer)</strong>'} :</p>
      <table role="presentation" width="100%" style="margin:14px 0;background:#F8F4EF;border-radius:12px;"><tr><td style="padding:16px 20px;">
        <p style="margin:4px 0;color:#3B312D;"><strong>Cliente :</strong> ${name || '—'}</p>
        <p style="margin:4px 0;color:#3B312D;"><strong>Email :</strong> ${email || '—'}</p>
        <p style="margin:4px 0;color:#3B312D;"><strong>Téléphone :</strong> ${phone || '—'}</p>
        <p style="margin:4px 0;color:#3B312D;"><strong>Soin :</strong> ${appt.serviceType ?? 'Soin'}</p>
        <p style="margin:4px 0;color:#3B312D;"><strong>Quand :</strong> ${when}</p>
        <p style="margin:4px 0;color:#3B312D;"><strong>Statut :</strong> ${confirmed ? 'Confirmé' : 'À confirmer'}</p>
      </td></tr></table>
      <div style="text-align:center;margin-top:10px;">${emailButton('Ouvrir l\'administration', `${SITE_URL}/admin`)}</div>`;
    for (const to of adminEmails) {
      await sendNotificationEmail({ subject: `Nouvelle réservation — ${name || email} (${when})`, recipientEmail: to, replyTo: 'contact@holisya.fr', body: emailShell('Nouvelle réservation 🗓️', inner) });
    }
  } catch (e) { console.error('admin booking email error', e); }
}
