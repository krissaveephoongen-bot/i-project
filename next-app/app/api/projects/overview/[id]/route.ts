import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const projectId = params.id;
  try {
    // Use the backend API instead of direct database access
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Get project details
    const projectResponse = await fetch(
      `${backendUrl}/api/projects/${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!projectResponse.ok) {
      if (projectResponse.status === 404) {
        return NextResponse.json(
          { error: "project not found" },
          { status: 404 },
        );
      }
      throw new Error(
        `Backend project API error: ${projectResponse.status} ${projectResponse.statusText}`,
      );
    }

    const project = await projectResponse.json();

    // Get tasks for this project
    const tasksResponse = await fetch(
      `${backendUrl}/api/tasks?projectId=${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const tasks = tasksResponse.ok ? await tasksResponse.json() : [];

    // Calculate progress from tasks
    const totalWeight =
      (tasks || []).reduce(
        (s: number, t: any) => s + Number(t.weight || 0),
        0,
      ) || 1;
    const actualWeighted = (tasks || []).reduce(
      (s: number, t: any) =>
        s + Number(t.weight || 0) * Number(t.progressActual || 0),
      0,
    );
    const progressOverall = Number((actualWeighted / totalWeight).toFixed(2));
    const planningWeighted = (tasks || []).reduce(
      (s: number, t: any) =>
        s + Number(t.weight || 0) * Number(t.progressPlan || 0),
      0,
    );
    const progressPlanning = Number(
      (planningWeighted / totalWeight).toFixed(2),
    );

    // For now, return empty arrays for other data (milestones, risks, etc.)
    const overview = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        warrantyStartDate: project.warrantyStartDate,
        warrantyEndDate: project.warrantyEndDate,
        closureChecklist: project.closureChecklist || [],
        budget: project.budget,
        progress: progressOverall,
        planning: progressPlanning,
        // Include other important fields for consistency
        managerId: project.managerId,
        clientId: project.clientId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        hourlyRate: project.hourlyRate,
        isArchived: project.isArchived,
        priority: project.priority,
        category: project.category,
        spent: project.spent,
        remaining: project.remaining,
        spi: project.spi,
        riskLevel: project.riskLevel,
        progressPlan: project.progressPlan,
      },
      tasks: tasks || [],
      milestones: [],
      risks: [],
      documents: [],
      team: [],
      summary: {
        approvedBudget: 0,
        actualCost: Number(project.spent || 0),
        committedCost: 0,
        remainingBudget: Number(project.remaining || 0),
        paidAmount: 0,
        pendingAmount: Number(project.budget || 0),
        totalBudget: Number(project.budget || 0),
      },
    };
    return NextResponse.json(overview, { status: 200 });
  } catch (error: any) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { error: error?.message || "overview error" },
      { status: 500 },
    );
  }
}
