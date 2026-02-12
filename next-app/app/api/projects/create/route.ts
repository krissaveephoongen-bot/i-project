
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

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

    // Handle Tasks (with Weights)
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
        
        const { error: taskErr } = await supabase
            .from('tasks')
            .insert(taskPayloads);
            
        if (taskErr) console.error('Error creating tasks:', taskErr);
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
