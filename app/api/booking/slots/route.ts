export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getSlotsForDate } from '@/lib/booking-server';

export async function GET(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get('serviceId') ?? '';
    const date = req.nextUrl.searchParams.get('date') ?? '';
    if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ slots: [] });
    const slots = await getSlotsForDate(serviceId, date);
    return NextResponse.json({ slots });
  } catch (error: any) { console.error(error); return NextResponse.json({ slots: [] }); }
}
