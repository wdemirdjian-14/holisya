import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Détecte un fichier HEIC/HEIF (photos iPhone) par ses octets d'en-tête.
function isHeic(buf: Buffer, mime?: string): boolean {
  if (mime && /heic|heif/i.test(mime)) return true;
  if (buf.length < 12) return false;
  const box = buf.toString('ascii', 4, 8);
  const brand = buf.toString('ascii', 8, 12);
  return box === 'ftyp' && ['heic', 'heix', 'mif1', 'heif', 'hevc', 'msf1'].includes(brand);
}

// Traite n'importe quelle photo (y compris HEIC iPhone) : conversion en JPEG,
// redressement selon l'orientation EXIF, redimensionnement web. Renvoie le nom de fichier.
export async function processAndSaveImage(opts: {
  input: Buffer;
  mime?: string;
  destDir: string;
  baseName: string;
  maxSize?: number;
  quality?: number;
}): Promise<string> {
  const { input, mime, destDir, baseName, maxSize = 1600, quality = 82 } = opts;

  let working = input;
  if (isHeic(input, mime)) {
    const heicConvert = (await import('heic-convert')).default as any;
    const out = await heicConvert({ buffer: input, format: 'JPEG', quality: 0.92 });
    working = Buffer.from(out);
  }

  const processed = await sharp(working, { failOn: 'none' })
    .rotate() // applique l'orientation EXIF puis la supprime
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  await mkdir(destDir, { recursive: true });
  const filename = `${baseName}.jpg`;
  await writeFile(path.join(destDir, filename), processed);
  return filename;
}
