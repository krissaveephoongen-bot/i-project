
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, code, description, status = 'in_progress', progress = 0,
      endDate, budget = 0, managerId, clientId, priority = 'medium', category,
      milestones = [],
      members = [],
      tasks = [],
      contacts = []
    } = body || {};

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const payload = {
      name,
      code,
      description,
      status,
      progress,
      endDate: endDate || null,
      budget,
      managerId: managerId || null,
      clientId: clientId || null,
      priority,
      category: category || null,
      progressPlan: 0,
      spi: 1.0,
      riskLevel: 'medium',
      spent: 0,
      remaining: budget, // Initial remaining = budget
      hourlyRate: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    const projectId = data.id;

    // Handle milestones if any
    if (Array.isArray(milestones) && milestones.length > 0) {
      const msPayloads = milestones.map((m: any) => ({
        projectId,
        name: m.name || '',
        percentage: Number(m.percentage || 0),
        amount: Number(m.amount || 0),
        dueDate: m.dueDate || null,
        status: m.status || 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const { error: msError } = await supabase
        .from('milestones')
        .insert(msPayloads);
        
      if (msError) console.error('Error creating milestones:', msError);
    }

    // Handle team members (roles) if provided
    if (Array.isArray(members) && members.length > 0) {
      const memberPayloads = members
        .filter((m: any) => m?.userId && m?.role)
        .map((m: any) => ({
          projectId,
          userId: m.userId,
          role: m.role,
          joinedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      if (memberPayloads.length > 0) {
        const { error: memErr } = await supabase
          .from('project_members')
          .insert(memberPayloads);
        if (memErr) console.error('Error creating project members:', memErr);
      }
    }

    // Handle Tasks (with Weights) and Generate Plan Points
    if (Array.isArray(tasks) && tasks.length > 0) {
        const taskPayloads = tasks.map((t: any) => ({
            projectId,
            title: t.title,
            description: t.description || null,
            status: 'todo',
            priority: t.priority || 'medium',
            weight: Number(t.weight || 0),
            startDate: t.startDate || null,
            dueDate: t.dueDate || null,
            createdBy: 'system', // or current user if available
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
        
        const { data: createdTasks, error: taskErr } = await supabase
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
                    const { error: ppError } = await supabase
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
            project_id: projectId,
            name: c.name,
            position: c.position || c.role,
            email: c.email,
            phone: c.phone,
            type: c.type || 'Stakeholder',
            is_key_person: c.isKeyPerson || false
        }));

        const { error: contactErr } = await supabase
            .from('contacts')
            .insert(contactPayloads);

        if (contactErr) console.error('Error creating contacts:', contactErr);
    }

    return NextResponse.json({ id: projectId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
