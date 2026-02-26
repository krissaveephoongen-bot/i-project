"use client";

import React, { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { th } from "date-fns/locale";
import { useWeeklyActivities } from "../hooks/useWeeklyActivities";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LoadingSpinner, Skeleton } from "./ui/loading";

const WeeklyActivities = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const { activities, loading, error, refreshActivities } =
    useWeeklyActivities(selectedWeek);

  const handleWeekChange = (direction) => {
    const newWeek =
      direction === "next"
        ? addDays(selectedWeek, 7)
        : addDays(selectedWeek, -7);
    setSelectedWeek(newWeek);
  };

  const handleRefresh = () => {
    refreshActivities();
  };

  const getWeekDisplay = () => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    return format(weekStart, "yyyy/MM/dd", { locale: th });
  };

  const filteredActivities = activities.filter((employee) =>
    employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton lines={1} height="h-6" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} lines={1} height="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            เกิดข้อผิดพลาด
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshActivities}>ลองใหม่</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            รายละเอียดรายสัปดาห์ (Activities)
          </h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="ค้นหาพนักงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Refresh */}
            <Button
              variant="ghost"
              onClick={handleRefresh}
              title="รีเฟรชข้อมูล"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Week Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700">
            สัปดาห์ที่เลือก:
          </label>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleWeekChange("prev")}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>

            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg min-w-[120px] text-center">
              <span className="text-sm font-medium text-gray-900">
                {getWeekDisplay()}
              </span>
            </div>

            <Button variant="outline" onClick={() => handleWeekChange("next")}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Activities Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200">
                  พนักงาน
                </th>
                {mockActivities[0]?.days.map((day, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 min-w-[120px]"
                  >
                    {day.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((employee, empIndex) => (
                <tr
                  key={empIndex}
                  className={empIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-200">
                    {employee.employeeName}
                  </td>
                  {employee.days.map((day, dayIndex) => (
                    <td
                      key={dayIndex}
                      className="px-4 py-3 text-sm text-gray-600 border border-gray-200 align-top"
                    >
                      <div className="space-y-1 min-h-[60px]">
                        {day.activities[0] === "-" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          day.activities.map((activity, actIndex) => (
                            <div
                              key={actIndex}
                              className="text-xs leading-relaxed"
                            >
                              {activity}
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-xs text-gray-500 italic">
          ข้อมูลแยกบรรทัดตามแต่ละกิจกรรมที่บันทึกในวันเดียวกัน
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              ไม่พบข้อมูลกิจกรรมสำหรับพนักงานที่ค้นหา
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyActivities;
