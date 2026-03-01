import { eq, gte, lte, desc, sql, and, count, sum, extract } from "drizzle-orm";
import { getDbClient } from "../../../shared/database.js";
import {
  timeEntries,
  projects,
  users,
} from "../../../shared/database/schema.js";

export class ExecutiveReportService {
  constructor() {
    this.db = getDbClient().db;
  }

  /**
   * ดึงข้อมูลรายงานเชิงบริหาร
   */
  async getExecutiveReport(filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = this.buildWhereConditions(filters);

    // ดึงข้อมูล timesheet พร้อมข้อมูลผู้ใช้และโปรเจค
    const data = await this.db
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
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(timeEntries.date));

    // แปลงข้อมูลให้ตรงกับรูปแบบที่ต้องการ
    const reportData = data.map((entry) => ({
      id: entry.id,
      recorderName: entry.userName || "ไม่ระบุ",
      role: this.getRoleDisplayName(entry.userRole),
      workDate: entry.workDate,
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      workType: entry.workType,
      projectName: entry.projectName || undefined,
      activity: this.getActivityFromDescription(entry.description),
      description: entry.description || "",
      hours: Number(entry.hours),
      userId: entry.userId,
      projectId: entry.projectId || undefined,
    }));

    // คำนวณสรุป
    const summary = this.calculateSummary(reportData);

    return {
      summary,
      data: reportData,
      filters: {
        year: filters.year,
        month: filters.month,
        userId: filters.userId,
        projectId: filters.projectId,
        workType: filters.workType,
      },
    };
  }

  /**
   * ดึงข้อมูลสรุปรายเดือน
   */
  async getMonthlyReport(year) {
    if (!this.db) throw new Error("Database not configured");

    const monthlyData = await this.db
      .select({
        month: extract("month", timeEntries.date).as("month"),
        totalHours: sum(timeEntries.hours).mapWith(Number),
        totalEmployees: count(sql`DISTINCT ${timeEntries.userId}`).mapWith(
          Number,
        ),
        totalProjects: count(sql`DISTINCT ${timeEntries.projectId}`).mapWith(
          Number,
        ),
      })
      .from(timeEntries)
      .where(eq(extract("year", timeEntries.date), year))
      .groupBy(extract("month", timeEntries.date))
      .orderBy(extract("month", timeEntries.date));

    return monthlyData.map((data) => ({
      month: data.month,
      monthName: this.getMonthName(data.month),
      totalHours: data.totalHours || 0,
      totalEmployees: data.totalEmployees || 0,
      totalProjects: data.totalProjects || 0,
      averageHoursPerPerson:
        data.totalEmployees > 0
          ? (data.totalHours || 0) / data.totalEmployees
          : 0,
    }));
  }

  /**
   * ดึงข้อมูลสรุปตามโปรเจค
   */
  async getProjectReportSummary(filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = this.buildWhereConditions(filters);

    const projectData = await this.db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        totalHours: sum(timeEntries.hours).mapWith(Number),
        totalEmployees: count(sql`DISTINCT ${timeEntries.userId}`).mapWith(
          Number,
        ),
      })
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .where(and(...whereConditions, sql`${timeEntries.projectId} IS NOT NULL`))
      .groupBy(projects.id, projects.name)
      .orderBy(desc(sum(timeEntries.hours)));

    return projectData.map((data) => ({
      projectId: data.projectId || "",
      projectName: data.projectName || "ไม่ระบุโปรเจค",
      totalHours: data.totalHours || 0,
      totalEmployees: data.totalEmployees || 0,
      averageHoursPerEmployee:
        data.totalEmployees > 0
          ? (data.totalHours || 0) / data.totalEmployees
          : 0,
      completionRate: 0, // คำนวณจากข้อมูลโปรเจคต่อไป
    }));
  }

  /**
   * ดึงข้อมูลสรุปตามพนักงาน
   */
  async getEmployeeReportSummary(filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = this.buildWhereConditions(filters);

    const employeeData = await this.db
      .select({
        userId: users.id,
        employeeName: users.name,
        userRole: users.role,
        totalHours: sum(timeEntries.hours).mapWith(Number),
        projectHours: sum(
          sql`CASE WHEN ${timeEntries.workType} = 'project' THEN ${timeEntries.hours} ELSE 0 END`,
        ).mapWith(Number),
        nonProjectHours: sum(
          sql`CASE WHEN ${timeEntries.workType} != 'project' THEN ${timeEntries.hours} ELSE 0 END`,
        ).mapWith(Number),
        projectsWorked: count(sql`DISTINCT ${timeEntries.projectId}`).mapWith(
          Number,
        ),
      })
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(users.id, users.name, users.role)
      .orderBy(desc(sum(timeEntries.hours)));

    return employeeData.map((data) => ({
      userId: data.userId || "",
      employeeName: data.employeeName || "ไม่ระบุ",
      role: this.getRoleDisplayName(data.userRole),
      totalHours: data.totalHours || 0,
      projectHours: data.projectHours || 0,
      nonProjectHours: data.nonProjectHours || 0,
      efficiency:
        data.totalHours > 0
          ? ((data.projectHours || 0) / data.totalHours) * 100
          : 0,
      projectsWorked: data.projectsWorked || 0,
    }));
  }

  /**
   * ลบข้อมูล timesheet แบบหลายรายการ
   */
  async batchDelete(request) {
    if (!this.db) throw new Error("Database not configured");

    try {
      const deletedIds = [];
      const failedIds = [];

      for (const id of request.ids) {
        try {
          const result = await this.db
            .delete(timeEntries)
            .where(eq(timeEntries.id, id))
            .returning();

          if (result.length > 0) {
            deletedIds.push(id);
          } else {
            failedIds.push(id);
          }
        } catch (error) {
          failedIds.push(id);
        }
      }

      return {
        success: failedIds.length === 0,
        deletedCount: deletedIds.length,
        failedIds,
        message: `ลบสำเร็จ ${deletedIds.length} รายการ${failedIds.length > 0 ? `, ล้มเหลว ${failedIds.length} รายการ` : ""}`,
      };
    } catch (error) {
      return {
        success: false,
        deletedCount: 0,
        failedIds: request.ids,
        message: `การลบล้มเหลว: ${error.message}`,
      };
    }
  }

  /**
   * ส่งออกข้อมูลเป็น Excel (เตรียมข้อมูลสำหรับ frontend)
   */
  async prepareExportData(filters = {}) {
    const report = await this.getExecutiveReport(filters);

    const headers = [
      "ID",
      "ชื่อผู้บันทึก",
      "ตำแหน่ง",
      "วันที่ทำงาน",
      "เวลาเริ่ม",
      "เวลาสิ้นสุด",
      "ประเภทงาน",
      "ชื่อโปรเจค",
      "กิจกรรม",
      "รายละเอียด",
      "ชั่วโมง",
    ];

    const data = report.data.map((item) => [
      item.id,
      item.recorderName,
      item.role,
      item.workDate.toISOString().split("T")[0],
      item.startTime,
      item.endTime,
      item.workType === "project" ? "Project" : "Non Project",
      item.projectName || "-",
      item.activity,
      item.description,
      item.hours.toString(),
    ]);

    return {
      fileName: `รายงานเชิงบริหาร_${filters.year}${filters.month ? `_${filters.month.toString().padStart(2, "0")}` : ""}_${new Date().toISOString().split("T")[0]}.xlsx`,
      headers,
      data,
      filters: report.filters,
      summary: report.summary,
    };
  }

  buildWhereConditions(filters) {
    const conditions = [];

    // กรองตามปี
    conditions.push(eq(extract("year", timeEntries.date), filters.year));

    // กรองตามเดือน (ถ้าระบุ)
    if (filters.month) {
      conditions.push(eq(extract("month", timeEntries.date), filters.month));
    }

    // กรองตามผู้ใช้
    if (filters.userId) {
      conditions.push(eq(timeEntries.userId, filters.userId));
    }

    // กรองตามโปรเจค
    if (filters.projectId) {
      conditions.push(eq(timeEntries.projectId, filters.projectId));
    }

    // กรองตามประเภทงาน
    if (filters.workType) {
      conditions.push(eq(timeEntries.workType, filters.workType));
    }

    // กรองตามช่วงวันที่ (ถ้าระบุ)
    if (filters.startDate) {
      conditions.push(gte(timeEntries.date, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(timeEntries.date, new Date(filters.endDate)));
    }

    return conditions;
  }

  calculateSummary(data) {
    const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
    const totalEmployees = new Set(data.map((item) => item.userId)).size;
    const totalProjects = new Set(
      data.filter((item) => item.projectId).map((item) => item.projectId),
    ).size;
    const projectHours = data
      .filter((item) => item.workType === "project")
      .reduce((sum, item) => sum + item.hours, 0);
    const nonProjectHours = totalHours - projectHours;

    return {
      totalHours,
      totalEmployees,
      totalProjects,
      averageHoursPerPerson:
        totalEmployees > 0 ? totalHours / totalEmployees : 0,
      projectHours,
      nonProjectHours,
      efficiency: totalHours > 0 ? (projectHours / totalHours) * 100 : 0,
    };
  }

  getRoleDisplayName(role) {
    const roleMap = {
      admin: "Admin",
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

  getMonthName(month) {
    const months = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    return months[month - 1] || "ไม่ระบุ";
  }
}
