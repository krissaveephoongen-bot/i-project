import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

// Create supabase client with loaded environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seedBasicData() {
  console.log("Seeding basic data...");

  try {
    // Define users
    const users = [
      {
        name: "Thanongsak Thongkwid",
        role: "Manager",
        email: "thanongsak.th@appworks.co.th",
      },
      {
        name: "Pratya Fufueng",
        role: "Manager",
        email: "pratya.fu@appworks.co.th",
      },
      {
        name: "Jakgrits Phoongen",
        role: "Employee",
        email: "jakgrits.ph@appworks.co.th",
      },
      {
        name: "Demo Employee",
        role: "Employee",
        email: "employee@company.com",
      },
      { name: "John Smith", role: "Employee", email: "john.smith@company.com" },
      { name: "Jane Doe", role: "Employee", email: "jane.doe@company.com" },
    ];

    // Insert users (handle duplicates)
    const { data: existingUsers, error: fetchError } = await supabase
      .from("users")
      .select("name, id");

    if (fetchError) throw fetchError;

    const existingUserNames = new Set(existingUsers?.map((u) => u.name) || []);
    const newUsers = users.filter((u) => !existingUserNames.has(u.name));

    let insertedUsers = existingUsers || [];

    if (newUsers.length > 0) {
      const { data: newInsertedUsers, error: userError } = await supabase
        .from("users")
        .insert(newUsers)
        .select();

      if (userError) throw userError;
      insertedUsers = [...insertedUsers, ...newInsertedUsers!];
      console.log("Inserted new users:", newInsertedUsers?.length);
    } else {
      console.log("All users already exist");
    }

    // Create user map
    const userMap = new Map(insertedUsers!.map((u) => [u.name, u.id]));

    // Insert projects (without dashboard-specific columns for now)
    const projects = [
      {
        name: "Enterprise ERP Implementation",
        status: "Active",
        progress: 65,
        budget: 15000000,
        spent: 8500000,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        manager_id: userMap.get("Thanongsak Thongkwid"),
      },
      {
        name: "Mobile Banking App",
        status: "Active",
        progress: 45,
        budget: 8000000,
        spent: 3200000,
        start_date: "2024-03-01",
        end_date: "2024-10-31",
        manager_id: userMap.get("Pratya Fufueng"),
      },
      {
        name: "Cloud Migration Project",
        status: "Planning",
        progress: 15,
        budget: 12000000,
        spent: 1800000,
        start_date: "2024-06-01",
        end_date: "2025-03-31",
        manager_id: userMap.get("Jakgrits Phoongen"),
      },
    ];

    const { data: insertedProjects, error: projectError } = await supabase
      .from("projects")
      .insert(projects)
      .select();

    if (projectError) throw projectError;
    console.log("Inserted projects:", insertedProjects?.length);

    // Insert sample tasks for first project
    const firstProject = insertedProjects![0];
    const tasks = [
      {
        project_id: firstProject.id,
        name: "Requirements Analysis",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        progress: 100,
        dependencies: [],
      },
      {
        project_id: firstProject.id,
        name: "System Design",
        start_date: "2024-02-01",
        end_date: "2024-03-15",
        progress: 85,
        dependencies: [],
      },
      {
        project_id: firstProject.id,
        name: "Development Phase 1",
        start_date: "2024-03-01",
        end_date: "2024-06-30",
        progress: 60,
        dependencies: [],
      },
      {
        project_id: firstProject.id,
        name: "Testing & QA",
        start_date: "2024-07-01",
        end_date: "2024-09-30",
        progress: 20,
        dependencies: [],
      },
      {
        project_id: firstProject.id,
        name: "Deployment",
        start_date: "2024-10-01",
        end_date: "2024-12-31",
        progress: 5,
        dependencies: [],
      },
    ];

    const { data: insertedTasks, error: taskError } = await supabase
      .from("tasks")
      .insert(tasks)
      .select();

    if (taskError) throw taskError;
    console.log("Inserted tasks:", insertedTasks?.length);

    // Insert sample risks
    const risks = [
      {
        project_id: firstProject.id,
        risk: "Scope Creep",
        probability: "High",
        impact: "High",
        mitigation: "Implement strict change control process",
      },
      {
        project_id: firstProject.id,
        risk: "Resource Availability",
        probability: "Medium",
        impact: "Medium",
        mitigation: "Cross-train team members and maintain backup resources",
      },
      {
        project_id: firstProject.id,
        risk: "Technical Complexity",
        probability: "Low",
        impact: "High",
        mitigation: "Conduct technical proof of concepts early",
      },
    ];

    const { data: insertedRisks, error: riskError } = await supabase
      .from("risks")
      .insert(risks)
      .select();

    if (riskError) throw riskError;
    console.log("Inserted risks:", insertedRisks?.length);

    console.log("Basic data seeding completed successfully!");
    console.log(`- ${insertedUsers?.length} users`);
    console.log(`- ${insertedProjects?.length} projects`);
    console.log(`- ${insertedTasks?.length} tasks`);
    console.log(`- ${insertedRisks?.length} risks`);
  } catch (error) {
    console.error("Error seeding basic data:", error);
  }
}

seedBasicData();
