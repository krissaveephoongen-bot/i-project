// Shared status display utilities for Thai labels and colors

export const STATUS_MAP: Record<string, { label: string; color: string; variant: string }> = {
  active: { label: "ดำเนินการ", color: "bg-emerald-100 text-emerald-700 border-emerald-200", variant: "default" },
  in_progress: { label: "ดำเนินการ", color: "bg-emerald-100 text-emerald-700 border-emerald-200", variant: "default" },
  "in progress": { label: "ดำเนินการ", color: "bg-emerald-100 text-emerald-700 border-emerald-200", variant: "default" },
  planning: { label: "วางแผน", color: "bg-blue-100 text-blue-700 border-blue-200", variant: "secondary" },
  completed: { label: "เสร็จสิ้น", color: "bg-slate-100 text-slate-600 border-slate-200", variant: "secondary" },
  on_hold: { label: "พักชั่วคราว", color: "bg-amber-100 text-amber-700 border-amber-200", variant: "secondary" },
  "on hold": { label: "พักชั่วคราว", color: "bg-amber-100 text-amber-700 border-amber-200", variant: "secondary" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-700 border-red-200", variant: "destructive" },
}

export function getStatusDisplay(status: string) {
  const key = (status || "").toLowerCase()
  return STATUS_MAP[key] ?? { label: status, color: "bg-slate-100 text-slate-600 border-slate-200", variant: "secondary" }
}

export const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: "ต่ำ", color: "bg-slate-100 text-slate-600" },
  medium: { label: "ปานกลาง", color: "bg-blue-100 text-blue-700" },
  high: { label: "สูง", color: "bg-orange-100 text-orange-700" },
  critical: { label: "วิกฤต", color: "bg-red-100 text-red-700" },
}

export function getPriorityDisplay(priority: string) {
  const key = (priority || "").toLowerCase()
  return PRIORITY_MAP[key] ?? { label: priority || "ไม่ระบุ", color: "bg-slate-100 text-slate-600" }
}

export const RISK_MAP: Record<string, { label: string; color: string; variant: string }> = {
  low: { label: "ต่ำ", color: "bg-green-100 text-green-700", variant: "secondary" },
  medium: { label: "ปานกลาง", color: "bg-amber-100 text-amber-700", variant: "default" },
  high: { label: "สูง", color: "bg-red-100 text-red-700", variant: "destructive" },
  critical: { label: "วิกฤต", color: "bg-red-200 text-red-800", variant: "destructive" },
}

export function getRiskDisplay(risk: string) {
  const key = (risk || "").toLowerCase()
  return RISK_MAP[key] ?? { label: risk || "ไม่ระบุ", color: "bg-slate-100 text-slate-600", variant: "secondary" }
}

export function formatThaiDate(dateStr: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return "-"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "-"
    return d.toLocaleDateString("th-TH", opts ?? { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return "-"
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "฿0"
  return `฿${amount.toLocaleString()}`
}
