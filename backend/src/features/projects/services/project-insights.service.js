import { eq, gte, lte, desc, sql, and, count, sum, extract } from "drizzle-orm";
import { getDbClient } from "../../../shared/database.js";
import {
  timeEntries,
  projects,
  users,
} from "../../../shared/database/schema.js";

export class ProjectInsightsService {
  constructor() {
    this.db = getDbClient().db;
  }

  /**
   * Get comprehensive project insights based on timesheet data
   */
  async getProjectInsights(filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = this.buildWhereConditions(filters);

    // Get timesheet data with project information
    const timesheetData = await this.db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        workType: timeEntries.workType,
        hours: timeEntries.hours,
        userId: timeEntries.userId,
        userName: users.name,
        date: timeEntries.date,
      })
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(timeEntries.date));

    // Group data by project
    const projectGroups = this.groupTimesheetDataByProject(timesheetData);

    // Generate insights for each project
    const insights = [];
    for (const [projectId, data] of projectGroups.entries()) {
      const insight = await this.generateProjectInsight(projectId, data);
      insights.push(insight);
    }

    return insights;
  }

  /**
   * Get project structure analysis for sunburst visualization
   */
  async getProjectStructureAnalysis(year, month, filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = this.buildWhereConditions(filters);

    // Add year filter
    whereConditions.push(sql`EXTRACT(YEAR FROM ${timeEntries.date}) = ${year}`);

    if (month) {
      whereConditions.push(
        sql`EXTRACT(MONTH FROM ${timeEntries.date}) = ${parseInt(month)}`,
      );
    }

    const data = await this.db
      .select({
        workType: timeEntries.workType,
        projectId: projects.id,
        projectName: projects.name,
        userId: timeEntries.userId,
        userName: users.name,
        description: timeEntries.description,
        hours: timeEntries.hours,
        date: timeEntries.date,
      })
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .where(and(...whereConditions));

    // Build sunburst data structure
    const sunburstData = this.buildSunburstData(data);

    // Calculate summary metrics
    const totalHours = data.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0,
    );
    const projectHours = data
      .filter((entry) => entry.workType === "project")
      .reduce((sum, entry) => sum + Number(entry.hours), 0);
    const nonProjectHours = totalHours - projectHours;
    const projectCount = new Set(
      data.filter((entry) => entry.projectId).map((entry) => entry.projectId),
    ).size;

    return {
      year,
      month,
      data: sunburstData,
      totalHours,
      projectCount,
      nonProjectHours,
      projectHours,
    };
  }

  /**
   * Get timesheet analysis with various breakdowns
   */
  async getTimesheetAnalysis(filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = this.buildWhereConditions(filters);

    const data = await this.db
      .select({
        workType: timeEntries.workType,
        projectId: projects.id,
        projectName: projects.name,
        userId: timeEntries.userId,
        userName: users.name,
        hours: timeEntries.hours,
        date: timeEntries.date,
      })
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Work type breakdown
    const workTypeBreakdown = {
      project: data
        .filter((entry) => entry.workType === "project")
        .reduce((sum, entry) => sum + Number(entry.hours), 0),
      office: data
        .filter((entry) => entry.workType === "office")
        .reduce((sum, entry) => sum + Number(entry.hours), 0),
      other: data
        .filter((entry) => entry.workType === "other")
        .reduce((sum, entry) => sum + Number(entry.hours), 0),
    };

    // Project breakdown
    const projectMap = new Map();
    data.forEach((entry) => {
      if (entry.projectId && entry.workType === "project") {
        const current = projectMap.get(entry.projectId) || {
          name: entry.projectName || "Unknown",
          hours: 0,
        };
        current.hours += Number(entry.hours);
        projectMap.set(entry.projectId, current);
      }
    });

    const totalProjectHours = workTypeBreakdown.project;
    const projectBreakdown = Array.from(projectMap.entries()).map(
      ([id, data]) => ({
        projectId: id,
        projectName: data.name,
        hours: data.hours,
        percentage:
          totalProjectHours > 0 ? (data.hours / totalProjectHours) * 100 : 0,
      }),
    );

    // Staff breakdown
    const staffMap = new Map();
    data.forEach((entry) => {
      const current = staffMap.get(entry.userId) || {
        name: entry.userName || "Unknown",
        project: 0,
        office: 0,
        other: 0,
        total: 0,
      };
      const hours = Number(entry.hours);
      current[entry.workType] += hours;
      current.total += hours;
      staffMap.set(entry.userId, current);
    });

    const staffBreakdown = Array.from(staffMap.entries()).map(
      ([userId, data]) => ({
        userId,
        userName: data.name,
        hours: data.total,
        projectHours: data.project,
        officeHours: data.office,
        otherHours: data.other,
      }),
    );

    // Time distribution (hour of day analysis)
    const timeDistribution = new Array(24)
      .fill(0)
      .map((_, hour) => ({ hour, count: 0 }));
    // This would need start_time field for proper analysis, using placeholder logic
    data.forEach((entry) => {
      // Placeholder: distribute evenly across working hours (9-17)
      const randomHour = 9 + Math.floor(Math.random() * 9);
      timeDistribution[randomHour].count++;
    });

    return {
      workTypeBreakdown,
      projectBreakdown,
      staffBreakdown,
      timeDistribution,
    };
  }

  /**
   * Get summary insights across all projects
   */
  async getProjectInsightSummary(filters = {}) {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = this.buildWhereConditions(filters);

    const data = await this.db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        userId: timeEntries.userId,
        userName: users.name,
        workType: timeEntries.workType,
        hours: timeEntries.hours,
      })
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalHours = data.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0,
    );
    const projectMap = new Map();
    const userMap = new Map();

    data.forEach((entry) => {
      if (entry.projectId) {
        const current = projectMap.get(entry.projectId) || {
          name: entry.projectName || "Unknown",
          hours: 0,
        };
        current.hours += Number(entry.hours);
        projectMap.set(entry.projectId, current);
      }

      const userCurrent = userMap.get(entry.userId) || {
        name: entry.userName || "Unknown",
        hours: 0,
      };
      userCurrent.hours += Number(entry.hours);
      userMap.set(entry.userId, userCurrent);
    });

    const totalProjects = projectMap.size;
    const averageHoursPerProject =
      totalProjects > 0 ? totalHours / totalProjects : 0;

    // Find most/least active projects
    const projectEntries = Array.from(projectMap.entries());
    const mostActiveProject = projectEntries.reduce(
      (max, current) => (current[1].hours > max[1].hours ? current : max),
      ["", { name: "", hours: 0 }],
    );
    const leastActiveProject = projectEntries.reduce(
      (min, current) => (current[1].hours < min[1].hours ? current : min),
      ["", { name: "", hours: Infinity }],
    );

    // Find top contributor
    const topContributor = Array.from(userMap.entries()).reduce(
      (max, current) => (current[1].hours > max[1].hours ? current : max),
      ["", { name: "", hours: 0 }],
    );

    // Calculate overall efficiency (project hours / total hours)
    const projectHours = data
      .filter((entry) => entry.workType === "project")
      .reduce((sum, entry) => sum + Number(entry.hours), 0);
    const overallEfficiency =
      totalHours > 0 ? (projectHours / totalHours) * 100 : 0;

    return {
      totalProjects,
      totalHours,
      averageHoursPerProject,
      mostActiveProject: {
        projectId: mostActiveProject[0],
        projectName: mostActiveProject[1].name,
        totalHours: mostActiveProject[1].hours,
      },
      leastActiveProject: {
        projectId: leastActiveProject[0],
        projectName: leastActiveProject[1].name,
        totalHours:
          leastActiveProject[1].hours === Infinity
            ? 0
            : leastActiveProject[1].hours,
      },
      topContributor: {
        userId: topContributor[0],
        userName: topContributor[1].name,
        totalHours: topContributor[1].hours,
      },
      overallEfficiency,
    };
  }

  /**
   * Compare insights between two time periods
   */
  async compareInsights(period1, period2, filters = {}) {
    const [metrics1, metrics2] = await Promise.all([
      this.getProjectInsightSummary({ ...filters, ...period1 }),
      this.getProjectInsightSummary({ ...filters, ...period2 }),
    ]);

    return {
      period1: { ...period1, metrics: metrics1 },
      period2: { ...period2, metrics: metrics2 },
      changes: {
        totalHoursChange: metrics2.totalHours - metrics1.totalHours,
        efficiencyChange:
          metrics2.overallEfficiency - metrics1.overallEfficiency,
        projectCountChange: metrics2.totalProjects - metrics1.totalProjects,
      },
    };
  }

  buildWhereConditions(filters) {
    const conditions = [];

    if (filters.projectId) {
      conditions.push(eq(timeEntries.projectId, filters.projectId));
    }

    if (filters.userId) {
      conditions.push(eq(timeEntries.userId, filters.userId));
    }

    if (filters.startDate) {
      conditions.push(gte(timeEntries.date, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(timeEntries.date, new Date(filters.endDate)));
    }

    if (filters.workType) {
      conditions.push(eq(timeEntries.workType, filters.workType));
    }

    return conditions;
  }

  groupTimesheetDataByProject(data) {
    const projectGroups = new Map();

    data.forEach((entry) => {
      const projectId = entry.projectId || "non-project";
      if (!projectGroups.has(projectId)) {
        projectGroups.set(projectId, []);
      }
      projectGroups.get(projectId).push(entry);
    });

    return projectGroups;
  }

  async generateProjectInsight(projectId, data) {
    const totalHours = data.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0,
    );
    const projectHours = data
      .filter((entry) => entry.workType === "project")
      .reduce((sum, entry) => sum + Number(entry.hours), 0);
    const officeHours = data
      .filter((entry) => entry.workType === "office")
      .reduce((sum, entry) => sum + Number(entry.hours), 0);
    const otherHours = data
      .filter((entry) => entry.workType === "other")
      .reduce((sum, entry) => sum + Number(entry.hours), 0);

    const uniqueDays = new Set(data.map((entry) => entry.date.toDateString()))
      .size;
    const averageHoursPerDay = uniqueDays > 0 ? totalHours / uniqueDays : 0;

    // Work type distribution
    const workTypeDistribution = [
      {
        workType: "project",
        hours: projectHours,
        percentage: (projectHours / totalHours) * 100,
        color: "#3b82f6",
      },
      {
        workType: "office",
        hours: officeHours,
        percentage: (officeHours / totalHours) * 100,
        color: "#10b981",
      },
      {
        workType: "other",
        hours: otherHours,
        percentage: (otherHours / totalHours) * 100,
        color: "#f59e0b",
      },
    ];

    // Monthly trend (simplified)
    const monthlyTrend = this.calculateMonthlyTrend(data);

    // Top contributors
    const topContributors = this.calculateTopContributors(data);

    // Efficiency metrics
    const efficiency = this.calculateEfficiencyMetrics(data);

    return {
      projectId,
      projectName: data[0]?.projectName || "Non-Project Work",
      totalHours,
      projectHours,
      officeHours,
      otherHours,
      averageHoursPerDay,
      totalDaysWorked: uniqueDays,
      workTypeDistribution,
      monthlyTrend,
      topContributors,
      efficiency,
    };
  }

  buildSunburstData(data) {
    const root = { name: "ทั้งหมด", children: [] };

    // Group by work type first
    const workTypeGroups = {
      project: { name: "Project Work Type", children: [] },
      office: { name: "Non-Project", children: [] },
      other: { name: "Non-Project", children: [] },
    };

    data.forEach((entry) => {
      const workType = entry.workType;
      if (workType === "project" && entry.projectName) {
        workTypeGroups.project.children.push({
          name: entry.projectName,
          value: Number(entry.hours),
          children: entry.userName
            ? [
                {
                  name: entry.userName,
                  value: Number(entry.hours),
                },
              ]
            : undefined,
        });
      } else if (workType === "office") {
        const category = entry.description || "Other Internal Work";
        const existing = workTypeGroups.office.children.find(
          (child) => child.name === category,
        );
        if (existing) {
          existing.value = (existing.value || 0) + Number(entry.hours);
        } else {
          workTypeGroups.office.children.push({
            name: category,
            value: Number(entry.hours),
          });
        }
      } else if (workType === "other") {
        const category = entry.description || "Other Internal Work";
        const existing = workTypeGroups.other.children.find(
          (child) => child.name === category,
        );
        if (existing) {
          existing.value = (existing.value || 0) + Number(entry.hours);
        } else {
          workTypeGroups.other.children.push({
            name: category,
            value: Number(entry.hours),
          });
        }
      }
    });

    // Combine non-project work types
    const nonProjectChildren = [
      ...workTypeGroups.office.children,
      ...workTypeGroups.other.children,
    ];
    if (nonProjectChildren.length > 0) {
      root.children.push({
        name: "Non-Project",
        children: nonProjectChildren,
      });
    }

    if (workTypeGroups.project.children.length > 0) {
      root.children.push(workTypeGroups.project);
    }

    return root;
  }

  calculateMonthlyTrend(data) {
    const monthlyMap = new Map();

    data.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: String(date.getMonth() + 1).padStart(2, "0"),
          year: date.getFullYear(),
          totalHours: 0,
          projectHours: 0,
          officeHours: 0,
          otherHours: 0,
        });
      }

      const trend = monthlyMap.get(monthKey);
      const hours = Number(entry.hours);
      trend.totalHours += hours;

      if (entry.workType === "project") trend.projectHours += hours;
      else if (entry.workType === "office") trend.officeHours += hours;
      else if (entry.workType === "other") trend.otherHours += hours;
    });

    return Array.from(monthlyMap.values()).sort((a, b) =>
      `${a.year}-${a.month}`.localeCompare(`${b.year}-${b.month}`),
    );
  }

  calculateTopContributors(data) {
    const userMap = new Map();

    data.forEach((entry) => {
      const userId = entry.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName: entry.userName || "Unknown",
          totalHours: 0,
          projectHours: 0,
          efficiency: 0,
          contributionPercentage: 0,
        });
      }

      const contributor = userMap.get(userId);
      const hours = Number(entry.hours);
      contributor.totalHours += hours;

      if (entry.workType === "project") {
        contributor.projectHours += hours;
      }
    });

    const totalHours = Array.from(userMap.values()).reduce(
      (sum, user) => sum + user.totalHours,
      0,
    );

    userMap.forEach((contributor) => {
      contributor.efficiency =
        contributor.totalHours > 0
          ? (contributor.projectHours / contributor.totalHours) * 100
          : 0;
      contributor.contributionPercentage =
        totalHours > 0 ? (contributor.totalHours / totalHours) * 100 : 0;
    });

    return Array.from(userMap.values())
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 10);
  }

  calculateEfficiencyMetrics(data) {
    const totalHours = data.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0,
    );
    const projectHours = data
      .filter((entry) => entry.workType === "project")
      .reduce((sum, entry) => sum + Number(entry.hours), 0);

    const overallEfficiency =
      totalHours > 0 ? (projectHours / totalHours) * 100 : 0;
    const projectEfficiency = 100; // Placeholder: would need more complex calculation
    const timeUtilization = overallEfficiency; // Simplified

    // Determine trend (simplified - would need historical data)
    const trendDirection = "stable";

    return {
      overallEfficiency,
      projectEfficiency,
      timeUtilization,
      trendDirection,
    };
  }
}
