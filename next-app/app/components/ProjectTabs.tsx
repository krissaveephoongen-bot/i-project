'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const tabs = [
  { key: 'overview', label: 'Overview', path: (id: string) => `/projects/${id}/overview` },
  { key: 'plan', label: 'Plan', path: (id: string) => `/projects/${id}/tasks` },
  { key: 'finance', label: 'Finance', path: (id: string) => `/projects/${id}/milestones` },
  { key: 'risk', label: 'Risk', path: (id: string) => `/projects/${id}/risks` },
  { key: 'docs', label: 'Documents', path: (id: string) => `/projects/${id}/documents` },
  { key: 'team', label: 'Team', path: (id: string) => `/projects/${id}/team` },
];

export default function ProjectTabs({ children }: { children?: React.ReactNode }) {
  const params = useParams() as { id?: string };
  const pathname = usePathname();
  const id = params?.id || '';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-4 flex items-center justify-between gap-2">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(t => {
          const href = t.path(id);
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={t.key}
              href={href}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap',
                active ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children && <div className="flex gap-2 shrink-0">{children}</div>}
    </div>
  );
}
