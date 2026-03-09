"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { CheckCircle2, AlertTriangle, FileText, Settings, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";

export default function ProjectDeliveryPage({ params }: { params: { id: string } }) {
  const readiness = 75;

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Delivery & Cutover"
          breadcrumbs={[
            { label: "Projects", href: "/projects" },
            { label: "Overview", href: `/projects/${params.id}/overview` },
            { label: "Delivery" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-5xl space-y-6">
          
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Go-Live Readiness</h2>
              <p className="text-sm text-slate-500">ความพร้อมก่อนขึ้นระบบจริง</p>
            </div>
            <div className="flex items-center gap-4 w-1/3">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progress</span>
                  <span>{readiness}%</span>
                </div>
                <Progress value={readiness} className="h-2" />
              </div>
              <Button disabled={readiness < 100} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <Rocket className="w-4 h-4" /> Go Live
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" /> System Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {["Server Configuration", "Database Migration", "Security Scan", "Performance Test"].map((item, i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked={i < 2} />
                      <span className={i < 2 ? "text-slate-900 line-through decoration-slate-400" : "text-slate-700"}>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> User Acceptance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {["UAT Sign-off", "User Training", "Manual Delivery", "Access Setup"].map((item, i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked={i === 0} />
                      <span className={i === 0 ? "text-slate-900 line-through decoration-slate-400" : "text-slate-700"}>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">Cutover Plan (Runbook)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center text-slate-500 py-12">
              <p>ยังไม่มีแผน Cutover</p>
              <Button variant="outline" className="mt-4">สร้างแผนงาน</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
