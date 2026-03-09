"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import {
  Calendar,
  Users,
  FileText,
  Briefcase,
  Building2,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/app/components/ui/card";

export default function MasterDataPage() {
  const menus = [
    {
      label: "ปฏิทินวันหยุด (Holidays)",
      icon: Calendar,
      href: "/admin/master-data/holidays",
      desc: "จัดการวันหยุดนักขัตฤกษ์และวันหยุดบริษัท",
      color: "text-red-600 bg-red-50",
    },
    {
      label: "ข้อมูลลูกค้า (Clients)",
      icon: Users,
      href: "/clients",
      desc: "จัดการรายชื่อลูกค้าและผู้ติดต่อ",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "ข้อมูลผู้ขาย (Vendors)",
      icon: Building2,
      href: "/admin/vendors",
      desc: "จัดการรายชื่อ Vendor และสัญญา",
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "ประเภทกิจกรรม (Activities)",
      icon: Briefcase,
      href: "/admin/activities",
      desc: "กำหนดประเภทงานสำหรับ Timesheet",
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "รหัสต้นทุน (Cost Codes)",
      icon: Tags,
      href: "/admin/cost-codes",
      desc: "จัดการรหัสบัญชีและประเภทค่าใช้จ่าย",
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="จัดการข้อมูลหลัก (Master Data)"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Master Data" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((m) => (
              <Link key={m.href} href={m.href} className="group">
                <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className={`p-4 rounded-full transition-colors ${m.color}`}>
                      <m.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{m.label}</h3>
                      <p className="text-sm text-slate-500">{m.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
