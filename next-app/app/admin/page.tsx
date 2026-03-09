"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import {
  Users,
  Briefcase,
  Settings,
  Database,
  Activity,
  Server,
  AlertCircle,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
      toast.error("โหลดข้อมูล Admin Stats ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runMaintenance = async (url: string, name: string) => {
    try {
      setLog(`Running ${name}...`);
      const res = await fetch(url, { method: "POST" });
      const json = await res.json();
      setLog((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] ${name}: Success\n${JSON.stringify(json, null, 2)}`);
      toast.success(`${name} สำเร็จ`);
      fetchStats(); // Refresh stats
    } catch (e: any) {
      setLog((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] ${name}: Failed - ${e.message}`);
      toast.error(`${name} ล้มเหลว`);
    }
  };

  const menuItems = [
    { label: "จัดการผู้ใช้", icon: Users, href: "/admin/users", desc: "เพิ่ม/ลบ/แก้ไขสิทธิ์พนักงาน" },
    { label: "กำหนดโครงการ", icon: Briefcase, href: "/admin/project-assign", desc: "จัดการสมาชิกในแต่ละโครงการ" },
    { label: "Timesheets", icon: Activity, href: "/admin/timesheets", desc: "ตรวจสอบและแก้ไขเวลาทำงาน" },
    { label: "ตั้งค่าระบบ", icon: Settings, href: "/settings", desc: "ตั้งค่าทั่วไปขององค์กร" }, // Redirect to general settings for now
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="ผู้ดูแลระบบ (Admin Dashboard)"
          breadcrumbs={[{ label: "Admin" }]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-8">
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">ผู้ใช้งานทั้งหมด</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stats?.usersCount || 0}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">โครงการทั้งหมด</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stats?.projectsCount || 0}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">สถานะระบบ</p>
                  <h3 className="text-xl font-bold text-slate-900 uppercase">{stats?.status || "Unknown"}</h3>
                  <p className="text-xs text-slate-400">Uptime: {Math.floor(stats?.uptime || 0)}s</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Logs ทั้งหมด</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stats?.logsCount || 0}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <h2 className="text-lg font-semibold text-slate-800">เมนูจัดการด่วน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-slate-50 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 rounded-full transition-colors">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{item.label}</h3>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* System Maintenance */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-500" />
                การบำรุงรักษาระบบ (System Maintenance)
              </CardTitle>
              <CardDescription>เครื่องมือสำหรับจัดการฐานข้อมูลและสคริปต์ (Dev Tools)</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <RefreshCw className="w-4 h-4" /> Sync Schema
                  </div>
                  <p className="text-xs text-slate-500">อัปเดตโครงสร้างฐานข้อมูลให้ตรงกับ Code ล่าสุด</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => runMaintenance("/api/migrations/schema-sync", "Sync Schema")}
                  >
                    Run Sync
                  </Button>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <Database className="w-4 h-4" /> Seed Financial
                  </div>
                  <p className="text-xs text-slate-500">สร้างข้อมูลจำลองด้านการเงิน (Reset Data)</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => runMaintenance("/api/migrations/seed-financial", "Seed Financial")}
                  >
                    Run Seed
                  </Button>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <Play className="w-4 h-4" /> Seed Projects
                  </div>
                  <p className="text-xs text-slate-500">สร้างข้อมูลโครงการตัวอย่าง (Reset Data)</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => runMaintenance("/api/migrations/seed-project-flex", "Seed Projects")}
                  >
                    Run Seed
                  </Button>
                </div>
              </div>

              {log && (
                <div className="mt-4 p-4 bg-slate-900 text-slate-50 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {log}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
