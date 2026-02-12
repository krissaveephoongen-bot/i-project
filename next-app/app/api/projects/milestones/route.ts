 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 export async function GET(request: NextRequest) {
   try {
     const { searchParams } = new URL(request.url);
     const projectId = searchParams.get('projectId');
     if (!projectId) {
       return NextResponse.json({ error: 'projectId required' }, { status: 400 });
     }
    const { data, error } = await supabase
      .from('milestones')
      .select('id,title,amount,dueDate,actualDate,invoiceDate,planReceivedDate,receiptDate,status,progress,notes')
       .eq('projectId', projectId)
       .order('dueDate', { ascending: true });
     if (error) return NextResponse.json([], { status: 200 });
    const rows = (data || []).map((m: any) => ({
       id: m.id,
       name: m.title,
       percentage: m.progress,
       amount: m.amount,
      due_date: m.dueDate,
      actual_date: m.actualDate,
      invoice_date: m.invoiceDate,
      plan_received_date: m.planReceivedDate,
      receipt_date: m.receiptDate,
       status: m.status,
       note: m.notes,
     }));
     return NextResponse.json(rows, { status: 200 });
   } catch {
     return NextResponse.json([], { status: 200 });
   }
 }
