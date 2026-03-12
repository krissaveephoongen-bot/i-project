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
            <div className="bg-gradient-to-b from-white via-slate-50 to-blue-50 pb-12">
                {/* Hero Section */}
                <div className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 overflow-hidden">
                    {/* Background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-40 right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-40 left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                                Welcome to I-PROJECT Portal
                            </h1>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
                                icon={<FolderKanban className="w-6 h-6 text-blue-600" />}
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
                                icon={<CheckSquare className="w-6 h-6 text-green-600" />}
                                badge="Tracking"
                                badgeColor="green"
                            />

                            <PortalTile
                                title="Financials"
                                description="Monitor budgets, expenses, and cash flow"
                                href="/expenses"
                                icon={<CreditCard className="w-6 h-6 text-yellow-600" />}
                                badge="Critical"
                                badgeColor="yellow"
                            />

                            {/* Secondary Features */}
                            <PortalTile
                                title="Timesheet"
                                description="Record and approve team time entries"
                                href="/timesheet"
                                icon={<Calendar className="w-6 h-6 text-cyan-600" />}
                            />

                            <PortalTile
                                title="Reports & Analytics"
                                description="View insights, trends, and KPI dashboards"
                                href="/reports"
                                icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
                            />

                            <PortalTile
                                title="Warranty & Support"
                                description="Manage SLA tickets and preventive maintenance"
                                href="/warranty"
                                icon={<ShieldCheck className="w-6 h-6 text-red-600" />}
                            />

                            {/* Workspace Features */}
                            <PortalTile
                                title="Clients"
                                description="Manage client information and contacts"
                                href="/clients"
                                icon={<Users className="w-6 h-6 text-blue-600" />}
                            />

                            <PortalTile
                                title="Approvals"
                                description="Review and approve pending requests"
                                href="/approvals"
                                icon={<UserCheck className="w-6 h-6 text-green-600" />}
                            />

                            <PortalTile
                                title="Delivery & Cutover"
                                description="Plan and track delivery milestones"
                                href="/delivery"
                                icon={<Truck className="w-6 h-6 text-orange-600" />}
                            />
                        </div>

                        {/* Divider */}
                        <div className="mb-16">
                            <div className="border-t border-slate-700" />
                        </div>

                        {/* Admin Section (collapsible) */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <Settings className="w-6 h-6 text-slate-600" />
                                Administration
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <PortalTile
                                    title="Master Data"
                                    description="Manage system configurations and data"
                                    href="/admin/master-data"
                                    icon={
                                        <Database className="w-6 h-6 text-slate-600" />
                                    }
                                />

                                <PortalTile
                                    title="User Management"
                                    description="Manage users, roles, and permissions"
                                    href="/admin/users"
                                    icon={
                                        <Users className="w-6 h-6 text-slate-600" />
                                    }
                                />

                                <PortalTile
                                    title="Project Assignment"
                                    description="Assign users to projects and teams"
                                    href="/admin/project-assign"
                                    icon={
                                        <FolderKanban className="w-6 h-6 text-slate-600" />
                                    }
                                />

                                <PortalTile
                                    title="System Health"
                                    description="Monitor system performance and logs"
                                    href="/admin/health"
                                    icon={
                                        <Activity className="w-6 h-6 text-slate-600" />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PageTransition>
    );
}
