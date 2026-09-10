import { BUSINESS, SITE_URL, addressLine } from './business';

/**
 * Constructeurs d'emails Holisya (HTML) — mise en page de marque cohérente.
 * Import relatif de ./business pour rester utilisable aussi bien dans les routes Next
 * (@/lib/emails) que dans les scripts cron (../lib/emails via tsx).
 */

const C = {
  terra: '#C98F79', terraDeep: '#b87d68', sage: '#AAB7A0',
  ink: '#3B312D', cream: '#F8F4EF', paper: '#ffffff', muted: '#8b807a',
};

export function emailButton(label: string, url: string, color: string = C.terra): string {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;margin:5px 4px;">${label}</a>`;
}

/** Bloc coordonnées de Lamyae / Holisya. */
export function contactBlock(): string {
  const tel = BUSINESS.phoneDisplay || BUSINESS.phone;
  return `<table role="presentation" width="100%" style="margin-top:16px;background:${C.paper};border-radius:16px;border:1px solid rgba(59,49,45,.07);"><tr><td style="padding:20px 24px;">
    <p style="margin:0 0 8px;color:${C.ink};font-weight:bold;font-family:Georgia,serif;">${BUSINESS.practitioner} — ${BUSINESS.name}</p>
    <p style="margin:3px 0;color:${C.muted};font-size:13px;">📍 ${addressLine()}</p>
    ${tel ? `<p style="margin:3px 0;color:${C.muted};font-size:13px;">📞 <a href="tel:${BUSINESS.phone}" style="color:${C.terraDeep};text-decoration:none;">${tel}</a></p>` : ''}
    <p style="margin:3px 0;color:${C.muted};font-size:13px;">✉️ <a href="mailto:${BUSINESS.email}" style="color:${C.terraDeep};text-decoration:none;">${BUSINESS.email}</a></p>
    <p style="margin:3px 0;color:${C.muted};font-size:13px;">🕑 Lun–Ven 17h–20h · Samedi 10h–20h</p>
  </td></tr></table>`;
}

/** Enveloppe de marque. showContact=true ajoute le bloc coordonnées Lamyae. */
export function emailShell(title: string, innerHtml: string, opts?: { showContact?: boolean }): string {
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;background:${C.cream};padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="text-align:center;padding:6px 0 20px;">
        <span style="font-family:Georgia,serif;font-size:26px;letter-spacing:4px;color:${C.ink};">HOLISYA</span>
        <div style="font-size:10px;letter-spacing:4px;color:${C.sage};margin-top:3px;">BOULOGNE-BILLANCOURT · PARIS</div>
      </div>
      <table role="presentation" width="100%" style="background:${C.paper};border-radius:16px;box-shadow:0 2px 10px rgba(59,49,45,.06);"><tr><td style="padding:34px 30px;">
        ${title ? `<h1 style="margin:0 0 18px;color:${C.ink};font-family:Georgia,serif;font-size:22px;text-align:center;font-weight:normal;">${title}</h1>` : ''}
        ${innerHtml}
      </td></tr></table>
      ${opts?.showContact ? contactBlock() : ''}
      <p style="text-align:center;color:#b3a9a2;font-size:11px;margin-top:18px;">Holisya — approche holistique du bien-être féminin</p>
    </div>
  </div>`;
}

/** Trois actions client sur un rendez-vous : modifier / annuler / message. */
export function appointmentActions(): string {
  const manage = `${SITE_URL}/espace-membre/rendez-vous`;
  const contact = `${SITE_URL}/contact`;
  return `<div style="text-align:center;margin:22px 0 4px;">
    ${emailButton('Modifier', manage)}
    ${emailButton('Annuler', manage, '#b8817a')}
    ${emailButton('Envoyer un message', contact, C.sage)}
  </div>
  <p style="text-align:center;color:${C.muted};font-size:12px;margin:6px 0 0;">Besoin d'aide ? Répondez simplement à cet email.</p>`;
}

/** Email de confirmation / demande de RDV. */
export function appointmentEmail(opts: { confirmed: boolean; serviceType: string; whenLabel: string }): string {
  const inner = `
    <p style="color:${C.ink};margin:0 0 4px;">Votre soin</p>
    <p style="color:${C.ink};font-size:18px;font-weight:bold;margin:0 0 10px;">${opts.serviceType}</p>
    <p style="color:${C.terraDeep};font-weight:bold;font-size:17px;margin:0 0 14px;">${opts.whenLabel}</p>
    <p style="color:${C.muted};font-size:13px;margin:0;">${opts.confirmed ? 'Nous avons hâte de vous accueillir.' : 'Nous confirmerons votre créneau très rapidement.'}</p>
    ${appointmentActions()}`;
  return emailShell(opts.confirmed ? 'Rendez-vous confirmé 🌸' : 'Demande enregistrée 🌸', inner, { showContact: true });
}

/** Email de remerciement post-soin + invitation à laisser un avis Google. */
export function thankYouReviewEmail(opts: { firstName: string; serviceType?: string }): string {
  const inner = `
    <p style="color:${C.ink};">Bonjour ${opts.firstName || ''},</p>
    <p style="color:${C.ink};">Un grand merci d'avoir choisi Holisya pour votre soin${opts.serviceType ? ` « ${opts.serviceType} »` : ''}. Ce fut un plaisir de prendre soin de vous. 🌸</p>
    <p style="color:${C.ink};">J'espère vous revoir très vite pour prolonger ce moment de bien-être.</p>
    <p style="color:${C.ink};">Si vous avez apprécié votre expérience, votre avis sur Google m'aiderait énormément et aiderait d'autres femmes à découvrir Holisya. Cela ne prend qu'une minute :</p>
    <div style="text-align:center;margin:22px 0;">
      ${emailButton('⭐ Laisser un avis sur Google', BUSINESS.googleReviewUrl)}
    </div>
    <div style="text-align:center;margin:6px 0 0;">
      ${emailButton('Reprendre rendez-vous', `${SITE_URL}/rendez-vous`, C.sage)}
    </div>
    <p style="color:${C.muted};font-size:13px;margin-top:18px;">Avec toute ma gratitude,<br/>${BUSINESS.practitioner}</p>`;
  return emailShell('Merci pour votre visite 🌸', inner, { showContact: true });
}

/** Jolie carte cadeau envoyée au destinataire. */
export function giftCardEmail(opts: { recipientName?: string; amount: number; code: string; expiresAt: Date; personalMessage?: string; fromName?: string }): string {
  const validUntil = opts.expiresAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const inner = `
    <p style="color:${C.ink};">${opts.recipientName ? `Bonjour ${opts.recipientName},` : 'Bonjour,'}</p>
    <p style="color:${C.ink};">Une jolie attention vous attend${opts.fromName ? ` de la part de ${opts.fromName}` : ''} : une carte cadeau Holisya pour un moment de bien-être rien qu'à vous. 🌸</p>
    <table role="presentation" width="100%" style="margin:22px 0;border-collapse:separate;">
      <tr><td style="background:linear-gradient(135deg,#D6A491,#AC6A52);border-radius:18px;padding:28px 24px;text-align:center;">
        <div style="font-family:Georgia,serif;letter-spacing:4px;color:#fff;font-size:18px;">HOLISYA</div>
        <div style="color:#ffffff;opacity:.85;font-size:11px;letter-spacing:2px;margin-top:2px;">CARTE CADEAU</div>
        <div style="font-family:Georgia,serif;color:#fff;font-size:44px;font-weight:bold;margin:14px 0 6px;">${opts.amount} €</div>
        <div style="display:inline-block;background:rgba(255,255,255,.9);color:#8a4f3c;font-weight:bold;letter-spacing:2px;padding:8px 16px;border-radius:8px;font-size:15px;">${opts.code}</div>
        <div style="color:#fff;opacity:.9;font-size:12px;margin-top:14px;">Valable jusqu'au ${validUntil}</div>
      </td></tr>
    </table>
    ${opts.personalMessage ? `<div style="background:${C.cream};border-left:3px solid ${C.terra};border-radius:8px;padding:14px 16px;margin:0 0 12px;"><p style="margin:0;color:${C.ink};font-style:italic;">« ${opts.personalMessage} »</p></div>` : ''}
    <p style="color:${C.muted};font-size:13px;">Pour en profiter, présentez ce code lors de votre rendez-vous ou saisissez-le lors de votre réservation en ligne.</p>
    <div style="text-align:center;margin:18px 0 0;">${emailButton('Prendre rendez-vous', `${SITE_URL}/rendez-vous`)}</div>`;
  return emailShell('Vous avez reçu une carte cadeau 🎁', inner, { showContact: true });
}

/** Email confirmant l'encaissement (utilisation) d'une carte cadeau. */
export function giftCardRedeemedEmail(opts: { amount: number; code: string; remaining: number }): string {
  const inner = `
    <p style="color:${C.ink};">Bonjour,</p>
    <p style="color:${C.ink};">Nous vous confirmons l'utilisation de votre carte cadeau Holisya.</p>
    <table role="presentation" width="100%" style="margin:16px 0;background:${C.cream};border-radius:12px;"><tr><td style="padding:18px 20px;">
      <p style="margin:4px 0;color:${C.ink};"><strong>Carte :</strong> ${opts.code}</p>
      <p style="margin:4px 0;color:${C.ink};"><strong>Montant utilisé :</strong> ${opts.amount} €</p>
      <p style="margin:4px 0;color:${C.ink};"><strong>Solde restant :</strong> ${opts.remaining} €</p>
    </td></tr></table>
    <p style="color:${C.muted};font-size:13px;">${opts.remaining > 0 ? 'Votre solde restant est utilisable lors d\'un prochain soin.' : 'Votre carte est désormais totalement utilisée. Merci de votre confiance. 🌸'}</p>`;
  return emailShell('Carte cadeau utilisée', inner, { showContact: true });
}
