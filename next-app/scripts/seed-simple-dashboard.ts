import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

// Create supabase client with loaded environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function seedSimpleDashboard() {
  console.log("Seeding simple dashboard data...");

  try {
    // Get existing projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(
        "id, name, progress, budget, spent, start_date, end_date, users!manager_id(name)",
      );

    if (projectsError) throw projectsError;

    if (!projects || projects.length === 0) {
      console.log("No projects found. Please seed projects first.");
      return;
    }

    console.log(`Found ${projects.length} projects`);

    // Create mock dashboard data based on existing projects
    const mockDashboardData = projects.map((project) => ({
      id: project.id,
      name: project.name,
      client: (project.users as any)?.name || "Unknown Manager",
      progressPlan: project.progress + 5,
      progressActual: project.progress,
      spi: Number((0.8 + Math.random() * 0.4).toFixed(2)),
      riskLevel: ["Low", "Medium", "High", "Critical"][
        Math.floor(Math.random() * 4)
      ],
      sparkline: [
        Math.floor(Math.random() * 30) + 40,
        Math.floor(Math.random() * 30) + 45,
        Math.floor(Math.random() * 30) + 50,
        Math.floor(Math.random() * 30) + 55,
      ],
    }));

    console.log(
      "Dashboard data prepared:",
      mockDashboardData.length,
      "projects",
    );

    // Create mock financial data
    const financialData = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const revenue = Math.floor(Math.random() * 5000000) + 7000000; // 7-12M THB
      const cost = Math.floor(revenue * (Math.random() * 0.3 + 0.6)); // 60-90% of revenue

      financialData.push({
        month: monthDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: revenue,
        cost: cost,
      });
    }

    // Create mock team load data
    const teamLoad = [
      { name: "Thanongsak T", mon: 8, tue: 7, wed: 8, thu: 6, fri: 5 },
      { name: "Pratya F", mon: 6, tue: 8, wed: 7, thu: 8, fri: 4 },
      { name: "Jakgrits P", mon: 7, tue: 6, wed: 8, thu: 7, fri: 6 },
      { name: "John Smith", mon: 5, tue: 6, wed: 5, thu: 7, fri: 4 },
      { name: "Jane Doe", mon: 8, tue: 8, wed: 6, thu: 5, fri: 3 },
    ];

    console.log("Financial data prepared:", financialData.length, "months");
    console.log("Team load data prepared:", teamLoad.length, "team members");

    // Save the data to a JSON file for the dashboard to use temporarily
    const fs = require("fs");
    const dashboardData = {
      projects: mockDashboardData,
      financialData: financialData,
      teamLoadData: teamLoad,
    };

    fs.writeFileSync(
      "./public/dashboard-data.json",
      JSON.stringify(dashboardData, null, 2),
    );
    console.log("Dashboard data saved to public/dashboard-data.json");

    console.log("Simple dashboard seeding completed!");
  } catch (error) {
    console.error("Error seeding simple dashboard:", error);
  }
}

seedSimpleDashboard();
