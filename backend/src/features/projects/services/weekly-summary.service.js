import { eq, gte, lte, desc, sql, and, count, sum, extract } from "drizzle-orm";
import { getDbClient } from "../../shared/database.js";
import { timeEntries, projects, users } from "../../shared/database/schema.js";

export class WeeklySummaryService {
  constructor() {
    this.db = getDbClient().db;
  }

  /**
   * ดึงข้อมูลสรุปรายสัปดาห์
   */
  async getWeeklySummary(filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const weekRange = this.getWeekRange(filters);
    const { weekStart, weekEnd } = weekRange;

    // ดึงข้อมูลพนักงานทั้งหมด
    const allEmployees = await this.db
      .select({
        userId: users.id,
        employeeName: users.name,
        role: users.role,
        department: users.department,
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(users.name);

    // ดึงข้อมูล timesheet ในช่วงสัปดาห์ที่กำหนด
    const timesheetData = await this.db
      .select({
        id: timeEntries.id,
        userId: timeEntries.userId,
        userName: users.name,
        userRole: users.role,
        workDate: timeEntries.date,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        workType: timeEntries.workType,
        projectId: projects.id,
        projectName: projects.name,
        description: timeEntries.description,
        hours: timeEntries.hours,
      })
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .where(
        and(
          gte(timeEntries.date, weekStart),
          lte(timeEntries.date, weekEnd),
          filters.userId ? eq(timeEntries.userId, filters.userId) : sql`1=1`,
        ),
      )
      .orderBy(timeEntries.date, timeEntries.startTime);

    // จัดกลุ่มข้อมูลตามพนักงานและวัน
    const employeeData = await this.buildEmployeeData(
      allEmployees,
      timesheetData,
      weekRange,
    );

    // คำนวณสรุป
    const summary = this.calculateWeeklySummary(employeeData, weekRange);

    return {
      weekStart,
      weekEnd,
      year: weekRange.year,
      weekNumber: weekRange.weekNumber,
      employees: employeeData,
      summary,
    };
  }

  /**
   * ดึงข้อมูลสรุปรายวันในสัปดาห์
   */
  async getDailySummary(weekStart, weekEnd) {
    if (!this.db) throw new Error("Database not configured");

    const dailyData = await this.db
      .select({
        date: timeEntries.date,
        totalHours: sum(timeEntries.hours).mapWith(Number),
        employeesWorking: count(sql`DISTINCT ${timeEntries.userId}`).mapWith(
          Number,
        ),
        projectHours: sum(
          sql`CASE WHEN ${timeEntries.workType} = 'project' THEN ${timeEntries.hours} ELSE 0 END`,
        ).mapWith(Number),
        nonProjectHours: sum(
          sql`CASE WHEN ${timeEntries.workType} != 'project' THEN ${timeEntries.hours} ELSE 0 END`,
        ).mapWith(Number),
      })
      .from(timeEntries)
      .where(
        and(gte(timeEntries.date, weekStart), lte(timeEntries.date, weekEnd)),
      )
      .groupBy(timeEntries.date)
      .orderBy(timeEntries.date);

    return dailyData.map((data) => ({
      date: data.date,
      dayName: this.getDayName(data.date),
      totalHours: data.totalHours || 0,
      employeesWorking: data.employeesWorking || 0,
      averageHoursPerEmployee:
        data.employeesWorking > 0
          ? (data.totalHours || 0) / data.employeesWorking
          : 0,
      projectHours: data.projectHours || 0,
      nonProjectHours: data.nonProjectHours || 0,
    }));
  }

  /**
   * เปรียบเทียบข้อมูลระหว่างสัปดาห์ปัจจุบันกับสัปดาห์ที่แล้ว
   */
  async compareWeeks(currentWeekStart) {
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const [currentWeek, previousWeek] = await Promise.all([
      this.getWeeklySummary({ weekStart: currentWeekStart.toISOString() }),
      this.getWeeklySummary({ weekStart: previousWeekStart.toISOString() }),
    ]);

    const totalHoursChange =
      currentWeek.summary.totalHours - previousWeek.summary.totalHours;
    const totalHoursChangePercentage =
      previousWeek.summary.totalHours > 0
        ? (totalHoursChange / previousWeek.summary.totalHours) * 100
        : 0;

    return {
      currentWeek,
      previousWeek,
      changes: {
        totalHoursChange,
        totalHoursChangePercentage,
        employeesWithDataChange:
          currentWeek.summary.employeesWithData -
          previousWeek.summary.employeesWithData,
        averageHoursPerEmployeeChange:
          currentWeek.summary.averageHoursPerEmployee -
          previousWeek.summary.averageHoursPerEmployee,
      },
    };
  }

  /**
   * ดึงข้อมูลแนวโน้มรายสัปดาห์ (ย้อนหลัง 12 สัปดาห์)
   */
  async getWeeklyTrends(year, weeks = 12) {
    if (!this.db) throw new Error("Database not configured");

    const trends = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekNumber = i + 1;
      const weekStart = this.getWeekStart(year, weekNumber);
      const weekEnd = this.getWeekEnd(year, weekNumber);

      const weekData = await this.db
        .select({
          totalHours: sum(timeEntries.hours).mapWith(Number),
          employeesWithData: count(sql`DISTINCT ${timeEntries.userId}`).mapWith(
            Number,
          ),
        })
        .from(timeEntries)
        .where(
          and(gte(timeEntries.date, weekStart), lte(timeEntries.date, weekEnd)),
        );

      const totalHours = weekData[0]?.totalHours || 0;
      const employeesWithData = weekData[0]?.employeesWithData || 0;

      trends.push({
        weekNumber,
        year,
        weekStart,
        totalHours,
        employeesWithData,
        averageHoursPerEmployee:
          employeesWithData > 0 ? totalHours / employeesWithData : 0,
      });
    }

    return trends;
  }

  /**
   * เตรียมข้อมูลสำหรับส่งออก Excel
   */
  async prepareExportData(filters = {}) {
    const weeklySummary = await this.getWeeklySummary(filters);

    const headers = [
      "ชื่อพนักงาน",
      "ตำแหน่ง",
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
      "รวมสัปดาห์",
      "เฉลี่ย/วัน",
      "วันทำงาน",
    ];

    const data = weeklySummary.employees.map((employee) => {
      const dailyHours = employee.dailyHours.reduce((acc, day) => {
        acc[day.dayNumber] = day.hasData ? day.hours.toFixed(2) : "0.00";
        return acc;
      }, {});

      return [
        employee.employeeName,
        employee.role,
        dailyHours[0] || "0.00", // Sunday
        dailyHours[1] || "0.00", // Monday
        dailyHours[2] || "0.00", // Tuesday
        dailyHours[3] || "0.00", // Wednesday
        dailyHours[4] || "0.00", // Thursday
        dailyHours[5] || "0.00", // Friday
        dailyHours[6] || "0.00", // Saturday
        employee.totalWeeklyHours.toFixed(2),
        employee.averageDailyHours.toFixed(2),
        employee.workingDays.toString(),
      ];
    });

    return {
      fileName: `สรุปรายสัปดาห์_${weeklySummary.year}_W${weeklySummary.weekNumber.toString().padStart(2, "0")}_${new Date().toISOString().split("T")[0]}.xlsx`,
      headers,
      data,
      weekInfo: {
        weekStart: weeklySummary.weekStart.toISOString().split("T")[0],
        weekEnd: weeklySummary.weekEnd.toISOString().split("T")[0],
        weekNumber: weeklySummary.weekNumber,
        year: weeklySummary.year,
      },
    };
  }

  /**
   * ดึงข้อมูลช่วงสัปดาห์ที่มีอยู่
   */
  async getAvailableWeeks(year) {
    const weeks = [];

    for (let weekNumber = 1; weekNumber <= 52; weekNumber++) {
      const weekStart = this.getWeekStart(year, weekNumber);
      const weekEnd = this.getWeekEnd(year, weekNumber);

      // ตรวจสอบว่ามีข้อมูลในสัปดาห์นี้หรือไม่
      const hasData = await this.db
        .select({ count: count() })
        .from(timeEntries)
        .where(
          and(gte(timeEntries.date, weekStart), lte(timeEntries.date, weekEnd)),
        )
        .limit(1);

      if (hasData.length > 0 && hasData[0].count > 0) {
        weeks.push({
          weekStart,
          weekEnd,
          weekNumber,
          year,
          displayText: `สัปดาห์ที่ ${weekNumber} (${weekStart.toLocaleDateString("th-TH")} - ${weekEnd.toLocaleDateString("th-TH")})`,
        });
      }
    }

    return weeks;
  }

  getWeekRange(filters = {}) {
    const now = new Date();
    let year = filters.year || now.getFullYear();
    let weekNumber = filters.weekNumber || this.getWeekNumber(now);

    if (filters.weekStart) {
      const weekStart = new Date(filters.weekStart);
      year = weekStart.getFullYear();
      weekNumber = this.getWeekNumber(weekStart);
    }

    const weekStart = this.getWeekStart(year, weekNumber);
    const weekEnd = this.getWeekEnd(year, weekNumber);

    return {
      weekStart,
      weekEnd,
      weekNumber,
      year,
      displayText: `สัปดาห์ที่ ${weekNumber} (${weekStart.toLocaleDateString("th-TH")} - ${weekEnd.toLocaleDateString("th-TH")})`,
    };
  }

  getWeekStart(year, weekNumber) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7 - firstDayOfYear.getDay();
    const weekStart = new Date(firstDayOfYear);
    weekStart.setDate(firstDayOfYear.getDate() + daysOffset);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  getWeekEnd(year, weekNumber) {
    const weekStart = this.getWeekStart(year, weekNumber);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  async buildEmployeeData(allEmployees, timesheetData, weekRange) {
    const employees = [];

    for (const employee of allEmployees) {
      const employeeTimesheets = timesheetData.filter(
        (entry) => entry.userId === employee.userId,
      );

      // สร้างข้อมูลรายวัน (7 วันในสัปดาห์)
      const dailyHours = [];
      let totalWeeklyHours = 0;
      let workingDays = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(weekRange.weekStart);
        currentDate.setDate(weekRange.weekStart.getDate() + dayOffset);

        const dayTimesheets = employeeTimesheets.filter(
          (entry) =>
            entry.workDate.toDateString() === currentDate.toDateString(),
        );

        const dayHours = dayTimesheets.reduce(
          (sum, entry) => sum + Number(entry.hours),
          0,
        );
        const hasData = dayTimesheets.length > 0;

        if (hasData) {
          totalWeeklyHours += dayHours;
          workingDays++;
        }

        // สร้าง entries สำหรับวันนี้
        const entries = dayTimesheets.map((entry) => ({
          id: entry.id,
          workType: entry.workType,
          projectName: entry.projectName || undefined,
          activity: this.getActivityFromDescription(entry.description),
          description: entry.description || "",
          startTime: entry.startTime || "",
          endTime: entry.endTime || "",
          hours: Number(entry.hours),
        }));

        dailyHours.push({
          date: currentDate,
          dayName: this.getDayName(currentDate),
          dayNumber: dayOffset,
          hours: dayHours,
          hasData,
          entries,
        });
      }

      employees.push({
        userId: employee.userId,
        employeeName: employee.employeeName,
        role: this.getRoleDisplayName(employee.role),
        dailyHours,
        totalWeeklyHours,
        averageDailyHours: workingDays > 0 ? totalWeeklyHours / workingDays : 0,
        workingDays,
        hasData: totalWeeklyHours > 0,
      });
    }

    return employees;
  }

  calculateWeeklySummary(employees, weekRange) {
    const totalEmployees = employees.length;
    const employeesWithData = employees.filter((emp) => emp.hasData).length;
    const employeesWithoutData = totalEmployees - employeesWithData;
    const totalHours = employees.reduce(
      (sum, emp) => sum + emp.totalWeeklyHours,
      0,
    );
    const averageHoursPerEmployee =
      totalEmployees > 0 ? totalHours / totalEmployees : 0;
    const averageHoursPerDay = averageHoursPerEmployee / 7;

    // หาวันที่ทำงานมากที่สุดและน้อยที่สุด
    const dayTotals = new Array(7).fill(0);
    employees.forEach((employee) => {
      employee.dailyHours.forEach((day, index) => {
        if (day.hasData) {
          dayTotals[index] += day.hours;
        }
      });
    });

    const dayNames = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    let maxHours = 0,
      minHours = Infinity;
    let mostProductiveDay = dayNames[0],
      leastProductiveDay = dayNames[0];

    dayTotals.forEach((hours, index) => {
      if (hours > maxHours) {
        maxHours = hours;
        mostProductiveDay = dayNames[index];
      }
      if (hours < minHours && hours > 0) {
        minHours = hours;
        leastProductiveDay = dayNames[index];
      }
    });

    return {
      totalEmployees,
      totalHours,
      averageHoursPerEmployee,
      averageHoursPerDay,
      employeesWithData,
      employeesWithoutData,
      mostProductiveDay: {
        dayName: mostProductiveDay,
        totalHours: maxHours,
      },
      leastProductiveDay: {
        dayName: leastProductiveDay,
        totalHours: minHours === Infinity ? 0 : minHours,
      },
    };
  }

  getDayName(date) {
    const dayNames = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    return dayNames[date.getDay()];
  }

  getRoleDisplayName(role) {
    const roleMap = {
      admin: "Administrator",
      manager: "PM",
      employee: "Employee",
      project_manager: "PM",
      project_coordinator: "Project Coordinator",
      vp_pm: "VP PM",
    };
    return roleMap[role || ""] || role || "Employee";
  }

  getActivityFromDescription(description) {
    if (!description) return "Other";

    const desc = description.toLowerCase();
    if (desc.includes("meeting") || desc.includes("ประชุม")) return "Meeting";
    if (desc.includes("document") || desc.includes("เอกสาร")) return "Document";
    if (desc.includes("presentation") || desc.includes("นำเสนอ"))
      return "Presentation";
    if (desc.includes("follow") || desc.includes("ติดตาม")) return "Follow Up";
    if (desc.includes("internal") || desc.includes("ภายใน"))
      return "Internal Work";

    return "Other Internal Work";
  }
}
