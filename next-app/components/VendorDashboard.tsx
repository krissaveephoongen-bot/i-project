// next-app/components/VendorDashboard.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  PieChart,
} from "lucide-react";

interface VendorStats {
  vendorsByStatus: Array<{
    status: string;
    count: number;
  }>;
  vendorsByCategory: Array<{
    category: string;
    count: number;
  }>;
  vendorsByType: Array<{
    type: string;
    count: number;
  }>;
  topVendors: Array<{
    id: string;
    name: string;
    overallRating: string;
    totalProjects: number;
    successfulProjects: number;
  }>;
}

interface ContractStats {
  contractsByStatus: Array<{
    status: string;
    count: number;
    totalValue: number;
  }>;
  contractsByType: Array<{
    type: string;
    count: number;
    totalValue: number;
  }>;
  expiringContracts: Array<{
    id: string;
    title: string;
    vendorName: string;
    endDate: string;
    value: number;
  }>;
}

interface PaymentStats {
  paymentsByStatus: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  paymentsByType: Array<{
    paymentType: string;
    count: number;
    totalAmount: number;
  }>;
  overduePayments: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    vendorName: string;
  }>;
  upcomingPayments: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    vendorName: string;
  }>;
}

interface KpiStats {
  evaluationsByRating: Array<{
    rating: string;
    count: number;
  }>;
  avgScoresByCategory: Array<{
    category: string;
    avgQuality: number;
    avgTimeliness: number;
    avgCost: number;
    avgCommunication: number;
    avgTechnical: number;
    avgOverall: number;
    evaluationCount: number;
  }>;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    vendorCategory: string;
    avgScore: number;
    evaluationCount: number;
  }>;
}

interface VendorDashboardProps {
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({
  timeRange = "30d",
  onTimeRangeChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null);
  const [contractStats, setContractStats] = useState<ContractStats | null>(
    null,
  );
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [kpiStats, setKpiStats] = useState<KpiStats | null>(null);

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-yellow-100 text-yellow-800",
    blacklisted: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    active: "ใช้งาน",
    inactive: "ไม่ใช้งาน",
    suspended: "ระงับ",
    blacklisted: "บัญชีดำ",
  };

  const ratingColors = {
    excellent: "bg-green-100 text-green-800",
    good: "bg-blue-100 text-blue-800",
    satisfactory: "bg-yellow-100 text-yellow-800",
    needs_improvement: "bg-orange-100 text-orange-800",
    poor: "bg-red-100 text-red-800",
  };

  const ratingLabels = {
    excellent: "ดีเยี่ยม",
    good: "ดี",
    satisfactory: "พอใช้",
    needs_improvement: "ต้องปรับปรุง",
    poor: "แย่",
  };

  const timeRanges = [
    { value: "7d", label: "7 วัน" },
    { value: "30d", label: "30 วัน" },
    { value: "90d", label: "90 วัน" },
    { value: "1y", label: "1 ปี" },
    { value: "all", label: "ทั้งหมด" },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [vendorRes, contractRes, paymentRes, kpiRes] = await Promise.all([
        fetch("/api/vendors-management/stats/overview"),
        fetch("/api/vendor-contracts/stats/overview"),
        fetch("/api/vendor-payments/stats/overview"),
        fetch("/api/vendor-kpi/stats/overview"),
      ]);

      const [vendorData, contractData, paymentData, kpiData] =
        await Promise.all([
          vendorRes.json(),
          contractRes.json(),
          paymentRes.json(),
          kpiRes.json(),
        ]);

      setVendorStats(vendorData);
      setContractStats(contractData);
      setPaymentStats(paymentData);
      setKpiStats(kpiData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Vendor ทั้งหมด
                </p>
                <p className="text-2xl font-bold">
                  {vendorStats?.vendorsByStatus?.reduce(
                    (sum, item) => sum + item.count,
                    0,
                  ) || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-500">12%</span>
                <span className="text-gray-500 ml-1">จากเดือนที่แล้ว</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  สัญญาที่ใช้งาน
                </p>
                <p className="text-2xl font-bold">
                  {contractStats?.contractsByStatus?.find(
                    (c) => c.status === "active",
                  )?.count || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-500">8%</span>
                <span className="text-gray-500 ml-1">จากเดือนที่แล้ว</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  การชำระเงินที่ค้าง
                </p>
                <p className="text-2xl font-bold">
                  {paymentStats?.overduePayments?.length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-red-500">3%</span>
                <span className="text-gray-500 ml-1">จากเดือนที่แล้ว</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  มูลค่าสัญญารวม
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    contractStats?.contractsByStatus?.reduce(
                      (sum, item) => sum + (item.totalValue || 0),
                      0,
                    ) || 0,
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-500">15%</span>
                <span className="text-gray-500 ml-1">จากเดือนที่แล้ว</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              สถานะ Vendor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorStats?.vendorsByStatus?.map((status) => {
                const total = vendorStats.vendorsByStatus.reduce(
                  (sum, item) => sum + item.count,
                  0,
                );
                const percentage = total > 0 ? (status.count / total) * 100 : 0;

                return (
                  <div
                    key={status.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={
                          statusColors[
                            status.status as keyof typeof statusColors
                          ]
                        }
                      >
                        {
                          statusLabels[
                            status.status as keyof typeof statusLabels
                          ]
                        }
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {status.count} vendor
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Vendor ที่ทำงานได้ดีที่สุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorStats?.topVendors?.slice(0, 5).map((vendor, index) => {
                const successRate =
                  vendor.totalProjects > 0
                    ? (vendor.successfulProjects / vendor.totalProjects) * 100
                    : 0;

                return (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-gray-500">
                          {vendor.totalProjects} โครงการ
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          ratingColors[
                            vendor.overallRating as keyof typeof ratingColors
                          ]
                        }
                      >
                        {
                          ratingLabels[
                            vendor.overallRating as keyof typeof ratingLabels
                          ]
                        }
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        สำเร็จ {successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Contract Expirations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              สัญญาที่จะหมดอายุเร็วๆ นี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contractStats?.expiringContracts?.slice(0, 5).map((contract) => {
                const daysUntilExpiry = Math.ceil(
                  (new Date(contract.endDate).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                const isUrgent = daysUntilExpiry <= 7;

                return (
                  <div
                    key={contract.id}
                    className={`p-3 border rounded-lg ${isUrgent ? "border-red-200 bg-red-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{contract.title}</p>
                        <p className="text-sm text-gray-500">
                          {contract.vendorName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${isUrgent ? "text-red-600" : "text-gray-600"}`}
                        >
                          {daysUntilExpiry} วัน
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(contract.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {contractStats?.expiringContracts?.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  ไม่มีสัญญาที่จะหมดอายุใน 30 วันข้างหน้า
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              การชำระเงินที่ค้างชำระ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentStats?.overduePayments?.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="p-3 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-gray-500">
                        {payment.vendorName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ครบกำหนด {formatDate(payment.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {paymentStats?.overduePayments?.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">ไม่มีการชำระเงินที่ค้างชำระ</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            สรุปประสิทธิภาพ Vendor (KPI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiStats?.avgScoresByCategory?.map((category) => (
              <div key={category.category} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 capitalize">
                  {category.category}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>คุณภาพ</span>
                    <span className="font-medium">
                      {category.avgQuality?.toFixed(1) || "-"}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ตรงเวลา</span>
                    <span className="font-medium">
                      {category.avgTimeliness?.toFixed(1) || "-"}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ต้นทุน</span>
                    <span className="font-medium">
                      {category.avgCost?.toFixed(1) || "-"}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>การสื่อสาร</span>
                    <span className="font-medium">
                      {category.avgCommunication?.toFixed(1) || "-"}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>เทคนิค</span>
                    <span className="font-medium">
                      {category.avgTechnical?.toFixed(1) || "-"}/10
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">คะแนนรวม</span>
                      <span className="font-semibold">
                        {category.avgOverall?.toFixed(1) || "-"}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
