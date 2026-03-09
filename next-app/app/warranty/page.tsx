"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { Plus, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function WarrantyDashboard() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [stats, setStats] = useState({
    openTickets: 0,
    slaBreached: 0,
    avgResolution: "N/A",
    upcomingPM: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Tickets (Issues)
        const resTickets = await fetch(`/api/warranty/tickets?status=Open`);
        const jsonTickets = await resTickets.json();
        
        // Fetch PM (Tasks)
        const resPM = await fetch(`/api/warranty/maintenance?status=pending`);
        const jsonPM = await resPM.json();

        const ticketData = jsonTickets.data || [];
        const pmData = jsonPM.data || [];

        setTickets(ticketData);
        setMaintenance(pmData);

        // Calculate basic stats
        setStats({
            openTickets: ticketData.length,
            slaBreached: ticketData.filter((t: any) => t.priority === 'Critical').length, // Mock logic for SLA
            avgResolution: "4h", // Placeholder until we have historical data
            upcomingPM: pmData.length
        });

      } catch (error) {
        console.error("Error fetching warranty data:", error);
        toast.error("Failed to load warranty data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Warranty & Maintenance"
          breadcrumbs={[{ label: "Warranty" }]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Open Tickets</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loading ? "..." : stats.openTickets}
                  </h3>
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
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loading ? "..." : stats.slaBreached}
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Avg Resolution</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stats.avgResolution}</h3>
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
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loading ? "..." : stats.upcomingPM}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets Table */}
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Active Incidents</CardTitle>
                <Link href="/warranty/tickets">
                  <Button size="sm" variant="outline" className="text-xs">View All</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                    <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Issue</th>
                      <th className="px-6 py-3">Project</th>
                      <th className="px-6 py-3">Severity</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.length === 0 ? (
                        <tr><td colSpan={4} className="p-6 text-center text-slate-500">No active incidents</td></tr>
                    ) : (
                        tickets.slice(0, 5).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900">{t.title}</td>
                            <td className="px-6 py-4 text-slate-600">{t.project?.name || "-"}</td>
                            <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                t.priority === 'High' || t.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {t.priority}
                            </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{t.status}</td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
                )}
              </CardContent>
            </Card>

            {/* PM Schedule Table */}
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Preventive Maintenance (PM)</CardTitle>
                <Link href="/warranty/pm-schedule">
                  <Button size="sm" variant="outline" className="text-xs">Manage Schedule</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                    <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
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
                    {maintenance.length === 0 ? (
                        <tr><td colSpan={4} className="p-6 text-center text-slate-500">No upcoming PM</td></tr>
                    ) : (
                        maintenance.slice(0, 5).map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900">{m.title}</td>
                            <td className="px-6 py-4 text-slate-600">{m.project?.name || "-"}</td>
                            <td className="px-6 py-4 text-slate-600">{m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "-"}</td>
                            <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                {m.status}
                            </span>
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
