// check-db-counts.js
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.development' });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'prefer', max: 1 });

try {
  console.log('🔍 Checking database table counts...\n');
  
  const projectsCount = await sql`SELECT COUNT(*) as count FROM projects`;
  const tasksCount = await sql`SELECT COUNT(*) as count FROM tasks`;
  const expensesCount = await sql`SELECT COUNT(*) as count FROM expenses`;
  const clientsCount = await sql`SELECT COUNT(*) as count FROM clients`;
  const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
  
  console.log('📊 Table Counts:');
  console.log(`  Projects: ${projectsCount[0].count}`);
  console.log(`  Tasks: ${tasksCount[0].count}`);
  console.log(`  Expenses: ${expensesCount[0].count}`);
  console.log(`  Clients: ${clientsCount[0].count}`);
  console.log(`  Users: ${usersCount[0].count}`);
  
  console.log('\n📋 Sample Project Statuses:');
  const statuses = await sql`SELECT DISTINCT status FROM projects`;
  statuses.forEach(s => console.log(`  - ${s.status}`));
  
  console.log('\n📋 Sample Task Statuses:');
  const taskStatuses = await sql`SELECT DISTINCT status FROM tasks`;
  taskStatuses.forEach(s => console.log(`  - ${s.status}`));
  
  console.log('\n📋 Sample Task Priorities:');
  try {
    const priorities = await sql`SELECT DISTINCT priority FROM tasks`;
    priorities.forEach(p => console.log(`  - ${p.priority}`));
  } catch (e) {
    console.log('  - Priority column does not exist');
  }
  
  console.log('\n👥 Sample Users:');
  const users = await sql`SELECT id, name, email, role FROM users LIMIT 3`;
  users.forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role}`));
  
  console.log('\n🏢 Sample Clients:');
  const clients = await sql`SELECT id, name FROM clients LIMIT 3`;
  clients.forEach(c => console.log(`  - ${c.name}`));
  
  await sql.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
