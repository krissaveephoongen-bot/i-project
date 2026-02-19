'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { X, Save, User, Briefcase, Building, Mail, Phone } from 'lucide-react';

interface StakeholderFormProps {
  stakeholder?: any;
  onSave: (stakeholder: any) => void;
  onCancel: () => void;
  projects?: any[];
}

export default function StakeholderForm({ stakeholder, onSave, onCancel, projects }: StakeholderFormProps) {
  const [formData, setFormData] = useState({
    id: stakeholder?.id || '',
    name: stakeholder?.name || '',
    position: stakeholder?.position || stakeholder?.role || '',
    organization: stakeholder?.organization || '',
    email: stakeholder?.email || '',
    phone: stakeholder?.phone || '',
    project_id: stakeholder?.project_id || stakeholder?.project?.id || '',
    type: stakeholder?.type || 'stakeholder'
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = stakeholder?.id ? 'PUT' : 'POST';
      const url = stakeholder?.id 
        ? '/api/stakeholders' 
        : '/api/stakeholders';

      const payload = stakeholder?.id 
        ? { ...formData, id: stakeholder.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onSave(data);
      } else {
        alert('Failed to save stakeholder');
      }
    } catch (error) {
      alert('Error saving stakeholder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {stakeholder?.id ? 'Edit Stakeholder' : 'Add Stakeholder'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter stakeholder name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Position/Role
              </label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Enter position or role"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Organization
              </label>
              <Input
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Enter organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project *
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Project</option>
                {projects?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={saving || !formData.name || !formData.project_id}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
