'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { Users, UserPlus, Mail, Phone, Calendar, Briefcase, Crown, Shield, User } from 'lucide-react';
import { clsx } from 'clsx';
import ProjectTabs from '@/app/components/ProjectTabs';
const API_BASE = process.env.NEXT_PUBLIC_API_URL as string;

interface Contact {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  type: string;
  is_key_person: boolean;
}

interface Project {
  id: string;
  name: string;
}

export default function ProjectTeamPage() {
  const params = useParams() as Record<string, string | string[] | undefined> | null;
  const projectId =
    typeof params?.id === 'string'
      ? params!.id
      : Array.isArray(params?.id)
      ? (params!.id as string[])[0]
      : '';
  const [activeTab, setActiveTab] = useState<'client' | 'internal'>('internal');
  const [teamData, setTeamData] = useState<{ client: Contact[]; internal: Contact[] }>({ client: [], internal: [] });
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        setProject({ id: projectId, name: `Project ${projectId}` });
        const res = await fetch(`${API_BASE}/api/projects/contacts?projectId=${projectId}`);
        const contactsData = res.ok ? await res.json() : [];
        const client = (contactsData || []).filter((c: Contact) => c.type === 'client');
        const internal = (contactsData || []).filter((c: Contact) => c.type === 'internal');

        setTeamData({ client, internal });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);
  const addContact = async (type: 'internal'|'client') => {
    const payload = { project_id: projectId, name: 'New Contact', position: 'Member', email: '', phone: '', type, is_key_person: false };
    const res = await fetch(`${API_BASE}/api/projects/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = res.ok ? await res.json() : null;
    if (data) {
      setTeamData(prev => ({ client: type==='client'?[...prev.client, data]:prev.client, internal: type==='internal'?[...prev.internal, data]:prev.internal }));
    }
  };
  const updateContact = async (id: string, updatedFields: any) => {
    const res = await fetch(`${API_BASE}/api/projects/contacts`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, updatedFields }) });
    if (res.ok) {
      setTeamData(prev => ({
        client: prev.client.map(c => c.id === id ? { ...c, ...updatedFields } : c),
        internal: prev.internal.map(c => c.id === id ? { ...c, ...updatedFields } : c),
      }));
    }
  };
  const deleteContact = async (id: string, type: 'internal'|'client') => {
    const res = await fetch(`${API_BASE}/api/projects/contacts?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTeamData(prev => ({ client: type==='client'?prev.client.filter(c=>c.id!==id):prev.client, internal: type==='internal'?prev.internal.filter(c=>c.id!==id):prev.internal }));
    }
  };

  const getRoleColor = (role: string) => {
    if (role.includes('Sponsor') || role.includes('Owner')) return 'bg-purple-100 text-purple-700';
    if (role.includes('Lead') || role.includes('Manager')) return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading team data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const keyPersonnelCount = [...teamData.client, ...teamData.internal].filter(c => c.is_key_person).length;

  return (
    <div className="min-h-screen">
      <Header
        title="Team & Resources"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project?.name || 'Project', href: `/projects/${projectId}` },
          { label: 'Team' }
        ]}
      />

      <div className="pt-20 px-6 pb-6">
        <ProjectTabs />
        {/* Team Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Team Members</p>
                <p className="text-2xl font-bold text-slate-900">{teamData.internal.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Stakeholders</p>
                <p className="text-2xl font-bold text-slate-900">{teamData.client.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Key Personnel</p>
                <p className="text-2xl font-bold text-slate-900">{keyPersonnelCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">On Board</p>
                <p className="text-2xl font-bold text-slate-900">100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('internal')}
                className={clsx(
                  'py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'internal'
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                Internal Team
              </button>
              <button
                onClick={() => setActiveTab('client')}
                className={clsx(
                  'py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'client'
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                Client Stakeholders
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'internal' && (
              <div className="grid grid-cols-3 gap-4">
                {teamData.internal.map((member: Contact, idx: number) => (
                  <div key={member.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-medium">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input className="font-medium text-slate-900 border rounded px-2 py-1" defaultValue={member.name} onBlur={(e)=>updateContact(member.id, { name: e.target.value })} />
                          {member.is_key_person && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className={clsx('text-xs px-2 py-0.5 rounded inline-block mb-2', getRoleColor(member.position || 'Member'))}>
                          <input className="border rounded px-2 py-1 text-xs" defaultValue={member.position || 'Member'} onBlur={(e)=>updateContact(member.id, { position: e.target.value })} />
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Mail className="w-3 h-3" />
                            <input className="border rounded px-2 py-1 text-xs w-full" defaultValue={member.email || ''} onBlur={(e)=>updateContact(member.id, { email: e.target.value })} />
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Phone className="w-3 h-3" />
                            <input className="border rounded px-2 py-1 text-xs w-full" defaultValue={member.phone || ''} onBlur={(e)=>updateContact(member.id, { phone: e.target.value })} />
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button onClick={()=>deleteContact(member.id, 'internal')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>addContact('internal')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700">Add Member</button>
              </div>
            )}

            {activeTab === 'client' && (
              <div className="grid grid-cols-3 gap-4">
                {teamData.client.map((member: Contact, idx: number) => (
                  <div key={member.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input className="font-medium text-slate-900 border rounded px-2 py-1" defaultValue={member.name} onBlur={(e)=>updateContact(member.id, { name: e.target.value })} />
                          {member.is_key_person && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className={clsx('text-xs px-2 py-0.5 rounded inline-block mb-2', getRoleColor(member.position || 'Stakeholder'))}>
                          <input className="border rounded px-2 py-1 text-xs" defaultValue={member.position || 'Stakeholder'} onBlur={(e)=>updateContact(member.id, { position: e.target.value })} />
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Mail className="w-3 h-3" />
                            <input className="border rounded px-2 py-1 text-xs w-full" defaultValue={member.email || ''} onBlur={(e)=>updateContact(member.id, { email: e.target.value })} />
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Phone className="w-3 h-3" />
                            <input className="border rounded px-2 py-1 text-xs w-full" defaultValue={member.phone || ''} onBlur={(e)=>updateContact(member.id, { phone: e.target.value })} />
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button onClick={()=>deleteContact(member.id, 'client')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>addContact('client')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700">Add Stakeholder</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
