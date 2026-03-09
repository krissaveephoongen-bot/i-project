"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

export default function AdminProjectAssignPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [role, setRole] = useState<string>("member");

  const load = async () => {
    const res = await fetch("/api/admin/project-assign", { cache: "no-store" });
    const json = await res.json();
    setProjects(json.projects || []);
    setUsers(json.users || []);
    setMembers(json.members || []);
    if (!projectId && json.projects?.[0]) setProjectId(json.projects[0].id);
  };

  useEffect(() => { load(); }, []);

  const currentMembers = useMemo(
    () => members.filter((m) => m.project_id === projectId),
    [members, projectId],
  );

  const assign = async () => {
    if (!projectId || !userId) return;
    await fetch("/api/admin/project-assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, user_id: userId, role }),
    });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/project-assign?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Project Assignment"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Project Assign" },
        ]}
      />
      <div className="pt-24 px-6 pb-6 container mx-auto space-y-6">
        <Card>
          <CardHeader><CardTitle>Assign User to Project</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="เลือกโครงการ" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="เลือกผู้ใช้" /></SelectTrigger>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="บทบาท" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={assign}>Assign</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Members in Project</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b"><th className="py-2">User</th><th className="py-2">Role</th><th className="py-2 text-right">Actions</th></tr></thead>
              <tbody className="divide-y">
                {currentMembers.map((m) => {
                  const user = users.find((u) => u.id === m.user_id);
                  return (
                    <tr key={m.id}>
                      <td className="py-2">{user?.name || m.user_id}</td>
                      <td className="py-2">{m.role || "member"}</td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" onClick={() => remove(m.id)}>Remove</Button>
                      </td>
                    </tr>
                  );
                })}
                {currentMembers.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">No members</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
