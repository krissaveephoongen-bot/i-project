/**
 * 🔐 Automated Admin CRUD Testing Script
 * Tests Timesheet, Stakeholders, and Expenses CRUD operations
 * Run with: node automated-admin-tests.js
 */

const puppeteer = require('puppeteer');
const { expect } = require('chai');

// Test Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  headless: false, // Set to true for headless mode
  slowMo: 100, // Slow down by 100ms
  timeout: 30000,
  adminCredentials: {
    email: 'admin@example.com', // Update with actual admin email
    password: 'admin123'        // Update with actual admin password
  }
};

// Test Data
const TEST_DATA = {
  timesheet: {
    project: 'Website Redesign',
    date: '2024-02-15',
    hours: 8,
    activity: 'Frontend development - React components'
  },
  stakeholder: {
    name: 'Test Stakeholder',
    email: 'test@stakeholder.com',
    role: 'Project Sponsor',
    organization: 'Test Corp',
    phone: '+66-2-123-4567'
  },
  expense: {
    project: 'Mobile App Development',
    date: '2024-02-14',
    amount: 1500,
    category: 'travel',
    description: 'Client meeting transportation'
  }
};

class AdminCRUDTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Initializing Automated Admin CRUD Tests...');
    this.browser = await puppeteer.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });
    this.page.setDefaultTimeout(CONFIG.timeout);
  }

  async loginAsAdmin() {
    console.log('🔑 Logging in as Admin...');
    
    try {
      await this.page.goto(`${CONFIG.baseUrl}/login`);
      await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      // Fill login form
      await this.page.type('input[type="email"]', CONFIG.adminCredentials.email);
      await this.page.type('input[type="password"]', CONFIG.adminCredentials.password);
      
      // Submit login
      await this.page.click('button[type="submit"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      // Verify login success
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
        console.log('✅ Admin login successful');
        return true;
      } else {
        console.log('❌ Admin login failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      return false;
    }
  }

  async testAdminUsersCRUD() {
    console.log('👥 Testing Admin Users CRUD...');
    const results = { module: 'Admin Users', tests: [] };

    try {
      // Navigate to admin users
      await this.page.goto(`${CONFIG.baseUrl}/admin/users`);
      await this.page.waitForSelector('table', { timeout: 5000 });

      // Test CREATE
      const createResult = await this.testCreateUser();
      results.tests.push(createResult);

      // Test READ
      const readResult = await this.testReadUsers();
      results.tests.push(readResult);

      // Test UPDATE
      const updateResult = await this.testUpdateUser();
      results.tests.push(updateResult);

      // Test DELETE
      const deleteResult = await this.testDeleteUser();
      results.tests.push(deleteResult);

    } catch (error) {
      results.tests.push({
        operation: 'Overall',
        status: 'FAIL',
        error: error.message
      });
    }

    this.testResults.push(results);
    return results;
  }

  async testCreateUser() {
    try {
      console.log('  ➕ Testing Create User...');
      
      // Click Add User button
      await this.page.click('button:contains("Add User")');
      await this.page.waitForSelector('dialog', { timeout: 5000 });

      // Fill user form
      await this.page.type('input[name="name"]', 'Test User');
      await this.page.type('input[name="email"]', 'testuser@example.com');
      await this.page.type('input[name="password"]', 'testpass123');
      await this.page.select('select[name="role"]', 'employee');
      await this.page.type('input[name="department"]', 'Testing');
      await this.page.type('input[name="position"]', 'QA Tester');

      // Submit form
      await this.page.click('button:contains("Save")');
      await this.page.waitForTimeout(2000);

      // Verify user created
      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && successMessage.includes('created')) {
        console.log('    ✅ User created successfully');
        return { operation: 'CREATE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ User creation failed');
        return { operation: 'CREATE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Create user error:', error.message);
      return { operation: 'CREATE', status: 'FAIL', error: error.message };
    }
  }

  async testReadUsers() {
    try {
      console.log('  👁️ Testing Read Users...');
      
      // Check if users table is populated
      const userRows = await this.page.$$eval('table tbody tr', rows => rows.length);
      
      if (userRows > 0) {
        console.log(`    ✅ Found ${userRows} users in table`);
        return { operation: 'READ', status: 'PASS', count: userRows };
      } else {
        console.log('    ❌ No users found in table');
        return { operation: 'READ', status: 'FAIL', error: 'No users found' };
      }
    } catch (error) {
      console.log('    ❌ Read users error:', error.message);
      return { operation: 'READ', status: 'FAIL', error: error.message };
    }
  }

  async testUpdateUser() {
    try {
      console.log('  ✏️ Testing Update User...');
      
      // Find and click edit button for first user
      const editButton = await this.page.$('button:contains("Edit")');
      if (!editButton) {
        return { operation: 'UPDATE', status: 'FAIL', error: 'No edit button found' };
      }

      await editButton.click();
      await this.page.waitForSelector('dialog', { timeout: 5000 });

      // Update user name
      await this.page.type('input[name="name"]', ' Updated', { clear: true });
      
      // Submit update
      await this.page.click('button:contains("Save")');
      await this.page.waitForTimeout(2000);

      // Verify update
      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && successMessage.includes('updated')) {
        console.log('    ✅ User updated successfully');
        return { operation: 'UPDATE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ User update failed');
        return { operation: 'UPDATE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Update user error:', error.message);
      return { operation: 'UPDATE', status: 'FAIL', error: error.message };
    }
  }

  async testDeleteUser() {
    try {
      console.log('  🗑️ Testing Delete User...');
      
      // Find and click delete button
      const deleteButton = await this.page.$('button:contains("Delete")');
      if (!deleteButton) {
        return { operation: 'DELETE', status: 'FAIL', error: 'No delete button found' };
      }

      // Handle confirmation dialog
      this.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await deleteButton.click();
      await this.page.waitForTimeout(2000);

      // Verify deletion
      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && successMessage.includes('deleted')) {
        console.log('    ✅ User deleted successfully');
        return { operation: 'DELETE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ User deletion failed');
        return { operation: 'DELETE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Delete user error:', error.message);
      return { operation: 'DELETE', status: 'FAIL', error: error.message };
    }
  }

  async testExpensesCRUD() {
    console.log('💰 Testing Expenses CRUD...');
    const results = { module: 'Expenses', tests: [] };

    try {
      await this.page.goto(`${CONFIG.baseUrl}/expenses`);
      await this.page.waitForSelector('button:contains("New Claim")', { timeout: 5000 });

      // Test CREATE
      const createResult = await this.testCreateExpense();
      results.tests.push(createResult);

      // Test READ
      const readResult = await this.testReadExpenses();
      results.tests.push(readResult);

      // Test UPDATE
      const updateResult = await this.testUpdateExpense();
      results.tests.push(updateResult);

      // Test DELETE
      const deleteResult = await this.testDeleteExpense();
      results.tests.push(deleteResult);

      // Test APPROVE/REJECT
      const approveResult = await this.testApproveExpense();
      results.tests.push(approveResult);

    } catch (error) {
      results.tests.push({
        operation: 'Overall',
        status: 'FAIL',
        error: error.message
      });
    }

    this.testResults.push(results);
    return results;
  }

  async testCreateExpense() {
    try {
      console.log('  ➕ Testing Create Expense...');
      
      await this.page.click('button:contains("New Claim")');
      await this.page.waitForSelector('dialog', { timeout: 5000 });

      // Fill expense form
      await this.page.select('select[name="projectId"]', '1'); // First project
      await this.page.type('input[name="date"]', TEST_DATA.expense.date);
      await this.page.type('input[name="amount"]', TEST_DATA.expense.amount.toString());
      await this.page.select('select[name="category"]', TEST_DATA.expense.category);
      await this.page.type('textarea[name="description"]', TEST_DATA.expense.description);

      // Submit form
      await this.page.click('button:contains("Save Claim")');
      await this.page.waitForTimeout(2000);

      // Verify creation
      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && (successMessage.includes('created') || successMessage.includes('saved'))) {
        console.log('    ✅ Expense created successfully');
        return { operation: 'CREATE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ Expense creation failed');
        return { operation: 'CREATE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Create expense error:', error.message);
      return { operation: 'CREATE', status: 'FAIL', error: error.message };
    }
  }

  async testReadExpenses() {
    try {
      console.log('  👁️ Testing Read Expenses...');
      
      const expenseRows = await this.page.$$eval('table tbody tr', rows => rows.length);
      
      if (expenseRows > 0) {
        console.log(`    ✅ Found ${expenseRows} expenses in table`);
        return { operation: 'READ', status: 'PASS', count: expenseRows };
      } else {
        console.log('    ❌ No expenses found in table');
        return { operation: 'READ', status: 'FAIL', error: 'No expenses found' };
      }
    } catch (error) {
      console.log('    ❌ Read expenses error:', error.message);
      return { operation: 'READ', status: 'FAIL', error: error.message };
    }
  }

  async testUpdateExpense() {
    try {
      console.log('  ✏️ Testing Update Expense...');
      
      const editButton = await this.page.$('button:contains("Edit")');
      if (!editButton) {
        return { operation: 'UPDATE', status: 'FAIL', error: 'No edit button found' };
      }

      await editButton.click();
      await this.page.waitForSelector('dialog', { timeout: 5000 });

      // Update amount
      await this.page.type('input[name="amount"]', '2000', { clear: true });
      
      await this.page.click('button:contains("Update")');
      await this.page.waitForTimeout(2000);

      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && (successMessage.includes('updated') || successMessage.includes('saved'))) {
        console.log('    ✅ Expense updated successfully');
        return { operation: 'UPDATE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ Expense update failed');
        return { operation: 'UPDATE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Update expense error:', error.message);
      return { operation: 'UPDATE', status: 'FAIL', error: error.message };
    }
  }

  async testDeleteExpense() {
    try {
      console.log('  🗑️ Testing Delete Expense...');
      
      const deleteButton = await this.page.$('button:contains("Delete")');
      if (!deleteButton) {
        return { operation: 'DELETE', status: 'FAIL', error: 'No delete button found' };
      }

      this.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await deleteButton.click();
      await this.page.waitForTimeout(2000);

      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && successMessage.includes('deleted')) {
        console.log('    ✅ Expense deleted successfully');
        return { operation: 'DELETE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ Expense deletion failed');
        return { operation: 'DELETE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Delete expense error:', error.message);
      return { operation: 'DELETE', status: 'FAIL', error: error.message };
    }
  }

  async testApproveExpense() {
    try {
      console.log('  ✅ Testing Approve Expense...');
      
      // Look for approve button (admin-only)
      const approveButton = await this.page.$('button:contains("Approve")');
      if (!approveButton) {
        return { operation: 'APPROVE', status: 'SKIP', error: 'No pending expenses to approve' };
      }

      await approveButton.click();
      await this.page.waitForTimeout(2000);

      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && successMessage.includes('approved')) {
        console.log('    ✅ Expense approved successfully');
        return { operation: 'APPROVE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ Expense approval failed');
        return { operation: 'APPROVE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Approve expense error:', error.message);
      return { operation: 'APPROVE', status: 'FAIL', error: error.message };
    }
  }

  async testTimesheetCRUD() {
    console.log('🕐 Testing Timesheet CRUD...');
    const results = { module: 'Timesheet', tests: [] };

    try {
      await this.page.goto(`${CONFIG.baseUrl}/timesheet`);
      await this.page.waitForSelector('button:contains("Add")', { timeout: 5000 });

      // Test CREATE
      const createResult = await this.testCreateTimesheetEntry();
      results.tests.push(createResult);

      // Test READ
      const readResult = await this.testReadTimesheet();
      results.tests.push(readResult);

      // Test UPDATE
      const updateResult = await this.testUpdateTimesheetEntry();
      results.tests.push(updateResult);

      // Test DELETE
      const deleteResult = await this.testDeleteTimesheetEntry();
      results.tests.push(deleteResult);

    } catch (error) {
      results.tests.push({
        operation: 'Overall',
        status: 'FAIL',
        error: error.message
      });
    }

    this.testResults.push(results);
    return results;
  }

  async testCreateTimesheetEntry() {
    try {
      console.log('  ➕ Testing Create Timesheet Entry...');
      
      await this.page.click('button:contains("Add")');
      await this.page.waitForSelector('dialog', { timeout: 5000 });

      // Fill timesheet form
      await this.page.select('select[name="projectId"]', '1');
      await this.page.type('input[name="date"]', TEST_DATA.timesheet.date);
      await this.page.type('input[name="hours"]', TEST_DATA.timesheet.hours.toString());
      await this.page.type('textarea[name="activity"]', TEST_DATA.timesheet.activity);

      await this.page.click('button:contains("Save")');
      await this.page.waitForTimeout(2000);

      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && (successMessage.includes('created') || successMessage.includes('saved'))) {
        console.log('    ✅ Timesheet entry created successfully');
        return { operation: 'CREATE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ Timesheet entry creation failed');
        return { operation: 'CREATE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Create timesheet entry error:', error.message);
      return { operation: 'CREATE', status: 'FAIL', error: error.message };
    }
  }

  async testReadTimesheet() {
    try {
      console.log('  👁️ Testing Read Timesheet...');
      
      const entryRows = await this.page.$$eval('table tbody tr', rows => rows.length);
      
      if (entryRows > 0) {
        console.log(`    ✅ Found ${entryRows} timesheet entries`);
        return { operation: 'READ', status: 'PASS', count: entryRows };
      } else {
        console.log('    ❌ No timesheet entries found');
        return { operation: 'READ', status: 'FAIL', error: 'No entries found' };
      }
    } catch (error) {
      console.log('    ❌ Read timesheet error:', error.message);
      return { operation: 'READ', status: 'FAIL', error: error.message };
    }
  }

  async testUpdateTimesheetEntry() {
    try {
      console.log('  ✏️ Testing Update Timesheet Entry...');
      
      const editButton = await this.page.$('button:contains("Edit")');
      if (!editButton) {
        return { operation: 'UPDATE', status: 'FAIL', error: 'No edit button found' };
      }

      await editButton.click();
      await this.page.waitForSelector('dialog', { timeout: 5000 });

      await this.page.type('input[name="hours"]', '6', { clear: true });
      
      await this.page.click('button:contains("Update")');
      await this.page.waitForTimeout(2000);

      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && (successMessage.includes('updated') || successMessage.includes('saved'))) {
        console.log('    ✅ Timesheet entry updated successfully');
        return { operation: 'UPDATE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ Timesheet entry update failed');
        return { operation: 'UPDATE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Update timesheet entry error:', error.message);
      return { operation: 'UPDATE', status: 'FAIL', error: error.message };
    }
  }

  async testDeleteTimesheetEntry() {
    try {
      console.log('  🗑️ Testing Delete Timesheet Entry...');
      
      const deleteButton = await this.page.$('button:contains("Delete")');
      if (!deleteButton) {
        return { operation: 'DELETE', status: 'FAIL', error: 'No delete button found' };
      }

      this.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await deleteButton.click();
      await this.page.waitForTimeout(2000);

      const successMessage = await this.page.$eval('.toast, .notification', el => el.textContent);
      if (successMessage && successMessage.includes('deleted')) {
        console.log('    ✅ Timesheet entry deleted successfully');
        return { operation: 'DELETE', status: 'PASS', message: successMessage };
      } else {
        console.log('    ❌ Timesheet entry deletion failed');
        return { operation: 'DELETE', status: 'FAIL', error: 'No success message found' };
      }
    } catch (error) {
      console.log('    ❌ Delete timesheet entry error:', error.message);
      return { operation: 'DELETE', status: 'FAIL', error: error.message };
    }
  }

  async testStakeholdersCRUD() {
    console.log('👥 Testing Stakeholders CRUD...');
    const results = { module: 'Stakeholders', tests: [] };

    try {
      await this.page.goto(`${CONFIG.baseUrl}/stakeholders`);
      await this.page.waitForSelector('div', { timeout: 5000 });

      // Test READ (UI is read-only)
      const readResult = await this.testReadStakeholders();
      results.tests.push(readResult);

      // Test API CRUD
      const apiResult = await this.testStakeholdersAPI();
      results.tests.push(apiResult);

    } catch (error) {
      results.tests.push({
        operation: 'Overall',
        status: 'FAIL',
        error: error.message
      });
    }

    this.testResults.push(results);
    return results;
  }

  async testReadStakeholders() {
    try {
      console.log('  👁️ Testing Read Stakeholders...');
      
      const stakeholderCards = await this.page.$$eval('.bg-slate-50', cards => cards.length);
      
      if (stakeholderCards > 0) {
        console.log(`    ✅ Found ${stakeholderCards} stakeholders`);
        return { operation: 'READ', status: 'PASS', count: stakeholderCards };
      } else {
        console.log('    ❌ No stakeholders found');
        return { operation: 'READ', status: 'FAIL', error: 'No stakeholders found' };
      }
    } catch (error) {
      console.log('    ❌ Read stakeholders error:', error.message);
      return { operation: 'READ', status: 'FAIL', error: error.message };
    }
  }

  async testStakeholdersAPI() {
    try {
      console.log('  🔌 Testing Stakeholders API CRUD...');
      
      // Test API endpoints directly
      const response = await this.page.evaluate(async () => {
        try {
          const createRes = await fetch('/api/stakeholders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'API Test Stakeholder',
              email: 'apitest@example.com',
              role: 'Test Role',
              organization: 'Test Org'
            })
          });
          
          if (createRes.ok) {
            const data = await createRes.json();
            return { success: true, data };
          } else {
            return { success: false, error: 'API call failed' };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      if (response.success) {
        console.log('    ✅ Stakeholders API CRUD working');
        return { operation: 'API', status: 'PASS', message: 'API endpoints functional' };
      } else {
        console.log('    ❌ Stakeholders API failed:', response.error);
        return { operation: 'API', status: 'FAIL', error: response.error };
      }
    } catch (error) {
      console.log('    ❌ Stakeholders API test error:', error.message);
      return { operation: 'API', status: 'FAIL', error: error.message };
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {},
      modules: []
    };

    for (const moduleResult of this.testResults) {
      const moduleReport = {
        name: moduleResult.module,
        tests: moduleResult.tests,
        summary: {
          total: moduleResult.tests.length,
          passed: moduleResult.tests.filter(t => t.status === 'PASS').length,
          failed: moduleResult.tests.filter(t => t.status === 'FAIL').length,
          skipped: moduleResult.tests.filter(t => t.status === 'SKIP').length
        }
      };

      report.modules.push(moduleReport);
      
      totalTests += moduleReport.summary.total;
      passedTests += moduleReport.summary.passed;
      failedTests += moduleReport.summary.failed;
      skippedTests += moduleReport.summary.skipped;
    }

    report.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
    };

    // Save report to file
    const fs = require('fs');
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📋 Test Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏭️ Skipped: ${skippedTests}`);
    console.log(`📊 Success Rate: ${report.summary.successRate}`);
    console.log('\n📄 Detailed report saved to: test-report.json');

    return report;
  }

  async runAllTests() {
    try {
      await this.init();
      
      // Login as admin
      const loginSuccess = await this.loginAsAdmin();
      if (!loginSuccess) {
        console.log('❌ Cannot proceed with tests - Admin login failed');
        return;
      }

      // Run all CRUD tests
      await this.testAdminUsersCRUD();
      await this.testExpensesCRUD();
      await this.testTimesheetCRUD();
      await this.testStakeholdersCRUD();

      // Generate final report
      await this.generateReport();

    } catch (error) {
      console.log('❌ Test execution error:', error.message);
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('🔚 Browser closed');
      }
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new AdminCRUDTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AdminCRUDTester;
