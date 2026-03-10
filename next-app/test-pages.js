// Comprehensive Page Testing Script
// This script will test all pages in the application

const pages = [
  // Main pages
  { path: "/", name: "Home/Dashboard" },
  { path: "/projects", name: "Projects List" },
  { path: "/projects/weekly-activities", name: "Weekly Activities" },

  // Project detail pages
  { path: "/projects/test-id", name: "Project Detail" },
  { path: "/projects/test-id/budget", name: "Project Budget" },
  { path: "/projects/test-id/documents", name: "Project Documents" },
  { path: "/projects/test-id/milestones", name: "Project Milestones" },
  { path: "/projects/test-id/risks", name: "Project Risks" },
  { path: "/projects/test-id/tasks", name: "Project Tasks" },
  { path: "/projects/test-id/team", name: "Project Team" },

  // Reports
  { path: "/reports", name: "Reports" },
  { path: "/reports/financial", name: "Financial Reports" },
  { path: "/reports/projects", name: "Project Reports" },
  { path: "/reports/resources", name: "Resource Reports" },

  // Resources
  { path: "/resources", name: "Resources" },

  // Settings
  { path: "/settings", name: "Settings" },

  // Staff pages
  { path: "/staff", name: "Staff" },

  // Login (unified)
  { path: "/login", name: "Unified Login" },

  // Tasks
  { path: "/tasks", name: "Tasks" },

  // Timesheet
  { path: "/timesheet", name: "Timesheet" },

  // Users
  { path: "/users", name: "Users" },
  { path: "/users/profile", name: "User Profile" },

  // Vendor pages
  { path: "/vendor", name: "Vendor" },

  // Approvals
  { path: "/approval", name: "Approval" },
  { path: "/approvals/expenses", name: "Expense Approvals" },
  { path: "/approvals/timesheets", name: "Timesheet Approvals" },

  // Profile
  { path: "/profile", name: "Profile" },

  // Stakeholders
  { path: "/stakeholders", name: "Stakeholders" },
];

// Test function to check if page loads
async function testPage(page) {
  try {
    const response = await fetch(`http://localhost:3001${page.path}`);
    return {
      ...page,
      status: response.status,
      success: response.ok,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ...page,
      status: "ERROR",
      success: false,
      error: error.message,
    };
  }
}

// Test all pages
async function testAllPages() {
  console.log("🧪 Testing all pages...\n");

  const results = [];

  for (const page of pages) {
    console.log(`📄 Testing: ${page.name} (${page.path})`);
    const result = await testPage(page);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${result.name} - Status: ${result.status}`);
    } else {
      console.log(`❌ ${result.name} - Error: ${result.error}`);
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log("\n📊 Test Summary:");
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log("\n❌ Failed Pages:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  return results;
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testAllPages = testAllPages;
  console.log("🔧 testAllPages() function available in console");
}

// For Node.js usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { testAllPages, pages };
}
