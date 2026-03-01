"use client";

import { useState, useMemo } from "react";
import { ProfessionalFilter } from "@/components/ProfessionalFilter";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Filter, Search, X } from "lucide-react";
import { useDynamicFilterOptions } from "@/hooks/useDynamicFilterOptions";

// Sample data for demonstration
const sampleProjects = [
  {
    id: "1",
    name: "Website Redesign",
    status: "active",
    category: "Development",
    priority: "high",
    manager: "John Doe",
    budget: 50000,
  },
  {
    id: "2",
    name: "Mobile App",
    status: "planning",
    category: "Development",
    priority: "medium",
    manager: "Jane Smith",
    budget: 75000,
  },
  {
    id: "3",
    name: "Marketing Campaign",
    status: "completed",
    category: "Marketing",
    priority: "low",
    manager: "Bob Johnson",
    budget: 25000,
  },
  {
    id: "4",
    name: "Database Migration",
    status: "active",
    category: "Infrastructure",
    priority: "high",
    manager: "Alice Brown",
    budget: 100000,
  },
  {
    id: "5",
    name: "Security Audit",
    status: "planning",
    category: "Security",
    priority: "high",
    manager: "Charlie Wilson",
    budget: 30000,
  },
  {
    id: "6",
    name: "UI/UX Research",
    status: "completed",
    category: "Design",
    priority: "medium",
    manager: "Diana Prince",
    budget: 15000,
  },
];

export default function ProfessionalFilterDemo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");

  const { data: dynamicOptions, isLoading: optionsLoading } =
    useDynamicFilterOptions();

  // Filter logic
  const filteredProjects = useMemo(() => {
    return sampleProjects.filter((project) => {
      const matchesSearch =
        !searchTerm ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || project.category === categoryFilter;
      const matchesPriority =
        priorityFilter === "all" || project.priority === priorityFilter;
      const matchesManager =
        managerFilter === "all" || project.manager === managerFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesManager
      );
    });
  }, [
    sampleProjects,
    searchTerm,
    statusFilter,
    categoryFilter,
    priorityFilter,
    managerFilter,
  ]);

  // Filter configuration
  const filters = [
    {
      key: "status",
      label: "สถานะ",
      value: statusFilter,
      type: "dynamic" as const,
      dynamicOptions: "projectStatuses" as const,
      onChange: setStatusFilter,
    },
    {
      key: "category",
      label: "หมวดหมู่",
      value: categoryFilter,
      type: "static" as const,
      staticOptions: [
        { value: "Development", label: "พัฒนา" },
        { value: "Marketing", label: "การตลาด" },
        { value: "Infrastructure", label: "โครงสร้างพื้นฐาน" },
        { value: "Security", label: "ความปลอดภัย" },
        { value: "Design", label: "การออกแบบ" },
      ],
      onChange: setCategoryFilter,
    },
    {
      key: "priority",
      label: "ความสำคัญ",
      value: priorityFilter,
      type: "static" as const,
      staticOptions: [
        { value: "high", label: "สูง" },
        { value: "medium", label: "ปานกลาง" },
        { value: "low", label: "ต่ำ" },
      ],
      onChange: setPriorityFilter,
    },
    {
      key: "manager",
      label: "ผู้จัดการ",
      value: managerFilter,
      type: "dynamic" as const,
      dynamicOptions: "users" as const,
      onChange: setManagerFilter,
    },
  ];

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setManagerFilter("all");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Professional Filter System Demo</h1>
        <p className="text-muted-foreground">
          ตัวอย่างการใช้งานระบบกรองข้อมูลแบบ Professional พร้อมฟีเจอร์ครบครัน
        </p>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>คุณสมบัติหลัก</CardTitle>
          <CardDescription>
            ระบบกรองข้อมูลแบบใหม่มีฟีเจอร์ดังต่อไปนี้:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-blue-500" />
              <span>Debounced Search (300ms)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-500" />
              <span>Dynamic Data Sources</span>
            </div>
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-red-500" />
              <span>Clear All Filters</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-purple-500" />
              <span>Date Range Filtering</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">5</Badge>
              <span>Multi-Condition Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-orange-500 rounded-full" />
              <span>Empty State Handling</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Filter Component */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรองข้อมูล</CardTitle>
          <CardDescription>
            ลองใช้งานฟีเจอร์ต่างๆ ของระบบกรองข้อมูล
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfessionalFilter
            searchPlaceholder="ค้นหาชื่อโครงการ, ผู้จัดการ, หรือหมวดหมู่..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            resultCount={filteredProjects.length}
            totalItems={sampleProjects.length}
            onClearAll={clearAllFilters}
            isLoading={optionsLoading}
          />
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>ผลลัพธ์ ({filteredProjects.length} รายการ)</CardTitle>
          <CardDescription>
            {filteredProjects.length === 0
              ? "ไม่พบข้อมูลที่ตรงตามเงื่อนไข"
              : `แสดง ${filteredProjects.length} รายการจากทั้งหมด ${sampleProjects.length} รายการ`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <EmptyState
              type="no-results"
              title="ไม่พบข้อมูลที่ตรงตามเงื่อนไข"
              description="ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูลใหม่"
              action={{
                label: "ล้างตัวกรอง",
                onClick: clearAllFilters,
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>ผู้จัดการ: {project.manager}</p>
                        <p>งบประมาณ: ${project.budget.toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดทางเทคนิค</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <strong>Dynamic Options Loading:</strong>{" "}
              {optionsLoading ? "Loading..." : "Loaded"}
            </div>
            <div>
              <strong>Current Filters:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Search: "{searchTerm}"</li>
                <li>• Status: {statusFilter}</li>
                <li>• Category: {categoryFilter}</li>
                <li>• Priority: {priorityFilter}</li>
                <li>• Manager: {managerFilter}</li>
              </ul>
            </div>
            <div>
              <strong>Performance:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Search debounced to 300ms</li>
                <li>• Filter options cached for 5 minutes</li>
                <li>• React.memo for optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
