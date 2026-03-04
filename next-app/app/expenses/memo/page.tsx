"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft, FileText, Send } from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../components/AuthProvider";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function MemoRequestPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState("");
  const [subject, setSubject] = useState("");
  const [approverId, setApproverId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Projects
      // Use /api/projects which now uses backend API or direct DB query
      const projRes = await fetch(`${API_BASE}/api/projects`);
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data);
      }

      // Fetch Users (for approver selection)
      const usersRes = await fetch(`${API_BASE}/api/users?status=active`);
      if (usersRes.ok) {
        const data = await usersRes.json();
        // Filter out current user? Or allow self-approval (usually not)
        setUsers(data.filter((u: User) => u.id !== user?.id));
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!projectId || !subject || !approverId || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Find project name for reference if not manually set
      const project = projects.find((p) => p.id === projectId);
      const docNo = `MEMO-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 1000,
      )
        .toString()
        .padStart(3, "0")}`; // Simple auto-gen

      const payload = {
        user_id: user?.id,
        project_id: projectId,
        date,
        amount: 0, // Memos might not have direct amount, or 0
        category: "Memo",
        description: subject, // Subject as description
        approverId,
        details: {
          type: "memo_request",
          documentNo: docNo,
          subject,
          reference: reference || project?.name,
          content,
          requesterName: user?.name,
          // We can add more fields from the docx analysis
        },
      };

      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Memo request submitted successfully");
        window.location.href = "/expenses";
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Submit error", error);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Memo Request"
        breadcrumbs={[
          { label: "Expenses", href: "/expenses" },
          { label: "Memo Request" },
        ]}
      />

      <div className="container mx-auto px-6 py-8 pt-24 space-y-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/expenses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              New Memo Request
            </h1>
            <p className="text-slate-500">
              Submit a formal request or memo for approval
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Memo Details</CardTitle>
            <CardDescription>
              Fill in the details of your request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project (Reference)
                </label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="e.g. Request for additional Mandays"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To (Approver)</label>
              <Select value={approverId} onValueChange={setApproverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Approver" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Content / Justification
              </label>
              <Textarea
                className="min-h-[200px]"
                placeholder="Explain the reason for this request..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Link href="/expenses">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />{" "}
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
