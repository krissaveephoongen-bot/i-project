 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 export async function POST(request: NextRequest) {
   try {
    const body = await request.json();
    const { projectId, project_id, name, percentage = 0, amount = 0, dueDate, due_date, actualDate, actual_date, invoiceDate, invoice_date, planReceivedDate, plan_received_date, receiptDate, receipt_date, status = 'pending', note, notes } = body || {};
     const pid = project_id ?? projectId;
     if (!pid || !name) return NextResponse.json({ error: 'projectId and name required' }, { status: 400 });
     const nowIso = new Date().toISOString();
     const snakePayload: any = {
       project_id: pid,
       title: name,
       progress: percentage,
       amount,
       due_date: due_date ?? dueDate ?? null,
       actual_date: actual_date ?? actualDate ?? null,
       invoice_date: invoice_date ?? invoiceDate ?? null,
       plan_received_date: plan_received_date ?? planReceivedDate ?? null,
       receipt_date: receipt_date ?? receiptDate ?? null,
       status,
       notes: note ?? notes ?? null,
       created_at: nowIso,
       updated_at: nowIso,
     };
     const camelPayload: any = {
       projectId: pid,
       title: name,
       progress: percentage,
       amount,
       dueDate: due_date ?? dueDate ?? null,
       actualDate: actual_date ?? actualDate ?? null,
       invoiceDate: invoice_date ?? invoiceDate ?? null,
       planReceivedDate: plan_received_date ?? planReceivedDate ?? null,
       receiptDate: receipt_date ?? receiptDate ?? null,
       status,
       notes: note ?? notes ?? null,
       created_at: nowIso,
       updated_at: nowIso,
     };

     let data: any = null;
     let error: any = null;
     for (const p of [snakePayload, camelPayload]) {
       const res = await supabase.from('milestones').insert(p).select('*').limit(1);
       data = res.data;
       error = res.error;
       if (!error) break;
       const msg = `${error.message || ''}`;
       if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
       break;
     }
     if (error) return NextResponse.json({ error: error.message }, { status: 500 });
     return NextResponse.json((data || [])[0], { status: 200 });
   } catch {
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
 }
