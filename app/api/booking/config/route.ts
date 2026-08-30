export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBookingSettings } from '@/lib/booking-server';

export async function GET() {
  try {
    const settings = await getBookingSettings();
    const services = settings.onlineBookingEnabled
      ? await prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, description: true, duration: true, price: true, category: true, imageUrl: true } })
      : [];
    return NextResponse.json({
      enabled: settings.onlineBookingEnabled,
      requireCardImprint: settings.requireCardImprint,
      maxAdvanceDays: settings.maxAdvanceDays,
      services,
    });
  } catch (error: any) { console.error(error); return NextResponse.json({ enabled: false, services: [] }); }
}
