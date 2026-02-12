import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';
 
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
