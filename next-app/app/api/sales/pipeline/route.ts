import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
   const { data: pipelines } = await supabase.from('sales_pipelines').select('id,name,updatedAt').order('updatedAt', { ascending: false }).limit(1);
   let pipeline = (pipelines || [])[0] || null;
   if (!pipeline) {
     const id = crypto.randomUUID();
     const defStages = [
       { name: 'Lead', order_index: 1, probability: 10 },
       { name: 'Qualified', order_index: 2, probability: 25 },
       { name: 'Proposal', order_index: 3, probability: 50 },
       { name: 'Negotiation', order_index: 4, probability: 75 },
       { name: 'Won', order_index: 5, probability: 100 },
       { name: 'Lost', order_index: 6, probability: 0 },
     ];
     await supabase.from('sales_pipelines').insert({ id, name: 'Default Pipeline', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
     await supabase.from('sales_stages').insert(defStages.map(s => ({ id: crypto.randomUUID(), pipeline_id: id, name: s.name, order_index: s.order_index, probability: s.probability, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })));
     pipeline = { id, name: 'Default Pipeline', updatedAt: new Date().toISOString() };
   }
   const { data: stages } = await supabase.from('sales_stages').select('id,name,order_index,probability').eq('pipeline_id', pipeline.id).order('order_index', { ascending: true });
   const normalized = (stages || []).map((s: any) => ({ id: s.id, name: s.name, order: Number(s.order_index || 0), probability: Number(s.probability || 0) }));
   return ok({ pipeline, stages: normalized }, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, stages } = body;
    
    if (!name) return err('Pipeline name is required', 400);

    const pipelineId = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error: pError } = await supabase.from('sales_pipelines').insert({
        id: pipelineId,
        name,
        createdAt: now,
        updatedAt: now
    });
    
    if (pError) throw pError;

    if (stages && Array.isArray(stages)) {
        const stagesPayload = stages.map((s: any, idx: number) => ({
            id: crypto.randomUUID(),
            pipeline_id: pipelineId,
            name: s.name,
            order_index: s.order || idx + 1,
            probability: s.probability || 0,
            createdAt: now,
            updatedAt: now
        }));
        const { error: sError } = await supabase.from('sales_stages').insert(stagesPayload);
        if (sError) throw sError;
    }

    return ok({ id: pipelineId, name }, 201);
  } catch (e: any) {
    return err(e?.message || 'Failed to create pipeline', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, stages } = body;
    
    if (!id) return err('Pipeline ID required', 400);

    const now = new Date().toISOString();

    if (name) {
        const { error } = await supabase.from('sales_pipelines').update({ name, updatedAt: now }).eq('id', id);
        if (error) throw error;
    }

    if (stages && Array.isArray(stages)) {
        // Simple strategy: upsert (update if id exists, insert if not)
        // But for stages deletion, we might need a diff strategy or just allow adding/updating here.
        // For simplicity, let's just upsert provided stages.
        for (const s of stages) {
            if (s.id) {
                await supabase.from('sales_stages').update({ 
                    name: s.name, 
                    order_index: s.order, 
                    probability: s.probability,
                    updatedAt: now 
                }).eq('id', s.id);
            } else {
                await supabase.from('sales_stages').insert({
                    id: crypto.randomUUID(),
                    pipeline_id: id,
                    name: s.name,
                    order_index: s.order,
                    probability: s.probability || 0,
                    createdAt: now,
                    updatedAt: now
                });
            }
        }
    }

    return ok({ success: true }, 200);
  } catch (e: any) {
    return err(e?.message || 'Failed to update pipeline', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get('id');
    if (!id) return err('ID required', 400);

    // Cascade delete is usually handled by DB, but let's be explicit if needed.
    // Our schema defines foreign keys, so if ON DELETE CASCADE is set, deleting pipeline deletes stages/deals.
    // If not, we might fail. Let's assume standard behavior or try deleting stages first.
    
    // Delete stages first to be safe
    await supabase.from('sales_stages').delete().eq('pipeline_id', id);
    
    // Delete pipeline
    const { error } = await supabase.from('sales_pipelines').delete().eq('id', id);
    if (error) throw error;

    return ok({ success: true }, 200);
  } catch (e: any) {
    return err(e?.message || 'Failed to delete pipeline', 500);
  }
}
