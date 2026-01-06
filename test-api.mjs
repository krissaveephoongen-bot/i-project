async function testAPIs() {
  // Use backend API directly for testing full auth flow
  const baseUrl = 'https://ticket-apw-api.vercel.app/api';
  
  console.log('Testing API Endpoints...\n');

  // Test 1: Health check
  console.log('1. Testing /api/health');
  try {
    const health = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log('✓ /api/health:', health);
  } catch (e) {
    console.log('✗ /api/health failed:', e.message);
  }

  // Test 2: Login
  console.log('\n2. Testing /api/auth/login');
  let token = null;
  let currentUserId = null;
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jakgrits.ph@appworks.co.th',
        password: 'AppWorks@123!'
      })
    }).then(r => r.json());
    
    if (loginRes.token) {
      token = loginRes.token;
      if (loginRes.user && loginRes.user.id) {
        currentUserId = loginRes.user.id;
      }
      console.log('✓ /api/auth/login: Success');
      console.log('  User:', loginRes.user?.name || loginRes.user?.email || 'Unknown');
      console.log('  Token:', loginRes.token.substring(0, 20) + '...');
    } else {
      console.log('✗ /api/auth/login failed:', loginRes.error);
    }
  } catch (e) {
    console.log('✗ /api/auth/login error:', e.message);
  }

  if (!token) {
    console.log('\nCannot proceed without token');
    return;
  }

  // Test 3: /me endpoint
  console.log('\n3. Testing /api/auth/me');
  try {
    const me = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    if (me && me.user && me.user.id) {
      currentUserId = me.user.id;
    }
    console.log(
      '✓ /api/auth/me:',
      me.name || me.email || me.user?.name || me.user?.email || JSON.stringify(me).substring(0, 50)
    );
  } catch (e) {
    console.log('✗ /api/auth/me failed:', e.message);
  }

  // Test 4: Projects endpoint
  console.log('\n4. Testing /api/projects');
  try {
    const projects = await fetch(`${baseUrl}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    console.log('✓ /api/projects:', Array.isArray(projects) ? `${projects.length} projects` : JSON.stringify(projects).substring(0, 50));
  } catch (e) {
    console.log('✗ /api/projects failed:', e.message);
  }

  // Test 5: Users endpoint
  console.log('\n5. Testing /api/users');
  try {
    const users = await fetch(`${baseUrl}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    console.log('✓ /api/users:', Array.isArray(users) ? `${users.length} users` : JSON.stringify(users).substring(0, 50));
  } catch (e) {
    console.log('✗ /api/users failed:', e.message);
  }

  // Test 6: Tasks endpoint (list)
  console.log('\n6. Testing /api/tasks');
  try {
    const tasks = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());

    console.log(
      '✓ /api/tasks:',
      Array.isArray(tasks) ? `${tasks.length} tasks` : JSON.stringify(tasks).substring(0, 50)
    );
  } catch (e) {
    console.log('✗ /api/tasks failed:', e.message);
  }

  // Test 7: Full Project CRUD
  console.log('\n7. Testing Project CRUD (create -> get -> update -> delete)');
  let createdProjectId = null;
  try {
    if (!currentUserId) {
      throw new Error('No current user id available');
    }
    // Create
    const createdProject = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'API Test Project ' + new Date().toISOString(),
        code: 'API-TEST-' + Date.now(),
        description: 'Temporary project created by automated API test',
        status: 'in_progress',
        startDate: new Date().toISOString(),
        endDate: null,
        budget: 100000,
        managerId: currentUserId,
        clientId: null,
        userId: currentUserId
      })
    }).then(r => r.json());

    createdProjectId = createdProject.id;
    if (!createdProjectId) {
      console.log('✗ Failed to create project:', JSON.stringify(createdProject).substring(0, 100));
      throw new Error('No project id returned');
    }
    console.log('  ✓ Created project ID:', createdProjectId);

    // Get
    const fetchedProject = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('  ✓ Fetched project name:', fetchedProject.name);

    // Update
    const updatedProject = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: fetchedProject.name + ' (Updated by Test)'
      })
    }).then(r => r.json());
    console.log('  ✓ Updated project name:', updatedProject.name);

    // Delete
    const deleteRes = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('  ✓ Deleted project:', deleteRes.message || JSON.stringify(deleteRes).substring(0, 80));
  } catch (e) {
    console.log('✗ Project CRUD test failed:', e.message);
  }

  // Test 8: Full Task CRUD (depends on a project)
  console.log('\n8. Testing Task CRUD (create -> get -> update -> delete)');
  try {
    if (!currentUserId) {
      throw new Error('No current user id available');
    }
    // Ensure we have a project to attach the task to: use first project or create one
    let projectIdForTask = null;
    const existingProjects = await fetch(`${baseUrl}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());

    if (Array.isArray(existingProjects) && existingProjects.length > 0) {
      projectIdForTask = existingProjects[0].id;
    } else {
      const tempProject = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Task Test Project ' + new Date().toISOString(),
          code: 'TASK-TEST-' + Date.now(),
          description: 'Temporary project for task CRUD test',
          status: 'in_progress'
        })
      }).then(r => r.json());
      projectIdForTask = tempProject.id;
    }

    if (!projectIdForTask) {
      throw new Error('No project ID available for task test');
    }

    // Create task
    const createdTask = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'API Test Task ' + new Date().toISOString(),
        description: 'Temporary task created by automated API test',
        status: 'todo',
        priority: 'high',
        projectId: projectIdForTask,
        estimatedHours: 4,
        createdBy: currentUserId,
        assignedTo: currentUserId
      })
    }).then(r => r.json());

    const createdTaskId = createdTask.id;
    if (!createdTaskId) {
      console.log('✗ Failed to create task:', JSON.stringify(createdTask).substring(0, 100));
      throw new Error('No task id returned');
    }
    console.log('  ✓ Created task ID:', createdTaskId);

    // Get task
    const fetchedTask = await fetch(`${baseUrl}/tasks/${createdTaskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('  ✓ Fetched task title:', fetchedTask.title);

    // Update task
    const updatedTask = await fetch(`${baseUrl}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'in_progress'
      })
    }).then(r => r.json());
    console.log('  ✓ Updated task status:', updatedTask.status);

    // Delete task
    const deleteTaskRes = await fetch(`${baseUrl}/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('  ✓ Deleted task:', deleteTaskRes.message || JSON.stringify(deleteTaskRes).substring(0, 80));
  } catch (e) {
    console.log('✗ Task CRUD test failed:', e.message);
  }

  console.log('\n✓ API Testing Complete');
}

testAPIs().catch(console.error);
