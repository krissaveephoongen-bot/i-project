 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 export async function POST(request: NextRequest) {
   try {
     const body = await request.json();
     const { id, updatedFields = {} } = body || {};
     if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const map: any = {
       name: 'title',
       percentage: 'progress',
       amount: 'amount',
       due_date: 'dueDate',
      actual_date: 'actualDate',
      invoice_date: 'invoiceDate',
      plan_received_date: 'planReceivedDate',
      receipt_date: 'receiptDate',
       status: 'status',
       note: 'notes',
     };
     const payload: any = {};
     for (const k of Object.keys(map)) {
       if (k in updatedFields) payload[map[k]] = updatedFields[k];
     }
     payload.updatedAt = new Date().toISOString();
     const { data, error } = await supabase.from('milestones').update(payload).eq('id', id).select('*').limit(1);
     if (error) return NextResponse.json({ error: error.message }, { status: 500 });
     return NextResponse.json((data || [])[0], { status: 200 });
   } catch {
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
 }
