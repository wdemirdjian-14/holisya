import type { PrismaClient } from '@prisma/client';
import { ImapFlow } from 'imapflow';
import { simpleParser, type ParsedMail } from 'mailparser';
import { sendPush, pushConfigured } from './push';

// Lecture de la boîte mail (IMAP) :
//  - détecte les emails revenus en erreur (bounces) et met à jour les fiches clientes ;
//  - enregistre les nouveaux mails reçus et notifie l'administration.
// Utilisé par le cron (scripts/check-mailbox.ts) et par le bouton « Vérifier maintenant » de l'admin.

export type MailKind = 'message' | 'bounce' | 'autoreply' | 'promo' | 'planity' | 'internal';
export type Classified = { kind: MailKind; bounced: string[]; permanent: boolean };

const EMAIL_RE = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const OWN_DOMAIN = 'holisya.fr';
const INBOX_URL = '/admin?tab=emails&section=inbox';

export function mailboxConfigured(): boolean {
  return !!(process.env.IMAP_HOST && process.env.IMAP_USER && process.env.IMAP_PASSWORD);
}

// Adresses de l'institut (jamais considérées comme « clientes en échec »).
export function ownAddresses(): string[] {
  const list = [process.env.IMAP_USER, process.env.SMTP_USER, process.env.SMTP_FROM, 'contact@holisya.fr'];
  const out = new Set<string>();
  for (const v of list) for (const m of (v ?? '').match(EMAIL_RE) ?? []) out.add(m.toLowerCase());
  return Array.from(out);
}

function isOwn(addr: string, own: string[]) {
  const a = addr.toLowerCase();
  return own.includes(a) || a.endsWith('@' + OWN_DOMAIN) || a.endsWith('.' + OWN_DOMAIN);
}

function isDaemon(addr: string) {
  return /^(mailer-daemon|postmaster|mail-daemon|mailerdaemon|bounce[s]?|noreply-dmarc|no-reply-dmarc)\b/i.test(addr.split('@')[0] ?? '');
}

function headerText(mail: ParsedMail, name: string): string {
  const v: any = mail.headers.get(name);
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v?.value === 'string') return v.value;
  if (v?.text) return v.text;
  return String(v);
}

// Adresses en échec lues dans le rapport technique (DSN) : Final-Recipient / Original-Recipient / X-Failed-Recipients.
export function extractDsnRecipients(raw: string): { recipients: string[]; permanent: boolean | null } {
  const recipients = new Set<string>();
  const re = /^(?:Final|Original)-Recipient:\s*rfc822;\s*<?([^\s<>;]+@[^\s<>;]+)>?/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) recipients.add(m[1].toLowerCase());
  const xf = raw.match(/^X-Failed-Recipients:\s*(.+)$/im);
  if (xf) for (const a of xf[1].match(EMAIL_RE) ?? []) recipients.add(a.toLowerCase());
  const statuses = Array.from(raw.matchAll(/^Status:\s*([245])\.\d{1,3}\.\d{1,3}/gim)).map((s) => s[1]);
  const actions = Array.from(raw.matchAll(/^Action:\s*(\w+)/gim)).map((s) => s[1].toLowerCase());
  let permanent: boolean | null = null;
  if (statuses.includes('5') || actions.includes('failed')) permanent = true;
  else if (statuses.includes('4') || actions.includes('delayed')) permanent = false;
  return { recipients: Array.from(recipients), permanent };
}

// Classe un mail reçu. `raw` = source brute (pour lire le rapport DSN).
export function classifyMail(mail: ParsedMail, raw: string, own: string[] = ownAddresses()): Classified {
  const from = (mail.from?.value?.[0]?.address ?? '').toLowerCase();
  const fromName = mail.from?.value?.[0]?.name ?? '';
  const subject = mail.subject ?? '';
  const contentType = headerText(mail, 'content-type');

  if (from === 'noreply@planity.com') return { kind: 'planity', bounced: [], permanent: true };

  const looksLikeBounce =
    isDaemon(from) ||
    /mail delivery (subsystem|system)/i.test(fromName) ||
    /report-type="?delivery-status/i.test(contentType) ||
    /^X-Failed-Recipients:/im.test(raw) ||
    /(undeliver|delivery status notification|mail delivery failed|delivery failure|failure notice|returned mail|non remis|non distribu|échec de (la )?(remise|distribution|livraison)|message not delivered|could not be delivered|address not found)/i.test(subject);

  if (looksLikeBounce) {
    const dsnParts = [raw, ...(mail.attachments ?? []).filter((a) => /delivery-status/i.test(a.contentType)).map((a) => a.content.toString('utf8'))].join('\n');
    const dsn = extractDsnRecipients(dsnParts);
    let bounced = dsn.recipients;
    if (bounced.length === 0) {
      // Pas de rapport technique : on prend les adresses citées dans le texte du message d'erreur
      // (elles seront ensuite filtrées : seules celles connues en base sont retenues).
      bounced = Array.from(new Set(((mail.text ?? '').match(EMAIL_RE) ?? []).map((a) => a.toLowerCase())));
    }
    bounced = bounced.filter((a) => !isOwn(a, own) && !isDaemon(a));
    const text = `${subject}\n${mail.text ?? ''}`;
    const temporary = /\(delay\)|delayed|temporar|will (continue to )?retry|retarde|différé|not yet been delivered/i.test(text);
    const permanent = dsn.permanent ?? !temporary;
    return { kind: 'bounce', bounced, permanent };
  }

  if (from && isOwn(from, own)) return { kind: 'internal', bounced: [], permanent: true };

  const autoSubmitted = headerText(mail, 'auto-submitted').toLowerCase();
  if ((autoSubmitted && autoSubmitted !== 'no') || mail.headers.has('x-autoreply') || mail.headers.has('x-autorespond') ||
      /^(réponse automatique|automatic reply|auto(matic)?[- ]?reply|absence|out of office|abwesend|risposta automatica)/i.test(subject)) {
    return { kind: 'autoreply', bounced: [], permanent: true };
  }

  const precedence = headerText(mail, 'precedence').toLowerCase();
  if (mail.headers.has('list') || mail.headers.has('list-unsubscribe') || mail.headers.has('list-id') || /bulk|list|junk/.test(precedence)) {
    return { kind: 'promo', bounced: [], permanent: true };
  }

  return { kind: 'message', bounced: [], permanent: true };
}

function snippetOf(mail: ParsedMail) {
  const t = mail.text || (typeof mail.html === 'string' ? mail.html.replace(/<[^>]+>/g, ' ') : '');
  return t.replace(/\s+/g, ' ').trim().slice(0, 300);
}

async function notifyAdmins(prisma: PrismaClient, p: { type: string; title: string; body: string; url: string }) {
  try {
    await prisma.notification.create({ data: { audience: 'admin', userId: '', ...p } });
    if (pushConfigured()) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      const ids = admins.map((a) => a.id);
      if (ids.length) await sendPush({ title: p.title, body: p.body, url: p.url }, { userId: { in: ids } }).catch(() => {});
    }
  } catch (e) { console.error('[mailbox] notification', e); }
}

// Marque l'adresse en échec : fiche(s) cliente(s), envois en attente, historique.
// Retourne les fiches nouvellement passées en échec.
async function applyBounce(prisma: PrismaClient, address: string) {
  const users = await prisma.user.findMany({
    where: { email: { equals: address, mode: 'insensitive' } },
    select: { id: true, firstName: true, lastName: true, email: true, emailBounced: true, privateNotes: true },
  });
  const updated: typeof users = [];
  const note = `⚠️ Email en échec le ${new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })} (retour du serveur)`;
  for (const u of users) {
    if (u.emailBounced) continue;
    const prev = u.privateNotes ?? '';
    const notes = prev.includes('Email en échec') ? prev : (prev ? `${prev} | ${note}` : note);
    await prisma.user.update({ where: { id: u.id }, data: { emailBounced: true, privateNotes: notes } });
    updated.push(u);
  }
  // Inutile de continuer à écrire à cette adresse.
  await prisma.emailQueueItem.updateMany({
    where: { email: { equals: address, mode: 'insensitive' }, status: 'pending' },
    data: { status: 'skipped', error: 'email en échec' },
  });
  // Le dernier envoi « réussi » vers cette adresse est en réalité revenu en erreur.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const log = await prisma.emailLog.findFirst({
    where: { recipientEmail: { equals: address, mode: 'insensitive' }, status: 'SENT', createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
  });
  if (log) await prisma.emailLog.update({ where: { id: log.id }, data: { status: 'FAILED', error: 'Revenu en erreur : adresse rejetée par le serveur destinataire' } });
  return updated;
}

// Ne garde que les adresses connues (cliente, historique d'envoi, file d'envoi, newsletter).
async function knownAddresses(prisma: PrismaClient, addrs: string[]) {
  const out: string[] = [];
  for (const a of addrs) {
    const ci = { equals: a, mode: 'insensitive' as const };
    const hit =
      (await prisma.user.count({ where: { email: ci } })) ||
      (await prisma.emailLog.count({ where: { recipientEmail: ci } })) ||
      (await prisma.emailQueueItem.count({ where: { email: ci } })) ||
      (await prisma.newsletterSubscriber.count({ where: { email: ci } }));
    if (hit) out.push(a);
  }
  return out;
}

export type SyncResult = { configured: boolean; scanned: number; added: number; messages: number; bounces: number; clientsUpdated: number; error?: string };

export async function syncMailbox(prisma: PrismaClient, opts: { days?: number; max?: number } = {}): Promise<SyncResult> {
  const res: SyncResult = { configured: mailboxConfigured(), scanned: 0, added: 0, messages: 0, bounces: 0, clientsUpdated: 0 };
  if (!res.configured) return res;

  const days = opts.days ?? 7;
  const max = opts.max ?? 200;
  const own = ownAddresses();
  const firstRun = (await prisma.inboxMessage.count()) === 0;

  const client = new ImapFlow({
    host: process.env.IMAP_HOST!, port: Number(process.env.IMAP_PORT ?? 993), secure: process.env.IMAP_SECURE !== 'false',
    auth: { user: process.env.IMAP_USER!, pass: process.env.IMAP_PASSWORD! }, logger: false,
  });

  const newMessages: { fromName: string; fromEmail: string; subject: string }[] = [];
  const newlyBounced: { name: string; email: string; userId: string }[] = [];

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');
  try {
    const uidValidity = String((client.mailbox as any)?.uidValidity ?? '0');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const uids = (await client.search({ since }, { uid: true })) || [];
    res.scanned = uids.length;
    if (uids.length === 0) return res;

    // 1) En-têtes seulement, pour ignorer ce qui est déjà enregistré.
    const heads: { uid: number; messageId: string }[] = [];
    for await (const msg of client.fetch(uids, { envelope: true, uid: true }, { uid: true })) {
      heads.push({ uid: msg.uid, messageId: msg.envelope?.messageId || `imap-${uidValidity}-${msg.uid}` });
    }
    const known = new Set((await prisma.inboxMessage.findMany({ where: { messageId: { in: heads.map((h) => h.messageId) } }, select: { messageId: true } })).map((m) => m.messageId));
    const todo = heads.filter((h) => !known.has(h.messageId)).slice(-max);

    // 2) Contenu complet des nouveaux messages (lecture sans marquer « lu » dans la boîte).
    for (const h of todo) {
      const msg = await client.fetchOne(String(h.uid), { source: true }, { uid: true });
      if (!msg || !msg.source) continue;
      const raw = msg.source.toString('utf8');
      const mail = await simpleParser(msg.source);
      const c = classifyMail(mail, raw, own);
      const fromEmail = (mail.from?.value?.[0]?.address ?? '').toLowerCase();
      const fromName = mail.from?.value?.[0]?.name ?? '';
      const subject = mail.subject ?? '';
      const receivedAt = mail.date ?? new Date();

      let bounced: string[] = [];
      if (c.kind === 'bounce') bounced = await knownAddresses(prisma, c.bounced);

      // Fiche cliente liée : l'expéditrice (message) ou l'adresse en échec (bounce).
      let userId = '';
      const linkEmail = c.kind === 'message' ? fromEmail : c.kind === 'bounce' ? (bounced[0] ?? '') : '';
      if (linkEmail) {
        const u = await prisma.user.findFirst({ where: { email: { equals: linkEmail, mode: 'insensitive' } }, select: { id: true } });
        userId = u?.id ?? '';
      }

      // Seuls les vrais messages restent « non lus » ; le reste est rangé automatiquement.
      const unread = c.kind === 'message' || (c.kind === 'bounce' && c.permanent && bounced.length > 0);
      try {
        await prisma.inboxMessage.create({
          data: {
            messageId: h.messageId, uid: h.uid, fromEmail, fromName, subject, snippet: snippetOf(mail),
            kind: c.kind, bouncedEmail: (bounced.length ? bounced : c.bounced).slice(0, 5).join(', '), permanent: c.permanent, userId, read: !unread, receivedAt,
          },
        });
      } catch (e: any) {
        if (e?.code === 'P2002') continue; // déjà traité par une autre exécution
        throw e;
      }
      res.added += 1;

      if (c.kind === 'bounce' && c.permanent) {
        for (const a of bounced) {
          const updated = await applyBounce(prisma, a);
          res.bounces += 1;
          res.clientsUpdated += updated.length;
          for (const u of updated) newlyBounced.push({ name: `${u.firstName} ${u.lastName}`.trim(), email: u.email, userId: u.id });
        }
      }
      if (c.kind === 'message') {
        res.messages += 1;
        // Au tout premier passage, on n'alerte pas pour l'historique déjà présent dans la boîte.
        if (!firstRun) newMessages.push({ fromName, fromEmail, subject });
      }
    }
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }

  // 3) Notifications (regroupées si nombreuses).
  if (newMessages.length === 1) {
    const m = newMessages[0];
    await notifyAdmins(prisma, { type: 'message', title: `Nouveau mail de ${m.fromName || m.fromEmail}`, body: m.subject || '(sans objet)', url: INBOX_URL });
  } else if (newMessages.length > 1) {
    const who = Array.from(new Set(newMessages.map((m) => m.fromName || m.fromEmail))).slice(0, 3).join(', ');
    await notifyAdmins(prisma, { type: 'message', title: `${newMessages.length} nouveaux mails`, body: who, url: INBOX_URL });
  }
  if (newlyBounced.length === 1) {
    const b = newlyBounced[0];
    await notifyAdmins(prisma, { type: 'info', title: 'Email en échec', body: `${b.name ? b.name + ' · ' : ''}${b.email} ne reçoit plus les emails. Fiche cliente mise à jour.`, url: INBOX_URL });
  } else if (newlyBounced.length > 1) {
    await notifyAdmins(prisma, { type: 'info', title: `${newlyBounced.length} adresses email en échec`, body: 'Fiches clientes mises à jour (« L\'email ne fonctionne plus »).', url: INBOX_URL });
  }

  return res;
}
