"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import ProjectForm from "@/app/components/ProjectForm";
import {
  getProjects,
  updateProject,
  Project as ProjectType,
} from "@/app/lib/projects";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

export default function EditProjectPage() {
  const params = useParams() as Record<
    string,
    string | string[] | undefined
  > | null;
  const router = useRouter();
  const queryClient = useQueryClient();
  const id =
    typeof params?.id === "string"
      ? params!.id
      : Array.isArray(params?.id)
        ? (params!.id as string[])[0]
        : "";

  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery<ProjectType[]>({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const project = useMemo(() => {
    return (projectsData || []).find((p) => p.id === id) || null;
  }, [projectsData, id]);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updatedFields,
    }: {
      id: string;
      updatedFields: Partial<ProjectType>;
    }) => updateProject(id, updatedFields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-lg font-semibold">Project not found</h3>
              <Button onClick={() => router.push("/projects")}>
                Back to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Edit Project"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${project.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24">
        <ProjectForm
          project={project}
          onSave={(saved) =>
            updateMutation.mutate({ id: project.id, updatedFields: saved })
          }
          onCancel={() => router.push("/projects")}
          isOpen={true}
        />
      </div>
    </div>
  );
}
