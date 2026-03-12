import { NextRequest, NextResponse } from "next/server";
import { approvalService, ApprovalType } from "@/lib/services/approval-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schema
const approvalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
  approvedBy: z.string().min(1, 'Approved by is required')
});

// PUT: Process approval action
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; type: string } }
) {
  try {
    const { id, type } = params;
    
    // Validate type
    if (!Object.values(ApprovalType).includes(type as ApprovalType)) {
      return NextResponse.json(
        { error: 'Invalid approval type' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = approvalActionSchema.parse(body);

    // Process approval
    const result = await approvalService.processApproval(
      id,
      type as ApprovalType,
      {
        action: validatedData.action,
        reason: validatedData.reason,
        approvedBy: validatedData.approvedBy
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Approval ${validatedData.action}d successfully`
    });
  } catch (error) {
    console.error('PUT /api/approvals/[id]/[type] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: error.errors[0]?.message || 'Invalid input data'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process approval',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
