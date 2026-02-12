 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 export async function POST(request: NextRequest) {
   try {
     const body = await request.json();
     const { id } = body || {};
     if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
     const { error } = await supabase.from('projects').delete().eq('id', id);
     if (error) return NextResponse.json({ error: error.message }, { status: 500 });
     return NextResponse.json({ ok: true }, { status: 200 });
   } catch {
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
 }
