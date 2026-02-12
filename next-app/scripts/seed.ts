import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('Starting database seeding...')

  // Define sample projects data
  const portfolioProjects: { name: string, manager: string, status: string, progress: number, budget: number, spent: number, start_date: string, end_date: string }[] = [
    {
      name: 'E-commerce Platform Redesign',
      manager: 'Thanongsak Thongkwid',
      status: 'In Progress',
      progress: 65,
      budget: 2500000,
      spent: 1500000,
      start_date: '2024-01-15',
      end_date: '2024-12-31'
    },
    {
      name: 'Mobile Banking App',
      manager: 'Pratya Fufueng',
      status: 'In Progress',
      progress: 45,
      budget: 3200000,
      spent: 1200000,
      start_date: '2024-03-01',
      end_date: '2025-02-28'
    },
    {
      name: 'CRM System Implementation',
      manager: 'Jakgrits Phoongen',
      status: 'Planning',
      progress: 15,
      budget: 1800000,
      spent: 200000,
      start_date: '2024-06-01',
      end_date: '2024-11-30'
    }
  ];

  // Define sample tasks data
  const wbsTasks: { name: string, start_date: string, end_date: string, progress: number, dependencies: string[] }[] = [
    {
      name: 'Requirements Analysis',
      start_date: '2024-01-15',
      end_date: '2024-02-15',
      progress: 100,
      dependencies: []
    },
    {
      name: 'System Design',
      start_date: '2024-02-16',
      end_date: '2024-03-31',
      progress: 85,
      dependencies: ['Requirements Analysis']
    }
  ];

  // Define sample risks data
  const riskMatrixData: { risk: string, probability: string, impact: string, mitigation: string }[] = [
    {
      risk: 'Scope Creep',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Strict change control process'
    },
    {
      risk: 'Resource Availability',
      probability: 'Low',
      impact: 'Medium',
      mitigation: 'Cross-training team members'
    }
  ];

  // Define sample milestones data
  const paymentMilestones: { milestone: string, amount: number, due_date: string, status: string }[] = [
    {
      milestone: 'Project Kickoff',
      amount: 500000,
      due_date: '2024-01-31',
      status: 'Paid'
    },
    {
      milestone: 'Requirements Complete',
      amount: 750000,
      due_date: '2024-02-28',
      status: 'Paid'
    }
  ];

  // Define sample timesheet data
  const timesheetData: { employee: string, project: string, task: string, hours: number, date: string, status: string }[] = [
    {
      employee: 'Thanongsak Thongkwid',
      project: 'E-commerce Platform Redesign',
      task: 'Requirements Analysis',
      hours: 8,
      date: '2024-01-15',
      status: 'Approved'
    },
    {
      employee: 'Pratya Fufueng',
      project: 'Mobile Banking App',
      task: 'System Design',
      hours: 7,
      date: '2024-01-15',
      status: 'Approved'
    }
  ];

  // Extract unique users
  const userNames = new Set<string>()
  portfolioProjects.forEach(p => userNames.add(p.manager))
  timesheetData.forEach(t => userNames.add(t.employee))
  // Add more if needed

  const users = Array.from(userNames).map(name => ({
    name,
    role: portfolioProjects.some(p => p.manager === name) ? 'Manager' : 'Employee'
  }))

  // Add additional users from backend seeds
  const additionalUsers = [
    { name: 'Thanongsak Thongkwid', role: 'admin', email: 'thanongsak.th@appworks.co.th' },
    { name: 'Pratya Fufueng', role: 'manager', email: 'pratya.fu@appworks.co.th' },
    { name: 'Jakgrits Phoongen', role: 'employee', email: 'jakgrits.ph@appworks.co.th' },
    { name: 'Demo Employee', role: 'employee', email: 'employee@company.com' }
  ]

  users.push(...additionalUsers)

  // Insert users
  const { data: insertedUsers, error: userError } = await supabase
    .from('users')
    .insert(users)
    .select()

  if (userError) {
    console.error('Error inserting users:', userError)
    return
  }

  console.log('Inserted users:', insertedUsers)

  // Create user map
  const userMap = new Map(insertedUsers!.map(u => [u.name, u.id]))

  // Insert projects
  const projects = portfolioProjects.map(p => ({
    name: p.name,
    status: p.status,
    progress: p.progress,
    budget: p.budget,
    spent: p.spent,
    start_date: p.start_date,
    end_date: p.end_date,
    manager_id: userMap.get(p.manager)
  }))

  const { data: insertedProjects, error: projectError } = await supabase
    .from('projects')
    .insert(projects)
    .select()

  if (projectError) {
    console.error('Error inserting projects:', projectError)
    return
  }

  console.log('Inserted projects:', insertedProjects)

  // Assume first project for tasks, risks, milestones
  const firstProjectId = insertedProjects![0].id

  // Insert tasks
  const tasks = wbsTasks.map(t => ({
    project_id: firstProjectId,
    name: t.name,
    start_date: t.start_date,
    end_date: t.end_date,
    progress: t.progress,
    dependencies: t.dependencies
  }))

  const { data: insertedTasks, error: taskError } = await supabase
    .from('tasks')
    .insert(tasks)
    .select()

  if (taskError) {
    console.error('Error inserting tasks:', taskError)
    return
  }

  console.log('Inserted tasks:', insertedTasks)

  // Create task map
  const taskMap = new Map(insertedTasks!.map(t => [t.name, t.id]))

  // Insert risks
  const risks = riskMatrixData.map(r => ({
    project_id: firstProjectId,
    risk: r.risk,
    probability: r.probability,
    impact: r.impact,
    mitigation: r.mitigation
  }))

  const { error: riskError } = await supabase
    .from('risks')
    .insert(risks)

  if (riskError) {
    console.error('Error inserting risks:', riskError)
    return
  }

  console.log('Inserted risks')

  // Insert milestones
  const milestones = paymentMilestones.map(m => ({
    project_id: firstProjectId,
    milestone: m.milestone,
    amount: m.amount,
    due_date: m.due_date,
    status: m.status
  }))

  const { error: milestoneError } = await supabase
    .from('milestones')
    .insert(milestones)

  if (milestoneError) {
    console.error('Error inserting milestones:', milestoneError)
    return
  }

  console.log('Inserted milestones')

  // Insert timesheets
  const timesheets = timesheetData.map(t => {
    const userId = userMap.get(t.employee)
    const project = insertedProjects!.find(p => p.name === t.project)
    const task = insertedTasks!.find(ta => ta.name === t.task)
    return {
      user_id: userId,
      project_id: project?.id,
      task_id: task?.id,
      hours: t.hours,
      date: t.date,
      status: t.status
    }
  }).filter(t => t.user_id && t.project_id && t.task_id) // Only insert if all fks exist

  const { error: timesheetError } = await supabase
    .from('timesheets')
    .insert(timesheets)

  if (timesheetError) {
    console.error('Error inserting timesheets:', timesheetError)
    return
  }

  console.log('Inserted timesheets')

  console.log('Database seeding completed successfully!')
}

// Run the seeding
seedDatabase().catch(console.error)