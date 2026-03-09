import { NextRequest, NextResponse } from "next/server";
import { getProjectOverview } from "@/app/projects/overviewActions";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const projectId = params.id;
  try {
    const overview = await getProjectOverview(projectId);
    if (!overview) {
      return NextResponse.json({ error: "project not found" }, { status: 404 });
    }
    return NextResponse.json(overview, { status: 200 });
  } catch (error: any) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { error: error?.message || "overview error" },
      { status: 500 },
    );
  }
}
