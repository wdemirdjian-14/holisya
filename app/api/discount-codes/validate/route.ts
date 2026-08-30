export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.toUpperCase() ?? '';
    const amount = parseFloat(searchParams.get('amount') ?? '0');
    if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 });
    const dc = await prisma.discountCode.findUnique({ where: { code } });
    if (!dc) return NextResponse.json({ valid: false, error: 'Code invalide' });
    if (!dc.isActive) return NextResponse.json({ valid: false, error: 'Code désactivé' });
    if (dc.expiresAt && dc.expiresAt < new Date()) return NextResponse.json({ valid: false, error: 'Code expiré' });
    if (dc.maxUses > 0 && dc.currentUses >= dc.maxUses) return NextResponse.json({ valid: false, error: 'Code épuisé' });
    if (dc.minPurchase > 0 && amount < dc.minPurchase) return NextResponse.json({ valid: false, error: `Minimum ${dc.minPurchase}€ requis` });
    return NextResponse.json({ valid: true, type: dc.type, value: dc.value, description: dc.description });
  } catch (error: any) {
    console.error('Validate discount error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
