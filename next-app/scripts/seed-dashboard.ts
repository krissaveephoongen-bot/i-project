import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Hardcoded mock data for dashboard
const revenueCostData = [
  { month: "Jan", revenue: 120000, cost: 95000 },
  { month: "Feb", revenue: 135000, cost: 105000 },
  { month: "Mar", revenue: 150000, cost: 115000 },
  { month: "Apr", revenue: 145000, cost: 110000 },
  { month: "May", revenue: 160000, cost: 120000 },
  { month: "Jun", revenue: 175000, cost: 130000 },
];

const teamLoadData = [
  { name: "John Doe", mon: 8, tue: 8, wed: 6, thu: 8, fri: 7 },
  { name: "Jane Smith", mon: 7, tue: 8, wed: 8, thu: 6, fri: 8 },
  { name: "Bob Johnson", mon: 6, tue: 7, wed: 8, thu: 8, fri: 6 },
  { name: "Alice Brown", mon: 8, tue: 6, wed: 7, thu: 8, fri: 8 },
  { name: "Charlie Wilson", mon: 7, tue: 8, wed: 6, thu: 7, fri: 8 },
];

async function seedDashboardData() {
  console.log("Starting dashboard data seeding...");

  // Seed revenue cost data
  const { error: revenueError } = await supabase
    .from("revenue_cost_data")
    .insert(revenueCostData);

  if (revenueError) {
    console.error("Error inserting revenue cost data:", revenueError);
  } else {
    console.log("Inserted revenue cost data");
  }

  // Seed team load data
  const { error: teamError } = await supabase
    .from("team_load_data")
    .insert(teamLoadData);

  if (teamError) {
    console.error("Error inserting team load data:", teamError);
  } else {
    console.log("Inserted team load data");
  }

  console.log("Dashboard data seeding completed!");
}

// Run the seeding
seedDashboardData().catch(console.error);
