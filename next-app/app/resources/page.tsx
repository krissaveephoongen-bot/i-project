'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Users, UserPlus, Search, Calendar } from 'lucide-react';

export default function ResourcesPage() {
  const [teamLoad, setTeamLoad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{start: string, end: string} | null>(null);

  useEffect(() => {
    fetch('/api/resources/team-load')
      .then(res => res.json())
      .then(data => {
         setTeamLoad(data.data || []);
         setDateRange({ start: data.start, end: data.end });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header 
        title="Resources"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Resources' }
        ]}
      />
      
      <div className="pt-20 px-6 pb-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team members, vendors..."
              className="w-80 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Resource
          </button>
        </div>

        {/* Team Load Heatmap */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Team Load Overview</h2>
            {dateRange && (
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}</span>
                </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Team Member</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Mon</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Tue</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Wed</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Thu</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Fri</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Sat</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Sun</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan={9} className="text-center py-8 text-slate-500">Loading workload data...</td></tr>
                ) : teamLoad.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-slate-500">No data found for this week.</td></tr>
                ) : (
                teamLoad.map((member, idx) => {
                  const getLoadColor = (hours: number) => {
                    if (hours >= 8) return 'bg-red-500 text-white';
                    if (hours >= 6) return 'bg-yellow-400 text-slate-900';
                    if (hours >= 4) return 'bg-green-400 text-slate-900';
                    if (hours > 0) return 'bg-blue-100 text-blue-700';
                    return 'bg-slate-50 text-slate-400';
                  };
                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs">
                            {member.avatar ? <img src={member.avatar} alt={member.name} /> : member.name.charAt(0)}
                        </div>
                        {member.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.mon)}`}>
                          {member.mon || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.tue)}`}>
                          {member.tue || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.wed)}`}>
                          {member.wed || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.thu)}`}>
                          {member.thu || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.fri)}`}>
                          {member.fri || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.sat)}`}>
                          {member.sat || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.sun)}`}>
                          {member.sun || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-sm font-bold ${member.total > 40 ? 'text-red-600' : 'text-slate-900'}`}>
                          {member.total}h
                        </span>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </div>
  );
}
