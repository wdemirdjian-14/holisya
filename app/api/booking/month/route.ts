export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getAvailableDaysInMonth } from '@/lib/booking-server';

export async function GET(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get('serviceId') ?? '';
    const year = parseInt(req.nextUrl.searchParams.get('year') ?? '');
    const month = parseInt(req.nextUrl.searchParams.get('month') ?? ''); // 1-based
    if (!serviceId || !year || !month) return NextResponse.json({ days: [] });
    const days = await getAvailableDaysInMonth(serviceId, year, month);
    return NextResponse.json({ days });
  } catch (error: any) { console.error(error); return NextResponse.json({ days: [] }); }
}
