"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function EditDocumentPage() {
  const params = useParams() as Record<
    string,
    string | string[] | undefined
  > | null;
  const router = useRouter();
  const projectId =
    typeof params?.id === "string"
      ? (params!.id as string)
      : Array.isArray(params?.id)
        ? (params!.id as string[])[0]
        : "";
  const docId =
    typeof params?.docId === "string"
      ? (params!.docId as string)
      : Array.isArray(params?.docId)
        ? (params!.docId as string[])[0]
        : "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["documents", projectId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/api/projects/documents?projectId=${projectId}`,
      );
      return res.ok ? await res.json() : [];
    },
  });

  const doc = useMemo(
    () => (data || []).find((d: any) => d.id === docId) || null,
    [data, docId],
  );
  const [name, setName] = useState<string>(doc?.name || "");
  const [url, setUrl] = useState<string>(doc?.url || "");

  const save = async (patch: any) => {
    const res = await fetch(`${API_BASE}/api/projects/documents/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: docId, updatedFields: patch }),
    });
    if (res.ok) router.push(`/projects/${projectId}/documents`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading document...
      </div>
    );
  }
  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-lg font-semibold">Document not found</h3>
              <Button
                onClick={() => router.push(`/projects/${projectId}/documents`)}
              >
                Back
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
        title="Edit Document"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Documents", href: `/projects/${projectId}/documents` },
          { label: "Edit" },
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 max-w-2xl">
        <div className="space-y-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block">
            <span className="text-sm text-slate-600">ชื่อเอกสาร</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/documents`)}
            >
              กลับ
            </Button>
            <Button onClick={() => save({ name, url })}>บันทึก</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
