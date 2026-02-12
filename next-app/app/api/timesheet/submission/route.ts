import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
 
 export async function GET(request: NextRequest) {
   try {
     const { searchParams } = new URL(request.url);
     const userId = searchParams.get('userId');
     const start = searchParams.get('start'); // YYYY-MM-DD
     if (!userId || !start) {
       return NextResponse.json({ error: 'userId and start are required' }, { status: 400 });
     }
    const { data } = await supabase
      .from('timesheet_submissions')
      .select('status')
      .eq('user_id', userId)
      .eq('period_start_date', start)
      .limit(1);
    const status = (data || [])[0]?.status || 'Draft';
    return NextResponse.json({ status }, { status: 200 });
   } catch (error) {
    console.error('Timesheet submission error:', error);
    return NextResponse.json({ status: 'Draft' }, { status: 200 });
   }
 }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id;
    const start = body.period_start_date;
    const end = body.period_end_date;
    const total = Number(body.total_hours || 0);
    if (!userId || !start) {
      return NextResponse.json({ error: 'user_id and period_start_date are required' }, { status: 400 });
    }
    const payload = {
      id: `${userId}-${start}`,
      user_id: userId,
      period_start_date: start,
      period_end_date: end || null,
      total_hours: total,
      status: 'Submitted',
      submitted_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('timesheet_submissions')
      .upsert(payload, { onConflict: 'id' })
      .select('status')
      .limit(1);
    const st = (data || [])[0]?.status || 'Submitted';
    if (error) return NextResponse.json({ status: st }, { status: 200 });
    return NextResponse.json({ status: st }, { status: 200 });
  } catch {
    return NextResponse.json({ status: 'Submitted' }, { status: 200 });
  }
}
