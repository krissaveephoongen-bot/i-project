 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 import { firstOk, PROJECT_ID_COLUMNS } from '../../_lib/supabaseCompat';
 
 export async function GET(request: NextRequest) {
   try {
     const { searchParams } = new URL(request.url);
     const projectId = searchParams.get('projectId');
     if (!projectId) {
       return NextResponse.json({ error: 'projectId required' }, { status: 400 });
     }
    let res: any = null;
    for (const orderCol of ['due_date', 'dueDate']) {
      res = await firstOk(PROJECT_ID_COLUMNS, (col) =>
        supabase
          .from('milestones')
          .select('*')
          .eq(col, projectId)
          .order(orderCol, { ascending: true })
      );
      if (!res?.error) break;
    }
    const { data, error } = res as any;
     if (error) return NextResponse.json([], { status: 200 });
    const rows = (data || []).map((m: any) => ({
       id: m.id,
       name: m.title ?? m.name ?? '',
       percentage: Number(m.progress ?? m.percentage ?? 0),
       amount: Number(m.amount ?? 0),
       due_date: m.due_date ?? m.dueDate ?? null,
       actual_date: m.actual_date ?? m.actualDate ?? null,
       invoice_date: m.invoice_date ?? m.invoiceDate ?? null,
       plan_received_date: m.plan_received_date ?? m.planReceivedDate ?? null,
       receipt_date: m.receipt_date ?? m.receiptDate ?? null,
       status: m.status ?? 'pending',
       note: m.notes ?? m.note ?? null,
     }));
     return NextResponse.json(rows, { status: 200 });
   } catch {
     return NextResponse.json([], { status: 200 });
   }
 }
