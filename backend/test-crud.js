import { getDbClient } from './lib/db.js';

async function testCRUD() {
  const { client: sql } = getDbClient();

  if (!sql) {
    console.error('Database connection not available');
    return;
  }

  try {
    console.log('🧪 Testing CRUD Operations...\n');

    // Test CREATE - Insert a test user
    console.log('📝 CREATE: Inserting test user...');
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      role: 'employee'
    };

    const [insertedUser] = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${testUser.name}, ${testUser.email}, ${testUser.password}, ${testUser.role})
      RETURNING id, name, email, role
    `;
    console.log('✅ Created user:', insertedUser);

    // Test READ - Select the user
    console.log('\n📖 READ: Fetching user...');
    const [fetchedUser] = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${insertedUser.id}
    `;
    console.log('✅ Read user:', fetchedUser);

    // Test UPDATE - Update the user
    console.log('\n✏️  UPDATE: Updating user...');
    const [updatedUser] = await sql`
      UPDATE users
      SET name = 'Updated Test User'
      WHERE id = ${insertedUser.id}
      RETURNING id, name, email, role
    `;
    console.log('✅ Updated user:', updatedUser);

    // Test CREATE - Insert a test project
    console.log('\n📝 CREATE: Inserting test project...');
    const testProject = {
      name: 'Test Project',
      description: 'A test project',
      status: 'todo',
      manager_id: insertedUser.id
    };

    const [insertedProject] = await sql`
      INSERT INTO projects (name, description, status, manager_id)
      VALUES (${testProject.name}, ${testProject.description}, ${testProject.status}, ${testProject.manager_id})
      RETURNING id, name, description, status
    `;
    console.log('✅ Created project:', insertedProject);

    // Test READ with JOIN - Get project with manager
    console.log('\n📖 READ: Fetching project with manager...');
    const [projectWithManager] = await sql`
      SELECT p.id, p.name, p.description, p.status, u.name as manager_name
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      WHERE p.id = ${insertedProject.id}
    `;
    console.log('✅ Read project with manager:', projectWithManager);

    // Test DELETE - Delete the project
    console.log('\n🗑️  DELETE: Deleting project...');
    const deleteProjectResult = await sql`
      DELETE FROM projects WHERE id = ${insertedProject.id}
    `;
    console.log('✅ Deleted project, affected rows:', deleteProjectResult.count);

    // Test DELETE - Delete the user
    console.log('\n🗑️  DELETE: Deleting user...');
    const deleteUserResult = await sql`
      DELETE FROM users WHERE id = ${insertedUser.id}
    `;
    console.log('✅ Deleted user, affected rows:', deleteUserResult.count);

    console.log('\n🎉 CRUD Test Completed Successfully!');
    console.log('✅ CREATE, READ, UPDATE, DELETE operations all working');

  } catch (error) {
    console.error('❌ CRUD Test Failed:', error.message);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testCRUD();