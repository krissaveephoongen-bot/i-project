import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET() {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role, department, position')
      .limit(10);
    
    return NextResponse.json({
      sample: users || [],
      total: users?.length || 0
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
