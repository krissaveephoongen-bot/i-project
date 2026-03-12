// API Routes for Users
// Uses the UserService for all database operations

import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'
import { z } from 'zod'

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'employee']).default('employee'),
  department: z.string().optional(),
  position: z.string().optional(),
  employee_code: z.string().optional(),
  phone: z.string().optional(),
  hourlyRate: z.number().optional(),
})

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['admin', 'manager', 'employee']).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employee_code: z.string().optional(),
  phone: z.string().optional(),
  hourlyRate: z.number().optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const dynamic = "force-dynamic";

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    // Build where clause
    let where: any = {}
    
    if (role && typeof role === 'string') {
      where.role = role
    }
    
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employee_code: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ]
    }

    where.isActive = true
    where.isDeleted = false

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: 'name',
      sortOrder: 'asc' as const
    }

    const result = await userService.findPaginated(pagination, {
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        employee_code: true,
        phone: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error) {
      console.error('GET /api/users error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch users',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await userService.findByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists',
          message: 'A user with this email address is already registered'
        },
        { status: 400 }
      )
    }

    // Check if employee code is unique (if provided)
    if (validatedData.employee_code) {
      const existingEmployeeCode = await userService.findByEmployeeCode(validatedData.employee_code)
      if (existingEmployeeCode) {
        return NextResponse.json(
          { 
          success: false, 
          error: 'Employee code already exists',
          message: 'An employee with this code is already registered'
        },
        { status: 400 }
        )
      }
    }

    // Create user data with required fields
    const userData = {
      ...validatedData,
      id: crypto.randomUUID(),
      updatedAt: new Date()
    }

    const user = await userService.create(userData)

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/users error:', error)
    
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
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update user
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID is required',
          message: 'User ID is required for update'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateUserSchema.parse(body)

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
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await userService.findByEmail(validatedData.email)
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

    // Check if employee code is being changed to an existing one
    if (validatedData.employee_code && validatedData.employee_code !== existingUser.employee_code) {
      const employeeCodeExists = await userService.findByEmployeeCode(validatedData.employee_code)
      if (employeeCodeExists) {
        return NextResponse.json(
          { 
          success: false, 
          error: 'Employee code already exists',
          message: 'An employee with this code is already registered'
        },
          { status: 400 }
        )
      }
    }

    const user = await userService.update(id, validatedData)

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('PUT /api/users error:', error)
    
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

// DELETE /api/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID is required',
          message: 'User ID is required for deletion'
        },
        { status: 400 }
      )
    }

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
    console.error('DELETE /api/users error:', error)
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
