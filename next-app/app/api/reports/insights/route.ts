import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        { error: "admin client missing" },
        { status: 500 },
      );

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = Number(searchParams.get("year") || now.getFullYear());
    const month = Number(searchParams.get("month") || now.getMonth() + 1);
    const focus = (searchParams.get("focus") || "project").toLowerCase();
    const mode = (searchParams.get("mode") || "structure").toLowerCase();

    // Calculate start and end date of the month
    const start = new Date(Date.UTC(year, month - 1, 1))
      .toISOString()
      .slice(0, 10);
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

    // Robust fetch for different date column names
    let entries: any[] = [];
    const q1 = await supabaseAdmin
      .from("time_entries")
      .select("*")
      .gte("date", start)
      .lte("date", end);
    if (!q1.error) {
      entries = q1.data || [];
    } else {
      const q2 = await supabaseAdmin
        .from("time_entries")
        .select("*")
        .gte("work_date" as any, start)
        .lte("work_date" as any, end);
      if (!q2.error) {
        entries = q2.data || [];
      } else {
        throw q2.error;
      }
    }

    // Fetch related data
    const pids = Array.from(
      new Set(
        (entries || [])
          .map((e: any) => e.projectId ?? e.project_id)
          .filter(Boolean),
      ),
    );
    const tids = Array.from(
      new Set(
        (entries || []).map((e: any) => e.taskId ?? e.task_id).filter(Boolean),
      ),
    );
    const uids = Array.from(
      new Set(
        (entries || []).map((e: any) => e.userId ?? e.user_id).filter(Boolean),
      ),
    );

    const [{ data: projects }, { data: tasks }, { data: users }] =
      await Promise.all([
        pids.length
          ? supabaseAdmin.from("projects").select("id,name,code").in("id", pids)
          : { data: [] },
        tids.length
          ? supabaseAdmin.from("tasks").select("*").in("id", tids)
          : { data: [] },
        uids.length
          ? supabaseAdmin.from("users").select("id,name").in("id", uids)
          : { data: [] },
      ]);

    const safeName = (v: any, fallback: string) => (v && String(v)) || fallback;

    const pMap: Record<string, string> = {};
    for (const p of projects || []) pMap[p.id] = p.name || p.code || p.id;
    const tMap: Record<string, string> = {};
    for (const t of tasks || []) tMap[t.id] = t.title || t.name || t.id;
    const uMap: Record<string, string> = {};
    for (const u of users || []) uMap[u.id] = u.name || u.id;

    // Build Tree
    const root: any = { name: "Root", value: 0, children: [] };

    // Helper to find or create node
    const findOrCreate = (parent: any, name: string) => {
      let node = parent.children.find((c: any) => c.name === name);
      if (!node) {
        node = { name, value: 0, children: [] };
        parent.children.push(node);
      }
      return node;
    };

    for (const r of entries || []) {
      const pid = r.projectId ?? r.project_id;
      const tid = r.taskId ?? r.task_id;
      const uid = r.userId ?? r.user_id;
      const proj = safeName(pMap[pid], `Project ${pid || "Unknown"}`);
      const task = safeName(tMap[tid], `Task ${tid || "General"}`);
      const user = safeName(uMap[uid], `User ${uid || "Unknown"}`);
      const hours = Number(r.hours || 0);

      const a = focus === "staff" ? user : proj;
      const b = mode === "worktype" ? task : focus === "staff" ? proj : task; // Simplified logic
      // Actually let's follow the original logic:
      // Focus=Project: Project -> Task -> User
      // Focus=Staff: User -> Project -> Task

      let l1, l2, l3;
      if (focus === "staff") {
        l1 = user;
        l2 = proj;
        l3 = task;
      } else {
        l1 = proj;
        l2 = task;
        l3 = user;
      }

      const node1 = findOrCreate(root, l1);
      const node2 = findOrCreate(node1, l2);
      const node3 = findOrCreate(node2, l3); // Leaf-ish

      node1.value += hours;
      node2.value += hours;
      node3.value += hours;
      root.value += hours;
    }

    return NextResponse.json({ root }, { status: 200 });
  } catch (e: any) {
    console.error("Insights API Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
