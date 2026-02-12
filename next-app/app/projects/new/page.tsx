'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/app/components/Header';
import ProjectForm from '@/app/components/ProjectForm';
import { createProject, Project as ProjectType } from '@/app/lib/projects';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: Partial<ProjectType>) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/projects');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Create Project"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'New' }
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24">
        <ProjectForm
          project={null}
          onSave={(saved) => createMutation.mutate(saved)}
          onCancel={() => router.push('/projects')}
          isOpen={true}
        />
      </div>
    </div>
  );
}
