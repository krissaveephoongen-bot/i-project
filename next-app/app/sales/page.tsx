"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import Header from "@/app/components/Header";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Trophy,
  XCircle,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

type Stage = { id: string; name: string; order: number; probability: number };
type Deal = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stage_id: string | null;
  stage_name?: string;
  owner_id?: string;
  client_id?: string;
  client_org?: string;
  owner_name?: string;
  client_name?: string;
  probability: number;
  status: string;
};

export default function SalesPipelinePage() {
  // State
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelineId, setPipelineId] = useState<string>("");
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    [],
  );

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [filter, setFilter] = useState<{
    stageId: string;
    status: string;
    q: string;
    clientId: string;
  }>({
    stageId: "all",
    status: "all",
    q: "",
    clientId: "all",
  });

  // Modal State
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    name: "",
    amount: "",
    stage_id: "",
    probability: "0",
    status: "open",
    currency: "THB",
    client_org: "",
    client_id: "none",
  };
  const [form, setForm] = useState(initialFormState);

  // Initial Data Load
  useEffect(() => {
    const load = async () => {
      try {
        const p = await fetch("/api/sales/pipeline", {
          cache: "no-store",
        }).then((r) => r.json());
        setPipelineId(p?.pipeline?.id || "");
        setStages(p?.stages || []);

        const d = await fetch(
          `/api/sales/deals?pipelineId=${p?.pipeline?.id || ""}`,
          { cache: "no-store" },
        ).then((r) => r.json());
        setDeals(d || []);

        const firstStage = (p?.stages || [])[0]?.id || "";
        setForm((f) => ({ ...f, stage_id: firstStage }));

        const prj = await fetch("/api/projects", { cache: "no-store" }).then(
          (r) => r.json(),
        );
        setProjects(prj || []);
      } catch {
        toast.error("โหลดข้อมูล Sales ล้มเหลว");
      }
    };
    load();
  }, []);

  // Load Clients when project changes
  useEffect(() => {
    const loadClients = async () => {
      const url =
        selectedProjectId !== "all"
          ? `/api/clients?type=stakeholder&projectId=${selectedProjectId}`
          : `/api/clients?type=stakeholder`;
      const cls = await fetch(url, { cache: "no-store" }).then((r) => r.json());
      setClients(cls || []);
    };
    loadClients();
  }, [selectedProjectId]);

  // Helpers
  const stageMap: Record<
    string,
    { name: string; order: number; probability: number }
  > = useMemo(
    () =>
      Object.fromEntries(
        stages.map((s) => [
          s.id,
          { name: s.name, order: s.order, probability: s.probability },
        ]),
      ),
    [stages],
  );

  const sortedDeals = useMemo(() => {
    let filtered = [...deals];

    // Client-side filtering for immediate feedback (can be replaced with server-side if needed)
    if (filter.stageId !== "all")
      filtered = filtered.filter((d) => d.stage_id === filter.stageId);
    if (filter.status !== "all")
      filtered = filtered.filter((d) => d.status === filter.status);
    if (filter.clientId !== "all")
      filtered = filtered.filter((d) => d.client_id === filter.clientId);
    if (filter.q) {
      const q = filter.q.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.client_org?.toLowerCase().includes(q),
      );
    }

    return filtered.sort((a, b) => {
      const ao = stageMap[a.stage_id || ""]?.order ?? 999;
      const bo = stageMap[b.stage_id || ""]?.order ?? 999;
      return ao - bo;
    });
  }, [deals, filter, stageMap]);

  const refreshDeals = async () => {
    const params = new URLSearchParams();
    if (pipelineId) params.set("pipelineId", pipelineId);
    // Apply server filters if we want to rely on server
    // For now, re-fetching all deals for this pipeline is safer to keep client-side sort consistent
    const d = await fetch(`/api/sales/deals?${params.toString()}`, {
      cache: "no-store",
    }).then((r) => r.json());
    setDeals(d || []);
  };

  // Actions
  const handleSubmit = async () => {
    if (!form.name || !form.stage_id) {
      toast.error("กรุณากรอกชื่อดีลและเลือก Stage");
      return;
    }
    const amt = Number(form.amount || 0);
    if (Number.isNaN(amt) || amt < 0) {
      toast.error("จำนวนเงินไม่ถูกต้อง");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: form.name,
        amount: amt,
        currency: form.currency,
        pipeline_id: pipelineId,
        stage_id: form.stage_id || null,
        status: form.status,
        probability: Number(form.probability || 0),
        client_org: form.client_org || null,
        client_id: form.client_id === "none" ? null : form.client_id,
      };

      if (editing) {
        await fetch(`/api/sales/deals/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("แก้ไขดีลสำเร็จ");
      } else {
        await fetch("/api/sales/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("เพิ่มดีลสำเร็จ");
      }

      setShowAdd(false);
      setEditing(null);
      setForm(initialFormState);
      await refreshDeals();
    } catch (error) {
      toast.error("บันทึกข้อมูลล้มเหลว");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditing(deal);
    setForm({
      name: deal.name || "",
      amount: String(deal.amount || ""),
      stage_id: deal.stage_id || "",
      probability: String(deal.probability || 0),
      status: deal.status || "open",
      currency: deal.currency || "THB",
      client_org: deal.client_org || "",
      client_id: deal.client_id || "none",
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ยืนยันการลบดีลนี้หรือไม่?")) return;
    try {
      await fetch(`/api/sales/deals/${id}`, { method: "DELETE" });
      await refreshDeals();
      toast.success("ลบดีลสำเร็จ");
    } catch {
      toast.error("ลบดีลล้มเหลว");
    }
  };

  const exportCsv = () => {
    const rows = [
      [
        "Stage",
        "Deal",
        "Amount",
        "Currency",
        "Probability",
        "Owner",
        "Client/Org",
        "Status",
      ],
      ...sortedDeals.map((d) => {
        const st = stageMap[d.stage_id || ""];
        const owner =
          d.owner_name || (d.owner_id ? d.owner_id.slice(0, 8) : "-");
        const client =
          d.client_org ||
          d.client_name ||
          (d.client_id ? d.client_id.slice(0, 8) : "-");
        return [
          st?.name || "-",
          d.name,
          String(d.amount || 0),
          d.currency || "",
          String(d.probability || 0),
          owner,
          client,
          d.status || "",
        ];
      }),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deals.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats Calculation
  const totalValue = sortedDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const wonValue = sortedDeals
    .filter((d) => d.status === "won")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const openCount = sortedDeals.filter((d) => d.status === "open").length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Sales Pipeline"
        breadcrumbs={[{ label: "Sales Pipeline" }]}
      />

      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Sales Pipeline
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your deals, track progress, and close more sales.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setForm(initialFormState);
                setShowAdd(true);
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pipeline Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {sortedDeals.length} deals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Won Deals Value
              </CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ฿{wonValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Closed won deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {openCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Active opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Project
                </label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Stage
                </label>
                <Select
                  value={filter.stageId}
                  onValueChange={(val) =>
                    setFilter((prev) => ({ ...prev, stageId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <Select
                  value={filter.status}
                  onValueChange={(val) =>
                    setFilter((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Client
                </label>
                <Select
                  value={filter.clientId}
                  onValueChange={(val) =>
                    setFilter((prev) => ({ ...prev, clientId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search deals..."
                    className="pl-9"
                    value={filter.q}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, q: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead>Deal Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Probability</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDeals.length > 0 ? (
                  sortedDeals.map((deal) => {
                    const st = stageMap[deal.stage_id || ""];
                    return (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {st?.name || "-"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {st ? `${st.probability}%` : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">
                              {deal.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {deal.currency}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ฿{Number(deal.amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{deal.probability}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="h-3 w-3 text-slate-500" />
                            </div>
                            <span className="text-sm">
                              {deal.owner_name ||
                                (deal.owner_id
                                  ? deal.owner_id.slice(0, 8)
                                  : "-")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {deal.client_org ||
                              deal.client_name ||
                              (deal.client_id
                                ? deal.client_id.slice(0, 8)
                                : "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              deal.status === "won"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : deal.status === "lost"
                                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            }
                          >
                            {deal.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEdit(deal)}
                              >
                                Edit Deal
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(deal.id)}
                              >
                                Delete Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No deals found. Create a new deal to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Deal" : "Create New Deal"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for your sales opportunity.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deal Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Project Alpha Phase 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stage</label>
                  <Select
                    value={form.stage_id}
                    onValueChange={(val) => setForm({ ...form, stage_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Probability (%)</label>
                  <Input
                    type="number"
                    value={form.probability}
                    onChange={(e) =>
                      setForm({ ...form, probability: e.target.value })
                    }
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => setForm({ ...form, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Input
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    placeholder="THB"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Client / Organization
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={form.client_id}
                    onValueChange={(val) =>
                      setForm({ ...form, client_id: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Existing Client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select Client --</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={form.client_org}
                    onChange={(e) =>
                      setForm({ ...form, client_org: e.target.value })
                    }
                    placeholder="Or type organization name"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Deal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
