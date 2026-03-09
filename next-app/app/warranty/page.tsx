"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";

export default function WarrantyDashboard() {
  const tickets = [
    { id: 1, title: "Login issue on mobile", project: "Project Phoenix", severity: "High", status: "Open", sla: "2h left" },
    { id: 2, title: "Report generation failed", project: "ERP Migration", severity: "Medium", status: "In Progress", sla: "4h left" },
  ];

  const maintenance = [
    { id: 1, title: "Monthly Health Check", project: "Project Phoenix", due: "2024-11-01", status: "Pending" },
    { id: 2, title: "Security Patch Update", project: "Core Banking", due: "2024-11-05", status: "Scheduled" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Warranty & Maintenance"
          breadcrumbs={[{ label: "Warranty" }]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Open Tickets</p>
                  <h3 className="text-2xl font-bold text-slate-900">12</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">SLA Breached</p>
                  <h3 className="text-2xl font-bold text-slate-900">1</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Avg Resolution Time</p>
                  <h3 className="text-2xl font-bold text-slate-900">4h</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Upcoming PM</p>
                  <h3 className="text-2xl font-bold text-slate-900">5</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Active Incidents</CardTitle>
                <Link href="/warranty/tickets">
                  <Button size="sm" variant="outline" className="text-xs">View All</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Issue</th>
                      <th className="px-6 py-3">Project</th>
                      <th className="px-6 py-3">Severity</th>
                      <th className="px-6 py-3">SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900">{t.title}</td>
                        <td className="px-6 py-4 text-slate-600">{t.project}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            t.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {t.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-red-600 font-medium">{t.sla}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* PM Schedule */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Preventive Maintenance (PM)</CardTitle>
                <Link href="/warranty/pm-schedule">
                  <Button size="sm" variant="outline" className="text-xs">Manage Schedule</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Activity</th>
                      <th className="px-6 py-3">Project</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {maintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900">{m.title}</td>
                        <td className="px-6 py-4 text-slate-600">{m.project}</td>
                        <td className="px-6 py-4 text-slate-600">{m.due}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
