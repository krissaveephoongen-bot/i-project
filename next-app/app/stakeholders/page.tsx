import Header from '@/app/components/Header';
import { supabase } from '@/app/lib/supabaseClient';
import { User, Mail, Phone, Briefcase, Filter } from 'lucide-react';
import Link from 'next/link';
import ProjectFilter from './components/ProjectFilter';

async function getStakeholders({ projectId }: { projectId?: string }) {
    let query = supabase
        .from('contacts')
        .select(`
            id,
            name,
            position,
            email,
            phone,
            type,
            projects (id, name)
        `)
        .in('type', ['stakeholder', 'client', 'Stakeholder', 'Client']);

    if (projectId) {
        query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('name');

    if (error) {
        console.error("Error fetching stakeholders:", error);
        return [];
    }
    return data;
}

async function getProjects() {
    const { data, error } = await supabase.from('projects').select('id, name').order('name');
    if (error) {
        console.error("Error fetching projects for filter:", error);
        return [];
    }
    return data;
}

export default async function StakeholdersPage({ searchParams }: { searchParams?: { project_id?: string } }) {
    const projectId = searchParams?.project_id || '';
    const stakeholders = await getStakeholders({ projectId });
    const projects = await getProjects();

    return (
        <div className="min-h-screen">
            <Header
                title="Stakeholders"
                breadcrumbs={[{ label: 'Workspace' }, { label: 'Stakeholders' }]}
            />
            <div className="pt-20 px-6 pb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Stakeholder Directory</h2>
                                <p className="text-sm text-slate-500">{stakeholders.length} contacts found</p>
                            </div>
                            <ProjectFilter projects={projects} />
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stakeholders.map((stakeholder: any) => (
                            <div key={stakeholder.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${stakeholder.name}&background=e0e7ff&color=4f46e5`}
                                        alt={stakeholder.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-800">{stakeholder.name}</p>
                                        <p className="text-sm text-slate-600">{stakeholder.position}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Mail className="w-4 h-4 text-slate-400"/>
                                        <a href={`mailto:${stakeholder.email}`} className="hover:underline">{stakeholder.email}</a>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Phone className="w-4 h-4 text-slate-400"/>
                                        <span>{stakeholder.phone || 'N/A'}</span>
                                    </div>
                                     {stakeholder.projects?.name && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Briefcase className="w-4 h-4 text-slate-400"/>
                                            <Link href={`/projects/${stakeholder.projects.id}`} className="text-blue-600 hover:underline">{stakeholder.projects.name}</Link>
                                        </div>
                                     )}
                                </div>
                            </div>
                        ))}
                         {stakeholders.length === 0 && (
                            <div className="col-span-full py-8 px-6 text-center text-slate-500">
                                No stakeholders found for the selected filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}