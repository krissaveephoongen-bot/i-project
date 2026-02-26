"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabaseClient";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Filter,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import ProjectFilter from "./components/ProjectFilter";
import StakeholderForm from "./components/StakeholderForm";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent } from "@/app/components/ui/card";

interface Stakeholder {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  type: string;
  project?: { id: string; name: string };
}

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStakeholder, setEditingStakeholder] =
    useState<Stakeholder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch stakeholders
      let query = supabase
        .from("contacts")
        .select(
          `
          id,
          name,
          position,
          email,
          phone,
          type,
          project:projects!contacts_project_id_fkey (id, name)
        `,
        )
        .in("type", ["stakeholder", "client", "Stakeholder", "Client"]);

      if (selectedProject) {
        query = query.eq("project_id", selectedProject);
      }

      const { data: stakeholderData, error: stakeholderError } =
        await query.order("name");

      // Fetch projects
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");

      if (stakeholderError) {
        console.error("Error fetching stakeholders:", stakeholderError);
        setStakeholders([]);
      } else {
        setStakeholders(stakeholderData || []);
      }

      if (projectError) {
        console.error("Error fetching projects:", projectError);
        setProjects([]);
      } else {
        setProjects(projectData || []);
      }
    } catch (error) {
      console.error("Error:", error);
      setStakeholders([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStakeholder = (savedStakeholder: any) => {
    if (editingStakeholder) {
      setStakeholders((prev) =>
        prev.map((s) => (s.id === savedStakeholder.id ? savedStakeholder : s)),
      );
    } else {
      setStakeholders((prev) => [...prev, savedStakeholder]);
    }
    setShowForm(false);
    setEditingStakeholder(null);
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setShowForm(true);
  };

  const handleDeleteStakeholder = async (id: string) => {
    try {
      const res = await fetch(`/api/stakeholders?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStakeholders((prev) => prev.filter((s) => s.id !== id));
        setDeleteConfirmId(null);
      } else {
        alert("Failed to delete stakeholder");
      }
    } catch (error) {
      alert("Error deleting stakeholder");
    }
  };

  const handleAddStakeholder = () => {
    setEditingStakeholder(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Project Stakeholders"
        breadcrumbs={[{ label: "Workspace" }, { label: "Stakeholders" }]}
      />
      <div className="pt-20 px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Stakeholder Directory
                </h2>
                <p className="text-sm text-slate-500">
                  {stakeholders.length} contacts found
                  {selectedProject
                    ? " (Filtered by Project)"
                    : " (All Projects)"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ProjectFilter
                  projects={projects}
                  selectedProject={selectedProject}
                  onProjectChange={setSelectedProject}
                />
                <Button onClick={handleAddStakeholder} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Stakeholder
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stakeholders.map((stakeholder) => (
              <Card
                key={stakeholder.id}
                className="bg-slate-50 border border-slate-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${stakeholder.name}&background=e0e7ff&color=4f46e5`}
                        alt={stakeholder.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-bold text-slate-800">
                          {stakeholder.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {stakeholder.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStakeholder(stakeholder)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(stakeholder.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a
                        href={`mailto:${stakeholder.email}`}
                        className="hover:underline"
                      >
                        {stakeholder.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{stakeholder.phone || "N/A"}</span>
                    </div>
                    {stakeholder.project?.name && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <Link
                          href={`/projects/${stakeholder.project.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {stakeholder.project.name}
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {stakeholders.length === 0 && !loading && (
              <div className="col-span-full py-8 px-6 text-center text-slate-500">
                No stakeholders found for the selected filter.
                <div className="mt-4">
                  <Button onClick={handleAddStakeholder} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Stakeholder
                  </Button>
                </div>
              </div>
            )}
            {loading && (
              <div className="col-span-full py-8 px-6 text-center text-slate-500">
                Loading stakeholders...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stakeholder Form Modal */}
      {showForm && (
        <StakeholderForm
          stakeholder={editingStakeholder}
          onSave={handleSaveStakeholder}
          onCancel={() => {
            setShowForm(false);
            setEditingStakeholder(null);
          }}
          projects={projects}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this stakeholder? This action
                cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteStakeholder(deleteConfirmId)}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
