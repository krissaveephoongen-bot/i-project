export interface TimesheetApproval {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
  rejectedReason?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  user?: { id: string; name: string };
  project?: { id: string; name: string };
  task?: { id: string; title: string };
}

export interface ExpenseApproval {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  rejectedReason?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  user?: { id: string; name: string };
  project?: { id: string; name: string };
  task?: { id: string; title: string };
}

export async function getPendingTimesheets(): Promise<TimesheetApproval[]> {
  const res = await fetch("/api/approvals/timesheets", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load timesheets");
  return res.json();
}

export async function getPendingExpenses(): Promise<ExpenseApproval[]> {
  const res = await fetch("/api/approvals/expenses", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load expenses");
  return res.json();
}

export async function updateTimesheetApproval(
  id: string,
  action: "approve" | "reject",
  payload?: { reason?: string; approvedBy?: string },
) {
  const res = await fetch(`/api/approvals/timesheets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error("Failed to update timesheet");
  return res.json();
}

export async function updateExpenseApproval(
  id: string,
  action: "approve" | "reject",
  payload?: { reason?: string; approvedBy?: string },
) {
  const res = await fetch(`/api/approvals/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error("Failed to update expense");
  return res.json();
}
