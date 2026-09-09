/**
 * Attribue une image variée et pertinente à chaque article de blog, par thème.
 * - Télécharge des images libres de droit (Unsplash, licence commerciale) dans
 *   public/uploads/blog/, redimensionnées via sharp.
 * - Met à jour BlogPost.imageUrl (round-robin dans le pool du thème → images uniques).
 *
 * Réexécutable : ne re-télécharge pas une image déjà présente, ne réécrit que si l'URL change.
 * Usage (sur le serveur, racine du projet) : node scripts/assign-blog-images.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Pools d'identifiants photo Unsplash (photo-<ID>) par thème.
const POOLS = {
  massage: [ // Kobido + Drainage : massage du visage / soin
    '1598901986949-f593ff2a31a6', '1643684391140-c5056cfd3436', '1616394584738-fc6e612e71b9',
    '1570172619644-dfd03ed5d881', '1706795033728-9232ef548a16', '1731514771613-991a02407132',
    '1761718210089-ba3bb5ccb54f', '1643685276743-1b52832c58d5',
  ],
  food: [ // Nutrition : alimentation saine
    '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd', '1511690656952-34342bb7c2f2',
    '1547592180-85f173990554', '1490645935967-10de6ba17061', '1467453678174-768ec283a940',
    '1644704170910-a0cdf183649b',
  ],
  wellness: [ // Bien-être + Self-care : spa, bougies, détente
    '1621468644467-37e6df96e446', '1621554012422-237bc0b03ed3', '1631014858587-71607fd96391',
    '1621554258209-a4a4305e29e5', '1621554012188-c3f2280703c3', '1707839568483-9f1924d5f5de',
    '1706795033917-dee116e7cba2', '1619695663382-ba3916f2d79f',
  ],
};

const CAT2POOL = {
  Kobido: 'massage', Drainage: 'massage', Nutrition: 'food',
  'Bien-être': 'wellness', 'Self-care': 'wellness',
};

const DIR = path.join(process.cwd(), 'public', 'uploads', 'blog');

async function download(id) {
  const dest = path.join(DIR, `unsplash-${id}.jpg`);
  const rel = `/uploads/blog/unsplash-${id}.jpg`;
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) return rel;
  const url = `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop&fm=jpg&q=80`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = await sharp(buf).resize(1200, 800, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  fs.writeFileSync(dest, out);
  return rel;
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });

  // 1) Téléchargement (uniquement ce qui manque)
  const local = {}; // id -> chemin relatif
  for (const pool of Object.keys(POOLS)) {
    for (const id of POOLS[pool]) {
      try { local[id] = await download(id); process.stdout.write('.'); }
      catch (e) { console.log(`\nimg FAIL ${id}: ${e.message}`); }
    }
  }
  console.log('\nImages prêtes.');

  // 2) Attribution par thème (round-robin, images uniques tant que le pool n'est pas épuisé)
  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: 'asc' } });
  const counter = { massage: 0, food: 0, wellness: 0 };
  let updated = 0;
  for (const p of posts) {
    const pool = CAT2POOL[p.category] || 'wellness';
    const ids = POOLS[pool].filter((id) => local[id]);
    if (!ids.length) continue;
    const rel = local[ids[counter[pool] % ids.length]];
    counter[pool]++;
    if (p.imageUrl !== rel) {
      await prisma.blogPost.update({ where: { id: p.id }, data: { imageUrl: rel } });
      updated++;
      console.log(`[${p.category}] ${p.slug} -> ${rel}`);
    }
  }
  console.log(`\n=== ${updated} article(s) mis à jour ===`);
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
