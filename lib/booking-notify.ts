import { prisma } from '@/lib/db';
import { notifyAdmins, notifyUser } from '@/lib/notify';
import { sendNotificationEmail } from '@/lib/notifications';

// Notifie admin + cliente et envoie l'email de confirmation d'une réservation.
export async function notifyBookingCreated(apptId: string) {
  const appt = await prisma.appointment.findUnique({ where: { id: apptId }, include: { user: { select: { email: true, firstName: true, lastName: true } } } });
  if (!appt) return;
  const name = `${appt.user?.firstName ?? ''} ${appt.user?.lastName ?? ''}`.trim();
  const email = appt.user?.email ?? '';
  const when = new Date(appt.date).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const confirmed = appt.status === 'CONFIRMED';

  await notifyAdmins({ type: 'booking', title: 'Nouvelle réservation en ligne', body: `${name || email} — ${appt.serviceType} · ${when}`, url: '/admin' });
  await notifyUser(appt.userId, { type: 'appointment', title: confirmed ? 'Rendez-vous confirmé' : 'Demande de rendez-vous enregistrée', body: `${appt.serviceType} — ${when}`, url: '/espace-membre/rendez-vous' });
  if (email) {
    await sendNotificationEmail({
      subject: confirmed ? 'Votre rendez-vous Holisya est confirmé 🌸' : 'Votre demande de rendez-vous Holisya 🌸',
      recipientEmail: email,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8F4EF;padding:40px 30px;">
        <h1 style="color:#3B312D;text-align:center;font-size:24px;">${confirmed ? 'Rendez-vous confirmé' : 'Demande enregistrée'} 🌸</h1>
        <div style="background:white;padding:30px;border-radius:12px;">
          <p style="color:#3B312D;">${appt.serviceType}</p>
          <p style="color:#C98F79;font-weight:bold;font-size:18px;">${when}</p>
          ${confirmed ? '<p style="color:#666;font-size:13px;">Nous avons hâte de vous accueillir.</p>' : '<p style="color:#666;font-size:13px;">Nous confirmerons votre créneau très rapidement.</p>'}
        </div>
      </div>`,
    });
  }
}
