import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/prisma';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test data
let testUserId: string;
let testProjectId: string;
let testCostId: string;
let testAttachmentId: string;
let testApprovalId: string;

async function testAPI() {
  console.log('🧪 Starting Prisma API Tests...\n');

  try {
    // ==================== USER TESTS ====================
    console.log('📝 Testing Users API...');

    // Create user
    const userRes = await api.post('/users', {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Test@123456',
      role: 'user'
    });
    testUserId = userRes.data.data.id;
    console.log('✅ User created:', userRes.data.data.id);

    // Get all users
    const usersRes = await api.get('/users?take=5');
    console.log('✅ Users list retrieved:', usersRes.data.pagination.total, 'total');

    // Get user by ID
    const userDetailRes = await api.get(`/users/${testUserId}`);
    console.log('✅ User detail retrieved:', userDetailRes.data.data.name);

    // ==================== PROJECT TESTS ====================
    console.log('\n📊 Testing Projects API...');

    // Create project
    const projectRes = await api.post('/projects', {
      name: 'Test Project',
      description: 'API test project',
      budget: 50000,
      startDate: new Date().toISOString(),
      status: 'active'
    });
    testProjectId = projectRes.data.data.id;
    console.log('✅ Project created:', projectRes.data.data.id);

    // Get all projects
    const projectsRes = await api.get('/projects?take=5');
    console.log('✅ Projects list retrieved:', projectsRes.data.pagination.total, 'total');

    // Get project with stats
    const projectDetailRes = await api.get(`/projects/${testProjectId}`);
    console.log('✅ Project detail retrieved:', projectDetailRes.data.data.name);
    console.log('   - Total Budget:', projectDetailRes.data.data.budget);
    console.log('   - Stats:', projectDetailRes.data.data.stats);

    // Get budget analysis
    const budgetRes = await api.get(`/projects/${testProjectId}/budget-analysis`);
    console.log('✅ Budget analysis:', budgetRes.data.data);

    // ==================== COST TESTS ====================
    console.log('\n💰 Testing Costs API...');

    // Create cost
    const costRes = await api.post('/costs', {
      projectId: testProjectId,
      description: 'Test Development Cost',
      amount: 5000,
      category: 'Development',
      date: new Date().toISOString(),
      submittedBy: testUserId,
      invoiceNumber: 'INV-001'
    });
    testCostId = costRes.data.data.id;
    console.log('✅ Cost created:', costRes.data.data.id);

    // Get all costs
    const costsRes = await api.get('/costs?take=5');
    console.log('✅ Costs list retrieved:', costsRes.data.pagination.total, 'total');

    // Get cost by ID
    const costDetailRes = await api.get(`/costs/${testCostId}`);
    console.log('✅ Cost detail retrieved:', costDetailRes.data.data.description);

    // Get cost summary
    const costSummaryRes = await api.get(`/costs/project/${testProjectId}/summary`);
    console.log('✅ Cost summary retrieved:', costSummaryRes.data.data);

    // Create another cost for testing
    const cost2Res = await api.post('/costs', {
      projectId: testProjectId,
      description: 'Test Design Cost',
      amount: 3000,
      category: 'Design',
      submittedBy: testUserId
    });

    // ==================== APPROVAL TESTS ====================
    console.log('\n✔️ Testing Approvals API...');

    // Approve cost
    const approveRes = await api.post(`/costs/${testCostId}/approve`, {
      approvedBy: testUserId,
      comment: 'Approved for payment'
    });
    console.log('✅ Cost approved:', approveRes.data.data.approval.id);

    // Get all approvals
    const approvalsRes = await api.get('/approvals?take=5');
    console.log('✅ Approvals list retrieved:', approvalsRes.data.pagination.total, 'total');

    // Get pending approvals
    const pendingRes = await api.get(`/pending-approvals?approvedBy=${testUserId}`);
    console.log('✅ Pending approvals retrieved:', pendingRes.data.pagination.total, 'pending');

    // Get cost approvals
    const costApprovalsRes = await api.get(`/costs/${testCostId}/approvals`);
    console.log('✅ Cost approvals retrieved:', costApprovalsRes.data.data.length);

    // Reject another cost
    const rejectRes = await api.post(`/costs/${cost2Res.data.data.id}/reject`, {
      approvedBy: testUserId,
      comment: 'Rejected due to insufficient budget'
    });
    console.log('✅ Cost rejected:', rejectRes.data.data.approval.status);

    // ==================== ATTACHMENT TESTS ====================
    console.log('\n📎 Testing Attachments API...');

    // Get all attachments
    const attachmentsRes = await api.get('/attachments?take=5');
    console.log('✅ Attachments list retrieved:', attachmentsRes.data.pagination.total, 'total');

    // Get cost attachments
    const costAttachmentsRes = await api.get(`/costs/${testCostId}/attachments`);
    console.log('✅ Cost attachments retrieved:', costAttachmentsRes.data.data.length);

    // ==================== DASHBOARD TESTS ====================
    console.log('\n📈 Testing Dashboard API...');

    // Get dashboard summary
    const dashboardRes = await api.get('/dashboard');
    console.log('✅ Dashboard summary retrieved:');
    console.log('   - Total Users:', dashboardRes.data.data.summary.totalUsers);
    console.log('   - Total Projects:', dashboardRes.data.data.summary.totalProjects);
    console.log('   - Total Costs:', dashboardRes.data.data.summary.totalCosts);
    console.log('   - Total Spent:', dashboardRes.data.data.summary.totalSpent);

    // Get projects dashboard
    const projectsDashRes = await api.get('/dashboard/projects');
    console.log('✅ Projects dashboard retrieved:');
    console.log('   - Total Budget:', projectsDashRes.data.data.summary.totalBudget);
    console.log('   - Total Spent:', projectsDashRes.data.data.summary.totalSpent);
    console.log('   - Active Projects:', projectsDashRes.data.data.summary.activeProjects);

    // Get costs dashboard
    const costsDashRes = await api.get('/dashboard/costs');
    console.log('✅ Costs dashboard retrieved:');
    console.log('   - Total Amount:', costsDashRes.data.data.summary.totalAmount);
    console.log('   - Total Count:', costsDashRes.data.data.summary.totalCount);

    // Get project-specific dashboard
    const projectDashRes = await api.get(`/dashboard/project/${testProjectId}`);
    console.log('✅ Project dashboard retrieved:');
    console.log('   - Project Stats:', projectDashRes.data.data.projectStats);

    // Get user dashboard
    const userDashRes = await api.get(`/dashboard/user/${testUserId}`);
    console.log('✅ User dashboard retrieved:');
    console.log('   - User Stats:', userDashRes.data.data.userStats);

    // ==================== UPDATE TESTS ====================
    console.log('\n🔄 Testing Update Operations...');

    // Update project
    const updateProjectRes = await api.put(`/projects/${testProjectId}`, {
      name: 'Updated Test Project',
      budget: 60000
    });
    console.log('✅ Project updated:', updateProjectRes.data.data.name);

    // Update cost
    const updateCostRes = await api.put(`/costs/${testCostId}`, {
      description: 'Updated Test Cost',
      amount: 5500
    });
    console.log('✅ Cost updated:', updateCostRes.data.data.description);

    // Update user
    const updateUserRes = await api.put(`/users/${testUserId}`, {
      name: 'Updated Test User'
    });
    console.log('✅ User updated:', updateUserRes.data.data.name);

    // Change password
    const changePassRes = await api.put(`/users/${testUserId}/change-password`, {
      currentPassword: 'Test@123456',
      newPassword: 'NewPass@123456'
    });
    console.log('✅ Password changed successfully');

    // Get user activity
    const userActivityRes = await api.get(`/users/${testUserId}/activity`);
    console.log('✅ User activity retrieved:', userActivityRes.data.data.activity);

    // ==================== SUMMARY ====================
    console.log('\n✨ All API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   - Created User:', testUserId);
    console.log('   - Created Project:', testProjectId);
    console.log('   - Created Cost:', testCostId);
    console.log('   - Total Endpoints Tested: 30+');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI().then(() => {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
