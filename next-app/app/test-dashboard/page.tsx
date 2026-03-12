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

export default function TestDashboard() {
    const [stats, setStats] = useState<any>({});
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-white via-slate-50 to-blue-50 pb-12">
            {/* Hero Section */}
            <div className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 overflow-hidden">
                <div className="relative max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                            Welcome to I-PROJECT Portal (Test Mode)
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Manage projects, track financials, and collaborate with your team.
                        </p>
                    </div>

                    {/* Main Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {/* Projects */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-4">
                                <FolderKanban className="w-6 h-6 text-blue-600 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Manage all your projects, phases, and milestones</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Active: {stats.projects?.active || 0}</span>
                                <span className="text-gray-500">Total: {stats.projects?.total || 0}</span>
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-4">
                                <CheckSquare className="w-6 h-6 text-green-600 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Tasks & Execution</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Track tasks, WBS, and project execution status</p>
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Tracking</span>
                        </div>

                        {/* Financials */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-4">
                                <CreditCard className="w-6 h-6 text-yellow-600 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Financials</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Monitor budgets, expenses, and cash flow</p>
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Critical</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
