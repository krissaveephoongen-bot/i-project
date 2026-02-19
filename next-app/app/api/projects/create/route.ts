
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import redis from '@/lib/redis';
import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });

    const body = await request.json();
    const {
      id,
      name,
      code,
      description,
      status = 'in_progress',
      progress = 0,
      startDate,
      start_date,
      endDate,
      end_date,
      budget = 0,
      managerId,
      manager_id,
      clientId,
      client_id,
      priority = 'medium',
      category,
      milestones = [],
      members = [],
      tasks = [],
      contacts = []
    } = body || {};

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const projectId = id ?? crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const start = start_date ?? startDate ?? null;
    const end = end_date ?? endDate ?? null;
    const manager = manager_id ?? managerId ?? null;
    const client = client_id ?? clientId ?? null;

    const payload: any = {
      id: projectId,
      name,
      code: code || null,
      description: description || null,
      status,
      progress: Number(progress ?? 0),
      progress_plan: 0,
      start_date: start,
      end_date: end,
      budget: Number(budget ?? 0),
      spent: 0,
      spi: 1.0,
      cpi: 1.0,
      client_id: client,
      manager_id: manager,
      category: category || null,
      is_archived: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { error: createErr } = await supabaseAdmin.from('projects').insert([payload]);
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });

    const project_id = projectId;

    // Handle milestones if any
    if (Array.isArray(milestones) && milestones.length > 0) {
      const msPayloads = milestones.map((m: any) => ({
        project_id,
        name: m.name || '',
        percentage: Number(m.percentage || 0),
        amount: Number(m.amount || 0),
        dueDate: m.dueDate || null,
        status: m.status || 'Pending',
        created_at: nowIso,
        updated_at: nowIso
      }));

      const { error: msError } = await supabaseAdmin
        .from('milestones')
        .insert(msPayloads);
        
      if (msError) console.error('Error creating milestones:', msError);
    }

    // Handle team members (roles) if provided
    if (Array.isArray(members) && members.length > 0) {
      const memberPayloads = members
        .filter((m: any) => m?.user_id && m?.role)
        .map((m: any) => ({
          project_id,
          user_id: m.user_id,
          role: m.role,
          joinedAt: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        }));
      if (memberPayloads.length > 0) {
        const { error: memErr } = await supabaseAdmin
          .from('project_members')
          .insert(memberPayloads);
        if (memErr) console.error('Error creating project members:', memErr);
      }
    }

    // Handle Tasks (with Weights) and Generate Plan Points
    if (Array.isArray(tasks) && tasks.length > 0) {
        const taskPayloads = tasks.map((t: any) => ({
            project_id,
            title: t.title,
            description: t.description || null,
            status: 'todo',
            priority: t.priority || 'medium',
            weight: Number(t.weight || 0),
            startDate: t.startDate || null,
            dueDate: t.dueDate || null,
            createdBy: 'system', // or current user if available
            created_at: nowIso,
            updated_at: nowIso
        }));
        
        const { data: createdTasks, error: taskErr } = await supabaseAdmin
            .from('tasks')
            .insert(taskPayloads)
            .select();
            
        if (taskErr) {
             console.error('Error creating tasks:', taskErr);
        } else if (createdTasks && createdTasks.length > 0) {
            // Generate Task Plan Points for S-Curve
            const planPoints: any[] = [];
            
            createdTasks.forEach((task: any) => {
                const weight = Number(task.weight || 0);
                if (weight > 0 && task.startDate && task.dueDate) {
                    const start = new Date(task.startDate);
                    const end = new Date(task.dueDate);
                    const durationMs = end.getTime() - start.getTime();
                    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
                    
                    if (days > 0) {
                        const dailyWeight = weight / days;
                        for (let i = 0; i < days; i++) {
                            const d = new Date(start);
                            d.setDate(d.getDate() + i);
                            const dateStr = d.toISOString().slice(0, 10);
                            
                            // Check if point already exists (unlikely in new project, but good practice)
                            planPoints.push({
                                id: crypto.randomUUID(),
                                task_id: task.id,
                                date: dateStr,
                                plan_percent: Number(dailyWeight.toFixed(4)) // Incremental daily weight
                            });
                        }
                    }
                }
            });

            if (planPoints.length > 0) {
                // Insert in batches to avoid payload limits if large
                const batchSize = 1000;
                for (let i = 0; i < planPoints.length; i += batchSize) {
                    const batch = planPoints.slice(i, i + batchSize);
                    const { error: ppError } = await supabaseAdmin
                        .from('task_plan_points')
                        .insert(batch);
                    if (ppError) console.error('Error creating plan points:', ppError);
                }
            }
        }
    }

    // Handle Contacts (Stakeholders)
    if (Array.isArray(contacts) && contacts.length > 0) {
        const contactPayloads = contacts.map((c: any) => ({
            project_id: project_id,
            name: c.name,
            position: c.position || c.role,
            email: c.email,
            phone: c.phone,
            type: c.type || 'Stakeholder',
            is_key_person: c.isKeyPerson || false
        }));

        const { error: contactErr } = await supabaseAdmin
            .from('contacts')
            .insert(contactPayloads);

        if (contactErr) console.error('Error creating contacts:', contactErr);
    }

    await redis.del('projects:all');
    return NextResponse.json({ id: project_id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
