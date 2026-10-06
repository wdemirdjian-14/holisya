import crypto from 'crypto';

/**
 * Authentification Google via compte de service (lecture GA4 Data API + Search Console).
 * Les identifiants viennent des variables d'environnement (jamais commités) :
 *   GOOGLE_SA_EMAIL        = xxx@projet.iam.gserviceaccount.com
 *   GOOGLE_SA_PRIVATE_KEY  = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
 * On signe un JWT RS256 (sans dépendance externe) puis on l'échange contre un access token.
 */

export const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

export function getServiceAccount(): { email: string; key: string } | null {
  const email = process.env.GOOGLE_SA_EMAIL;
  let key = process.env.GOOGLE_SA_PRIVATE_KEY;
  if (!email || !key) return null;
  // Les clés stockées en .env ont souvent des \n échappés.
  key = key.replace(/\\n/g, '\n').trim();
  if (!key.includes('BEGIN PRIVATE KEY')) return null;
  return { email, key };
}

export function isConfigured(): boolean {
  return getServiceAccount() !== null;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

let cache: { token: string; exp: number } | null = null;

export async function getAccessToken(): Promise<string | null> {
  const sa = getServiceAccount();
  if (!sa) return null;
  const now = Math.floor(Date.now() / 1000);
  if (cache && cache.exp > now + 60) return cache.token;

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.email,
    scope: SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  let signature: string;
  try {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(`${header}.${claim}`);
    signature = b64url(signer.sign(sa.key));
  } catch (e) {
    console.error('[seo] signature JWT échouée', e);
    return null;
  }
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!res.ok) {
    console.error('[seo] échange token échoué', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data: any = await res.json();
  cache = { token: data.access_token, exp: now + (data.expires_in ?? 3600) };
  return data.access_token;
}
