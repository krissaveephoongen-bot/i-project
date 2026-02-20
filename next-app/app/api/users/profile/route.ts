import { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId && !email) return err('User ID or email is required', 400);
    let user: any = null;
    if (userId) {
      const { data } = await supabase.from('users').select('*').eq('id', userId).limit(1);
      user = (data || [])[0] || null;
    } else if (email) {
      const { data } = await supabase.from('users').select('*').ilike('email', String(email)).limit(1);
      user = (data || [])[0] || null;
    }
    if (!user) return err('User not found', 404);
    const profile = {
      id: user.id,
      objectId: user.objectId ?? user.object_id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      phone: String(user.phone || '').replace(/\r?\n/g, ''),
      timezone: user.timezone,
      is_active: user.is_active ?? true,
      is_deleted: user.is_deleted ?? false,
      hourly_rate: Number(user.hourly_rate ?? 0),
      employee_code: user.employee_code,
      name_th: user.name_th,
      failed_login_attempts: user.failed_login_attempts,
      last_login: user.last_login,
      locked_until: user.locked_until,
      reset_token: user.reset_token,
      reset_tokenExpiry: user.reset_tokenExpiry,
      is_project_manager: user.is_project_manager ?? false,
      is_supervisor: user.is_supervisor ?? false,
      notificationPreferences: user.notificationPreferences,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    const { data: allProjects } = await supabase.from('projects').select('*');
    const { data: allTasks } = await supabase.from('tasks').select('*');
    
    let entriesQuery = supabase
      .from('time_entries')
      .select('id,date,hours,projectId,userId')
      .eq('userId', userId || '');

    if (startDate) entriesQuery = entriesQuery.gte('date', startDate);
    if (endDate) entriesQuery = entriesQuery.lte('date', endDate);

    const { data: entries } = await entriesQuery;

    const myProjects = (allProjects || []).filter((p: any) => String(p.managerId || '') === String(userId || ''));
    const myTasks = (allTasks || []).filter((t: any) => String(t.assignedTo || '') === String(userId || ''));
    const stats = {
      totalProjects: myProjects.length,
      activeProjects: myProjects.filter((p: any) => ['in_progress','active','ongoing'].includes(String(p.status || '').toLowerCase())).length,
      totalTasks: myTasks.length,
      completedTasks: myTasks.filter((t: any) => t.status === 'done').length,
      totalHours: (entries || []).reduce((s: number, e: any) => s + Number(e.hours || 0), 0),
      totalEarnings: (entries || []).reduce((s: number, e: any) => s + Number(e.hours || 0), 0) * Number(user.hourly_rate || 0)
    };
    return ok({ profile, stats }, 200);
  } catch (error: any) {
    return err(error?.message || 'Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;
    if (!userId || !updates) return err('User ID and updates are required', 400);
    const { password, id, created_at, ...safeUpdates } = updates || {};
    const payload: any = {};
    const fields = ['name','email','role','status','department','position','avatar','phone','timezone','hourly_rate','is_active','is_deleted','employee_code','name_th'];
    for (const f of fields) {
      if (f in safeUpdates) {
        let val = (safeUpdates as any)[f];
        if (f === 'hourly_rate') val = Number(val || 0);
        if (f === 'phone') val = String(val || '').replace(/\r?\n/g, '');
        payload[f] = val;
      }
    }
    payload.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select('id,name,email,role,status,department,position,avatar,phone,timezone,is_active,is_deleted,hourly_rate,employee_code,name_th,created_at,updated_at')
      .limit(1);
    if (error) return err(error.message || 'update failed', 500);
    return ok({ user: (data || [])[0] || {}, message: 'Profile updated successfully' }, 200);
  } catch (error: any) {
    return err(error?.message || 'Internal server error', 500);
  }
}
