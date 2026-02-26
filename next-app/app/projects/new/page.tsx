"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import ProjectCreationWizard from "@/app/components/ProjectCreationWizard";
import { createProject, Project as ProjectType } from "@/app/lib/projects";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: any) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Initialize New Project"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Initialize" },
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Project Initialization Wizard
          </h1>
          <p className="text-slate-500">
            Follow the steps to setup project structure, stakeholders, and plan.
          </p>
        </div>
        <ProjectCreationWizard
          onSave={(saved) => createMutation.mutate(saved)}
          onCancel={() => router.push("/projects")}
        />
      </div>
    </div>
  );
}
