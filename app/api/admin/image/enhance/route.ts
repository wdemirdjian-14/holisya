export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

/**
 * Éclaircit / améliore une image déjà uploadée (sous /uploads/), en place.
 * body: { url: '/uploads/...jpg', brightness?: number (0.5–2), auto?: boolean }
 * Les images externes (CDN) ne sont pas modifiables.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { url, brightness, auto } = await req.json();
    if (typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: "Seules les photos importées sur le site peuvent être éclaircies." }, { status: 400 });
    }
    const abs = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''));
    const publicRoot = path.join(process.cwd(), 'public') + path.sep;
    if (!abs.startsWith(publicRoot)) return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 });

    const buf = await fs.readFile(abs);
    const b = Math.min(2, Math.max(0.5, Number(brightness) || 1.15));
    let pipe = sharp(buf).rotate();
    if (auto) pipe = pipe.normalise();
    pipe = pipe.modulate({ brightness: b, saturation: 1.04 });
    const out = await pipe.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    await fs.writeFile(abs, out);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('image enhance error', error);
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 });
  }
}
