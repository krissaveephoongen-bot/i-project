// API Routes for Users Managers
// Uses the UserService for all database operations

import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'

export const dynamic = "force-dynamic";

// GET /api/users/managers - Get project managers
export async function GET(request: NextRequest) {
  try {
    const managers = await userService.getProjectManagers()

    return NextResponse.json({
      success: true,
      data: managers
    })
  } catch (error) {
    console.error('GET /api/users/managers error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch project managers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
