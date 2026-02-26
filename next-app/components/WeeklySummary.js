import React, { useState } from "react";
import { useWeeklySummary } from "../hooks";

function WeeklySummary() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedRange, setSelectedRange] = useState("current"); // current, last, custom

  try {
    const { summary, loading, error, refreshSummary } = useWeeklySummary();

    const items = [
      {
        label: "ชั่วโมงทำงาน",
        value: summary.hoursWorked,
        unit: "ชม.",
        icon: "clock",
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "งานที่เสร็จ",
        value: summary.tasksCompleted,
        unit: "งาน",
        icon: "check-circle",
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "ประชุม",
        value: summary.meetingsAttended,
        unit: "ครั้ง",
        icon: "users",
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
    ];

    // Handler functions
    const handleExportData = () => {
      const data = {
        สรุปสัปดาห์:
          selectedRange === "current"
            ? "สัปดาห์ปัจจุบัน"
            : selectedRange === "last"
              ? "สัปดาห์ที่แล้ว"
              : "ช่วงเวลาที่เลือก",
        ชั่วโมงทำงาน: summary.hoursWorked,
        งานที่เสร็จ: summary.tasksCompleted,
        ประชุม: summary.meetingsAttended,
        วันที่สร้าง: new Date().toLocaleString("th-TH"),
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `weekly-summary-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handlePrintSummary = () => {
      window.print();
    };

    const handleShareSummary = async () => {
      const summaryText = `สรุปสัปดาห์นี้:\nชั่วโมงทำงาน: ${summary.hoursWorked} ชม.\nงานที่เสร็จ: ${summary.tasksCompleted} งาน\nประชุม: ${summary.meetingsAttended} ครั้ง`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "สรุปสัปดาห์",
            text: summaryText,
          });
        } catch (err) {
          console.log("Error sharing:", err);
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(summaryText).then(() => {
          alert("คัดลอกข้อมูลสรุปไปยังคลิปบอร์ดแล้ว");
        });
      }
    };

    if (loading) {
      return (
        <div
          className="card"
          data-name="weekly-summary"
          data-file="components/WeeklySummary.js"
        >
          <h2 className="text-lg font-semibold mb-4">สรุปสัปดาห์นี้</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-4 text-center animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="card"
          data-name="weekly-summary"
          data-file="components/WeeklySummary.js"
        >
          <h2 className="text-lg font-semibold mb-4">สรุปสัปดาห์นี้</h2>
          <div className="text-center py-4 text-red-600">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        </div>
      );
    }

    return (
      <div
        className="card"
        data-name="weekly-summary"
        data-file="components/WeeklySummary.js"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">สรุปสัปดาห์นี้</h2>
          <button
            onClick={refreshSummary}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="icon-refresh-cw text-lg text-gray-600"></div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleExportData}
            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors"
          >
            <div className="icon-download text-xs"></div>
            ส่งออกข้อมูล
          </button>

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-300 transition-colors"
          >
            <div className="icon-calendar text-xs"></div>
            เลือกช่วงเวลา
          </button>

          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-300 transition-colors"
          >
            <div className="icon-eye text-xs"></div>
            ดูรายละเอียด
          </button>

          <button
            onClick={handleShareSummary}
            className="bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-300 transition-colors"
          >
            <div className="icon-share-2 text-xs"></div>
            แชร์
          </button>

          <button
            onClick={handlePrintSummary}
            className="bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-300 transition-colors"
          >
            <div className="icon-printer text-xs"></div>
            พิมพ์
          </button>
        </div>

        {/* Date Range Selector */}
        {showDatePicker && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedRange("current");
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1.5 rounded text-sm ${selectedRange === "current" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border"}`}
              >
                สัปดาห์ปัจจุบัน
              </button>
              <button
                onClick={() => {
                  setSelectedRange("last");
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1.5 rounded text-sm ${selectedRange === "last" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border"}`}
              >
                สัปดาห์ที่แล้ว
              </button>
              <button
                onClick={() => {
                  setSelectedRange("custom");
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1.5 rounded text-sm ${selectedRange === "custom" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border"}`}
              >
                กำหนดเอง
              </button>
            </div>
          </div>
        )}

        {/* Detailed View */}
        {showDetailedView && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <h3 className="font-semibold text-sm mb-2">รายละเอียดเพิ่มเติม</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ประสิทธิภาพการทำงาน:</span>
                <span className="font-medium">
                  {summary.tasksCompleted > 0 ? "ดีเยี่ยม" : "ปกติ"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เฉลี่ยชั่วโมง/วัน:</span>
                <span className="font-medium">
                  {(summary.hoursWorked / 7).toFixed(1)} ชม.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">อัตราส่วนการประชุม:</span>
                <span className="font-medium">
                  {summary.meetingsAttended > 0
                    ? `${((summary.meetingsAttended / 7) * 100).toFixed(0)}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สถานะโดยรวม:</span>
                <span
                  className={`font-medium ${summary.hoursWorked >= 35 ? "text-green-600" : "text-orange-600"}`}
                >
                  {summary.hoursWorked >= 35 ? "บรรลุเป้า" : "ต้องเพิ่มเวลา"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={`${item.bg} rounded-xl p-4 text-center`}
            >
              <div
                className={`icon-${item.icon} text-2xl ${item.color} mb-2`}
              ></div>
              <div className="text-2xl font-bold text-gray-900">
                {item.value}
              </div>
              <div className="text-xs text-gray-600">{item.unit}</div>
              <div className="text-xs text-gray-600 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("WeeklySummary component error:", error);
    return null;
  }
}
