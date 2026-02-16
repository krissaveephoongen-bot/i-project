'use client';

import { useLanguage } from './useLanguage';
import { useMemo } from 'react';

/**
 * Hook for Thai-specific localization
 * Provides date/time formatting with Thai Buddhist calendar support
 * and Thai language conventions
 */
export function useThaiLocale() {
  const { language, isThaiLanguage, formatDate, formatNumber } = useLanguage();

  // Thai month names in Buddhist calendar
  const thaiMonths = useMemo(() => ({
    names: [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ],
    short: [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ]
  }), []);

  // Thai day names
  const thaiDays = useMemo(() => ({
    names: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
    short: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  }), []);

  // Thai work type labels
  const thaiWorkTypes = useMemo(() => ({
    general: 'งานทั่วไป',
    project: 'โครงการ',
    training: 'การฝึกอบรม',
    leave: 'วันลา',
    overtime: 'ชั่วโมงพิเศษ',
  }), []);

  // Thai leave type labels
  const thaiLeaveTypes = useMemo(() => ({
    annual: 'วันลาประจำปี',
    sick: 'วันลาป่วย',
    personal: 'วันลาส่วนบุคคล',
    maternity: 'วันลาคลอด',
    unpaid: 'วันลาไม่จ่ายเงิน',
  }), []);

  // Thai status labels
  const thaiStatuses = useMemo(() => ({
    draft: 'ร่าง',
    submitted: 'ส่งแล้ว',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ',
    pending: 'รอดำเนินการ',
  }), []);

  // Format date in Thai style (dd MMM yyyy)
  const formatThaiDate = (date: Date): string => {
    if (!isThaiLanguage) {
      return formatDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    const d = new Date(date);
    const day = d.getDate();
    const month = thaiMonths.names[d.getMonth()];
    const year = d.getFullYear() + 543; // Buddhist calendar

    return `${day} ${month} ${year}`;
  };

  // Format date with day name (e.g., "จันทร์ 17 กุมภาพันธ์ 2567")
  const formatThaiDateWithDay = (date: Date): string => {
    if (!isThaiLanguage) {
      return formatDate(date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    const d = new Date(date);
    const day = d.getDate();
    const month = thaiMonths.names[d.getMonth()];
    const year = d.getFullYear() + 543;
    const dayName = thaiDays.names[d.getDay()];

    return `${dayName} ${day} ${month} ${year}`;
  };

  // Format time range (e.g., "08:00 - 17:00")
  const formatTimeRange = (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
  };

  // Format duration in hours (e.g., "8.5 ชั่วโมง")
  const formatDuration = (hours: number): string => {
    const formatted = formatNumber(hours, { maximumFractionDigits: 1 });
    return isThaiLanguage ? `${formatted} ชั่วโมง` : `${formatted} hrs`;
  };

  // Format hours worked with cost (Thai: "8 ชั่วโมง (4,000 บาท)")
  const formatHoursWithCost = (hours: number, cost: number): string => {
    const durationStr = formatDuration(hours);
    if (cost === 0) return durationStr;

    const costFormatted = formatNumber(cost, {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return isThaiLanguage ? `${durationStr} (${costFormatted})` : `${durationStr} (${costFormatted})`;
  };

  // Get work type label
  const getWorkTypeLabel = (type: string): string => {
    return isThaiLanguage ? 
      thaiWorkTypes[type as keyof typeof thaiWorkTypes] || type :
      type;
  };

  // Get leave type label
  const getLeaveTypeLabel = (type: string): string => {
    return isThaiLanguage ?
      thaiLeaveTypes[type as keyof typeof thaiLeaveTypes] || type :
      type;
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    return isThaiLanguage ?
      thaiStatuses[status as keyof typeof thaiStatuses] || status :
      status;
  };

  return {
    isThaiLanguage,
    thaiMonths,
    thaiDays,
    thaiWorkTypes,
    thaiLeaveTypes,
    thaiStatuses,
    formatNumber,
    formatThaiDate,
    formatThaiDateWithDay,
    formatTimeRange,
    formatDuration,
    formatHoursWithCost,
    getWorkTypeLabel,
    getLeaveTypeLabel,
    getStatusLabel,
  };
}
