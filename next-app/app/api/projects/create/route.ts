
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import redis from '@/lib/redis';
import crypto from 'node:crypto';
import { pool } from '../../_lib/db';

function quoteIdent(name: string) {
  return /^[a-z_][a-z0-9_]*$/.test(name) ? name : `"${name.replace(/"/g, '""')}"`;
}

async function pickColumn(table: string, candidates: string[]) {
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name = ANY($2::text[]) LIMIT 1`,
    [table, candidates]
  );
  return res.rows[0]?.column_name as string | undefined;
}

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

    const colId = await pickColumn('projects', ['id']);
    const colName = await pickColumn('projects', ['name']);
    if (!colId || !colName) return NextResponse.json({ error: 'projects schema missing id/name' }, { status: 500 });

    const colCode = await pickColumn('projects', ['code']);
    const colDesc = await pickColumn('projects', ['description']);
    const colStatus = await pickColumn('projects', ['status']);
    const colProgress = await pickColumn('projects', ['progress']);
    const colProgressPlan = await pickColumn('projects', ['progress_plan', 'progressPlan', 'progress_plan']);
    const colStart = await pickColumn('projects', ['start_date', 'startDate']);
    const colEnd = await pickColumn('projects', ['end_date', 'endDate']);
    const colBudget = await pickColumn('projects', ['budget']);
    const colSpent = await pickColumn('projects', ['spent']);
    const colRemaining = await pickColumn('projects', ['remaining']);
    const colSpi = await pickColumn('projects', ['spi']);
    const colCpi = await pickColumn('projects', ['cpi']);
    const colManager = await pickColumn('projects', ['manager_id', 'managerId']);
    const colClient = await pickColumn('projects', ['client_id', 'clientId']);
    const colPriority = await pickColumn('projects', ['priority']);
    const colCategory = await pickColumn('projects', ['category']);
    const colIsArchived = await pickColumn('projects', ['is_archived', 'isArchived']);
    const colCreated = await pickColumn('projects', ['created_at', 'createdAt']);
    const colUpdated = await pickColumn('projects', ['updated_at', 'updatedAt']);

    const cols: string[] = [colId, colName];
    const values: any[] = [projectId, name];

    const add = (c: string | undefined, v: any) => {
      if (!c) return;
      cols.push(c);
      values.push(v);
    };

    add(colCode, code || null);
    add(colDesc, description || null);
    add(colStatus, status);
    add(colProgress, Number(progress ?? 0));
    add(colProgressPlan, 0);
    add(colStart, start);
    add(colEnd, end);
    add(colBudget, Number(budget ?? 0));
    add(colSpent, 0);
    add(colRemaining, Number(budget ?? 0));
    add(colSpi, 1.0);
    add(colCpi, 1.0);
    add(colManager, manager);
    add(colClient, client);
    add(colPriority, priority);
    add(colCategory, category || null);
    add(colIsArchived, false);
    add(colCreated, nowIso);
    add(colUpdated, nowIso);

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    await pool.query(
      `INSERT INTO projects (${cols.map(quoteIdent).join(', ')}) VALUES (${placeholders})`,
      values
    );

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
