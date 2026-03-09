"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";

export default function AdminTimesheetsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("*");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  const fetchData = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ user_id: userId, start, end });
      const res = await fetch(`/api/timesheet/entries?${params.toString()}`, { cache: "no-store" });
      const json = res.ok ? await res.json() : [];
      setRows(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    await fetch("/api/timesheet/entries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  };

  const approveWeek = async () => {
    if (!start || !end) return;
    await fetch("/api/timesheet/batch-approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, start, end, status: "approved" }),
    });
    await fetchData();
  };

  const exportCsv = () => {
    const header = ["Date","User","Project","Task","Hours","Billable","Status"];
    const lines = [
      header.join(","),
      ...rows.map(r => [
        new Date(r.date).toISOString().split("T")[0],
        r.user_id,
        r.project_id || "",
        r.task_id || "",
        r.hours,
        r.billable_hours,
        r.status,
      ].join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheets_${start}_to_${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    setStart(weekAgo.toISOString().split("T")[0]);
    setEnd(today.toISOString().split("T")[0]);
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Timesheet Management"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Timesheets" },
        ]}
      />
      <div className="pt-24 px-6 pb-6 container mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกพนักงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="*">ทั้งหมด</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <Button onClick={fetchData} disabled={loading}>Load</Button>
            <Button variant="outline" onClick={approveWeek} disabled={loading}>Approve Week</Button>
            <Button variant="ghost" onClick={exportCsv}>Export CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Entries ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Date</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Project</th>
                  <th className="py-2">Task</th>
                  <th className="py-2">Hours</th>
                  <th className="py-2">Billable</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => {
                  const user = users.find(u => u.id === r.user_id);
                  return (
                    <tr key={r.id}>
                      <td className="py-2">{new Date(r.date).toLocaleDateString('th-TH')}</td>
                      <td className="py-2">{user ? user.name : r.user_id}</td>
                      <td className="py-2">{r.project_id || "-"}</td>
                      <td className="py-2">{r.task_id || "-"}</td>
                      <td className="py-2">{r.hours}</td>
                      <td className="py-2">{r.billable_hours ? "Yes" : "No"}</td>
                      <td className="py-2">
                        <Badge variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateStatus(r.id, "approved")}
                            disabled={r.status === 'approved'}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => updateStatus(r.id, "rejected")}
                            disabled={r.status === 'rejected'}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">No entries found</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
