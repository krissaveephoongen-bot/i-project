// API Routes for Users Basic
// Uses the UserService for all database operations

import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'

export const dynamic = "force-dynamic";

// GET /api/users/basic - Get basic user list for dropdowns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let where: any = {}
    if (role && typeof role === 'string') {
      where.role = role
    }

    const users = await userService.getBasicUsers(where)

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('GET /api/users/basic error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch basic users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
