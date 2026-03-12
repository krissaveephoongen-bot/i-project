// API Routes for Users by ID
// Uses the UserService for all database operations

import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'
import { z } from 'zod'

export const dynamic = "force-dynamic";

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const user = await userService.findWithRelations(id)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: `User with ID ${id} not found`
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error(`GET /api/users/${params.id} error:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const schema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "manager", "employee"]).optional(),
      status: z.string().optional(),
      employeeCode: z.string().optional(),
      phone: z.string().optional(),
      timezone: z.string().optional(),
      hourlyRate: z.number().optional(),
      isActive: z.boolean().optional(),
      isDeleted: z.boolean().optional(),
      password: z.string().min(6).optional(),
    })
    
    const parsed = schema.parse(body)
    
    // Check if user exists
    const existingUser = await userService.findById(id)
    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: `User with ID ${id} not found`
        },
        { status: 404 }
      )
    }

    // Check if email is being changed to an existing email
    if (parsed.email && parsed.email !== existingUser.email) {
      const emailExists = await userService.findByEmail(parsed.email)
      if (emailExists) {
        return NextResponse.json(
          { 
          success: false, 
          error: 'Email already exists',
          message: 'A user with this email address is already registered'
        },
          { status: 400 }
        )
      }
    }

    const user = await userService.update(id, parsed)

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error(`PATCH /api/users/${params.id} error:`, error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: error.errors[0]?.message || 'Invalid input data'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if user exists
    const existingUser = await userService.findById(id)
    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: `User with ID ${id} not found`
        },
        { status: 404 }
      )
    }

    // Soft delete user
    const user = await userService.softDelete(id)

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error(`DELETE /api/users/${params.id} error:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
