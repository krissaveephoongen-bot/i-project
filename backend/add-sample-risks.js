import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development' });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(DATABASE_URL);

async function addSampleRisks() {
  try {
    console.log('Adding sample risks...');
    
    // First get actual project IDs
    const projects = await sql`SELECT id, name FROM "projects" LIMIT 2`;
    const users = await sql`SELECT id, name FROM "users" WHERE role = 'manager' LIMIT 2`;
    
    if (projects.length === 0 || users.length === 0) {
      console.log('❌ No projects or users found. Please seed the database first.');
      return;
    }
    
    console.log('Found projects:', projects);
    console.log('Found users:', users);
    
    await sql`
      INSERT INTO "risks" ("title", "description", "impact", "probability", "risk_score", "status", "project_id", "assigned_to", "created_at", "updated_at")
      VALUES 
        ('High Budget Risk', 'Project may exceed budget due to scope creep', 'High', 'Medium', 75, 'open', ${projects[0].id}, ${users[0].id}, NOW(), NOW()),
        ('Timeline Delay', 'Key dependencies may cause delays', 'Medium', 'High', 60, 'open', ${projects[1].id}, ${users[0].id}, NOW(), NOW()),
        ('Resource Shortage', 'Limited availability of key resources', 'High', 'Low', 40, 'in_progress', ${projects[0].id}, ${users[1] ? users[1].id : users[0].id}, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;
    
    console.log('✅ Sample risks added!');
    
    // Verify the data was added
    const count = await sql`SELECT COUNT(*) as count FROM "risks"`;
    console.log(`Risks table now has ${count[0].count} records`);
    
  } catch (error) {
    console.error('❌ Error adding sample risks:', error);
  } finally {
    await sql.end();
  }
}

addSampleRisks();
