import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test basic Prisma connection
    const userCount = await prisma.users.count();
    
    return NextResponse.json({
      success: true,
      userCount,
      message: "Prisma connection working"
    });
  } catch (error) {
    console.error("Prisma test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Prisma connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
