"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Check, Save, AlertCircle, FileText } from "lucide-react";
import Header from "@/app/components/Header";
import { Button } from "@/app/components/ui/Button";
import {
  updateProjectClosureAction,
} from "../../closureActions";
  import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Textarea } from "@/app/components/ui/textarea";
import { useAuth } from "@/app/components/AuthProvider";
import ProjectTabs from "@/app/components/ProjectTabs";

const CHECKLIST_TEMPLATE = [
  {
    id: "1",
    folder: "TOR (ขอบเขตงาน)",
    description:
      "เอกสารที่กำหนดขอบเขตและรายละเอียดของการทำงานหรือโครงการที่มีการลงนามจากลูกค้าแล้ว",
  },
  {
    id: "2",
    folder: "BIDDING (Proposal)",
    description:
      "เอกสารที่เกี่ยวข้องกับการขายงาน , เอกสารที่ใช้ในการยื่น BID หรือเอกสารอื่นๆที่เกี่ยวข้องกับโครงการจากทาง Sales",
  },
  {
    id: "3",
    folder: "Contract (สัญญา)",
    description: "สัญญาเช่าระหว่างผู้ว่าจ้างและผู้รับจ้าง",
  },
  {
    id: "4",
    folder: "Project Document Out (จดหมายส่งออก)",
    description:
      "เอกสารที่ใช้ในการสื่อสารหรือส่งข้อมูลที่เกี่ยวข้องกับโครงการไปยังลูกค้า หรือหน่วยงานที่เกี่ยวข้อง เช่น การส่งรายงานความคืบหน้า...",
  },
  {
    id: "5",
    folder: "Project Document In (จดหมายเข้า)",
    description:
      "เอกสารที่เข้ามาจากภายนอกหรือจากฝ่ายที่เกี่ยวข้องกับโครงการ ซึ่งได้รับจากลูกค้าหรือหน่วยงานอื่นที่เกี่ยวข้อง",
  },
  {
    id: "6",
    folder: "Miscellaneous Document",
    description:
      "เอกสารต่างๆ เช่น เอกสารการออกแบบ , Weekly&Monthly Report ,S-Curve,เอกสารต่างๆ ที่ได้รับมาจากฝ่ายอื่น หรือส่งให้ฝ่ายอื่น...",
  },
  {
    id: "7",
    folder: "Meeting",
    description:
      "เอกสาร Kick-off กับทางลูกค้า ,รายงานการประชุม , เอกสารประกอบการประชุมต่างๆ",
  },
  {
    id: "8",
    folder: "Procurement Document",
    description: "เอกสารการสั่งซื้อ,สั่งจ้างต่างๆ เช่น PR,PO,WO,QT",
  },
  {
    id: "9",
    folder: "3rd Party",
    description:
      "Supplier หรือ คู่ค้าภายนอก ที่บริษัทสั่งซื้อวัสดุ อุปกรณ์ หรือบริการที่จำเป็นสำหรับโครงการ...",
  },
  {
    id: "10",
    folder: "RM (ถ้ามี)",
    description:
      "เป็น Martrix หรือตารางแสดงหัวข้อและรายละเอียดของส่วนงานทั้งหมดของโครงการ...",
  },
  {
    id: "11",
    folder: "Packing List",
    description:
      "Product Tracking ,รูปภาพอุปกรณ์ต่างๆ, ใบส่ง,ใบรับสินค้า, ใบรับประกันสินค้า เป็นต้น",
  },
  {
    id: "12",
    folder: "เอกสารวางบิล",
    description: "เอกสารส่งมอบงานแต่ละงวด , ใบแจ้งหนี้",
  },
  {
    id: "13",
    folder: "Project Handover",
    description:
      "คือรายละเอียดงานและเอกสารต่างๆของโครงการที่ต้องการโอนย้ายให้ IT Service รวมถึง เอกสารส่งมอบโครงการให้ทีม IT Service...",
  },
];

export default function ProjectClosurePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warrantyEnd, setWarrantyEnd] = useState("");

  useEffect(() => {
    if (params?.id) {
      fetchProject();
    }
  }, [params?.id]);

  const fetchProject = async () => {
    if (!params?.id) return;
    try {
      const res = await fetch(`/api/projects/overview/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);

        // Initialize checklist
        if (
          data.project.closureChecklist &&
          data.project.closureChecklist.length > 0
        ) {
          setChecklist(data.project.closureChecklist);
        } else {
          // Initialize with template
          setChecklist(
            CHECKLIST_TEMPLATE.map((item) => ({
              ...item,
              checked: false,
              status: "Pending",
              note: "",
            })),
          );
        }

        if (data.project.warrantyEndDate) {
          setWarrantyEnd(
            new Date(data.project.warrantyEndDate).toISOString().split("T")[0],
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch project", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (id: string, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, checked, status: checked ? "Completed" : "Pending" }
          : item,
      ),
    );
  };

  const handleNoteChange = (id: string, note: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item)),
    );
  };

  const handleDeliver = async () => {
    if (!params?.id) return;
    setSaving(true);
    try {
      const result = await updateProjectClosureAction({
        projectId: params.id as string,
        status: "Delivered",
      });

      if (result.error) throw new Error(result.error);

      toast.success("Project marked as Delivered");
      fetchProject();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (closeProject = false) => {
    if (!params?.id) return;
    setSaving(true);
    try {
      const payload: any = {
        projectId: params.id as string,
        closureChecklist: checklist,
      };

      if (closeProject) {
        // Validation
        const allChecked = checklist.every((item) => item.checked);
        if (!allChecked) {
          if (
            !confirm(
              "Not all items are checked. Are you sure you want to proceed with closure?",
            )
          ) {
            setSaving(false);
            return;
          }
        }

        if (!warrantyEnd) {
          toast.error("Please specify warranty end date");
          setSaving(false);
          return;
        }

        payload.status = "Warranty";
        payload.warrantyStartDate = new Date().toISOString();
        payload.warrantyEndDate = new Date(warrantyEnd).toISOString();
      }

      const result = await updateProjectClosureAction(payload);

      if (result.error) throw new Error(result.error);

      toast.success(
        closeProject
          ? "Project closed and moved to Warranty period"
          : "Checklist saved",
      );
      if (closeProject) {
        fetchProject(); // Refresh to see new status
      }
    } catch (error) {
      console.error("Save error", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!project) return <div className="p-8 text-center">Project not found</div>;

  return (
    <div className="min-h-screen">
      <Header
        title="Project Closure"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Project", href: `/projects/${params?.id || ""}` },
          { label: "Closure" },
        ]}
      />

      <div className="pt-20 px-6 pb-6">
        <ProjectTabs />
        <div className="space-y-6 pb-20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Project Closure
              </h2>
              <p className="text-slate-500">
                Verify documents and handover before closing the project.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Progress
                </p>
                <p
                  className={`text-xl font-bold ${project.progress === 100 ? "text-green-600" : "text-slate-900"}`}
                >
                  {project.progress}%
                </p>
              </div>
              <Badge
                variant={project.status === "Warranty" ? "default" : "outline"}
                className="text-base py-1 px-3"
              >
                Current Status: {project.status}
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Checklist</CardTitle>
              <CardDescription>
                Ensure all necessary documents are collected and verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b font-medium text-sm text-slate-600">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-3">Folder</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-3">Note</div>
                </div>
                {checklist.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-start hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="col-span-1 text-center text-slate-500 pt-2">
                      {index + 1}
                    </div>
                    <div className="col-span-3 pt-2 font-medium">
                      {item.folder}
                    </div>
                    <div className="col-span-4 pt-2 text-sm text-slate-600">
                      {item.description}
                    </div>
                    <div className="col-span-1 flex justify-center pt-1">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(c) =>
                          handleCheck(item.id, c as boolean)
                        }
                        className="h-5 w-5"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Note..."
                        value={item.note || ""}
                        onChange={(e) =>
                          handleNoteChange(item.id, e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warranty & Handover</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Warranty End Date
                  </label>
                  <Input
                    type="date"
                    value={warrantyEnd}
                    onChange={(e) => setWarrantyEnd(e.target.value)}
                    disabled={project.status === "Warranty"}
                  />
                  <p className="text-xs text-slate-500">
                    Specify when the warranty period ends.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleSave(false)}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" /> Save Progress
                    </Button>

                    {project.status !== "Warranty" &&
                      project.status !== "Delivered" &&
                      (project.progress === 100 ? (
                        <Button
                          onClick={handleDeliver}
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Check className="h-4 w-4 mr-2" /> Mark as Delivered
                        </Button>
                      ) : (
                        <div className="text-amber-600 text-sm flex items-center bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Project must be 100% complete to deliver.
                        </div>
                      ))}

                    {project.status === "Delivered" && (
                      <Button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" /> Close Project & Start
                        Warranty
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
