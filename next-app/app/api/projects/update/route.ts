
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Update Project Request:', body);
    
    const { id, updatedFields = {} } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const allowed = ['name','code','description','status','progress','endDate','budget','managerId','clientId','priority','category', 'riskLevel', 'spi', 'spent', 'remaining', 'progressPlan'];
    const payload: any = {};
    for (const k of allowed) {
      if (k in updatedFields) payload[k] = updatedFields[k];
    }
    payload.updated_at = new Date().toISOString();
    
    console.log('Update Payload:', payload);

    const { data, error } = await supabase.from('projects').update(payload).eq('id', id).select('*').limit(1);
    if (error) {
      console.error('Supabase Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track Progress History if progress changed
    if ('progress' in updatedFields) {
      const progress = Number(updatedFields.progress);
      if (!isNaN(progress)) {
        await supabase.from('project_progress_history').insert({
          projectId: id,
          progress: progress,
          weekDate: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
    }

    console.log('Update Success:', data);
    return NextResponse.json((data || [])[0] || {}, { status: 200 });
  } catch (e: any) {
    console.error('Update Project Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
