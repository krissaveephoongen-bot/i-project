"use client";

import { useEffect, useState } from "react";
import { Project } from "../lib/projects";
import { Button } from "./ui/Button";
import { getUsers, User } from "../users/actions";
import { getClients, Client } from "../clients/actions";
import { useToast } from "@/hooks/useToast";

interface ProjectFormProps {
  project: Project | null;
  onSave: (data: Partial<Project>) => Promise<void> | void;
  onCancel: () => void;
  isOpen?: boolean;
}

export default function ProjectForm({
  project,
  onSave,
  onCancel,
}: ProjectFormProps) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<Partial<Project>>({
    name: project?.name || "",
    code: project?.code || "",
    description: project?.description || "",
    status: project?.status || "Planning",
    progress: project?.progress || 0,
    endDate: project?.endDate || "",
    budget: project?.budget || 0,
    managerId: project?.managerId || "",
    clientId: project?.clientId || "",
    priority: project?.priority || "medium",
    category: project?.category || "",
  });
  const [milestones, setMilestones] = useState<
    Array<{
      name: string;
      dueDate: string;
      amount: number;
      percentage?: number;
      status?: string;
      attachments?: Array<{ name: string; size: number }>;
      note?: string;
    }>
  >([]);
  const [members, setMembers] = useState<
    Array<{ role: string; userId: string }>
  >([]);
  const [errorText, setErrorText] = useState<string>("");

  const [managers, setManagers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    // Fetch all users for manager dropdown, not just those with manager role
    console.log("Fetching managers for dropdown...");
    getUsers({ status: "active" })
      .then((data) => {
        console.log("Managers fetched:", data.length, "users");
        console.log("Sample manager:", data[0]);
        setManagers(data);
      })
      .catch((error) => {
        console.error("Error fetching managers:", error);
        setManagers([]);
      });
    getClients()
      .then((data) => {
        console.log("Clients fetched:", data.length, "clients");
        setClients(data);
      })
      .catch((error) => {
        console.error("Error fetching clients:", error);
        setClients([]);
      });
  }, []);

  const update = (key: keyof Project, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    const totalPct = milestones.reduce(
      (sum, m) => sum + Number(m.percentage || 0),
      0,
    );
    const totalAmt = milestones.reduce(
      (sum, m) => sum + Number(m.amount || 0),
      0,
    );
    if (totalPct > 100) {
      const msg = "เปอร์เซ็นต์รวมของงวดงานต้องไม่เกิน 100%";
      setErrorText(msg);
      showError(msg);
      return;
    }
    if (form.budget && totalAmt > Number(form.budget)) {
      const msg = "จำนวนเงินรวมของงวดงานมากกว่างบประมาณ";
      setErrorText(msg);
      showError(msg);
      return;
    }
    if (!form.name || String(form.name).trim().length < 3) {
      const msg = "ชื่อโครงการต้องมีอย่างน้อย 3 ตัวอักษร";
      setErrorText(msg);
      showError(msg);
      return;
    }
    if (
      form.progress != null &&
      (Number(form.progress) < 0 || Number(form.progress) > 100)
    ) {
      const msg = "ความคืบหน้าต้องอยู่ระหว่าง 0 ถึง 100";
      setErrorText(msg);
      showError(msg);
      return;
    }
    const payload = { ...form, milestones, members };
    try {
      await onSave(payload);
      showSuccess(project ? "อัปเดตโครงการสำเร็จ" : "สร้างโครงการสำเร็จ");
    } catch (error) {
      showError(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ชื่อโครงการ <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name || ""}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
            placeholder="Project Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            รหัสโครงการ
          </label>
          <input
            value={form.code || ""}
            onChange={(e) => update("code", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="PROJ-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ลูกค้า (Client)
          </label>
          <select
            value={form.clientId || ""}
            onChange={(e) => update("clientId", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">เลือกลูกค้า</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            สถานะ
          </label>
          <select
            value={form.status || "Planning"}
            onChange={(e) => update("status", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ความคืบหน้า (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.progress || 0}
            onChange={(e) => update("progress", parseInt(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            วันสิ้นสุด
          </label>
          <input
            type="date"
            value={form.endDate || ""}
            onChange={(e) => update("endDate", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            งบประมาณ
          </label>
          <input
            type="number"
            min="0"
            value={form.budget || 0}
            onChange={(e) => update("budget", parseFloat(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ผู้จัดการโครงการ
          </label>
          <select
            value={form.managerId || ""}
            onChange={(e) => update("managerId", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">เลือกผู้จัดการ</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            หมวดหมู่
          </label>
          <input
            value={form.category || ""}
            onChange={(e) => update("category", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          คำอธิบาย
        </label>
        <textarea
          value={form.description || ""}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={4}
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-md font-semibold text-slate-900">
          งวดงาน (Milestones)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  ชื่อรายการ
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  วันครบกำหนด
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  % ของงบประมาณ
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  จำนวนเงิน
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  สถานะ
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  แนบไฟล์
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  หมายเหตุ
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                  ลบ
                </th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 px-3">
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={m.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMilestones((prev) =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, name: v } : x,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={m.dueDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMilestones((prev) =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, dueDate: v } : x,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={(m.percentage as any) || 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setMilestones((prev) =>
                          prev.map((x, idx) =>
                            idx === i
                              ? {
                                  ...x,
                                  percentage: v,
                                  amount: form.budget
                                    ? (v / 100) * (form.budget || 0)
                                    : x.amount || 0,
                                }
                              : x,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={m.amount}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setMilestones((prev) =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, amount: v } : x,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={m.status || "Pending"}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMilestones((prev) =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, status: v } : x,
                          ),
                        );
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Approved">Approved</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="file"
                      multiple
                      className="w-full text-sm"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).map(
                          (f) => ({ name: f.name, size: f.size }),
                        );
                        setMilestones((prev) =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, attachments: files } : x,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={m.note || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMilestones((prev) =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, note: v } : x,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded"
                      onClick={() =>
                        setMilestones((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
              {milestones.length === 0 && (
                <tr>
                  <td className="py-3 px-3 text-sm text-slate-500" colSpan={8}>
                    ยังไม่มีงวดงาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="px-3 py-1 bg-slate-100 text-slate-900 rounded text-sm"
            onClick={() =>
              setMilestones((prev) => [
                ...prev,
                { name: "", dueDate: "", amount: 0 },
              ])
            }
          >
            เพิ่มงวดงาน
          </button>
          <div className="text-sm text-slate-700">
            รวมงวดงาน:{" "}
            <span className="font-medium">
              {milestones
                .reduce((sum, m) => sum + (m.amount || 0), 0)
                .toFixed(2)}
            </span>
            {form.budget ? ` / งบประมาณ ${form.budget}` : ""}
          </div>
        </div>
      </div>
      {errorText && (
        <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">
          {errorText}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึก</Button>
      </div>
    </form>
  );
}
