export const EMAIL_VARIABLES = [
  { key: 'prenom', label: 'Prénom' },
  { key: 'nom', label: 'Nom' },
  { key: 'email', label: 'Email' },
];

export function renderTemplate(text: string, vars: Record<string, string>): string {
  return (text ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? '');
}

export function withUnsubscribeFooter(html: string, unsubscribeUrl: string): string {
  return `${html}
    <div style="max-width: 600px; margin: 24px auto 0; text-align: center; font-size: 11px; color: #999;">
      <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Se désinscrire de ces emails</a>
    </div>`;
}
