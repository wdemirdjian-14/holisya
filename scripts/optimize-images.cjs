/**
 * Maintenance : retraite en place les images déjà présentes dans public/uploads.
 * Redimensionne à 1600px max (fit inside, sans agrandir), redresse l'orientation EXIF
 * et ré-encode (JPEG q82 mozjpeg / PNG compressé / WebP q82). Ne touche qu'aux fichiers
 * trop grands (>1600px) ou trop lourds (>500 Ko), et seulement si le résultat est plus léger.
 * Le nom de fichier est conservé → les URLs restent valides.
 *
 * Les NOUVELLES photos sont déjà traitées à l'upload (lib/image-process.ts) ; ce script
 * ne sert qu'à rattraper les images importées avant cette chaîne, ou copiées manuellement.
 *
 * Usage (sur le serveur, depuis la racine du projet) : node scripts/optimize-images.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(process.cwd(), 'public', 'uploads');
const MAX = 1600;
const SIZE_THRESHOLD = 500 * 1024; // 500 Ko
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function walk(dir) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (exts.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

(async () => {
  const files = walk(ROOT);
  let touched = 0, savedBytes = 0, skipped = 0, failed = 0;
  for (const f of files) {
    try {
      const stat = fs.statSync(f);
      const meta = await sharp(f).metadata();
      const tooBig = (meta.width || 0) > MAX || (meta.height || 0) > MAX;
      const tooHeavy = stat.size > SIZE_THRESHOLD;
      if (!tooBig && !tooHeavy) { skipped++; continue; }

      const ext = path.extname(f).toLowerCase();
      let pipe = sharp(f).rotate().resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true });
      if (ext === '.png') pipe = pipe.png({ compressionLevel: 9, palette: true });
      else if (ext === '.webp') pipe = pipe.webp({ quality: 82 });
      else pipe = pipe.jpeg({ quality: 82, mozjpeg: true });
      const buf = await pipe.toBuffer();

      if (buf.length < stat.size) {
        fs.writeFileSync(f, buf);
        savedBytes += stat.size - buf.length;
        touched++;
        console.log(`OK  ${path.relative(ROOT, f)}  ${(stat.size / 1024).toFixed(0)}Ko -> ${(buf.length / 1024).toFixed(0)}Ko  (${meta.width}x${meta.height})`);
      } else {
        skipped++;
      }
    } catch (e) {
      failed++;
      console.log(`ERR ${path.relative(ROOT, f)} : ${e.message}`);
    }
  }
  console.log(`\n=== ${touched} optimisée(s), ${skipped} inchangée(s), ${failed} échec(s), ~${(savedBytes / 1024 / 1024).toFixed(1)} Mo économisés ===`);
})();
