'use client';

import clsx from 'clsx';

interface TeamLoadChartProps {
  data: {
    name: string;
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
  }[];
}

const getLoadColor = (hours: number) => {
    if (hours >= 8) return 'bg-red-500 text-white';
    if (hours >= 6) return 'bg-yellow-400 text-slate-900';
    if (hours >= 4) return 'bg-green-400 text-slate-900';
    return 'bg-slate-100 text-slate-600';
};

export default function TeamLoadChart({ data }: TeamLoadChartProps) {
  return (
    <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Team Load Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 text-xs font-medium text-slate-600">Team</th>
                <th className="text-center py-2 px-1 text-xs font-medium text-slate-600">M</th>
                <th className="text-center py-2 px-1 text-xs font-medium text-slate-600">T</th>
                <th className="text-center py-2 px-1 text-xs font-medium text-slate-600">W</th>
                <th className="text-center py-2 px-1 text-xs font-medium text-slate-600">T</th>
                <th className="text-center py-2 px-1 text-xs font-medium text-slate-600">F</th>
              </tr>
            </thead>
            <tbody>
              {data.map((member, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 px-2 text-xs font-medium text-slate-700 truncate max-w-[80px]">{member.name}</td>
                  <td className="py-2 px-1 text-center">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', getLoadColor(member.mon))}>
                      {member.mon}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-center">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', getLoadColor(member.tue))}>
                      {member.tue}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-center">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', getLoadColor(member.wed))}>
                      {member.wed}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-center">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', getLoadColor(member.thu))}>
                      {member.thu}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-center">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', getLoadColor(member.fri))}>
                      {member.fri}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-slate-500">8+ hrs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-slate-500">6-7 hrs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span className="text-slate-500">4-5 hrs</span>
          </div>
        </div>
    </div>
  );
}
