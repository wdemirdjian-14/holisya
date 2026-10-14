import { PrismaClient } from '@prisma/client';
import { syncMailbox } from '../lib/mailbox';

// Cron (toutes les 10 min) : lit la boîte mail, traite les emails en erreur et notifie les nouveaux mails.
const prisma = new PrismaClient();

async function main() {
  const r = await syncMailbox(prisma);
  if (!r.configured) { console.log('[mailbox] IMAP non configuré'); return; }
  console.log(`[mailbox] ${r.scanned} mail(s) sur 7 j, ${r.added} nouveau(x) : ${r.messages} message(s), ${r.bounces} adresse(s) en échec, ${r.clientsUpdated} fiche(s) mise(s) à jour.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
