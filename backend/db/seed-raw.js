// backend/db/seed-raw.js
// Raw SQL seeding to avoid Drizzle naming issues

import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.development' });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(DATABASE_URL, { ssl: 'prefer' });

const main = async () => {
  console.log('🌱 Starting database seeding with raw SQL...');

  try {
    console.log('🗑️  Clearing project-related data...');
    await sql`DELETE FROM tasks`;
    await sql`DELETE FROM projects`;
    await sql`DELETE FROM expenses`;
    await sql`DELETE FROM clients`;
    console.log('✅ Data cleared.');

    // Get existing users
    console.log('👥 Getting existing users...');
    const users = await sql`SELECT id FROM users LIMIT 6`;
    console.log(`✅ Found ${users.length} existing users.`);
    
    const adminUserId = users[0]?.id;
    const managerUserId = users[1]?.id;
    const employeeUserId = users[2]?.id;

    if (!adminUserId || !managerUserId || !employeeUserId) {
      throw new Error('Not enough users in database');
    }

    // Seed clients
    console.log('🏢 Seeding clients...');
    const clients = await sql`
      INSERT INTO clients (id, name, email, phone, address, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'Innovate Corp', 'contact@innovatecorp.com', '+1-555-0101', '123 Tech Street, San Francisco, CA', now(), now()),
        (gen_random_uuid(), 'Quantum Solutions', 'info@quantumsol.com', '+1-555-0102', '456 Logic Ave, Boston, MA', now(), now()),
        (gen_random_uuid(), 'Digital Transformation Ltd', 'hello@digitrans.io', '+1-555-0103', '789 Future Blvd, Seattle, WA', now(), now())
      RETURNING id, name
    `;
    console.log(`✅ ${clients.length} clients seeded.`);
    const clientIds = clients.map(c => c.id);

    // Seed projects
    console.log('📁 Seeding projects...');
    const projects = await sql`
      INSERT INTO projects (id, name, description, status, budget, progress, manager_id, client_id, category, priority, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'Project Phoenix', 'A revolutionary new platform for enterprise solutions.', 'active', '500000', 65, ${adminUserId}, ${clientIds[0]}, 'Enterprise Solutions', 'high', now(), now()),
        (gen_random_uuid(), 'Project Neptune', 'Advanced data analytics and visualization tool.', 'active', '350000', 45, ${managerUserId}, ${clientIds[1]}, 'Data Analytics', 'high', now(), now()),
        (gen_random_uuid(), 'Project Aurora', 'Cloud infrastructure modernization.', 'planning', '750000', 15, ${adminUserId}, ${clientIds[2]}, 'Infrastructure', 'medium', now(), now()),
        (gen_random_uuid(), 'Project Horizon', 'Mobile application development.', 'active', '200000', 85, ${managerUserId}, ${clientIds[0]}, 'Mobile Development', 'medium', now(), now())
      RETURNING id
    `;
    console.log(`✅ ${projects.length} projects seeded.`);
    const projectIds = projects.map(p => p.id);

    // Tasks and expenses tables have different schemas than expected
    // Skip seeding those for now
    console.log('✓ Skipping tasks and expenses (schema mismatch)...');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`
✅ Clients created: ${clients.length}
✅ Projects created: ${projects.length}
✅ Existing users preserved: ${users.length}

Your dropdowns should now work!
Navigate to: https://i-projects.skin/projects
    `);

    await sql.end();
  } catch (error) {
    console.error('❌ An error occurred during database seeding:');
    console.error(error);
    process.exit(1);
  }
};

main();
