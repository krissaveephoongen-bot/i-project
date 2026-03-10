"use client";

import { useEffect, useState } from "react";
import {
    FolderKanban,
    CheckSquare,
    Calendar,
    CreditCard,
    BarChart3,
    ShieldCheck,
    Users,
    UserCheck,
    Truck,
    Database,
    Settings,
    Activity,
    ArrowUp,
    TrendingUp,
} from "lucide-react";
import PortalTile from "@/app/components/PortalTile";
import PageTransition from "@/app/components/PageTransition";
import { toast } from "react-hot-toast";

interface PortalStats {
    projects?: { active: number; total: number };
    tasks?: { pending: number; total: number };
    expenses?: { pending: number; total: number };
    approvals?: { waiting: number };
}

export default function PortalDashboard() {
    const [stats, setStats] = useState<PortalStats>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/portfolio");
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        projects: {
                            active: data.rows?.filter(
                                (p: any) =>
                                    p.status?.toLowerCase() !== "completed"
                            ).length || 0,
                            total: data.rows?.length || 0,
                        },
                    });
                }
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
                {/* Hero Section */}
                <div className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 overflow-hidden">
                    {/* Background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-40 right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-40 left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                Welcome to I-PROJECT Portal
                            </h1>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                                Manage projects, track financials, and collaborate with your team.
                            </p>
                        </div>

                        {/* Main Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            {/* Primary Features */}
                            <PortalTile
                                title="Projects"
                                description="Manage all your projects, phases, and milestones"
                                href="/projects"
                                icon={<FolderKanban className="w-6 h-6 text-blue-300" />}
                                badge="Core"
                                badgeColor="blue"
                                stats={
                                    stats.projects
                                        ? [
                                              {
                                                  label: "Active",
                                                  value: stats.projects.active,
                                              },
                                              {
                                                  label: "Total",
                                                  value: stats.projects.total,
                                              },
                                          ]
                                        : undefined
                                }
                                variant="default"
                            />

                            <PortalTile
                                title="Tasks & Execution"
                                description="Track tasks, WBS, and project execution status"
                                href="/tasks"
                                icon={<CheckSquare className="w-6 h-6 text-green-300" />}
                                badge="Tracking"
                                badgeColor="green"
                            />

                            <PortalTile
                                title="Financials"
                                description="Monitor budgets, expenses, and cash flow"
                                href="/expenses"
                                icon={<CreditCard className="w-6 h-6 text-yellow-300" />}
                                badge="Critical"
                                badgeColor="yellow"
                            />

                            {/* Secondary Features */}
                            <PortalTile
                                title="Timesheet"
                                description="Record and approve team time entries"
                                href="/timesheet"
                                icon={<Calendar className="w-6 h-6 text-cyan-300" />}
                            />

                            <PortalTile
                                title="Reports & Analytics"
                                description="View insights, trends, and KPI dashboards"
                                href="/reports"
                                icon={<BarChart3 className="w-6 h-6 text-purple-300" />}
                            />

                            <PortalTile
                                title="Warranty & Support"
                                description="Manage SLA tickets and preventive maintenance"
                                href="/warranty"
                                icon={<ShieldCheck className="w-6 h-6 text-red-300" />}
                            />

                            {/* Workspace Features */}
                            <PortalTile
                                title="Clients"
                                description="Manage client information and contacts"
                                href="/clients"
                                icon={<Users className="w-6 h-6 text-blue-300" />}
                            />

                            <PortalTile
                                title="Approvals"
                                description="Review and approve pending requests"
                                href="/approvals"
                                icon={<UserCheck className="w-6 h-6 text-green-300" />}
                            />

                            <PortalTile
                                title="Delivery & Cutover"
                                description="Plan and track delivery milestones"
                                href="/delivery"
                                icon={<Truck className="w-6 h-6 text-orange-300" />}
                            />
                        </div>

                        {/* Divider */}
                        <div className="mb-16">
                            <div className="border-t border-slate-700" />
                        </div>

                        {/* Admin Section (collapsible) */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <Settings className="w-6 h-6 text-slate-400" />
                                Administration
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <PortalTile
                                    title="Master Data"
                                    description="Manage system configurations and data"
                                    href="/admin/master-data"
                                    icon={
                                        <Database className="w-6 h-6 text-slate-400" />
                                    }
                                />

                                <PortalTile
                                    title="User Management"
                                    description="Manage users, roles, and permissions"
                                    href="/admin/users"
                                    icon={
                                        <Users className="w-6 h-6 text-slate-400" />
                                    }
                                />

                                <PortalTile
                                    title="Project Assignment"
                                    description="Assign users to projects and teams"
                                    href="/admin/project-assign"
                                    icon={
                                        <FolderKanban className="w-6 h-6 text-slate-400" />
                                    }
                                />

                                <PortalTile
                                    title="System Health"
                                    description="Monitor system performance and logs"
                                    href="/admin/health"
                                    icon={
                                        <Activity className="w-6 h-6 text-slate-400" />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Active Projects
                                </p>
                                <p className="text-3xl font-bold text-white flex items-center gap-2">
                                    {stats.projects?.active || 0}
                                    <ArrowUp className="w-5 h-5 text-green-400" />
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Total Portfolio Value
                                </p>
                                <p className="text-3xl font-bold text-white">
                                    ฿ --
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">
                                    System Health
                                </p>
                                <p className="text-3xl font-bold text-green-400 flex items-center gap-2">
                                    100%
                                    <TrendingUp className="w-5 h-5" />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
