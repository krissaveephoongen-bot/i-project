import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';
 import { NextRequest } from 'next/server';
 import crypto from 'node:crypto';
 
 export async function GET(req: NextRequest) {
   try {
     const u = new URL(req.url);
     const dealId = u.searchParams.get('dealId');
    let q = supabase.from('sales_activities').select('id,deal_id,type,note,user_id,created_at').limit(100);
    if (dealId) q = q.eq('deal_id', dealId);
    const { data: rows, error } = await q.order('created_at', { ascending: false });
    if (error) return err(error.message || 'error', 500);
    const userIds = Array.from(new Set((rows || []).map((r: any) => r.user_id).filter(Boolean)));
    const { data: users } = userIds.length ? await supabase.from('users').select('id,name').in('id', userIds) : { data: [] };
    const nameMap = Object.fromEntries((users || []).map((u: any) => [u.id, u.name]));
    const result = (rows || []).map((r: any) => ({
      id: r.id,
      dealId: r.deal_id,
      type: r.type,
      note: r.note ?? null,
      userId: r.user_id ?? null,
      created_at: r.created_at,
      user_name: r.user_id ? nameMap[r.user_id] : null
    }));
    return ok(result, 200);
   } catch (e: any) {
     return err(e?.message || 'error', 500);
   }
 }
 
 export async function POST(req: NextRequest) {
   try {
     const body = await req.json();
     const id = crypto.randomUUID();
     const { deal_id, type, note, user_id } = body || {};
     if (!deal_id || !type) return err('deal_id and type required', 400);
    const { data, error } = await supabase.from('sales_activities').insert({
      id,
      deal_id,
      type,
      note: note || null,
      user_id: user_id || null,
      created_at: new Date().toISOString()
    }).select('id').limit(1);
    if (error) return err(error.message || 'error', 500);
    return ok({ id: (data || [])[0]?.id || id }, 200);
   } catch (e: any) {
     return err(e?.message || 'error', 500);
   }
 }
