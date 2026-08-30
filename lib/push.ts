import webpush from 'web-push';
import { prisma } from '@/lib/db';

let configured = false;
function configure() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (pub && priv) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@holisya.fr', pub, priv);
    configured = true;
  }
}

export function pushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

// Envoie une notification à une liste d'abonnements ; nettoie ceux qui ne sont plus valides.
export async function sendPush(payload: { title: string; body: string; url?: string }, where: any = {}) {
  if (!pushConfigured()) return { sent: 0, failed: 0 };
  configure();
  const subs = await prisma.pushSubscription.findMany({ where });
  const data = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url || '/' });
  let sent = 0, failed = 0;
  const dead: string[] = [];
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any, data);
      sent += 1;
    } catch (e: any) {
      failed += 1;
      if (e?.statusCode === 404 || e?.statusCode === 410) dead.push(s.endpoint);
    }
  }));
  if (dead.length) await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: dead } } }).catch(() => {});
  return { sent, failed };
}
