import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin client not initialized' }, { status: 500 });

    const { id } = params;
    const body = await req.json();
    
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name) updates.name = body.name;
    if (body.role) updates.role = body.role;
    if (body.department) updates.department = body.department;
    if (body.position) updates.position = body.position;
    
    // Handle boolean toggles explicitly
    if (typeof body.is_active === 'boolean') {
        updates.is_active = body.is_active;
        updates.status = body.is_active ? 'active' : 'inactive';
    }

    // Password reset
    if (body.password) {
        updates.password = await bcrypt.hash(body.password, 10);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Soft delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin client not initialized' }, { status: 500 });

    const { id } = params;

    // Soft delete
    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        is_deleted: true, 
        is_active: false,
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
