import { NextRequest, NextResponse } from "next/server";
import { approvalService, ApprovalType, ApprovalPriority } from "@/lib/services/approval-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schemas
const approvalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
  approvedBy: z.string().min(1, 'Approved by is required')
});

// GET: Get pending approvals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ApprovalType | undefined;
    const priority = searchParams.get('priority') as ApprovalPriority | undefined;
    const requestedBy = searchParams.get('requestedBy') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate parameters
    if (type && !Object.values(ApprovalType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    if (priority && !Object.values(ApprovalPriority).includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority parameter' },
        { status: 400 }
      );
    }

    const result = await approvalService.getPendingApprovals({
      type,
      priority,
      requestedBy,
      pagination: { page, limit, sortBy: 'requestedAt', sortOrder: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: result.approvals,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('GET /api/approvals error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch approvals',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create new approval request (for future use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Implement approval request creation
    return NextResponse.json(
      { 
        success: false,
        message: 'Approval request creation not yet implemented'
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('POST /api/approvals error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create approval request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
