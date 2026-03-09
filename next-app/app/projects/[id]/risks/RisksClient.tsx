"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import ProjectTabs from "@/app/components/ProjectTabs";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { AlertTriangle, AlertCircle, TrendingDown, Bug, CheckCircle, Clock } from "lucide-react";
import { createRiskAction, updateRiskAction, deleteRiskAction, createIssueAction, updateIssueAction } from "../../riskActions";

interface Risk {
  id: string;
  title: string;
  impact: number;
  likelihood: number;
  severity: string;
  owner?: string | null;
  target_date?: string | null;
  action_plan?: string | null;
}

interface Issue {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assigned_to?: string;
  due_date?: string;
}

export default function RisksClient({
  projectId,
  initialRisks,
  initialIssues,
}: {
  projectId: string;
  initialRisks: Risk[];
  initialIssues: Issue[];
}) {
  const [risks, setRisks] = useState<Risk[]>(initialRisks || []);
  const [issues, setIssues] = useState<Issue[]>(initialIssues || []);
  const [filter, setFilter] = useState<"all" | "High" | "Medium" | "Low">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [followUpRiskId, setFollowUpRiskId] = useState<string | null>(null);
  const [issueForm, setIssueForm] = useState<Partial<Issue>>({
    title: "",
    priority: "Medium",
    status: "Open",
    assigned_to: "",
    due_date: "",
  });
  const router = useRouter();

  const addRisk = async () => {
    try {
      const result = await createRiskAction({
        projectId,
        title: "New Risk",
        impact: 3,
        likelihood: 3,
        severity: "Medium",
      });
      if (result.data) setRisks((prev) => [...prev, result.data as any]);
    } catch {}
  };

  const updateRisk = async (id: string, updatedFields: any) => {
    const result = await updateRiskAction(id, updatedFields);
    if (result.data) {
      setRisks((prev) => prev.map((r) => (r.id === id ? { ...(r as any), ...updatedFields } : r)));
    }
  };

  const deleteRisk = async (id: string) => {
    const result = await deleteRiskAction(id);
    if (result.success) setRisks((prev) => prev.filter((r) => r.id !== id));
  };

  const openFollowUp = (risk: Risk) => {
    setIsIssueModalOpen(true);
    setFollowUpRiskId(risk.id);
    setIssueForm({
      title: `Follow-up: ${risk.title}`,
      priority: (risk.severity === "High" ? "High" : risk.severity === "Medium" ? "Medium" : "Low") as any,
      status: "Open",
      assigned_to: "",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
  };

  const handleCreateIssue = async () => {
    if (!issueForm.title) return;
    const result = await createIssueAction({
      projectId,
      title: issueForm.title!,
      priority: issueForm.priority as any,
      status: issueForm.status as any,
      assignedTo: issueForm.assigned_to,
      dueDate: issueForm.due_date,
      riskId: followUpRiskId || undefined,
    });
    if (result.data) {
      setIssues((prev) => [result.data as any, ...prev]);
      setIsIssueModalOpen(false);
      setIssueForm({
        title: "",
        priority: "Medium",
        status: "Open",
        assigned_to: "",
        due_date: "",
      });
    }
  };

  const updateIssueStatus = async (id: string, newStatus: string) => {
    const result = await updateIssueAction(id, { status: newStatus as any });
    if (result.data) {
      setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus as any } : i)));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  const getImpactColor = (val: number) =>
    val >= 4 ? "bg-red-500" : val >= 3 ? "bg-yellow-500" : "bg-green-500";

  const filteredRisks = risks.filter((risk) => filter === "all" || risk.severity === filter);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Risk & Issue Management"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Risks & Issues" },
        ]}
      />
      <div className="pt-24 px-6 pb-6 container mx-auto space-y-6">
        <ProjectTabs />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Risk Matrix (Real-time)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square max-h-[250px] mx-auto">
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500 font-bold tracking-wider">
                      IMPACT
                    </div>
                    <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-xs text-slate-500 font-bold tracking-wider">
                      LIKELIHOOD
                    </div>
                    <div className="grid grid-cols-5 gap-1 h-full w-full">
                      {[5, 4, 3, 2, 1].map((impact) => (
                        <div key={impact} className="contents">
                          {[1, 2, 3, 4, 5].map((likelihood) => {
                            const severity = impact * likelihood;
                            const count = risks.filter((r) => r.impact === impact && r.likelihood === likelihood).length;
                            const color =
                              severity >= 15 ? "bg-red-500" : severity >= 8 ? "bg-yellow-400" : "bg-green-400";
                            return (
                              <div
                                key={`${impact}-${likelihood}`}
                                className={clsx(
                                  "rounded flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105 cursor-default relative group",
                                  color,
                                  count === 0 && "opacity-20 hover:opacity-40",
                                )}
                              >
                                {count > 0 && count}
                                {count > 0 && (
                                  <div className="absolute z-10 bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2 rounded w-32 text-center pointer-events-none">
                                    {count} risks (Imp:{impact}, Lik:{likelihood})
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Risk Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-medium text-red-900">High Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      {risks.filter((r) => r.severity === "High").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="font-medium text-yellow-900">Medium Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">
                      {risks.filter((r) => r.severity === "Medium").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-green-900">Low Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {risks.filter((r) => r.severity === "Low").length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Risk Register</CardTitle>
                <Button onClick={addRisk} size="sm" className="bg-[#2563EB] hover:bg-blue-700">
                  + Add Risk
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRisks.map((risk) => (
                    <div key={risk.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={clsx("font-semibold", getSeverityColor(risk.severity))}
                            >
                              {risk.severity}
                            </Badge>
                            <h4 className="font-medium text-slate-900">{risk.title}</h4>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1">
                              <span>Impact:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div
                                    key={i}
                                    className={clsx(
                                      "w-2 h-2 rounded-full",
                                      i <= risk.impact ? getImpactColor(risk.impact) : "bg-slate-200",
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Likelihood:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div
                                    key={i}
                                    className={clsx(
                                      "w-2 h-2 rounded-full",
                                      i <= risk.likelihood ? getImpactColor(risk.likelihood) : "bg-slate-200",
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                            <input
                              placeholder="Owner"
                              defaultValue={risk.owner || ""}
                              className="border rounded px-2 py-1 text-sm"
                              onBlur={(e) => updateRisk(risk.id, { owner: e.target.value })}
                            />
                            <input
                              type="date"
                              defaultValue={
                                risk.target_date ? new Date(risk.target_date).toISOString().split("T")[0] : ""
                              }
                              className="border rounded px-2 py-1 text-sm"
                              onBlur={(e) => updateRisk(risk.id, { target_date: e.target.value || null })}
                            />
                            <input
                              placeholder="Action plan"
                              defaultValue={risk.action_plan || ""}
                              className="border rounded px-2 py-1 text-sm"
                              onBlur={(e) => updateRisk(risk.id, { action_plan: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openFollowUp(risk)}>
                            Follow-up
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/projects/${projectId}/risks/${risk.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteConfirmId(risk.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredRisks.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No risks found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-slate-200 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="w-5 h-5 text-orange-500" />
                  Issue Log
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setIsIssueModalOpen(true)}>
                  + Add
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[800px] p-0">
                <div className="divide-y divide-slate-100">
                  {issues.map((issue) => (
                    <div key={issue.id} className="p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-1">
                        <Badge
                          variant={
                            issue.priority === "Critical"
                              ? "destructive"
                              : issue.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {issue.priority}
                        </Badge>
                        <select
                          className="text-xs border-none bg-transparent text-slate-500 focus:ring-0 cursor-pointer hover:text-slate-900"
                          value={issue.status}
                          onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <h4
                        className={clsx(
                          "text-sm font-medium mb-1",
                          issue.status === "Resolved" || issue.status === "Closed"
                            ? "text-slate-500 line-through"
                            : "text-slate-900",
                        )}
                      >
                        {issue.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {issue.assigned_to && (
                          <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {issue.assigned_to}
                          </span>
                        )}
                        {issue.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(issue.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {issues.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      No open issues
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Issue Modal */}
        <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report New Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Title</label>
                <Input
                  value={issueForm.title || ""}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  placeholder="e.g. System crash on login"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={issueForm.priority}
                    onValueChange={(val: any) => setIssueForm({ ...issueForm, priority: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={issueForm.due_date || ""}
                    onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned To</label>
                <Input
                  value={issueForm.assigned_to || ""}
                  onChange={(e) => setIssueForm({ ...issueForm, assigned_to: e.target.value })}
                  placeholder="Name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIssue}>Create Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        {deleteConfirmId && (
          <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this risk? This action cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteRisk(deleteConfirmId!);
                    setDeleteConfirmId(null);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
