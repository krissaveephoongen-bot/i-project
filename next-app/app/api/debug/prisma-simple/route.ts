import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Simple Prisma client without adapter
    const prisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'pretty',
    });

    // Test basic connection
    const userCount = await prisma.users.count();
    
    // Test a simple query
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 3
    });

    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      userCount,
      users,
      message: "Simple Prisma connection working"
    });
  } catch (error) {
    console.error("Simple Prisma test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Simple Prisma connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
