import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Logo blanc HOLISYA (embarqué une seule fois en base64).
let logoDataUri = '';
function getLogo(): string {
  if (logoDataUri) return logoDataUri;
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', 'images', 'logo-holisya.png'));
    logoDataUri = `data:image/png;base64,${buf.toString('base64')}`;
  } catch { logoDataUri = ''; }
  return logoDataUri;
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Découpe un message en lignes (max ~34 caractères, 3 lignes).
function wrap(text: string, max = 34, maxLines = 3): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
    if (lines.length >= maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) lines[maxLines - 1] += '…';
  return lines;
}

export async function renderGiftCardPng(card: {
  amount: number; code: string; expiresAt: Date | string; personalMessage?: string; recipientName?: string; remaining?: number;
}): Promise<Buffer> {
  const W = 1000, H = 1180;
  const bg = '#0D1A13';
  const line = 'rgba(244,239,230,0.55)';
  const white = '#F6EFE6';
  const validUntil = new Date(card.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const partial = typeof card.remaining === 'number' && card.remaining < card.amount;
  const serif = "Georgia, 'Times New Roman', 'DejaVu Serif', serif";

  const logo = getLogo();
  const logoW = 460, logoH = Math.round(logoW / 3.37), logoX = (W - logoW) / 2, logoY = 250;

  const code = esc(card.code);
  const pillW = Math.min(760, Math.max(300, code.length * 17 + 60));
  const pillX = (W - pillW) / 2, pillY = 742, pillH = 58;

  const msg = (card.personalMessage || '').trim();
  const msgLines = msg ? wrap(msg) : [];
  const msgSvg = msgLines.length
    ? `<text x="${W / 2}" y="900" font-family="${serif}" font-size="26" fill="${white}" fill-opacity="0.9" font-style="italic" text-anchor="middle">`
      + msgLines.map((l, i) => {
        const prefix = i === 0 ? '« ' : '';
        const suffix = i === msgLines.length - 1 ? ' »' : '';
        return `<tspan x="${W / 2}" dy="${i === 0 ? 0 : 38}">${prefix}${esc(l)}${suffix}</tspan>`;
      }).join('')
      + `</text>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <rect x="44" y="44" width="${W - 88}" height="${H - 88}" fill="none" stroke="${line}" stroke-width="2"/>
    ${logo ? `<image href="${logo}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet"/>` : ''}
    <text x="${W / 2}" y="500" font-family="${serif}" font-size="22" letter-spacing="6" fill="${white}" fill-opacity="0.72" text-anchor="middle">CARTE CADEAU</text>
    <text x="${W / 2}" y="640" font-family="${serif}" font-size="112" font-weight="bold" fill="#ffffff" text-anchor="middle">${partial ? (card.remaining as number) : card.amount} €</text>
    ${partial ? `<text x="${W / 2}" y="686" font-family="${serif}" font-size="20" fill="${white}" fill-opacity="0.6" text-anchor="middle">solde restant · carte de ${card.amount} €</text>` : ''}
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="10" fill="#F8F4EF"/>
    <text x="${W / 2}" y="${pillY + 39}" font-family="'DejaVu Sans Mono', monospace" font-size="26" letter-spacing="2" font-weight="bold" fill="#0D1A13" text-anchor="middle">${code}</text>
    <text x="${W / 2}" y="${pillY + 108}" font-family="${serif}" font-size="22" fill="${white}" fill-opacity="0.82" text-anchor="middle">Valable jusqu'au ${esc(validUntil)}</text>
    ${msgSvg}
    <text x="${W / 2}" y="${H - 70}" font-family="${serif}" font-size="18" letter-spacing="3" fill="${white}" fill-opacity="0.6" text-anchor="middle">BOULOGNE-BILLANCOURT · PARIS</text>
  </svg>`;

  return sharp(Buffer.from(svg), { density: 150 }).png().toBuffer();
}
