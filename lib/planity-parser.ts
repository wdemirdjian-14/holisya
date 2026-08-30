// Extraction des informations d'un email de confirmation Planity.
const MONTHS: Record<string, number> = {
  'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
  'juillet': 6, 'août': 7, 'aout': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11,
};

export type PlanityParsed = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  date: Date;
  durationMin: number;
};

function field(text: string, label: string): string {
  const re = new RegExp('(?:' + label + ')\\s*:\\s*(.+)', 'i');
  const m = re.exec(text);
  return m && m[1] ? m[1].trim() : '';
}

// Construit une date en heure locale (le process doit tourner en TZ Europe/Paris).
export function parsePlanityEmail(text: string): PlanityParsed | null {
  if (!text) return null;

  const dateRe = /(\d{1,2})\s+([a-zA-Zéèûôàù]+)\s+(\d{4})\s+de\s+(\d{1,2}):(\d{2})\s+à\s+(\d{1,2}):(\d{2})/i;
  const dm = dateRe.exec(text);
  if (!dm) return null;
  const day = parseInt(dm[1]);
  const monthIdx = MONTHS[dm[2].toLowerCase()];
  const year = parseInt(dm[3]);
  const startH = parseInt(dm[4]); const startM = parseInt(dm[5]);
  const endH = parseInt(dm[6]); const endM = parseInt(dm[7]);
  if (monthIdx === undefined) return null;

  const date = new Date(year, monthIdx, day, startH, startM, 0, 0);
  const durationMin = Math.max(15, (endH * 60 + endM) - (startH * 60 + startM));

  const lastName = field(text, 'Nom');
  const firstName = field(text, 'Prénom|Prenom');
  const emailRaw = field(text, 'Email|E-mail');
  const emailMatch = /[\w.+-]+@[\w.-]+\.\w+/.exec(emailRaw || text);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';
  const phone = field(text, 'Téléphone|Telephone|Tél');

  // Ligne de prestation : "- Drainage lymphatique corps de 17:30 à 18:45 ..."
  let serviceType = '';
  const svcRe = /[-•]\s*(.+?)\s+de\s+\d{1,2}:\d{2}\s+à\s+\d{1,2}:\d{2}/i;
  const sm = svcRe.exec(text);
  if (sm) serviceType = sm[1].trim();

  return { firstName, lastName, email, phone, serviceType, date, durationMin };
}
