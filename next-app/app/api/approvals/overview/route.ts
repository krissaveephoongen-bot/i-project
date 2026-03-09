import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // timesheet | expense | all
    const priority = searchParams.get("priority"); // low | medium | high | urgent (mock for now as DB doesn't have it)

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Admin client missing" }, { status: 500 });
    }

    // Parallel fetch for pending items
    const [timesheetRes, expenseRes, usersRes, projectsRes] = await Promise.all([
      supabaseAdmin
        .from("time_entries")
        .select("*")
        .eq("status", "pending")
        .order("date", { ascending: true }),
      supabaseAdmin
        .from("expenses")
        .select("*")
        .eq("status", "pending")
        .order("date", { ascending: true }),
      supabaseAdmin.from("users").select("id, name, email, avatar_url"),
      supabaseAdmin.from("projects").select("id, name, code"),
    ]);

    if (timesheetRes.error) throw timesheetRes.error;
    if (expenseRes.error) throw expenseRes.error;

    const usersMap = new Map(usersRes.data?.map((u) => [u.id, u]) || []);
    const projectsMap = new Map(projectsRes.data?.map((p) => [p.id, p]) || []);

    const pendingApprovals: any[] = [];

    // Process Timesheets
    if (!type || type === "timesheet") {
      (timesheetRes.data || []).forEach((t: any) => {
        const user = usersMap.get(t.user_id);
        const project = projectsMap.get(t.project_id);
        pendingApprovals.push({
          requestId: t.id,
          type: "timesheet",
          title: `Timesheet: ${t.hours}h - ${project?.code || "No Project"}`,
          description: t.description || "No description",
          requestedBy: user?.name || "Unknown",
          requestedByEmail: user?.email || "",
          requestedAt: t.created_at || t.date,
          status: t.status,
          priority: "medium", // Default priority
          amount: t.hours,
          currency: "Hrs",
          projectName: project?.name || "No Project",
          metadata: { date: t.date, ...t },
        });
      });
    }

    // Process Expenses
    if (!type || type === "expense") {
      (expenseRes.data || []).forEach((e: any) => {
        const user = usersMap.get(e.user_id);
        const project = projectsMap.get(e.project_id);
        pendingApprovals.push({
          requestId: e.id,
          type: "expense",
          title: `Expense: ${e.category}`,
          description: e.description || "No description",
          requestedBy: user?.name || "Unknown",
          requestedByEmail: user?.email || "",
          requestedAt: e.created_at || e.date,
          status: e.status,
          priority: e.amount > 5000 ? "high" : "medium", // Logic for priority
          amount: e.amount,
          currency: "THB",
          projectName: project?.name || "No Project",
          metadata: { date: e.date, ...e },
        });
      });
    }

    // Filter by priority if requested (mock logic)
    const filtered = priority
      ? pendingApprovals.filter((i) => i.priority === priority)
      : pendingApprovals;

    // Calculate Stats
    const stats = [
      {
        type: "timesheet",
        status: "pending",
        count: (timesheetRes.data || []).length,
        totalAmount: (timesheetRes.data || []).reduce((s: number, i: any) => s + Number(i.hours), 0),
      },
      {
        type: "expense",
        status: "pending",
        count: (expenseRes.data || []).length,
        totalAmount: (expenseRes.data || []).reduce((s: number, i: any) => s + Number(i.amount), 0),
      },
    ];

    const priorityStats = [
      { priority: "high", count: pendingApprovals.filter((i) => i.priority === "high").length },
      { priority: "medium", count: pendingApprovals.filter((i) => i.priority === "medium").length },
      { priority: "low", count: pendingApprovals.filter((i) => i.priority === "low").length },
    ];

    // Mock history for now (or fetch approved/rejected items)
    const history = []; // TODO: Implement fetch history

    return NextResponse.json({
      pending: filtered,
      stats,
      priorityStats,
      recentApprovals: [], // TODO: Implement recent
      history,
    });
  } catch (e: any) {
    console.error("Approval Overview Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
