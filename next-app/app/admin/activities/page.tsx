"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
import { activityService, ActivityType } from "@/app/lib/activity-service";
import { WorkType } from "@/app/timesheet/types";
import { toast } from "react-hot-toast";

export default function ActivityAdminPage() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<ActivityType>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getAll();
      setActivities(data);
    } catch (error) {
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentActivity.name || !currentActivity.workType) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (currentActivity.id) {
        await activityService.update(currentActivity as ActivityType);
        toast.success("Updated successfully");
      } else {
        await activityService.add({
          name: currentActivity.name,
          workType: currentActivity.workType,
          isActive: true,
        });
        toast.success("Created successfully");
      }
      setModalOpen(false);
      loadActivities();
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity type?")) return;
    try {
      await activityService.delete(id);
      toast.success("Deleted successfully");
      loadActivities();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const openModal = (activity?: ActivityType) => {
    setCurrentActivity(
      activity || { isActive: true, workType: WorkType.PROJECT },
    );
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="จัดการประเภทกิจกรรม (Activity Types)"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Activities" },
        ]}
      />

      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            รายการประเภทกิจกรรม
          </h2>
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="w-4 h-4" /> เพิ่มประเภทกิจกรรม
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อกิจกรรม</TableHead>
                  <TableHead>ประเภทงาน (Work Type)</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.workType === WorkType.PROJECT
                            ? "bg-blue-100 text-blue-700"
                            : activity.workType === WorkType.LEAVE
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {activity.workType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${activity.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {activity.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openModal(activity)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {activities.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentActivity.id ? "แก้ไขประเภทกิจกรรม" : "เพิ่มประเภทกิจกรรม"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อกิจกรรม</Label>
              <Input
                value={currentActivity.name || ""}
                onChange={(e) =>
                  setCurrentActivity({
                    ...currentActivity,
                    name: e.target.value,
                  })
                }
                placeholder="เช่น Development, Meeting..."
              />
            </div>
            <div className="space-y-2">
              <Label>ประเภทงานหลัก</Label>
              <Select
                value={currentActivity.workType}
                onValueChange={(v: WorkType) =>
                  setCurrentActivity({ ...currentActivity, workType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทงาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WorkType.PROJECT}>Project</SelectItem>
                  <SelectItem value={WorkType.OFFICE}>
                    Office / Non-Project
                  </SelectItem>
                  <SelectItem value={WorkType.LEAVE}>Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={currentActivity.isActive}
                onChange={(e) =>
                  setCurrentActivity({
                    ...currentActivity,
                    isActive: e.target.checked,
                  })
                }
                className="rounded border-slate-300"
              />
              <Label htmlFor="active">ใช้งาน (Active)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
