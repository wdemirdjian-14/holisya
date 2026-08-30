export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Get services error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
