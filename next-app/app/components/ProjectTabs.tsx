"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { clsx } from "clsx"
import {
  BarChart3,
  FileSignature,
  ListTodo,
  ShoppingCart,
  Sheet,
  DollarSign,
  Receipt,
  AlertTriangle,
  Truck,
  FileText,
  Users,
} from "lucide-react"

const tabs = [
  {
    key: "overview",
    label: "ภาพรวม",
    icon: BarChart3,
    path: (id: string) => `/projects/${id}/overview`,
  },
  {
    key: "contract",
    label: "สัญญา",
    icon: FileSignature,
    path: (id: string) => `/projects/${id}/contract`,
  },
  {
    key: "plan",
    label: "งาน (WBS)",
    icon: ListTodo,
    path: (id: string) => `/projects/${id}/tasks`,
  },
  {
    key: "procurement",
    label: "จัดซื้อ",
    icon: ShoppingCart,
    path: (id: string) => `/projects/${id}/procurement`,
  },
  {
    key: "cost-sheet",
    label: "ต้นทุน",
    icon: Sheet,
    path: (id: string) => `/projects/${id}/cost-sheet`,
  },
  {
    key: "budget",
    label: "งบประมาณ",
    icon: DollarSign,
    path: (id: string) => `/projects/${id}/budget`,
  },
  {
    key: "billing",
    label: "เรียกเก็บ",
    icon: Receipt,
    path: (id: string) => `/projects/${id}/milestones`,
  },
  {
    key: "risk",
    label: "ความเสี่ยง",
    icon: AlertTriangle,
    path: (id: string) => `/projects/${id}/risks`,
  },
  {
    key: "delivery",
    label: "ส่งมอบ",
    icon: Truck,
    path: (id: string) => `/projects/${id}/delivery`,
  },
  {
    key: "docs",
    label: "เอกสาร",
    icon: FileText,
    path: (id: string) => `/projects/${id}/documents`,
  },
  {
    key: "team",
    label: "ทีมงาน",
    icon: Users,
    path: (id: string) => `/projects/${id}/team`,
  },
]

export default function ProjectTabs({
  children,
}: {
  children?: React.ReactNode
}) {
  const params = useParams() as { id?: string }
  const pathname = usePathname()
  const id = params?.id || ""

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between">
        {/* Tab Navigation */}
        <nav
          className="flex-1 flex gap-0.5 px-2 py-1.5 overflow-x-auto no-scrollbar scroll-smooth"
          aria-label="แท็บโครงการ"
        >
          {tabs.map((t) => {
            const href = t.path(id)
            const active = pathname?.startsWith(href)
            const Icon = t.icon
            return (
              <Link
                key={t.key}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Action Buttons */}
        {children && (
          <div className="flex items-center gap-2 px-3 shrink-0 border-l border-slate-200 ml-1">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
