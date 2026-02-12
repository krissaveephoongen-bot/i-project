/**
 * Database Migration and Seeding Script
 * 
 * This script migrates from mock data to Supabase database
 * and seeds it with all existing mock data from lib/mockData.ts
 */

import { createClient } from '@supabase/supabase-js';
import { 
  portfolioProjects, 
  teamLoadData, 
  wbsTasks, 
  riskMatrixData, 
  paymentMilestones, 
  stakeholderData,
  timesheetData,
  vendorTasks
} from '../next-app/app/lib/mockData';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define interfaces for better type safety
interface Risk {
  [key: string]: any; // Use index signature to allow any properties
}

/**
 * Helper function to handle database errors
 */
function handleDatabaseError(error: any, operation: string) {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message}`);
}

/**
 * Create users from mock data
 */
async function createUsers() {
  console.log('👤 Creating users...');
  
  const users = [
    // Admin user
    {
      email: 'jakgrits.ph@appworks.co.th',
      password: 'AppWorks@123!',
      name: 'Jakgrits Ph.',
      role: 'admin',
      position: 'System Administrator',
    },
    // Manager user
    {
      email: 'manager@example.com',
      password: 'AppWorks@123!',
      name: 'Manager Mike',
      role: 'manager',
      position: 'Project Manager',
    },
    // Employee users
    {
      email: 'employee@example.com',
      password: 'AppWorks@123!',
      name: 'Employee Emma',
      role: 'employee',
      position: 'Software Engineer',
    },
    {
      email: 'staff@appworks.com',
      password: 'AppWorks@123!',
      name: 'Staff User',
      role: 'employee',
      position: 'Developer',
    },
    // Vendor user
    {
      email: 'vendor@vendor.com',
      password: 'AppWorks@123!',
      name: 'Vendor Company Ltd',
      role: 'vendor',
      position: 'External Vendor',
    },
  ];

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert({
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        position: user.position,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create user');
    }
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

/**
 * Create clients from mock data
 */
async function createClients() {
  console.log('🏢 Creating clients...');
  
  const clients = [
    { name: 'TechCorp Industries' },
    { name: 'Global Finance Ltd' },
    { name: 'Digital Bank Co' },
  ];

  for (const client of clients) {
    const { error } = await supabase
      .from('clients')
      .upsert({
        name: client.name,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create client');
    }
  }

  console.log(`✅ Created ${clients.length} clients`);
  return clients;
}

/**
 * Create projects from mock data
 */
async function createProjects(users: any[], clients: any[]) {
  console.log('📁 Creating projects...');
  
  const projects = portfolioProjects.map((project: any) => ({
    name: project.name,
    description: project.client,
    status: project.progressActual === 100 ? 'completed' : 'active',
    progress: project.progressActual,
    start_date: project.startDate || '2024-01-01',
    end_date: project.endDate || null,
    budget: project.budget,
    client_id: clients.find(c => c.name === project.client)?.id || null,
    manager_id: users.find(u => u.role === 'manager')?.id || null,
  }));

  for (const project of projects) {
    const { error } = await supabase
      .from('projects')
      .upsert({
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
        client_id: project.client_id,
        manager_id: project.manager_id,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create project');
    }
  }

  console.log(`✅ Created ${projects.length} projects`);
  return projects;
}

/**
 * Create tasks from mock data
 */
async function createTasks(users: any[], projects: any[]) {
  console.log('📋 Creating tasks...');
  
  // WBS Tasks
  const wbsTasksToCreate = wbsTasks.map((task: any) => ({
    title: task.name,
    description: `WBS Task: ${task.name}`,
    status: task.progressActual === 100 ? 'completed' : 
            task.progressActual > 0 ? 'in_progress' : 'todo',
    priority: task.weight === 20 ? 'high' : task.weight === 15 ? 'medium' : 'low',
    due_date: task.endDate || '2024-12-31',
    progress: task.progressActual,
    project_id: projects.find(p => p.name === task.project)?.id || null,
    assigned_to: users.find(u => u.name === task.assignee)?.id || null,
    created_by: users.find(u => u.role === 'manager')?.id || null,
  }));

  // Vendor Tasks
  const vendorTasksToCreate = vendorTasks.map((task: any) => ({
    title: task.taskName,
    description: `Vendor Task: ${task.taskName}`,
    status: task.progress === 100 ? 'completed' : 'in_progress',
    priority: 'priority',
    due_date: '2024-12-31',
    progress: task.progress,
    project_id: projects.find(p => p.name === task.project)?.id || null,
    assigned_to: users.find(u => u.role === 'vendor')?.id || null,
    created_by: users.find(u => u.role === 'manager')?.id || null,
  }));

  const allTasks = [...wbsTasksToCreate, ...vendorTasksToCreate];

  for (const task of allTasks) {
    const { error } = await supabase
      .from('tasks')
      .upsert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        progress: task.progress,
        project_id: task.project_id,
        assigned_to: task.assigned_to,
        created_by: task.created_by,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create task');
    }
  }

  console.log(`✅ Created ${allTasks.length} tasks`);
  return allTasks;
}

/**
 * Create timesheets from mock data
 */
async function createTimesheets(users: any[], projects: any[]) {
  console.log('⏰ Creating timesheets...');
  
  const timesheets = timesheetData.entries.map((entry: any) => ({
    user_id: users.find(u => u.name === entry.name)?.id || null,
    project_id: projects.find(p => p.name === entry.project)?.id || null,
    date: entry.date,
    hours: entry.hours,
    description: entry.description,
    status: entry.status,
  }));

  for (const timesheet of timesheets) {
    const { error } = await supabase
      .from('timesheets')
      .upsert({
        user_id: timesheet.user_id,
        project_id: timesheet.project_id,
        date: timesheet.date,
        hours: timesheet.hours,
        description: timesheet.description,
        status: timesheet.status,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create timesheet');
    }
  }

  console.log(`✅ Created ${timesheets.length} timesheets`);
  return timesheets;
}

/**
 * Create risks from mock data
 */
async function createRisks(users: any[], projects: any[]) {
  console.log('⚠️ Creating risks...');
  
  const risks = riskMatrixData.map((risk: any): Risk => ({
    title: risk.title,
    description: `Risk: ${risk.title}`,
    impact: risk.impact,
    probability: risk.likelihood,
    likelihood: risk.likelihood,
    status: 'open',
    project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
    assigned_to: users.find(u => u.role === 'manager')?.id || null,
    mitigation_plan: `Mitigation: ${risk.title}`,
    risk_score: null,
  }));

  for (const risk of risks) {
    const { error } = await supabase
      .from('risks')
      .upsert({
        title: (risk as any).title,
        description: (risk as any).description,
        impact: (risk as any).impact,
        probability: (risk as any).probability,
        likelihood: (risk as any).likelihood,
        status: (risk as any).status,
        project_id: (risk as any).project_id,
        assigned_to: (risk as any).assigned_to,
        mitigation_plan: (risk as any).mitigation_plan,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create risk');
    }
  }

  console.log(`✅ Created ${risks.length} risks`);
  return risks;
}

/**
 * Create milestones from mock data
 */
async function createMilestones(projects: any[]) {
  console.log('🎯 Creating milestones...');
  
  const milestones = paymentMilestones.map((milestone: any) => ({
    title: milestone.name,
    description: milestone.name,
    due_date: new Date(milestone.date).toISOString().split('T')[0],
    status: milestone.status === 'Paid' ? 'completed' : 'pending',
    progress: milestone.percentage,
    project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
  }));

  for (const milestone of milestones) {
    const { error } = await supabase
      .from('milestones')
      .upsert({
        title: milestone.title,
        description: milestone.description,
        due_date: milestone.due_date,
        status: milestone.status,
        progress: milestone.progress,
        project_id: milestone.project_id,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create milestone');
    }
  }

  console.log(`✅ Created ${milestones.length} milestones`);
  return milestones;
}

/**
 * Create contacts from mock data
 */
async function createContacts(projects: any[]) {
  console.log('👥 Creating contacts...');
  
  const contacts = [
    // Client contacts
    {
      name: 'Robert Chen',
      position: 'CEO',
      email: 'robert.chen@techcorp.com',
      phone: '+66-81-234-5678',
      type: 'client',
      client_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      is_key_person: true,
      notes: 'Main decision maker for Enterprise ERP Implementation',
    },
    {
      name: 'Sarah Johnson',
      position: 'CTO',
      email: 'sarah.johnson@techcorp.com',
      phone: '+66-81-234-5679',
      type: 'client',
      client_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      is_key_person: true,
      notes: 'Technical requirements and approvals',
    },
    // Stakeholders
    {
      name: 'Dr. Robert Wilson',
      position: 'External Consultant',
      email: 'robert.wilson@consulting.com',
      phone: '+66-81-234-5678',
      type: 'stakeholder',
      project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      is_key_person: true,
      notes: 'Industry expert advisor for Enterprise ERP Implementation',
    },
    {
      name: 'Lisa Anderson',
      position: 'Regulatory Affairs',
      email: 'lisa.anderson@gov.th',
      phone: '+66-81-234-5679',
      type: 'stakeholder',
      project_id: projects.find(p => p.name === 'Cloud Migration Phase 2')?.id || null,
      is_key_person: false,
      notes: 'Compliance and regulatory requirements',
    },
  ];

  for (const contact of contacts) {
    const { error } = await supabase
      .from('contacts')
      .upsert({
        name: contact.name,
        position: contact.position,
        email: contact.email,
        phone: contact.phone,
        type: contact.type,
        client_id: contact.client_id,
        project_id: contact.project_id,
        is_key_person: contact.is_key_person,
        notes: contact.notes,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create contact');
    }
  }

  console.log(`✅ Created ${contacts.length} contacts`);
  return contacts;
}

/**
 * Create team structure from mock data
 */
async function createTeamStructure(users: any[], projects: any[]) {
  console.log('👥 Creating team structure...');
  
  const teamStructure = [
    {
      project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      user_id: users.find(u => u.name === 'Manager Mike')?.id || null,
      role: 'Project Manager',
      level: 1,
      responsibilities: 'Overall project management, client communication, budget control',
      start_date: '2024-01-01',
    },
    {
      project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      user_id: users.find(u => u.name === 'Sarah Chen')?.id || null,
      role: 'Senior Developer',
      level: 2,
      parent_id: null, // Will be set after PM record is created
      responsibilities: 'Frontend development, UI/UX implementation',
      start_date: '2024-01-01',
    },
    {
      project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      user_id: users.find(u => u.name === 'Mike Johnson')?.id || null,
      role: 'Technical Lead',
      level: 2,
      parent_id: null, // Will be set after PM record is created
      responsibilities: 'Database schema development, API design',
      start_date: '2024-01-01',
    },
    {
      project_id: projects.find(p => p.name === 'Cloud Migration Phase 2')?.id || null,
      user_id: users.find(u => u.name === 'Emily Brown')?.id || null,
      role: 'Business Analyst',
      level: 3,
      parent_id: null, // Will be set after TL record is created
      responsibilities: 'Requirements analysis, business process mapping',
      start_date: '2024-02-01',
    },
  ];

  for (const member of teamStructure) {
    const { error } = await supabase
      .from('team_structure')
      .upsert({
        project_id: member.project_id,
        user_id: member.user_id,
        role: member.role,
        level: member.level,
        parent_id: member.parent_id,
        responsibilities: member.responsibilities,
        start_date: member.start_date,
        is_active: true,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create team member');
    }
  }

  console.log(`✅ Created ${teamStructure.length} team members`);
  return teamStructure;
}

/**
 * Create approval workflows
 */
async function createApprovalWorkflows() {
  console.log('🔄 Creating approval workflows...');
  
  const workflows = [
    {
      name: 'Timesheet Approval',
      description: 'Approval workflow for staff timesheet entries',
      type: 'timesheet',
      required_role: 'manager',
      is_active: true,
    },
    {
      name: 'Expense Approval',
      description: 'Approval workflow for expense claims',
      type: 'expense',
      required_role: 'manager',
      is_active: true,
    },
    {
      name: 'High Value Expense Approval',
      description: 'Approval workflow for expenses over 10,000 THB',
      type: 'expense',
      required_role: 'admin',
      is_active: true,
    },
  ];

  for (const workflow of workflows) {
    const { error } = await supabase
      .from('approval_workflows')
      .upsert({
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        required_role: workflow.required_role,
        is_active: workflow.is_active,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create approval workflow');
    }
  }

  console.log(`✅ Created ${workflows.length} approval workflows`);
  return workflows;
}

/**
 * Create sample approval requests
 */
async function createApprovalRequests(users: any[], projects: any[], workflows: any[]) {
  console.log('📋 Creating approval requests...');
  
  const requests = [
    {
      type: 'timesheet',
      request_id: 'sample-timesheet-1',
      title: 'Weekly Timesheet - Emma Wilson',
      description: 'Timesheet for week of Jan 8-12, 2024',
      requested_by: users.find(u => u.name === 'Employee Emma')?.id || null,
      status: 'pending',
      priority: 'medium',
      project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      workflow_id: workflows.find(w => w.type === 'timesheet')?.id || null,
      metadata: { totalHours: 40, weekStartDate: '2024-01-08', weekEndDate: '2024-01-12' },
    },
    {
      type: 'expense',
      request_id: 'sample-expense-1',
      title: 'Office Supplies Purchase',
      description: 'Purchase of office supplies for development team',
      requested_by: users.find(u => u.name === 'Employee Emma')?.id || null,
      status: 'pending',
      priority: 'low',
      amount: '2500.00',
      currency: 'THB',
      project_id: projects.find(p => p.name === 'Enterprise ERP Implementation')?.id || null,
      workflow_id: workflows.find(w => w.type === 'expense')?.id || null,
      metadata: { expenseCategory: 'supplies', receiptNumber: 'REC-2024-001' },
    },
  ];

  for (const request of requests) {
    const { error } = await supabase
      .from('approval_requests')
      .upsert({
        type: request.type,
        request_id: request.request_id,
        title: request.title,
        description: request.description,
        requested_by: request.requested_by,
        status: request.status,
        priority: request.priority,
        amount: request.amount,
        currency: request.currency,
        project_id: request.project_id,
        workflow_id: request.workflow_id,
        metadata: request.metadata,
      })
      .select();

    if (error) {
      handleDatabaseError(error, 'create approval request');
    }
  }

  console.log(`✅ Created ${requests.length} approval requests`);
  return requests;
}

/**
 * Main migration function
 */
async function migrateToSupabase() {
  console.log('🚀 Starting migration to Supabase...');
  
  try {
    // Create users first (other tables depend on users)
    const users = await createUsers();
    
    // Create clients
    const clients = await createClients();
    
    // Create projects
    const projects = await createProjects(users, clients);
    
    // Create tasks
    await createTasks(users, projects);
    
    // Create timesheets
    await createTimesheets(users, projects);
    
    // Create risks
    await createRisks(users, projects);
    
    // Create milestones
    await createMilestones(projects);
    
    // Create contacts
    await createContacts(projects);
    
    // Create team structure
    await createTeamStructure(users, projects);
    
    // Create approval workflows and requests
    const workflows = await createApprovalWorkflows();
    await createApprovalRequests(users, projects, workflows);

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Clients: ${clients.length}`);
    console.log(`- Projects: ${projects.length}`);
    console.log(`- Tasks: ${users.length + vendorTasks.length}`);
    console.log(`- Timesheets: ${timesheetData.entries.length}`);
    console.log(`- Risks: ${riskMatrixData.length}`);
    console.log(`- Milestones: ${paymentMilestones.length}`);
    console.log(`- Contacts: ${stakeholderData.client.length + stakeholderData.internal.length}`);
    console.log(`- Team Members: ${teamLoadData.length}`);
    console.log(`- Approval Workflows: ${4}`);
    console.log(`- Approval Requests: ${2}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToSupabase();
}

export { migrateToSupabase };
