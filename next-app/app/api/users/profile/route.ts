import { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
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
      isActive: user.isActive ?? true,
      isDeleted: user.isDeleted ?? false,
      hourlyRate: Number(user.hourlyRate ?? 0),
      employeeCode: user.employeeCode,
      name_th: user.name_th,
      failedLoginAttempts: user.failedLoginAttempts,
      lastLogin: user.lastLogin,
      lockedUntil: user.lockedUntil,
      resetToken: user.resetToken,
      resetTokenExpiry: user.resetTokenExpiry,
      isProjectManager: user.isProjectManager ?? false,
      isSupervisor: user.isSupervisor ?? false,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    const { data: allProjects } = await supabase.from('projects').select('*');
    const { data: allTasks } = await supabase.from('tasks').select('*');
    const { data: entries } = await supabase
      .from('time_entries')
      .select('id,date,hours,projectId,userId')
      .eq('userId', userId || '');
    const myProjects = (allProjects || []).filter((p: any) => String(p.managerId || '') === String(userId || ''));
    const myTasks = (allTasks || []).filter((t: any) => String(t.assignedTo || '') === String(userId || ''));
    const stats = {
      totalProjects: myProjects.length,
      activeProjects: myProjects.filter((p: any) => ['in_progress','active','ongoing'].includes(String(p.status || '').toLowerCase())).length,
      totalTasks: myTasks.length,
      completedTasks: myTasks.filter((t: any) => t.status === 'done').length,
      totalHours: (entries || []).reduce((s: number, e: any) => s + Number(e.hours || 0), 0),
      totalEarnings: (entries || []).reduce((s: number, e: any) => s + Number(e.hours || 0), 0) * Number(user.hourlyRate || 0)
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
    const { password, id, createdAt, ...safeUpdates } = updates || {};
    const payload: any = {};
    const fields = ['name','email','role','status','department','position','avatar','phone','timezone','hourlyRate','isActive','isDeleted','employeeCode','name_th'];
    for (const f of fields) {
      if (f in safeUpdates) {
        let val = (safeUpdates as any)[f];
        if (f === 'hourlyRate') val = Number(val || 0);
        if (f === 'phone') val = String(val || '').replace(/\r?\n/g, '');
        payload[f] = val;
      }
    }
    payload.updatedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select('id,name,email,role,status,department,position,avatar,phone,timezone,isActive,isDeleted,hourlyRate,employeeCode,name_th,createdAt,updatedAt')
      .limit(1);
    if (error) return err(error.message || 'update failed', 500);
    return ok({ user: (data || [])[0] || {}, message: 'Profile updated successfully' }, 200);
  } catch (error: any) {
    return err(error?.message || 'Internal server error', 500);
  }
}
