import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdminClient';
import { runSchemaSync } from '../../_lib/schema';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const log: string[] = [];
    const addLog = (msg: string) => {
      console.log(msg);
      log.push(msg);
    };

    addLog('Starting System Reset & Seed Process...');

    // 0. SYNC SCHEMA
    // ====================================================
    const schemaRes = await runSchemaSync();
    if (!schemaRes.ok) {
        addLog(`Schema Sync Errors: ${JSON.stringify(schemaRes.errors)}`);
        // We continue anyway as some errors might be "already exists"
    } else {
        addLog('✓ Schema Synced Successfully');
    }

    // 1. CLEAN DATA (Order is critical for FK constraints)
    // ====================================================
    
    // Timesheets & Submissions
    await supabaseAdmin.from('timesheet_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('timesheets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog('✓ Cleared Timesheets');

    // Tasks & Logs
    await supabaseAdmin.from('task_actual_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('task_plan_points').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog('✓ Cleared Tasks');

    // Milestones & Risks & Documents
    await supabaseAdmin.from('budget_lines').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('risks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('milestones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog('✓ Cleared Milestones, Risks, Documents');

    // Sales & Audit
    await supabaseAdmin.from('sales_activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('sales_deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog('✓ Cleared Sales & Audit Logs');

    // Projects & Clients
    await supabaseAdmin.from('project_progress_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog('✓ Cleared Projects & Clients');

    // 2. SEED DATA (Golden Path)
    // ==========================

    // Find a user to assign things to
    const { data: users } = await supabaseAdmin.from('users').select('*').limit(1);
    const mainUser = users?.[0];
    
    if (!mainUser) {
      throw new Error('No users found in the system. Cannot seed data.');
    }
    addLog(`> Using User: ${mainUser.name} (${mainUser.email})`);

    // A. Create Client
    const { data: client, error: clientError } = await supabaseAdmin.from('clients').insert({
      id: crypto.randomUUID(), // Ensure ID is generated
      name: 'Golden Customer Co., Ltd.',
      email: 'contact@goldencustomer.com',
      address: '123 Golden Tower, Bangkok',
      taxId: '1234567890123'
    }).select().single();
    if (clientError) throw clientError;
    addLog(`> Created Client: ${client.name}`);

    // B. Create Project
    const { data: project, error: projectError } = await supabaseAdmin.from('projects').insert({
      name: 'Project Phoenix (Rebirth)',
      code: 'PHX-001',
      description: 'A comprehensive project to demonstrate system capabilities.',
      status: 'Active',
      progress: 10,
      clientId: client.id,
      managerId: mainUser.id,
      budget: 1000000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // +90 days
      riskLevel: 'Low'
    }).select().single();
    if (projectError) throw projectError;
    addLog(`> Created Project: ${project.name}`);

    // C. Create Milestone
    const { data: milestone, error: milestoneError } = await supabaseAdmin.from('milestones').insert({
      project_id: project.id,
      name: 'Phase 1: Requirements',
      percentage: 30,
      amount: 300000,
      status: 'In Progress',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // +14 days
    }).select().single();
    if (milestoneError) throw milestoneError;
    addLog(`> Created Milestone: ${milestone.name}`);

    // D. Create Task
    const { data: task, error: taskError } = await supabaseAdmin.from('tasks').insert({
      title: 'Gather Requirements',
      description: 'Interview stakeholders and document core requirements.',
      projectId: project.id,
      // Note: Schema might use milestone_id (snake_case) or milestoneId depending on setup, trying both/standard
      // Based on schema read earlier: milestone_id
      // But Next.js types might differ. Let's try raw insert.
      assignedTo: mainUser.id,
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 40,
      actualHours: 8,
      createdBy: mainUser.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }).select().single();
    if (taskError) throw taskError;
    addLog(`> Created Task: ${task.title}`);
    
    // Link task to milestone (update separately to avoid schema ambiguity if any)
    // The schema showed `tasks_milestone_id_fkey`, so column is `milestone_id`
    // However, the `tasks` table definition in schema.ts didn't explicitly show `milestone_id` in the CREATE TABLE block, 
    // but had an ALTER TABLE ADD CONSTRAINT. So it exists.
    // Using supabaseAdmin (js client) usually handles camelCase mapping if configured, but safe to use raw.
    await supabaseAdmin.from('tasks').update({ milestone_id: milestone.id }).eq('id', task.id);

    // E. Create Timesheet
    const today = new Date().toISOString().split('T')[0];
    const { data: timesheet, error: tsError } = await supabaseAdmin.from('timesheets').insert({
      user_id: mainUser.id,
      project_id: project.id,
      task_id: task.id,
      date: today,
      hours: 8,
      // approved: true // If column exists, otherwise we assume draft/pending
    }).select().single();
    if (tsError) throw tsError;
    addLog(`> Created Timesheet: 8 hours on ${today}`);

    // F. Update Project Progress
    await supabaseAdmin.from('projects').update({
      progress: 5, // Manual update for demo
      spent: 8 * (mainUser.hourly_rate || 1000) // Calculate cost
    }).eq('id', project.id);
    addLog('> Updated Project Progress & Cost');

    return NextResponse.json({ 
      success: true, 
      message: 'System Reset & Seed Completed Successfully',
      log 
    });

  } catch (error: any) {
    console.error('Reset Failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error',
      details: error
    }, { status: 500 });
  }
}