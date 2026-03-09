"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import {
  UserPlus,
  Trash2,
  Search,
  Users,
  Briefcase,
  Shield,
  MoreVertical,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { toast } from "react-hot-toast";

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  position?: string;
}

interface Member {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export default function AdminProjectAssignPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [role, setRole] = useState<string>("member");
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/project-assign", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      setProjects(json.projects || []);
      setUsers(json.users || []);
      setMembers(json.members || []);
      
      // Auto-select first project if none selected
      if (!projectId && json.projects?.[0]) {
        setProjectId(json.projects[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const currentMembers = useMemo(() => {
    return members
      .filter((m) => m.project_id === projectId)
      .map((m) => {
        const user = users.find((u) => u.id === m.user_id);
        return { ...m, user };
      })
      .sort((a, b) => (a.user?.name || "").localeCompare(b.user?.name || ""));
  }, [members, projectId, users]);

  // Filter users not already in the project for assignment
  const availableUsers = useMemo(() => {
    const existingUserIds = new Set(
      members
        .filter((m) => m.project_id === projectId)
        .map((m) => m.user_id)
    );
    
    return users.filter(
      (u) => 
        !existingUserIds.has(u.id) && 
        (u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
         u.email.toLowerCase().includes(searchUser.toLowerCase()))
    );
  }, [users, members, projectId, searchUser]);

  const assign = async () => {
    if (!projectId || !userId) return;
    try {
      const res = await fetch("/api/admin/project-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, user_id: userId, role }),
      });
      
      if (!res.ok) throw new Error("Failed to assign user");
      
      toast.success("เพิ่มสมาชิกเรียบร้อยแล้ว");
      setUserId("");
      setIsAssignDialogOpen(false);
      await load();
    } catch (error) {
      console.error("Assign error:", error);
      toast.error("เพิ่มสมาชิกไม่สำเร็จ");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("คุณต้องการลบสมาชิกคนนี้ออกจากโครงการใช่หรือไม่?")) return;
    
    try {
      const res = await fetch(
        `/api/admin/project-assign?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      
      if (!res.ok) throw new Error("Failed to remove member");
      
      toast.success("ลบสมาชิกเรียบร้อยแล้ว");
      await load();
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("ลบสมาชิกไม่สำเร็จ");
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    // Implement role update logic here if API supports it
    // For now, we might need to remove and re-add or create a new endpoint
    toast("ฟีเจอร์แก้ไขบทบาทกำลังพัฒนา", { icon: "🚧" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="จัดการสมาชิกโครงการ"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/" },
          { label: "ผู้ดูแลระบบ", href: "/admin" },
          { label: "สมาชิกโครงการ" },
        ]}
      />
      
      <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-6">
        
        {/* Project Selector & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white p-2 rounded-lg border shadow-sm">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 md:w-[300px]">
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-10 bg-white border-slate-200">
                  <SelectValue placeholder="เลือกโครงการ" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.code}</span>
                        <span className="text-slate-500">- {p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <UserPlus className="w-4 h-4" /> เพิ่มสมาชิก
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>เพิ่มสมาชิกเข้าโครงการ</DialogTitle>
                <DialogDescription>
                  เลือกผู้ใช้และกำหนดบทบาทเพื่อเข้าร่วมทีมในโครงการ {currentProject?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ค้นหาผู้ใช้</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="พิมพ์ชื่อหรืออีเมล..."
                      className="pl-9"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">เลือกผู้ใช้</label>
                  <Select value={userId} onValueChange={setUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกจากรายการ..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length > 0 ? (
                        availableUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={u.avatar_url} />
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{u.name}</span>
                              <span className="text-xs text-slate-400">({u.email})</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-slate-500 text-center">
                          ไม่พบผู้ใช้ที่ยังไม่ได้อยู่ในโครงการ
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">บทบาทในโครงการ</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Project Manager</SelectItem>
                      <SelectItem value="member">Team Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>ยกเลิก</Button>
                <Button onClick={assign} disabled={!userId}>บันทึก</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members List */}
        <div className="grid gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    สมาชิกในทีม
                    <Badge variant="secondary" className="ml-2">
                      {currentMembers.length} คน
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    จัดการสิทธิ์และสมาชิกในโครงการ {currentProject?.code}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 w-[40%]">ชื่อ-สกุล</th>
                      <th className="px-6 py-3 w-[25%]">ตำแหน่ง</th>
                      <th className="px-6 py-3 w-[20%]">บทบาท</th>
                      <th className="px-6 py-3 w-[15%] text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : currentMembers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Users className="w-8 h-8 opacity-20" />
                            <p>ยังไม่มีสมาชิกในโครงการนี้</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-slate-100">
                                <AvatarImage src={m.user?.avatar_url} />
                                <AvatarFallback className="bg-slate-100 text-slate-600">
                                  {m.user?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {m.user?.name || "Unknown User"}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {m.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {m.user?.position || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={m.role === "manager" ? "default" : "secondary"}
                              className={m.role === "manager" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}
                            >
                              {m.role === "manager" ? "Manager" : 
                               m.role === "viewer" ? "Viewer" : "Member"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateMemberRole(m.id, "manager")}>
                                  <Shield className="w-4 h-4 mr-2" /> ตั้งเป็น Manager
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateMemberRole(m.id, "member")}>
                                  <Users className="w-4 h-4 mr-2" /> ตั้งเป็น Member
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={() => remove(m.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> ลบออกจากทีม
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
