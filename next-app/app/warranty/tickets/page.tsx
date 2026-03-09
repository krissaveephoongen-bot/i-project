"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { Plus, Filter, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

export default function TicketsPage() {
  const tickets = [
    { id: "INC-001", title: "Login issue on mobile", project: "Project Phoenix", severity: "High", status: "Open", assignee: "Dev Team" },
    { id: "INC-002", title: "Report generation failed", project: "ERP Migration", severity: "Medium", status: "In Progress", assignee: "QA Team" },
    { id: "REQ-003", title: "New user request", project: "Core Banking", severity: "Low", status: "Closed", assignee: "Admin" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="SLA Ticketing System"
          breadcrumbs={[
            { label: "Warranty", href: "/warranty" },
            { label: "Tickets" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-6">
          <div className="flex justify-between">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> New Ticket
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">Incident List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Assignee</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{t.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{t.title}</td>
                      <td className="px-6 py-4 text-slate-600">{t.project}</td>
                      <td className="px-6 py-4">
                        <Badge variant={t.severity === 'High' ? 'destructive' : 'secondary'}>
                          {t.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={t.status === 'Open' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{t.assignee}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
