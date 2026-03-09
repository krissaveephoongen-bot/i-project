import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    projectStatuses: [],
    projectCategories: [],
    taskStatuses: [],
    taskPriorities: [],
    taskCategories: [],
    expenseCategories: [],
    expenseStatuses: [],
    userRoles: [],
    clients: [],
    users: [],
  });
}
