"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "./ui/button";
import { Users } from "lucide-react";

const tabs = [
  {
    key: "overview",
    label: "Overview",
    path: (id: string) => `/projects/${id}/overview`,
  },
  {
    key: "contract",
    label: "Contract",
    path: (id: string) => `/projects/${id}/contract`,
  },
  { key: "plan", label: "Tasks (WBS)", path: (id: string) => `/projects/${id}/tasks` },
  {
    key: "procurement",
    label: "Procurement",
    path: (id: string) => `/projects/${id}/procurement`,
  },
  {
    key: "cost-sheet",
    label: "Cost Sheet",
    path: (id: string) => `/projects/${id}/cost-sheet`,
  },
  {
    key: "budget",
    label: "Budget",
    path: (id: string) => `/projects/${id}/budget`,
  },
  {
    key: "billing",
    label: "Billing",
    path: (id: string) => `/projects/${id}/milestones`,
  },
  { key: "risk", label: "Risks & Issues", path: (id: string) => `/projects/${id}/risks` },
  {
    key: "delivery",
    label: "Delivery",
    path: (id: string) => `/projects/${id}/delivery`,
  },
  {
    key: "docs",
    label: "Docs",
    path: (id: string) => `/projects/${id}/documents`,
  },
  { key: "team", label: "Team", path: (id: string) => `/projects/${id}/team` },
];

export default function ProjectTabs({
  children,
}: {
  children?: React.ReactNode;
}) {
  const params = useParams() as { id?: string };
  const pathname = usePathname();
  const id = params?.id || "";
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-4 flex items-center justify-between gap-2 overflow-hidden">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((t) => {
          const href = t.path(id);
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={t.key}
              href={href}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children && <div className="flex gap-2 shrink-0">{children}</div>}
      <div className="hidden md:block border-l border-slate-200 pl-2 ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open("/stakeholders", "_blank")}
          className="gap-2 text-slate-500"
        >
          <Users className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
