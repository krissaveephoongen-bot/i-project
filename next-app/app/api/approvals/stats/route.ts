import { NextRequest, NextResponse } from "next/server";
import { approvalService } from "@/lib/services/approval-service";

export const dynamic = "force-dynamic";

// GET: Get approval statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await approvalService.getApprovalStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('GET /api/approvals/stats error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch approval statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
