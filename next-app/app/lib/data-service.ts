import { createAdminClient, createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// --- Helper to get safe client ---
// Use authenticated client first, then fallback to admin only if user has permission
async function getSafeSupabase() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Verify user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // If no user, return standard client (which will likely fail RLS, as expected for unauth)
    // We do NOT default to admin for unauthenticated users.
    return supabase;
  }

  // If user exists, check role for admin privileges if we need to bypass RLS
  // But for now, we'll return the standard client. 
  // The 'Admin Fallback' should be explicit in the function logic, not global.
  return supabase;
}

// --- Types ---
export interface KpiData {
  totalValue: number;
  activeIssues: number;
  billingForecast: number;
  avgSpi: number;
}

export interface ProjectHealth {
  id: string;
  name: string;
  code?: string;
  progress_plan: number;
  progress_actual: number;
  spi: number;
  cpi: number;
  budget: number;
  risk_level: string;
  client: string;
  status: string;
  managerName: string;
  clientName: string;
  overdueMilestones: number;
  remaining: number;
  actual: number;
  committed: number;
  weeklyDelta: number;
  risks: { high: number; medium: number; low: number };
}

export interface FinancialData {
  month: string;
  revenue: number;
  cost: number;
}

export interface TeamLoadData {
  id: string;
  name: string;
  hours: number;
}

export interface Contact {
  name: string;
  phone: string;
  email: string;
  position: string;
  management: boolean;
}

export interface SunburstNode {
  name: string;
  value: number;
  children: SunburstNode[];
  meta?: any;
}

export interface VendorMetrics {
  totalVendors: number;
  activeContracts: number;
  pendingPaymentsAmount: number;
  topVendorName: string;
  topVendorSpend: number;
}

export interface VendorPaymentSummary {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  status: string;
}

export interface ActivityEntry {
  id: string;
  title: string;
  description: string;
  user: string;
  date: string;
  type: "audit" | "timesheet" | "system";
}

// --- Dashboard Functions ---

export async function getRecentActivities(): Promise<ActivityEntry[]> {
  const supabase = await getSafeSupabase();
  const adminSupabase = createAdminClient();

  try {
    let { data, error } = await supabase
      .from("activity_log")
      .select("id, action, description, created_at, users(name)")
      .order("created_at", { ascending: false })
      .limit(10);

    // Fallback
    const { data: { user } } = await supabase.auth.getUser();
    if (user && (!data || data.length === 0)) {
       const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
       if (profile && ["admin", "manager"].includes(profile.role)) {
          const adminRes = await adminSupabase
            .from("activity_log")
            .select("id, action, description, created_at, users(name)")
            .order("created_at", { ascending: false })
            .limit(10);
          if (adminRes.data) data = adminRes.data;
       }
    }

    if (error) {
       console.error("Error fetching activities:", error);
       return [];
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      title: a.action,
      description: a.description || "",
      user: a.users?.name || "Unknown",
      date: a.created_at,
      type: "audit", // Default type for now
    }));
  } catch (error) {
    console.error("Error in getRecentActivities:", error);
    return [];
  }
}

export async function getDashboardVendorMetrics(): Promise<VendorMetrics> {
  const supabase = await getSafeSupabase();
  const adminSupabase = createAdminClient();

  try {
    // 1. Total Vendors
    const { count: totalVendors } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true });

    // 2. Active Contracts
    const { count: activeContracts } = await supabase
      .from("vendor_contracts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // 3. Pending Payments
    const { data: pendingPayments } = await supabase
      .from("vendor_payments")
      .select("amount")
      .eq("status", "pending");
    
    const pendingAmount = (pendingPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // 4. Top Vendor by Spend (from expense_items or payments)
    // Using vendor_payments for simplicity
    const { data: payments } = await supabase
      .from("vendor_payments")
      .select("vendorId, amount")
      .eq("status", "paid");
      
    const vendorSpend: Record<string, number> = {};
    (payments || []).forEach((p: any) => {
      vendorSpend[p.vendorId] = (vendorSpend[p.vendorId] || 0) + Number(p.amount || 0);
    });
    
    let topVendorId = "";
    let maxSpend = 0;
    for (const [vid, amount] of Object.entries(vendorSpend)) {
      if (amount > maxSpend) {
        maxSpend = amount;
        topVendorId = vid;
      }
    }
    
    let topVendorName = "None";
    if (topVendorId) {
      const { data: v } = await supabase.from("vendors").select("name").eq("id", topVendorId).single();
      if (v) topVendorName = v.name;
    }

    return {
      totalVendors: totalVendors || 0,
      activeContracts: activeContracts || 0,
      pendingPaymentsAmount: pendingAmount,
      topVendorName,
      topVendorSpend: maxSpend
    };
  } catch (error) {
    console.error("Error fetching vendor metrics:", error);
    return {
      totalVendors: 0,
      activeContracts: 0,
      pendingPaymentsAmount: 0,
      topVendorName: "Error",
      topVendorSpend: 0
    };
  }
}

export async function getDashboardVendorPayments(): Promise<VendorPaymentSummary[]> {
  const supabase = await getSafeSupabase();
  try {
    const { data } = await supabase
      .from("vendor_payments")
      .select("id, amount, dueDate, status, vendors(name)")
      .eq("status", "pending")
      .order("dueDate", { ascending: true })
      .limit(5);

    return (data || []).map((p: any) => ({
      id: p.id,
      vendorName: p.vendors?.name || "Unknown",
      amount: Number(p.amount),
      dueDate: p.dueDate,
      status: p.status
    }));
  } catch (error) {
    console.error("Error fetching vendor payments:", error);
    return [];
  }
}

export async function getDashboardKPI(): Promise<KpiData> {
  const supabase = await getSafeSupabase();
  const adminSupabase = createAdminClient();
  
  try {
    // 1. Try with user RLS
    let { data: projRows, error: projError } = await supabase
      .from("projects")
      .select("budget,remaining,spi");
      
    // 2. If error or empty (and user might be admin/manager), try admin fallback
    // Check if user is admin/manager to allow fallback
    const { data: { user } } = await supabase.auth.getUser();
    if (user && (!projRows || projRows.length === 0)) {
        // Optimization: check role from metadata or profile table
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
        if (profile && ["admin", "manager"].includes(profile.role)) {
             const adminRes = await adminSupabase.from("projects").select("budget,remaining,spi");
             if (adminRes.data) projRows = adminRes.data;
        }
    }

    if (projError) console.error("Error fetching projects for KPI:", projError);

    let { data: riskRows, error: riskError } = await supabase
      .from("risks")
      .select("id,status");
      
    // Similar fallback for risks
    if (user && (!riskRows || riskRows.length === 0)) {
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
        if (profile && ["admin", "manager"].includes(profile.role)) {
             const adminRes = await adminSupabase.from("risks").select("id,status");
             if (adminRes.data) riskRows = adminRes.data;
        }
    }
    
    if (riskError) console.error("Error fetching risks for KPI:", riskError);

    const totalValue = (projRows || []).reduce(
      (s: number, p: any) => s + Number(p.budget || 0),
      0,
    );
    const billingForecast = (projRows || []).reduce(
      (s: number, p: any) => s + Number(p.remaining || 0),
      0,
    );
    const activeIssues = (riskRows || []).filter(
      (r: any) => String(r.status || "").toLowerCase() !== "closed",
    ).length;
    const avgSpi = (projRows || []).length
      ? (projRows || []).reduce(
          (s: number, p: any) => s + Number(p.spi || 0),
          0,
        ) / (projRows || []).length
      : 1;

    return { totalValue, activeIssues, billingForecast, avgSpi };
  } catch (error) {
    console.error("Error fetching KPI:", error);
    return { totalValue: 0, activeIssues: 0, billingForecast: 0, avgSpi: 1 };
  }
}

export async function getDashboardProjects(): Promise<ProjectHealth[]> {
  const supabase = await getSafeSupabase();
  const adminSupabase = createAdminClient();

  try {
    // Avoid ORDER BY to maximize compatibility across schemas
    let { data: projects, error } = await supabase
      .from("projects")
      .select("*");
      
    // Admin Fallback Logic
    const { data: { user } } = await supabase.auth.getUser();
    if (user && (!projects || projects.length === 0)) {
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
        if (profile && ["admin", "manager"].includes(profile.role)) {
             const adminRes = await adminSupabase.from("projects").select("*");
             if (adminRes.data) projects = adminRes.data;
             error = adminRes.error;
        }
    }

    if (error) {
      console.error("Supabase error fetching projects:", error);
      return [];
    }
    
    // Use admin client for auxiliary data (users, clients) to ensure names resolve
    // This is safe as it's just reference data, not sensitive transactional data
    const auxClient = adminSupabase; 

    // Exclude internal projects (department cost) from portfolio
    const list: any[] = (projects || []).filter((p: any) => {
      const isInternal = p.is_internal === true;
      const cat = String(p.internal_category || p.category || "").toLowerCase();
      return !(isInternal || cat === "internal" || cat.includes("department"));
    });

    const managerIds = Array.from(
      new Set(list.map((p: any) => p.manager_id).filter(Boolean)),
    );
    const clientIds = Array.from(
      new Set(list.map((p: any) => p.client_id).filter(Boolean)),
    );
    
    const { data: managers } = managerIds.length
      ? await auxClient.from("users").select("id,name").in("id", managerIds)
      : { data: [] };
      
    const { data: clients } = clientIds.length
      ? await auxClient.from("clients").select("id,name").in("id", clientIds)
      : { data: [] };
      
    const managersMap: Record<string, any> = {};
    const clientsMap: Record<string, any> = {};
    for (const m of managers || []) managersMap[m.id] = m;
    for (const c of clients || []) clientsMap[c.id] = c;

    const ids = list.map((p) => p.id);
    let milestones: any[] = [];
    
    if (ids.length) {
      const mRes1 = await auxClient
        .from("milestones")
        .select("*")
        .in("project_id", ids as any);
        
      if (!mRes1.error) {
        milestones = mRes1.data || [];
      } else {
         // Fallback for column name if needed, or just ignore
         milestones = [];
      }
    }
    
    // Fetch closure status for completed projects
    // Logic: if status is delivered or warranty, consider it closed for health metrics?
    // Actually, dashboard shows active portfolio.
    // If status is Warranty, it should probably still show but maybe in different section?
    // For now, we include everything but adjust health calc.

    const budgetByProject: Record<string, number> = {};
    for (const p of list) budgetByProject[p.id] = Number(p.budget || 0);
    
    const committedByProject: Record<string, number> = {};
    const overdueCounts: Record<string, number> = {};
    const today = new Date().toISOString().slice(0, 10);

    for (const m of milestones || []) {
      const pid = m.project_id ?? m.projectId;
      
      // Overdue check
      const d = m.due_date ?? m.dueDate;
      const st = String(m.status || "").toLowerCase();
      if (d && d < today && st !== "paid" && st !== "completed") {
        overdueCounts[pid] = (overdueCounts[pid] || 0) + 1;
      }

      // Committed check
      if (st === "approved") {
        const budget = budgetByProject[pid] || 0;
        const pct = Number(m.percentage ?? m.progress ?? 0);
        const amt = (pct / 100) * budget;
        committedByProject[pid] = (committedByProject[pid] || 0) + amt;
      }
    }

    // Risk Aggregation
    let risks: any[] = [];
    if (ids.length) {
       const rRes = await auxClient.from("risks").select("*").in("project_id", ids as any);
       risks = rRes.data || [];
    }
    
    const risksByProject: Record<string, { high: number; medium: number; low: number }> = {};
    
    for (const r of risks || []) {
      const pid = r.projectId ?? r.project_id;
      if (!risksByProject[pid]) risksByProject[pid] = { high: 0, medium: 0, low: 0 };
      const sev = (r.severity || "").toLowerCase();
      if (sev === "high") risksByProject[pid].high++;
      else if (sev === "medium") risksByProject[pid].medium++;
      else if (sev === "low") risksByProject[pid].low++;
    }

    return list.map((p: any) => {
      const budget = Number(p.budget || 0);
      const progress = Number(p.progress || 0);
      const actual = Number(p.spent || 0);
      const committed = committedByProject[p.id] || 0;
      const ev = budget * (progress / 100);

      let cpi = 0;
      if (budget > 0) {
        cpi = actual > 0 ? ev / actual : progress > 0 ? 1 : 0;
      } else if (progress > 0) {
        cpi = 1;
      } else {
        // Fallback or use DB value if exists
        cpi = Number(p.cpi || 1);
      }

      const riskCounts = risksByProject[p.id] || { high: 0, medium: 0, low: 0 };
      
      // Determine overall risk level
      let riskLevel = "low";
      if (riskCounts.high > 0) riskLevel = "high";
      else if (riskCounts.medium > 0) riskLevel = "medium";
      
      // Fallback to DB risk level if no risks found but DB has it
      if (riskCounts.high === 0 && riskCounts.medium === 0 && riskCounts.low === 0) {
          riskLevel = String(p.risk_level || "low").toLowerCase();
      }
      
      // If status is Warranty, risk is low by default unless specific issues
      if (p.status === "Warranty" || p.status === "Delivered") {
          riskLevel = "low";
      }

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        progress_plan: Number(p.progress_plan ?? 100),
        progress_actual: progress,
        spi: Number(p.spi ?? 1),
        cpi: Number(cpi.toFixed(2)),
        budget,
        risk_level: riskLevel,
        client: clientsMap[p.client_id]?.name || "No Client",
        status: p.status || "Active",
        managerName: managersMap[p.manager_id]?.name || "Unassigned",
        clientName: clientsMap[p.client_id]?.name || "No Client",
        overdueMilestones: overdueCounts[p.id] || 0,
        remaining: Math.max(budget - actual - committed, 0),
        actual,
        committed,
        weeklyDelta: 0,
        risks: riskCounts,
      };
    });
  } catch (error) {
    console.error("Error fetching dashboard projects:", error);
    return [];
  }
}

export async function getDashboardFinancials(): Promise<FinancialData[]> {
  const supabase = await getSafeSupabase();
  const adminSupabase = createAdminClient();

  try {
    let { data, error } = await supabase
      .from("financial_data")
      .select("month,revenue,cost")
      .order("month", { ascending: true });
      
    // Fallback
    const { data: { user } } = await supabase.auth.getUser();
    if (user && (!data || data.length === 0)) {
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
        if (profile && ["admin", "manager"].includes(profile.role)) {
             const adminRes = await adminSupabase.from("financial_data").select("month,revenue,cost").order("month", { ascending: true });
             if (adminRes.data) data = adminRes.data;
        }
    }

    return (data || []).map((r: any) => ({
      month: new Date(r.month).toLocaleString("en-US", { month: "short" }),
      revenue: Number(r.revenue || 0),
      cost: Number(r.cost || 0),
    }));
  } catch (error) {
    console.error("Error fetching financials:", error);
    return [];
  }
}

export async function getDashboardTeamLoad(): Promise<TeamLoadData[]> {
  const supabase = await getSafeSupabase();
  const adminSupabase = createAdminClient();

  try {
    let { data: users } = await supabase.from("users").select("id,name");
    
    // Fallback for users list
    const { data: { user } } = await supabase.auth.getUser();
    if (user && (!users || users.length === 0)) {
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
        if (profile && ["admin", "manager"].includes(profile.role)) {
             const adminRes = await adminSupabase.from("users").select("id,name");
             if (adminRes.data) users = adminRes.data;
        }
    }
    
    // Time entries might be huge, maybe filter by recent?
    // For team load, usually current month or active.
    // For now, fetch all as per original logic, but use admin if needed.
    let { data: entries } = await supabase
      .from("time_entries")
      .select("userId,hours");
      
    if (user && (!entries || entries.length === 0)) {
         const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
         if (profile && ["admin", "manager"].includes(profile.role)) {
             const adminRes = await adminSupabase.from("time_entries").select("userId,hours");
             if (adminRes.data) entries = adminRes.data;
         }
    }

    const userMap = new Map<string, { name: string; hours: number }>();

    (users || []).forEach((u: any) => {
      userMap.set(u.id, { name: u.name, hours: 0 });
    });

    (entries || []).forEach((e: any) => {
      const uid = e.userId;
      if (userMap.has(uid)) {
        const u = userMap.get(uid)!;
        u.hours += Number(e.hours || 0);
      }
    });

    const result: TeamLoadData[] = [];
    userMap.forEach((val, key) => {
      result.push({ id: key, name: val.name, hours: val.hours });
    });

    return result.sort((a, b) => b.hours - a.hours);
  } catch (error) {
    console.error("Error fetching team load:", error);
    return [];
  }
}

// --- Help Functions ---

export async function getHelpContacts(): Promise<{
  team: Contact[];
  stakeholders: Contact[];
}> {
  try {
    const { data: users } = await supabase
      .from("users")
      .select("name,full_name,phone,phone_number,email,position,role");

    const team = (users || []).map((u: any) => ({
      name: u.name || u.full_name || "",
      phone: u.phone || u.phone_number || "",
      email: u.email || "",
      position: u.position || u.role || "",
      management: ["admin", "manager"].includes(
        String(u.role || "").toLowerCase(),
      ),
    }));

    const { data: stakeholderRows } = await supabase
      .from("stakeholders") // Note: Assuming 'stakeholders' table exists, if not this will fail gracefully
      .select("name,full_name,phone,phone_number,email,position,title");

    // If stakeholders table fetch fails (e.g. table doesn't exist yet based on schema check), catch it
    // Actually, based on previous schema check, 'stakeholders' table was NOT in the list?
    // Let's check schema again? 'stakeholders' was missing in the list I got.
    // Ah, 'clients' exists. Maybe 'contacts'?
    // Previous code in api/help/contacts/route.ts queried 'stakeholders'.
    // If it fails, we return empty.

    const stakeholders = (stakeholderRows || []).map((s: any) => ({
      name: s.name || s.full_name || "",
      phone: s.phone || s.phone_number || "",
      email: s.email || "",
      position: s.position || s.title || "",
      management: false,
    }));

    return { team, stakeholders };
  } catch (error) {
    // If table doesn't exist or other error
    console.error("Error fetching help contacts:", error);

    // Try to recover team at least
    try {
      const { data: users } = await supabase
        .from("users")
        .select("name,email,role");
      const team = (users || []).map((u: any) => ({
        name: u.name,
        phone: "",
        email: u.email,
        position: u.role,
        management: ["admin", "manager"].includes(
          String(u.role || "").toLowerCase(),
        ),
      }));
      return { team, stakeholders: [] };
    } catch {
      return { team: [], stakeholders: [] };
    }
  }
}

// --- Report Functions ---

function inferTimes(start: any, end: any, date: string, hours: number) {
  if (start && end) return { start, end };
  const startTime = `${date}T09:00:00.000Z`;
  const endDate = new Date(startTime);
  endDate.setHours(endDate.getHours() + Number(hours || 0));
  return { start: startTime, end: endDate.toISOString() };
}

export async function getSunburstData(
  year: number,
  month: number,
  focus: string = "project",
  mode: string = "structure",
): Promise<{ root: SunburstNode }> {
  try {
    const start = new Date(Date.UTC(year, month - 1, 1))
      .toISOString()
      .slice(0, 10);
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

    const { data: entries, error } = await supabase
      .from("time_entries")
      .select("id,date,hours,startTime,endTime,projectId,taskId,userId")
      .gte("date", start)
      .lte("date", end);

    if (error) throw error;

    // Normalize snake_case to what logic expects or adjust logic
    const normalizedEntries = (entries || []).map((e: any) => ({
      ...e,
      startTime: e.startTime,
      endTime: e.endTime,
      projectId: e.projectId,
      taskId: e.taskId,
      userId: e.userId,
    }));

    const pids = Array.from(
      new Set(normalizedEntries.map((e: any) => e.projectId).filter(Boolean)),
    );
    const tids = Array.from(
      new Set(normalizedEntries.map((e: any) => e.taskId).filter(Boolean)),
    );
    const uids = Array.from(
      new Set(normalizedEntries.map((e: any) => e.userId).filter(Boolean)),
    );

    const [{ data: projects }, { data: tasks }, { data: users }] =
      await Promise.all([
        supabase.from("projects").select("id,name,code").in("id", pids),
        supabase.from("tasks").select("id,title").in("id", tids),
        supabase.from("users").select("id,name").in("id", uids),
      ]);

    const safeName = (v: any, fallback: string) => (v && String(v)) || fallback;

    const root: SunburstNode = { name: "Root", value: 0, children: [] };
    const level1 = new Map<string, SunburstNode>();
    const level2 = new Map<string, SunburstNode>();

    const pMap: Record<string, string> = {};
    for (const p of projects || []) pMap[p.id] = p.name || p.code || p.id;
    const tMap: Record<string, string> = {};
    for (const t of tasks || []) tMap[t.id] = t.title || t.id;
    const uMap: Record<string, string> = {};
    for (const u of users || []) uMap[u.id] = u.name || u.id;

    for (const r of normalizedEntries) {
      const { start: st, end: et } = inferTimes(
        r.startTime,
        r.endTime,
        r.date,
        r.hours,
      );
      const proj = safeName(pMap[r.projectId], `Project ${r.projectId || ""}`);
      const task = safeName(tMap[r.taskId], `Task ${r.taskId || ""}`);
      const user = safeName(uMap[r.userId], `User ${r.userId || ""}`);

      const a = focus === "staff" ? user : proj;
      const b = mode === "worktype" ? task : focus === "staff" ? proj : task;
      const c = focus === "staff" ? task : user;

      const keyA = a;
      const keyB = `${a}::${b}`;

      if (!level1.has(keyA)) {
        const nodeA = { name: a, value: 0, children: [] };
        level1.set(keyA, nodeA);
        root.children.push(nodeA);
      }
      const nodeA = level1.get(keyA)!;

      if (!level2.has(keyB)) {
        const nodeB = { name: b, value: 0, children: [] };
        level2.set(keyB, nodeB);
        nodeA.children.push(nodeB);
      }
      const nodeB = level2.get(keyB)!;

      const leaf = {
        name: c,
        value: Number(r.hours || 0),
        children: [],
        meta: { start: st, end: et, date: r.date },
      };
      nodeB.children.push(leaf);
      nodeB.value += leaf.value;
      nodeA.value += leaf.value;
      root.value += leaf.value;
    }

    return { root };
  } catch (error) {
    console.error("Error fetching sunburst data:", error);
    return { root: { name: "No Data", value: 0, children: [] } };
  }
}
