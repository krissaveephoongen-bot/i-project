 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 export async function POST(request: NextRequest) {
   try {
    const body = await request.json();
    const { projectId, name, percentage = 0, amount = 0, dueDate, actualDate, invoiceDate, planReceivedDate, receiptDate, status = 'pending', note } = body || {};
     if (!projectId || !name) return NextResponse.json({ error: 'projectId and name required' }, { status: 400 });
    const payload = {
       projectId,
       title: name,
       progress: percentage,
       amount,
       dueDate,
      actualDate,
      invoiceDate,
      planReceivedDate,
      receiptDate,
       status,
       notes: note,
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
     };
     const { data, error } = await supabase.from('milestones').insert(payload).select('*').limit(1);
     if (error) return NextResponse.json({ error: error.message }, { status: 500 });
     return NextResponse.json((data || [])[0], { status: 200 });
   } catch {
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
 }
