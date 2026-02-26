"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/app/components/Header";
import {
  createDocumentAction,
  updateDocumentAction,
  deleteDocumentAction,
} from "../../documentActions";
  import {
  FileText,
  Download,
  Upload,
  FolderOpen,
  Search,
  X,
  Eye,
} from "lucide-react";
import { clsx } from "clsx";
import ProjectTabs from "@/app/components/ProjectTabs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProjectDocumentsPage() {
  const params = useParams() as Record<
    string,
    string | string[] | undefined
  > | null;
  const projectId =
    typeof params?.id === "string"
      ? params!.id
      : Array.isArray(params?.id)
        ? (params!.id as string[])[0]
        : "";
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<(typeof documents)[0] | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newMilestone, setNewMilestone] = useState<string>("");
  const [newType, setNewType] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const STORAGE_BUCKET =
    process.env.NEXT_PUBLIC_STORAGE_BUCKET || "project-docs";
  const router = useRouter();
  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${API_BASE}/api/projects/documents?projectId=${projectId}`,
      );
      const rows = res.ok ? await res.json() : [];
      const mapped = (rows || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        size: d.size,
        modified: d.uploaded_at
          ? new Date(d.uploaded_at).toISOString().slice(0, 10)
          : "",
        uploadedBy: d.uploaded_by || "",
        milestone: d.milestone || "",
        url: d.url || "",
      }));
      setDocuments(mapped);
    };
    if (projectId) load();
  }, [projectId]);
  const addDocument = async () => {
    if (!newFile) return;
    setUploading(true);
    let fileUrl: string | null = null;
    try {
      const path = `${projectId}/${Date.now()}-${newFile.name}`;
      const up = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, newFile, { upsert: true, contentType: newFile.type });
      if (!up.error) {
        const pub = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        fileUrl = pub.data.publicUrl || null;
      }
    } catch {}

    try {
      const result = await createDocumentAction({
        projectId: projectId,
        name: newFile.name,
        type: newType || (newFile.name.split(".").pop() || "").toLowerCase(),
        size: `${(newFile.size / 1024 / 1024).toFixed(2)} MB`,
        url: fileUrl,
        milestone: newMilestone || "",
        uploadedBy: "",
      });

      if (result.error) throw new Error(result.error);

      if (result.data) {
        const row = result.data;
        setDocuments((prev) => [
          {
            id: row.id,
            name: row.name,
            type: row.type,
            size: row.size,
            modified: new Date().toISOString().slice(0, 10),
            uploadedBy: row.uploaded_by || "",
            milestone: row.milestone || "",
            url: row.url || "",
          },
          ...prev,
        ]);
        setNewFile(null);
        setNewMilestone("");
        setNewType("");
      }
    } catch (err) {
      console.error("Error adding document:", err);
    }
    setUploading(false);
  };
  const updateDocument = async (id: string, patch: any) => {
    try {
      const result = await updateDocumentAction(id, patch);
      if (result.error) throw new Error(result.error);

      if (result.data) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        );
      }
    } catch (err) {
      console.error("Error updating document:", err);
    }
  };
  const deleteDocument = async (id: string) => {
    try {
      const result = await deleteDocumentAction(id);
      if (result.error) throw new Error(result.error);

      if (result.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.milestone.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "bg-red-100 text-red-600";
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-600";
      case "xls":
      case "xlsx":
        return "bg-green-100 text-green-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Project Documents"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "ERP Implementation", href: "/projects/1" },
          { label: "Documents" },
        ]}
      />

      <div className="pt-20 px-6 pb-6">
        <ProjectTabs />
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
              <option value="all">All Milestones</option>
              <option value="Initiation">Initiation</option>
              <option value="Planning">Planning</option>
              <option value="Design">Design</option>
              <option value="Testing">Testing</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "px-3 py-1 rounded text-sm font-medium transition-colors",
                  viewMode === "grid"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-600",
                )}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "px-3 py-1 rounded text-sm font-medium transition-colors",
                  viewMode === "list"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-600",
                )}
              >
                List
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <input
                placeholder="Type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              />
              <input
                placeholder="Milestone"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              />
              <button
                onClick={addDocument}
                disabled={!newFile || uploading}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Documents</p>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">PDF Files</p>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.filter((d) => d.name.endsWith(".pdf")).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Word Documents</p>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.filter((d) => d.name.includes(".doc")).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Size</p>
                <p className="text-2xl font-bold text-slate-900">17.4 MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-4 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(`/projects/${projectId}/documents/${doc.id}/edit`)
                }
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      getFileIcon(doc.name),
                    )}
                  >
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-500">{doc.size}</span>
                </div>
                <h3 className="text-sm font-medium text-slate-900 truncate mb-1">
                  {doc.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                    {doc.milestone}
                  </span>
                  <span className="text-xs text-slate-500">{doc.modified}</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() =>
                      router.push(
                        `/projects/${projectId}/documents/${doc.id}/edit`,
                      )
                    }
                    className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs"
                  >
                    แก้ไข
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Document
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Milestone
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                    Size
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                    Uploaded
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            getFileIcon(doc.name),
                          )}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <input
                          className="text-sm font-medium text-slate-900 border rounded px-2 py-1"
                          defaultValue={doc.name}
                          onBlur={(e) =>
                            updateDocument(doc.id, { name: e.target.value })
                          }
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <input
                        className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border"
                        defaultValue={doc.milestone}
                        onBlur={(e) =>
                          updateDocument(doc.id, { milestone: e.target.value })
                        }
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600">
                      {doc.size}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600">
                      {doc.modified}
                    </td>
                    <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/projects/${projectId}/documents/${doc.id}/edit`,
                          )
                        }
                        className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/projects/${projectId}/documents/${doc.id}/edit`,
                          )
                        }
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(doc.id)}
                        className="p-1 text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Editing moved to dedicated page */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  ยืนยันการลบเอกสาร
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  คุณต้องการลบเอกสารนี้หรือไม่
                </p>
              </div>
              <div className="p-4 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    await deleteDocument(deleteConfirmId!);
                    setDeleteConfirmId(null);
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
