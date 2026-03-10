"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  Target,
  Activity,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";

// Mock Data
const mockProjects = [
  {
    id: "1",
    name: "E-Commerce Platform Development",
    code: "ECOM-2024-001",
    description: "Full-stack e-commerce platform with payment integration",
    status: "active",
    progress: 75,
    progressPlan: 80,
    spi: 1.05,
    riskLevel: "medium",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    budget: 2500000.00,
    spent: 1875000.00,
    remaining: 625000.00,
    managerId: "user1",
    clientId: "client1",
    priority: "high",
    category: "development",
    hourlyRate: 1500.00,
    isArchived: false,
    createdAt: "2024-01-15",
    updatedAt: "2024-03-10",
  },
  {
    id: "2",
    name: "Mobile Banking App",
    code: "MOB-2024-002",
    description: "Mobile banking application with secure transactions",
    status: "active",
    progress: 60,
    progressPlan: 65,
    spi: 0.95,
    riskLevel: "high",
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    budget: 1800000.00,
    spent: 108000.00,
    remaining: 720000.00,
    managerId: "user2",
    clientId: "client2",
    priority: "medium",
    category: "development",
    hourlyRate: 1200.00,
    isArchived: false,
    createdAt: "2024-02-01",
    updatedAt: "2024-03-10",
  },
  {
    id: "3",
    name: "CRM Implementation",
    code: "CRM-2024-003",
    description: "Customer Relationship Management system",
    status: "active",
    progress: 45,
    progressPlan: 50,
    spi: 0.78,
    riskLevel: "low",
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    budget: 120000.00,
    spent: 54000.00,
    remaining: 114600.00,
    managerId: "user1",
    clientId: "client3",
    priority: "medium",
    category: "development",
    hourlyRate: 1000.00,
    isArchived: false,
    createdAt: "2024-03-01",
    "updatedAt": "2024-03-10",
  },
  {
    id: "4",
    name: "Infrastructure Migration",
    code: "INFRA-2024-004",
    description: "Cloud infrastructure migration project",
    status: "active",
    progress: 90,
    progressPlan: 85,
    spi: 1.12,
    riskLevel: "medium",
    startDate: "2024-04-01",
    endDate: "2024-05-31",
    budget: 300000.00,
    spent: 270000.00,
    remaining: 30000.00,
    managerId: "user2",
    clientId: "client4",
    priority: "high",
    category: "infrastructure",
    hourlyRate: 2000.00,
    isArchived: false,
    createdAt: "2024-04-01",
    updatedAt: "2024-03-10",
  },
  {
    id: "5",
    name: "Digital Marketing Campaign",
    code: "DM-2024-005",
    description: "Digital marketing and SEO optimization",
    status: "planning",
    progress: 10,
    progressPlan: 15,
    spi: 0.85,
    riskLevel: "low",
    startDate: "2024-05-01",
    endDate: "2024-12-31",
    budget: 80000.00,
    spent: 8000.00,
    remaining: 72000.00,
    managerId: "user3",
    clientId: "client5",
    priority: "low",
    category: "marketing",
    hourlyRate: 800.00,
    isArchived: false,
    createdAt: "2024-05-01",
    updatedAt: "2024-03-10",
  },
];

// Mock Financial Data
const mockFinancials = {
  totalBudget: mockProjects.reduce((sum, project) => sum + (project.budget || 0), 0),
  totalSpent: mockProjects.reduce((sum, project) => sum + (project.spent || 0), 0),
  totalRemaining: mockProjects.reduce((sum, project) => sum + (project.remaining || 0), 0),
  avgSPI: mockProjects.reduce((sum, project) => sum + (project.spi || 1), 0) / mockProjects.length,
};

// Calculate RAG Status
const getRagStatus = (riskLevel: string, progress: number, spi: number) => {
  if (riskLevel === 'critical' || progress < 25) return 'critical';
  if (riskLevel === 'high' || (progress < 50 && spi < 0.9)) return 'warning';
  return 'healthy';
};

// Calculate Go-Live Countdown
const getGoLiveCountdown = (endDate: string) => {
  const now = new Date();
  const target = new Date(endDate);
  const diffTime = target.getTime() - now.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days`;
  return `${Math.ceil(days / 7)} weeks`;
};

// Get Status Badge Color
const getStatusBadgeColor = (status: string) => {
  const colors = {
    planning: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    on_hold: "bg-orange-100 text-orange-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

// Get Progress Color
const getProgressColor = (progress: number) => {
  if (progress >= 90) return "bg-green-500";
  if (progress >= 75) return "bg-blue-500";
  if (progress >= 50) return "bg-yellow-500";
  if (progress >= 25) return "bg-orange-500";
  return "bg-red-500";
};

// Get SPI Color
const getSPIColor = (spi: number) => {
  if (spi >= 1.1) return "text-green-600";
  if (spi >= 1.0) return "text-yellow-600";
  if (spi >= 0.9) return "text-orange-600";
  return "text-red-600";
};

// Get Risk Level Color
const getRiskLevelColor = (riskLevel: string) => {
  const colors = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-orange-600",
    critical: "text-red-600",
  };
  return colors[riskLevel as keyof typeof colors] || "text-gray-600";
};

interface ProjectCardProps {
  project: typeof mockProjects[0];
}

function ProjectCard({ project }: ProjectCardProps) {
  const ragStatus = getRagStatus(project.riskLevel, project.progress, project.spi);
  const goLiveCountdown = project.endDate ? getGoLiveCountdown(project.endDate) : 'Not Set';
  const statusColor = getStatusBadgeColor(project.status);
  const progressColor = getProgressColor(project.progress);
  const spiColor = getSPIColor(project.spi);
  const riskColor = getRiskLevelColor(project.riskLevel);

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">
            {project.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={statusColor}
            >
              {project.status}
            </Badge>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${progressColor}`} />
              <span className="text-xs text-slate-500 ml-1">
                {project.progress}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>
              {project.startDate ? new Date(project.startDate).toLocaleDateString('th-TH') : 'Not Set'}
            </span>
            <span className="text-muted-foreground">-</span>
            <span>
              {project.endDate ? new Date(project.endDate).toLocaleDateString('th-TH') : 'Not Set'}
            </span>
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>
              ฿{project.budget?.toLocaleString()}
            </span>
          </span>
          <span className="text-muted-foreground">-</span>
          <span className={remainingColor}>
            ฿{project.remaining?.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span>
              {project.progressPlan}%
            </span>
          </span>
          <span className="text-muted-foreground">Plan</span>
          <span className={spiColor}>
            SPI: {project.spi}
          </span>
        </div>

        {/* Go-Live Countdown */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>
              {goLiveCountdown}
            </span>
          </span>
        </div>

        {/* RAG Status */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className={riskColor}>
              {project.riskLevel.toUpperCase()}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectPortfolioDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRiskLevel, setFilterRiskLevel] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.code || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || project.status === filterStatus;
      const matchesRisk =
        filterRiskLevel === "all" || project.riskLevel === filterRiskLevel;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [searchTerm, filterStatus, filterRiskLevel]);

  // Sort Logic
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];
    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "progress":
        return sorted.sort((a, b) => b.progress - a.progress);
      case "budget":
        return sorted.sort((a, b) => (b.budget || 0) - (a.budget || 0));
      case "spi":
        return sorted.sort((a, b) => (b.spi || 1) - (a.spi || 1));
      case "risk":
        return sorted((a, b) => {
          const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [sortedProjects, sortBy]);

  // Calculate KPIs
  const totals = {
    totalBudget: mockFinancials.totalBudget,
    totalSpent: mockFinancials.totalSpent,
    totalRemaining: mockFinancials.totalRemaining,
    avgSPI: mockFinancials.avgSPI,
    completedCount: mockProjects.filter(p => p.status === 'completed').length,
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header
          title="Project Portfolio Dashboard"
          breadcrumbs={[{ label: "ภาพร้อมโครงการ" }]}
        />
        <div className="pt-24 px-6 pb-8 container mx-auto max-w-7xl space-y-8">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                ภาพร้อมโครงการ (Project Portfolio)
              </h1>
              <p className="text-slate-500">
                ติดตามสถานะะเปลี่ยนทั้งหม
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                อัปเดข้อมูล
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csv = [
                    ['Name', 'Status', 'Progress', 'Budget', 'Spent', 'Remaining', 'Risk Level', 'Start Date', 'End Date', 'Go-Live Countdown'],
                    ...filteredProjects.map(p => [
                      p.name,
                      p.status,
                      `${p.progress}%`,
                      `฿${(p.budget || 0).toLocaleString()}`,
                      `฿${(p.spent || 0).toLocaleString()}`,
                      `฿${(p.remaining || 0).toLocaleString()}`,
                      p.riskLevel,
                      p.startDate ? new Date(p.startDate).toLocaleDateString('th-TH') : 'Not Set',
                      p.endDate ? new Date(p.endDate).toLocaleDateString('th-TH') : 'Not Set',
                      p.endDate ? getGoLiveCountdown(p.endDate) : 'Not Set'
                    ])
                  ];
                  const csvContent = csv.join('\n');
                  navigator.clipboard.writeText(csvContent);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  ทั้งหมดโครงการทั้งหมด
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {totals.completedCount}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  โครงการเสร็จแล้ว
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  งบประมทั้งหมด
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ฿{totals.totalBudget.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  งบประมทั้งหมดอนุญ
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  ค่าใช้จ่าย
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  ฿{totals.totalSpent.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  ค่าใช้จ่ายจริจ
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  คงเหลือ
                </CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  ฿{totals.totalRemaining.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  คงเหลือทั้งหมด
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  ความเสี่ย์
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {totals.avgSPI.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  SPI: {totals.avgSPI.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Health Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>สถานะเสถานะโครงการ</CardTitle>
                <CardDescription>
                  ภาพระเสถานะโครงการทั้งหมด
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">สุขภสถานะโครงการ</span>
                    <span className="text-sm text-slate-500">
                      {mockProjects.filter(p => p.status === 'completed').length}/{mockProjects.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Health Status</span>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'healthy' ? 'bg-green-500' : 
                          mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'warning' ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} />
                        <span className="text-xs text-slate-500">
                          {mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'healthy' ? 'Healthy' : 
                                  mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'warning' ? 'Warning' : 
                                  mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'critical' ? 'Critical' : 'At Risk'
                        } />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">
                          {mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'healthy' ? 'Healthy' : 
                                  mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'warning' ? 'Warning' : 
                                  mockProjects.filter(p => getRagStatus(p.riskLevel, p.progress, p.spi) === 'critical' ? 'Critical' : 'At Risk'
                        } />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card className="border-0 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>ภาพระจังการเงิน</CardTitle>
                <CardDescription>
                  ภาพระจังการทั้งหมด
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      ฿{mockFinancials.totalBudget.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">งบประมานอนุษ</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ฿{mockFinancials.totalSpent.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">ค่าใช้จ่ายจริจ</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ฿{mockFinancials.totalRemaining.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">คงเหลือทั้งหมด</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mockFinancials.avgSPI.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-500">SPI: {mockFinancials.avgSPI.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
            </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  โครงการทั้งหมด
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {mockProjects.length}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  โครงการทั้งหมดทั้งหมด
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-green-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  งานที่เสร็จแล้ว
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {mockProjects.filter(p => p.status === 'completed').length}
                </div>
                <p className="text-xs text-slate-500">
                  โครงการที่เสร็จแล้ว
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-amber-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  กำลังดำนเล็
                </CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {mockProjects.filter(p => p.status === 'in_progress').length}
                </div>
                <p className="text-xs text-slate-500">
                  กำลังดำเล็ว
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-red-50/80 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  ความเสี่ย์
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {mockProjects.filter(p => p.status === 'cancelled').length}
                </div>
                <p className="text-xs text-slate-500">
                  โครงการที่ถูก
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>กราฟความความ (S-Curve)</CardTitle>
                <CardDescription>
                  เปรียบเทียบแผนงานกับผลงาจรจริจ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  {/* S-Curve Chart Component */}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  สรุงการเงิน/อออก
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Financial Chart Component */}
                <div className="h-[300px]">
                  {/* Financial Chart Component */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
