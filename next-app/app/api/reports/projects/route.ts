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

    const { data: projects, error } = await supabaseAdmin
      .from("projects")
      .select(
        "id, name, status, progress, progress_plan, budget, spent, start_date, end_date",
      );

    if (error) throw error;

    const { searchParams } = new URL(req.url);
    const includeInternalParam = (
      searchParams.get("includeInternal") || ""
    ).toLowerCase();
    const includeInternal =
      includeInternalParam === "true" ||
      includeInternalParam === "1" ||
      includeInternalParam === "yes";

    // Optionally exclude internal/department projects
    const visibleProjects = includeInternal
      ? projects || []
      : (projects || []).filter((p: any) => {
          const isInternal = p.is_internal === true;
          const cat = String(
            p.internal_category || p.category || "",
          ).toLowerCase();
          return !(
            isInternal ||
            cat === "internal" ||
            cat.includes("department")
          );
        });

    const totalProjects = visibleProjects.length;
    const onTime = (visibleProjects || []).filter((p: any) => {
      if (p.status !== "completed") return false;
      if (!p.end_date) return true; // Assume on time if no end date? Or not.
      return new Date(p.end_date) <= new Date();
    }).length;

    const overBudget = (visibleProjects || []).filter(
      (p: any) => Number(p.spent || 0) > Number(p.budget || 0),
    ).length;

    const avgProgress =
      totalProjects > 0
        ? (visibleProjects || []).reduce(
            (sum: number, p: any) => sum + Number(p.progress || 0),
            0,
          ) / totalProjects
        : 0;

    const kpis = {
      totalProjects,
      onTime,
      overBudget,
      avgProgress: Math.round(avgProgress),
    };

    return NextResponse.json(
      { projects: visibleProjects, kpis },
      { status: 200 },
    );
  } catch (e: any) {
    console.error("Projects Report API Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
