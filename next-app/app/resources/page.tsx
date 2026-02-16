'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Users, UserPlus, Search, Calendar, Plus, X } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/Dialog';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'react-hot-toast';

export default function ResourcesPage() {
  const [teamLoad, setTeamLoad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{start: string, end: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'human',
    status: 'available',
    description: '',
  });

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

  const handleAddResource = () => {
    if (!formData.name.trim()) {
      toast.error('Resource name is required');
      return;
    }
    setIsModalOpen(false);
    setFormData({ name: '', type: 'human', status: 'available', description: '' });
    toast.success('Resource added successfully');
  };

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
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </Button>
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

        {/* Add Resource Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>
                Add a new resource to your team or inventory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Name *</label>
                <Input
                  placeholder="e.g., John Doe, Server, Database"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="human">Human Resource</option>
                  <option value="equipment">Equipment</option>
                  <option value="material">Material</option>
                  <option value="software">Software</option>
                  <option value="facility">Facility</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Add any additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-24"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddResource} className="bg-blue-600 hover:bg-blue-700">
                Add Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
