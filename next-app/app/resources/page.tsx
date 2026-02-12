'use client';

import Header from '../components/Header';
import { Users, UserPlus, Search } from 'lucide-react';

export default function ResourcesPage() {
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Team Load Overview</h2>
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
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sarah Chen', mon: 6, tue: 8, wed: 7, thu: 6, fri: 5 },
                  { name: 'Mike Johnson', mon: 8, tue: 6, wed: 8, thu: 7, fri: 8 },
                  { name: 'Emily Brown', mon: 4, tue: 5, wed: 4, thu: 6, fri: 4 },
                ].map((member, idx) => {
                  const total = member.mon + member.tue + member.wed + member.thu + member.fri;
                  const getLoadColor = (hours: number) => {
                    if (hours >= 8) return 'bg-red-500';
                    if (hours >= 6) return 'bg-yellow-400';
                    if (hours >= 4) return 'bg-green-400';
                    return 'bg-slate-100';
                  };
                  return (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{member.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.mon)}`}>
                          {member.mon}h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.tue)}`}>
                          {member.tue}h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.wed)}`}>
                          {member.wed}h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.thu)}`}>
                          {member.thu}h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block w-10 py-1 rounded text-xs font-medium ${getLoadColor(member.fri)}`}>
                          {member.fri}h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-sm font-bold ${total > 40 ? 'text-orange-500' : 'text-slate-900'}`}>
                          {total}h
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendors Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Vendors</h2>
          <div className="grid grid-cols-3 gap-4">
            {['TechConsult', 'ArchDesign', 'DataPro', 'APIServices', 'WebCraft', 'TestForce'].map((vendor) => (
              <div key={vendor} className="p-4 border border-slate-200 rounded-lg hover:border-[#2563EB] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{vendor}</p>
                    <p className="text-xs text-slate-500">Active Partner</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
