"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Plus,
} from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import { useThaiLocale } from "@/lib/hooks/useThaiLocale";

// Shadcn UI Components
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/Dialog";
import PageTransition from "../components/PageTransition";
import { Skeleton } from "../components/ui/Skeleton";
import { useRouter } from "next/navigation";

// Custom Components
import MonthlyView from "./components/MonthlyView";
import WeeklyView from "./components/WeeklyView";
import ActivityLog from "./components/ActivityLog";
import TimesheetModal from "./components/TimesheetModal";
import {
  Project,
  TimesheetEntry,
  WeeklyData,
  ActivityData,
  ModalRow,
  SubmissionStatus,
  EntryStatus,
} from "./types";

// Service
import {
  getTimesheetProjectsAction,
  getTimesheetEntriesAction,
  createTimesheetEntryAction,
  updateTimesheetEntryAction,
  deleteTimesheetEntryAction,
  getSubmissionStatusAction,
  submitTimesheetAction,
  getWeeklySummaryAction,
  getActivityLogAction,
} from "./actions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function TimesheetPage() {
  const { user } = useAuth();
  const { isThaiLanguage } = useThaiLocale();
  const router = useRouter();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    status: "Draft",
  });

  // Weekly Tab State
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [weeklyStart, setWeeklyStart] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [weeklyProject, setWeeklyProject] = useState<string>("all");

  // Activities Tab State
  const [activities, setActivities] = useState<ActivityData | null>(null);
  const [activityUser, setActivityUser] = useState<string>("all");
  const [activityTeam, setActivityTeam] = useState<string>("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState<string>("");
  const [modalDate, setModalDate] = useState<string>("");
  const [modalRows, setModalRows] = useState<ModalRow[]>([]);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Derived Data
  const userOptions = useMemo(() => {
    const m = new Map<string, string>();
    (weekly?.data || []).forEach((r: any) => {
      if (!m.has(r.userId)) m.set(r.userId, r.name);
    });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [weekly]);

  const monthName = isThaiLanguage
    ? currentMonth.toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      })
    : currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch submission status
        const startOfMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          1,
        );
        const status = await getSubmissionStatusAction(
          user.id,
          startOfMonth.toISOString().split("T")[0],
        );
        setSubmissionStatus({ status: status as any });
        setIsEditing(false);

        // Fetch projects
        try {
          const projects = await getTimesheetProjectsAction(user.id);
          const transformedProjects = (projects || []).map(
            (project: any, index: number) => ({
              id: project.id,
              name: project.name,
              color: `hsl(${index * 60}, 70%, 50%)`,
              is_billable: !!project.is_billable,
              tasks: project.tasks || [],
            }),
          );
          setProjects(transformedProjects);
          await fetchTimesheetEntries(
            currentMonth,
            transformedProjects.map((p: any) => p.id),
          );
        } catch (e) {
          console.error("Failed to load projects", e);
        }

        // Fetch Weekly Data (Initial)
        const weekStart = new Date(currentMonth);
        const weekday = weekStart.getDay();
        const diff = (weekday + 6) % 7;
        weekStart.setDate(weekStart.getDate() - diff);

        const wData = await getWeeklySummaryAction(
          weekStart.toISOString().split("T")[0],
        );
        if (wData) {
          setWeekly(wData as any);
          setWeeklyStart(weekStart.toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("โหลดข้อมูลไทม์ชีทล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, user]);

  const fetchTimesheetEntries = async (month: Date, projectIds?: string[]) => {
    if (!user) return;
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const loadedEntries = await getTimesheetEntriesAction(
      user.id,
      startOfMonth.toISOString().split("T")[0],
      endOfMonth.toISOString().split("T")[0],
      projectIds,
    );

    setEntries(loadedEntries as unknown as TimesheetEntry[]);
  };

  // Actions
  const openDayEditor = (
    projectId: string,
    day: number,
    taskId?: string | null,
  ) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    )
      .toISOString()
      .split("T")[0];
    let existingEntries = entries.filter(
      (entry) => entry.projectId === projectId && entry.date === dateStr,
    );

    if (taskId !== undefined) {
      if (taskId === null) {
        existingEntries = existingEntries.filter((e) => !e.taskId);
      } else {
        existingEntries = existingEntries.filter((e) => e.taskId === taskId);
      }
    }

    setModalProjectId(projectId);
    setModalDate(dateStr);

    if (existingEntries.length > 0) {
      setModalRows(
        existingEntries.map((e) => ({
          id: e.id,
          date: e.date,
          project: e.projectId || "",
          task: e.taskId || "",
          startTime: e.startTime || "",
          endTime: e.endTime || "",
          hours: e.hours,
          description: e.description || "",
          status: e.status || "Draft",
        })),
      );
    } else {
      setModalRows([
        {
          id: "new",
          date: dateStr,
          project: projectId,
          task: taskId || "",
          startTime: "",
          endTime: "",
          hours: 0,
          description: "",
          status: "Draft",
        },
      ]);
    }
    setModalOpen(true);
  };

  const saveDayEditor = async (rows: ModalRow[]) => {
    try {
      for (const r of rows) {
        if (r.deleted) {
          if (r.id && r.id !== "new") {
            await deleteTimesheetEntryAction(r.id);
            setEntries((prev) => prev.filter((e) => e.id !== r.id));
          }
          continue;
        }

        const entryData = {
          hours: r.hours,
          taskId: r.task || null,
          description: r.description,
          startTime: r.startTime,
          endTime: r.endTime,
          date: modalDate,
          projectId: modalProjectId,
          userId: user?.id,
        };

        if (r.id && r.id !== "new") {
          const updated = await updateTimesheetEntryAction({
            ...entryData,
            id: r.id,
          });
          if (updated) {
            setEntries((prev) =>
              prev.map((e) =>
                e.id === r.id ? (updated as unknown as TimesheetEntry) : e,
              ),
            );
          }
        } else if (r.hours > 0) {
          const created = await createTimesheetEntryAction(entryData);
          if (created) {
            setEntries((prev) => [
              ...prev,
              created as unknown as TimesheetEntry,
            ]);
          }
        }
      }
      setModalOpen(false);
      toast.success("บันทึกข้อมูลสำเร็จ");
    } catch {
      toast.error("บันทึกข้อมูลล้มเหลว");
    }
  };

  const handleSubmitForApproval = async () => {
    if (!user) return;
    setLoading(true);
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

    const success = await submitTimesheetAction(
      user.id,
      startOfMonth.toISOString().split("T")[0],
      endOfMonth.toISOString().split("T")[0],
      totalHours,
    );

    if (success) {
      setSubmissionStatus({
        status: "Submitted",
        submittedAt: new Date().toISOString(),
      });
      setIsEditing(false);
      toast.success("ส่งอนุมัติเรียบร้อยแล้ว");
    } else {
      toast.error("ส่งข้อมูลล้มเหลว");
    }
    setLoading(false);
  };

  const handleWeeklySearch = async () => {
    const data = await getWeeklySummaryAction(
      weeklyStart,
      weeklyProject,
    );
    if (data) setWeekly(data as any);
  };

  const handleActivitySearch = async () => {
    const data = await getActivityLogAction(
      weeklyStart,
      weeklyProject,
      activityUser,
      activityTeam,
    );
    if (data) setActivities(data as any);
  };

  // Calculations
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const isAuthority = ["admin", "manager"].includes((user as any)?.role || "");
  const canEdit =
    submissionStatus.status === "Draft" ||
    submissionStatus.status === "Rejected" ||
    (isAuthority && submissionStatus.status === "Submitted");

  // Add Entry Handler
  const handleAddEntry = () => {
    if (!projects.length) {
      toast.error("ต้องมีโครงการอย่างน้อย 1 รายการ");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const firstProject = projects[0].id;

    setModalProjectId(firstProject);
    setModalDate(today);
    setModalRows([
      {
        id: "new",
        date: today,
        project: firstProject,
        task: "",
        startTime: "",
        endTime: "",
        hours: 0,
        description: "",
        status: "Draft",
      },
    ]);
    setModalOpen(true);
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status.status) {
      case "Draft":
        return <Badge variant="secondary">แบบร่าง (Draft)</Badge>;
      case "Submitted":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            รออนุมัติ (Submitted)
          </Badge>
        );
      case "Approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            อนุมัติแล้ว (Approved)
          </Badge>
        );
      case "Rejected":
        return <Badge variant="destructive">ไม่อนุมัติ (Rejected)</Badge>;
      default:
        return <Badge variant="outline">{status.status}</Badge>;
    }
  };

  if (!user) return <div className="p-8 text-center">กรุณาเข้าสู่ระบบ</div>;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="บันทึกเวลาทำงาน (Timesheet)"
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "Timesheet" },
          ]}
        />
        <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
          <div className="flex justify-between">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-slate-50/50">
      <Header
        title="บันทึกเวลาทำงาน (Timesheet)"
        breadcrumbs={[{ label: "แดชบอร์ด", href: "/" }, { label: "Timesheet" }]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6 max-w-[1600px]">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)),
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="font-semibold text-lg text-slate-900">
                {monthName}
              </span>
              <div className="flex items-center gap-2">
                {getStatusBadge(submissionStatus)}
                <span className="text-xs text-slate-500 font-medium">
                  {totalHours} ชม.
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)),
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <Button
                variant={isEditing ? "secondary" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2 rounded-xl"
              >
                {isEditing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit2 className="h-4 w-4" />
                )}
                {isEditing ? "หยุดแก้ไข" : "แก้ไขเวลา"}
              </Button>
            )}

            {canEdit && (
              <Button
                onClick={() => router.push("/timesheet/record")}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/20"
              >
                <Plus className="h-4 w-4" /> เพิ่มรายการใหม่
              </Button>
            )}

            {submissionStatus.status === "Draft" && (
              <Button
                onClick={() => setConfirmSubmit(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20"
              >
                <Send className="h-4 w-4" /> ส่งอนุมัติ
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full md:w-[450px] grid-cols-3 bg-slate-100 rounded-xl p-1">
            <TabsTrigger
              value="monthly"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              มุมมองรายเดือน
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              สรุปรายสัปดาห์
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              ประวัติกิจกรรม
            </TabsTrigger>
          </TabsList>

          {/* Monthly View */}
          <TabsContent
            value="monthly"
            className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <MonthlyView
              currentMonth={currentMonth}
              projects={projects}
              entries={entries}
              isEditing={isEditing}
              canEdit={canEdit}
              onOpenDayEditor={openDayEditor}
            />
          </TabsContent>

          {/* Weekly Summary */}
          <TabsContent
            value="weekly"
            className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <WeeklyView
              weekly={weekly}
              weeklyStart={weeklyStart}
              setWeeklyStart={setWeeklyStart}
              weeklyProject={weeklyProject}
              setWeeklyProject={setWeeklyProject}
              projects={projects}
              onSearch={handleWeeklySearch}
            />
          </TabsContent>

          {/* Activities Log */}
          <TabsContent
            value="activities"
            className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <ActivityLog
              activities={activities}
              weeklyStart={weeklyStart}
              setWeeklyStart={setWeeklyStart}
              weeklyProject={weeklyProject}
              setWeeklyProject={setWeeklyProject}
              activityUser={activityUser}
              setActivityUser={setActivityUser}
              projects={projects}
              userOptions={userOptions}
              onSearch={handleActivitySearch}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <TimesheetModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projectId={modalProjectId}
          date={modalDate}
          projects={projects}
          initialRows={modalRows}
          onSave={saveDayEditor}
          userId={user?.id}
        />

        {/* Confirm Submit Modal */}
        <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>ยืนยันการส่งอนุมัติ?</DialogTitle>
              <DialogDescription>
                คุณแน่ใจหรือไม่ที่จะส่ง Timesheet สำหรับเดือน {monthName}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>
                เมื่อส่งแล้ว
                คุณจะไม่สามารถแก้ไขข้อมูลได้อีกจนกว่าจะได้รับการพิจารณาจากหัวหน้างาน
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setConfirmSubmit(false)}
                className="rounded-xl"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSubmitForApproval}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                ยืนยันส่ง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
