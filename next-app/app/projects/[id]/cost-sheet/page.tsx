"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  getCostSheetAction,
  saveCostSheetAction,
} from "../../costSheetActions";
import type {
  LaborItem,
  ExpenseItem,
  CostCodeCatalog,
} from "@/app/projects/cost-sheet/types";

export default function ProjectCostSheetPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);

  const [catalog, setCatalog] = useState<CostCodeCatalog[]>([]);
  const [labor, setLabor] = useState<LaborItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [status, setStatus] = useState<
    "Draft" | "Submitted" | "ManagerApproved" | "FinalApproved"
  >("Draft");
  const [roleRates, setRoleRates] = useState<any[]>([]);

  const totals = useMemo(() => {
    const laborCalc = labor.reduce((sum, l) => {
      const pDays = Number(l.plannedProjectMandays || 0);
      const pHrs = Number(l.plannedProjectManhours || 0);
      const wDays = Number(l.plannedWarrantyMandays || 0);
      const wHrs = Number(l.plannedWarrantyManhours || 0);
      const dRate = Number(l.dailyRate || 0);
      const hRate = Number(l.hourlyRate || 0);
      return sum + pDays * dRate + pHrs * hRate + wDays * dRate + wHrs * hRate;
    }, 0);
    const expCalc = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return { labor: laborCalc, expenses: expCalc, total: laborCalc + expCalc };
  }, [labor, expenses]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const json = await getCostSheetAction(projectId);
        // ... (rest of mapping logic)
        const items: any[] = json?.items || [];
        const lab: LaborItem[] = items
          .filter((i) => i.type === "labor")
          .map((i: any) => ({
            id: i.id,
            costSheetId: i.cost_sheet_id,
            type: "labor",
            level: i.level || "",
            position: i.position || "",
            projectRole: i.project_role || "",
            dailyRate: Number(i.daily_rate || 0),
            hourlyRate: Number(i.hourly_rate || 0),
            plannedProjectMandays: i.planned_project_mandays || 0,
            plannedProjectManhours: i.planned_project_manhours || 0,
            plannedWarrantyMandays: i.planned_warranty_mandays || 0,
            plannedWarrantyManhours: i.planned_warranty_manhours || 0,
            remark: i.remark || "",
          }));
        const exp: ExpenseItem[] = items
          .filter((i) => i.type === "expense")
          .map((i: any) => ({
            id: i.id,
            costSheetId: i.cost_sheet_id,
            type: "expense",
            costCode: i.cost_code || "",
            description: i.description || "",
            amount: i.amount || 0,
            remark: i.remark || "",
          }));
        setLabor(lab);
        setExpenses(exp);
        setCatalog(
          (json?.catalog || []).map((c: any) => ({
            code: c.code,
            description: c.description,
            category: c.category,
            isActive: !!c.is_active,
          })),
        );
        setStatus(json?.sheet?.status || "Draft");
        // Role rates fetch kept separate or move to action if needed
      } catch (e: any) {
        toast.error(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const addLabor = () => {
    setLabor((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        costSheetId: "",
        type: "labor",
        level: "",
        position: "",
        projectRole: "",
        dailyRate: 0,
        hourlyRate: 0,
        plannedProjectMandays: 0,
        plannedProjectManhours: 0,
        plannedWarrantyMandays: 0,
        plannedWarrantyManhours: 0,
      },
    ]);
  };

  const addExpense = () => {
    setExpenses((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        costSheetId: "",
        type: "expense",
        costCode: "",
        description: "",
        amount: undefined,
        remark: "",
      },
    ]);
  };

  const save = async () => {
    try {
      const body = {
        projectId,
        status,
        createdBy: "system",
        items: [
          ...labor.map((l) => ({
            type: "labor" as const,
            // ... map fields
            level: l.level,
            position: l.position,
            projectRole: l.projectRole,
            dailyRate: Number(l.dailyRate || 0),
            hourlyRate: Number(l.hourlyRate || 0),
            plannedProjectMandays: Number(l.plannedProjectMandays || 0),
            plannedProjectManhours: Number(l.plannedProjectManhours || 0),
            plannedWarrantyMandays: Number(l.plannedWarrantyMandays || 0),
            plannedWarrantyManhours: Number(l.plannedWarrantyManhours || 0),
            remark: l.remark || "",
          })),
          ...expenses.map((e) => ({
            type: "expense" as const,
            costCode: e.costCode,
            description: e.description,
            amount: e.amount ?? null,
            remark: e.remark || "",
          })),
        ],
      };
      const result = await saveCostSheetAction(body);
      if (result.error) throw new Error(result.error);
      toast.success(`บันทึก Cost Sheet เวอร์ชัน ${result.version} แล้ว`);
    } catch (e: any) {
      toast.error(e?.message || "บันทึกไม่สำเร็จ");
    }
  };

  if (loading) return <div className="p-8">Loading cost sheet...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Cost Sheet"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Details", href: `/projects/${projectId}` },
          { label: "Cost Sheet" },
        ]}
      />

      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            สถานะ: <span className="font-medium">{status}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="ManagerApproved">ManagerApproved</SelectItem>
                <SelectItem value="FinalApproved">FinalApproved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={save} className="min-w-[140px]">
              บันทึกเวอร์ชันใหม่
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Project Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totals.total.toLocaleString()} THB
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Labor + Expenses
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Labor Subtotal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totals.labor.toLocaleString()} THB
              </div>
              <div className="text-xs text-slate-500 mt-1">
                คำนวณจาก Manday/Hour × Rate (Project + Warranty)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Expenses Subtotal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totals.expenses.toLocaleString()} THB
              </div>
              <div className="text-xs text-slate-500 mt-1">
                รวมจาก Cost Codes
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Labor (มาตรฐานตำแหน่ง/อัตรา + แผน Manday/Manhour) */}
        <Card>
          <CardHeader>
            <CardTitle>Labor (อัตราค่าจ้างและแผนกำลังคน)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={addLabor}>เพิ่มแถว (Labor)</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ระดับ (Level)</TableHead>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>บทบาทในโครงการ</TableHead>
                  <TableHead>อัตรามาตรฐาน</TableHead>
                  <TableHead className="text-right">รายวัน</TableHead>
                  <TableHead className="text-right">รายชั่วโมง</TableHead>
                  <TableHead className="text-right">Proj Mandays</TableHead>
                  <TableHead className="text-right">Proj Manhours</TableHead>
                  <TableHead className="text-right">Warranty Mandays</TableHead>
                  <TableHead className="text-right">
                    Warranty Manhours
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labor.map((l, idx) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Input
                        value={l.level}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, level: v } : r,
                            ),
                          );
                        }}
                        placeholder="เช่น Level 5 : Manager"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={l.position}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, position: v } : r,
                            ),
                          );
                        }}
                        placeholder="ตำแหน่ง"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={l.projectRole}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, projectRole: v } : r,
                            ),
                          );
                        }}
                        placeholder="เช่น Project Manager"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value=""
                        onValueChange={(val) => {
                          const rr = roleRates.find(
                            (x: any) => String(x.id) === String(val),
                          );
                          if (rr) {
                            setLabor((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? {
                                      ...r,
                                      level: r.level || rr.level || "",
                                      position: r.position || rr.position || "",
                                      projectRole:
                                        r.projectRole || rr.project_role || "",
                                      dailyRate: Number(
                                        rr.daily_rate || r.dailyRate || 0,
                                      ),
                                      hourlyRate: Number(
                                        rr.hourly_rate || r.hourlyRate || 0,
                                      ),
                                    }
                                  : r,
                              ),
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="เลือก Role Rate" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleRates.map((x: any) => (
                            <SelectItem key={x.id} value={String(x.id)}>
                              {x.level || ""}
                              {x.position ? ` • ${x.position}` : ""}{" "}
                              {x.daily_rate ? `• ${x.daily_rate}/day` : ""}{" "}
                              {x.hourly_rate ? `• ${x.hourly_rate}/hr` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={String(l.dailyRate ?? 0)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, dailyRate: v } : r,
                            ),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={String(l.hourlyRate ?? 0)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, hourlyRate: v } : r,
                            ),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={String(l.plannedProjectMandays ?? 0)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? { ...r, plannedProjectMandays: v }
                                : r,
                            ),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={String(l.plannedProjectManhours ?? 0)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? { ...r, plannedProjectManhours: v }
                                : r,
                            ),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={String(l.plannedWarrantyMandays ?? 0)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? { ...r, plannedWarrantyMandays: v }
                                : r,
                            ),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={String(l.plannedWarrantyManhours ?? 0)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setLabor((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? { ...r, plannedWarrantyManhours: v }
                                : r,
                            ),
                          );
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expenses (ตาม Cost Code) */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses (ตาม Cost Code)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={addExpense}>เพิ่มแถว (Expense)</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cost Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (THB)</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e, idx) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Select
                        value={e.costCode}
                        onValueChange={(v) => {
                          setExpenses((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? {
                                    ...r,
                                    costCode: v,
                                    description:
                                      catalog.find((c) => c.code === v)
                                        ?.description || r.description,
                                  }
                                : r,
                            ),
                          );
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="เลือก Cost Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalog.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={e.description}
                        onChange={(ev) => {
                          const v = ev.target.value;
                          setExpenses((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, description: v } : r,
                            ),
                          );
                        }}
                        placeholder="คำอธิบาย"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={e.amount !== undefined ? String(e.amount) : ""}
                        onChange={(ev) => {
                          const v =
                            ev.target.value === ""
                              ? undefined
                              : Number(ev.target.value);
                          setExpenses((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, amount: v } : r,
                            ),
                          );
                        }}
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={e.remark || ""}
                        onChange={(ev) => {
                          const v = ev.target.value;
                          setExpenses((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, remark: v } : r,
                            ),
                          );
                        }}
                        placeholder="หมายเหตุ"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
