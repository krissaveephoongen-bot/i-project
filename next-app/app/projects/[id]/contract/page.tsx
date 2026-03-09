"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { FileText, Save, Download, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

export default function ContractPage({ params }: { params: { id: string } }) {
  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="รายละเอียดสัญญา (Contract & TOR)"
          breadcrumbs={[
            { label: "Projects", href: "/projects" },
            { label: "Overview", href: `/projects/${params.id}/overview` },
            { label: "Contract" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-5xl space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> บันทึกข้อมูล
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">ข้อมูลสัญญา (Contract Info)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">เลขที่สัญญา (Contract No.)</label>
                <Input placeholder="e.g. CON-2024-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">วันที่เริ่มสัญญา</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">วันที่สิ้นสุดสัญญา</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">มูลค่าสัญญา (บาท)</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">ขอบเขตงาน (TOR Description)</label>
                <Textarea placeholder="รายละเอียดขอบเขตงาน..." rows={5} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-semibold">เงื่อนไขการรับประกัน (Warranty Terms)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ระยะเวลารับประกัน (เดือน)</label>
                  <Input type="number" placeholder="12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ประเภท SLA</label>
                  <Input placeholder="e.g. 8x5 NBD" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  เงื่อนไขค่าปรับ (Penalty Terms)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ค่าปรับล่าช้า (บาท/วัน)</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ค่าปรับสูงสุด (% ของสัญญา)</label>
                  <Input type="number" placeholder="10" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
