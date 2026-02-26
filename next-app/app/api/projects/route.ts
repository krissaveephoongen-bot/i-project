import { ok, err } from "../_lib/db";

export const revalidate = 60;

export async function GET() {
  try {
    // Use the backend API instead of direct database access
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const response = await fetch(`${backendUrl}/api/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`,
      );
    }

    const projects = await response.json();

    // Transform field names to camelCase for consistency
    const enrichedProjects = projects.map((p: any) => ({
      ...p,
      // Transform snake_case to camelCase for consistency
      managerId: p.manager_id,
      clientId: p.client_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      startDate: p.start_date,
      endDate: p.end_date,
      hourlyRate: p.hourly_rate,
      isArchived: p.is_archived,
      warrantyStartDate: p.warranty_start_date,
      warrantyEndDate: p.warranty_end_date,
      closureChecklist: p.closure_checklist,
    }));

    return ok(enrichedProjects, 200);
  } catch (e: any) {
    console.error("Projects API error:", e);
    return err(e?.message || "error", 500);
  }
}
