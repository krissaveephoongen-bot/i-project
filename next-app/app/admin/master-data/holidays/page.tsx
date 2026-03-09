"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";

export default function HolidaysPage() {
  const holidays = [
    { date: "2024-01-01", name: "New Year's Day", type: "Public Holiday" },
    { date: "2024-04-13", name: "Songkran Festival", type: "Public Holiday" },
    { date: "2024-05-01", name: "Labor Day", type: "Public Holiday" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="ปฏิทินวันหยุด (Holidays)"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Master Data", href: "/admin/master-data" },
            { label: "Holidays" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-5xl space-y-6">
          <div className="flex justify-end">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> เพิ่มวันหยุด
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Holiday Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {holidays.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{h.date}</td>
                      <td className="px-6 py-4 text-slate-600">{h.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {h.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          Delete
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
