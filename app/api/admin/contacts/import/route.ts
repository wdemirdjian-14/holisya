export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findOrCreateUserByEmail } from '@/lib/user-invite';
import * as XLSX from 'xlsx';

function pick(row: Record<string, any>, keys: string[]): string {
  for (const key of Object.keys(row)) {
    if (keys.includes(key.trim().toLowerCase())) return String(row[key] ?? '').trim();
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    let created = 0;
    let existing = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = pick(row, ['email', 'e-mail', 'mail']);
      const firstName = pick(row, ['prenom', 'prénom', 'firstname', 'first_name']);
      const lastName = pick(row, ['nom', 'lastname', 'last_name']);
      const phone = pick(row, ['telephone', 'téléphone', 'phone', 'tel']);

      if (!email || !email.includes('@')) { errors.push(`Ligne ${i + 2}: email manquant ou invalide`); continue; }

      try {
        const { created: wasCreated } = await findOrCreateUserByEmail({ email, firstName, lastName, phone });
        if (wasCreated) created += 1; else existing += 1;
      } catch (e: any) {
        errors.push(`Ligne ${i + 2}: ${e?.message ?? 'erreur'}`);
      }
    }

    return NextResponse.json({ total: rows.length, created, existing, errors });
  } catch (error: any) {
    console.error('Import contacts error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'import' }, { status: 500 });
  }
}
