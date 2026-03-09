"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { Plus, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

export default function PMSchedulePage() {
  const schedules = [
    { id: 1, title: "Monthly Health Check", project: "Project Phoenix", frequency: "Monthly", lastRun: "2024-10-01", nextRun: "2024-11-01", status: "Active" },
    { id: 2, title: "Security Patch Update", project: "Core Banking", frequency: "Quarterly", lastRun: "2024-08-01", nextRun: "2024-11-01", status: "Active" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Preventive Maintenance Schedule"
          breadcrumbs={[
            { label: "Warranty", href: "/warranty" },
            { label: "PM Schedule" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-6">
          <div className="flex justify-between">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" /> Calendar View
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Schedule PM
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((s) => (
              <Card key={s.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold text-slate-900">{s.title}</CardTitle>
                    <Badge variant={s.status === 'Active' ? 'default' : 'secondary'} className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{s.project}</p>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Frequency
                    </span>
                    <span className="font-medium">{s.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Last Run
                    </span>
                    <span className="font-medium">{s.lastRun}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Next Run
                    </span>
                    <span className="font-medium text-blue-600">{s.nextRun}</span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
