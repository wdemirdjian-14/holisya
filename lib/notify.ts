import { prisma } from '@/lib/db';
import { sendPush, pushConfigured } from '@/lib/push';

type Payload = { type?: string; title: string; body?: string; url?: string };

// Notifie une cliente précise (centre de notifs + push si abonnée).
export async function notifyUser(userId: string, p: Payload) {
  if (!userId) return;
  try {
    await prisma.notification.create({ data: { audience: 'user', userId, type: p.type ?? 'info', title: p.title, body: p.body ?? '', url: p.url ?? '/espace-membre' } });
    if (pushConfigured()) await sendPush({ title: p.title, body: p.body ?? '', url: p.url ?? '/espace-membre' }, { userId }).catch(() => {});
  } catch (e) { console.error('notifyUser error', e); }
}

// Notifie tous les administrateurs (flux partagé + push).
export async function notifyAdmins(p: Payload) {
  try {
    await prisma.notification.create({ data: { audience: 'admin', userId: '', type: p.type ?? 'info', title: p.title, body: p.body ?? '', url: p.url ?? '/admin' } });
    if (pushConfigured()) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      const ids = admins.map((a) => a.id);
      if (ids.length) await sendPush({ title: p.title, body: p.body ?? '', url: p.url ?? '/admin' }, { userId: { in: ids } }).catch(() => {});
    }
  } catch (e) { console.error('notifyAdmins error', e); }
}
