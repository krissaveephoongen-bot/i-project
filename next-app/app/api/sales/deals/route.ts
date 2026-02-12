import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
 
export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const pipelineId = u.searchParams.get('pipelineId');
    const stageId = u.searchParams.get('stageId');
    const status = u.searchParams.get('status');
    const q = u.searchParams.get('q');
    const minAmount = u.searchParams.get('minAmount');
    const maxAmount = u.searchParams.get('maxAmount');
    const ownerId = u.searchParams.get('ownerId');
    const clientId = u.searchParams.get('clientId');
    let query = supabase.from('sales_deals').select('*');
    if (pipelineId) query = query.eq('pipeline_id', pipelineId);
    if (stageId) query = query.eq('stage_id', stageId);
    if (status) query = query.eq('status', status);
    if (ownerId) query = query.eq('owner_id', ownerId);
    if (clientId) query = query.eq('client_id', clientId);
    if (minAmount) query = query.gte('amount', Number(minAmount));
    if (maxAmount) query = query.lte('amount', Number(maxAmount));
    if (q) query = query.or(`name.ilike.%${q}%,client_org.ilike.%${q}%`);
    const { data: deals, error } = await query.order('updatedAt', { ascending: false });
    if (error) return err(error.message || 'error', 500);
    const ownerIds = Array.from(new Set((deals || []).map((d: any) => d.owner_id).filter(Boolean)));
    const clientIds = Array.from(new Set((deals || []).map((d: any) => d.client_id).filter(Boolean)));
    const ownerQuery: any = ownerIds.length ? supabase.from('users').select('id,name').in('id', ownerIds) : { data: [] };
    const clientQuery: any = clientIds.length ? supabase.from('clients').select('id,name').in('id', clientIds) : { data: [] };
    const [{ data: owners }, { data: clients }] = await Promise.all([ownerQuery, clientQuery]);
    const oname: any = {};
    (owners || []).forEach((o: any) => { oname[o.id] = o.name; });
    const cname: any = {};
    (clients || []).forEach((c: any) => { cname[c.id] = c.name; });
    const rows = (deals || []).map((d: any) => ({
      id: d.id,
      pipeline_id: d.pipeline_id,
      stage_id: d.stage_id,
      name: d.name,
      amount: Number(d.amount || 0),
      currency: d.currency,
      owner_id: d.owner_id || null,
      client_id: d.client_id || null,
      client_org: d.client_org || null,
      status: d.status,
      probability: Number(d.probability || 0),
      created_at: d.createdAt || d.created_at,
      updated_at: d.updatedAt || d.updated_at,
      owner_name: d.owner_id ? oname[d.owner_id] : null,
      client_name: d.client_id ? cname[d.client_id] : (d.client_org || null),
    }));
    return ok(rows, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
 
 export async function POST(req: NextRequest) {
   try {
     const body = await req.json();
     const id = crypto.randomUUID();
     const {
      name, amount = 0, currency = 'THB', pipeline_id, stage_id, owner_id, client_id, client_org, status = 'open', probability = 0
     } = body || {};
     if (!pipeline_id || !name) return err('name and pipeline_id required', 400);
    const payload = {
      id,
      name,
      amount,
      currency,
      pipeline_id,
      stage_id: stage_id || null,
      owner_id: owner_id || null,
      client_id: client_id || null,
      client_org: client_org || null,
      status,
      probability,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { error } = await supabase.from('sales_deals').insert(payload);
    if (error) return err(error.message || 'error', 500);
    return ok({ id }, 200);
   } catch (e: any) {
     return err(e?.message || 'error', 500);
   }
 }
