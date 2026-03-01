import {
  eq,
  gte,
  lte,
  desc,
  sql,
  and,
  count,
  sum,
  extract,
  inArray,
} from "drizzle-orm";
import { getDbClient } from "../../../shared/database.js";
import {
  timeEntries,
  projects,
  users,
} from "../../../shared/database/schema.js";

// Performance-optimized service for project insights
class ProjectInsightsService {
  // Cache for frequently accessed data
  static cache = new Map();
  static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  static setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  static async getProjectInsights(filters = {}) {
    const cacheKey = `project-insights-${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const { db } = getDbClient();
    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      // Optimized query with proper indexing
      let query = db
        .select({
          projectId: projects.id,
          projectName: projects.name,
          totalHours: sql < number > `SUM(${timeEntries.hours})`,
          totalEntries: count(timeEntries.id),
          averageHoursPerEntry: sql < number > `AVG(${timeEntries.hours})`,
          projectStatus: projects.status,
          projectPriority: projects.priority,
          managerId: projects.managerId,
          clientId: projects.clientId,
          startDate: projects.startDate,
          endDate: projects.endDate,
          budget: projects.budget,
          spent: projects.spent,
          hourlyRate: projects.hourlyRate,
          createdAt: projects.createdAt,
        })
        .from(timeEntries)
        .innerJoin(projects, eq(timeEntries.projectId, projects.id))
        .where(
          and(
            filters.startDate
              ? gte(timeEntries.date, filters.startDate)
              : undefined,
            filters.endDate
              ? lte(timeEntries.date, filters.endDate)
              : undefined,
            filters.projectId
              ? eq(timeEntries.projectId, filters.projectId)
              : undefined,
            filters.status ? eq(projects.status, filters.status) : undefined,
          ),
        )
        .groupBy(
          projects.id,
          projects.name,
          projects.status,
          projects.priority,
          projects.managerId,
          projects.clientId,
          projects.startDate,
          projects.endDate,
          projects.budget,
          projects.spent,
          projects.hourlyRate,
          projects.createdAt,
        )
        .orderBy(desc(sql`SUM(${timeEntries.hours})`));

      const results = await query;

      // Transform data with optimized processing
      const insights = results.map((row) => ({
        projectId: row.projectId,
        projectName: row.projectName,
        totalHours: Number(row.totalHours) || 0,
        totalEntries: Number(row.totalEntries) || 0,
        averageHoursPerEntry: Number(row.averageHoursPerEntry) || 0,
        projectStatus: row.projectStatus,
        projectPriority: row.projectPriority,
        managerId: row.managerId,
        clientId: row.clientId,
        startDate: row.startDate,
        endDate: row.endDate,
        budget: row.budget ? Number(row.budget) : null,
        spent: row.spent ? Number(row.spent) : 0,
        hourlyRate: row.hourlyRate ? Number(row.hourlyRate) : 0,
        createdAt: row.createdAt,
        efficiency:
          row.budget && row.spent
            ? (Number(row.spent) / Number(row.budget)) * 100
            : 0,
      }));

      this.setCachedData(cacheKey, insights);
      return insights;
    } catch (error) {
      console.error("Error fetching project insights:", error);
      throw error;
    }
  }

  static async getTopContributors(limit = 10, filters = {}) {
    const cacheKey = `top-contributors-${limit}-${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const { db } = getDbClient();
    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      // Optimized query with proper indexing
      const results = await db
        .select({
          userId: users.id,
          userName: users.name,
          userRole: users.role,
          userDepartment: users.department,
          totalHours: sql < number > `SUM(${timeEntries.hours})`,
          totalProjects:
            sql < number > `COUNT(DISTINCT ${timeEntries.projectId})`,
          totalEntries: count(timeEntries.id),
          averageHoursPerEntry: sql < number > `AVG(${timeEntries.hours})`,
          projectTypes:
            sql < string > `array_agg(DISTINCT ${timeEntries.workType})`,
        })
        .from(timeEntries)
        .innerJoin(users, eq(timeEntries.userId, users.id))
        .where(
          and(
            filters.startDate
              ? gte(timeEntries.date, filters.startDate)
              : undefined,
            filters.endDate
              ? lte(timeEntries.date, filters.endDate)
              : undefined,
            filters.workType
              ? eq(timeEntries.workType, filters.workType)
              : undefined,
          ),
        )
        .groupBy(users.id, users.name, users.role, users.department)
        .orderBy(desc(sql`SUM(${timeEntries.hours})`))
        .limit(limit);

      const contributors = results.map((row) => ({
        userId: row.userId,
        userName: row.userName,
        userRole: row.userRole,
        userDepartment: row.userDepartment,
        totalHours: Number(row.totalHours) || 0,
        totalProjects: Number(row.totalProjects) || 0,
        totalEntries: Number(row.totalEntries) || 0,
        averageHoursPerEntry: Number(row.averageHoursPerEntry) || 0,
        projectTypes: row.projectTypes || [],
      }));

      this.setCachedData(cacheKey, contributors);
      return contributors;
    } catch (error) {
      console.error("Error fetching top contributors:", error);
      throw error;
    }
  }

  static async getWorkTypeDistribution(filters = {}) {
    const cacheKey = `work-type-distribution-${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const { db } = getDbClient();
    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      const results = await db
        .select({
          workType: timeEntries.workType,
          totalHours: sql < number > `SUM(${timeEntries.hours})`,
          totalEntries: count(timeEntries.id),
          uniqueProjects:
            sql < number > `COUNT(DISTINCT ${timeEntries.projectId})`,
          uniqueUsers: sql < number > `COUNT(DISTINCT ${timeEntries.userId})`,
        })
        .from(timeEntries)
        .where(
          and(
            filters.startDate
              ? gte(timeEntries.date, filters.startDate)
              : undefined,
            filters.endDate
              ? lte(timeEntries.date, filters.endDate)
              : undefined,
            filters.projectId
              ? eq(timeEntries.projectId, filters.projectId)
              : undefined,
          ),
        )
        .groupBy(timeEntries.workType)
        .orderBy(desc(sql`SUM(${timeEntries.hours})`));

      const distribution = results.map((row) => ({
        workType: row.workType,
        totalHours: Number(row.totalHours) || 0,
        totalEntries: Number(row.totalEntries) || 0,
        uniqueProjects: Number(row.uniqueProjects) || 0,
        uniqueUsers: Number(row.uniqueUsers) || 0,
        percentage: 0, // Will be calculated after total is known
      }));

      // Calculate percentages
      const totalHours = distribution.reduce(
        (sum, item) => sum + item.totalHours,
        0,
      );
      distribution.forEach((item) => {
        item.percentage =
          totalHours > 0 ? (item.totalHours / totalHours) * 100 : 0;
      });

      this.setCachedData(cacheKey, distribution);
      return distribution;
    } catch (error) {
      console.error("Error fetching work type distribution:", error);
      throw error;
    }
  }

  static async getMonthlyTrends(year, filters = {}) {
    const cacheKey = `monthly-trends-${year}-${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const { db } = getDbClient();
    if (!db) {
      throw new Error("Database connection not available");
    }

    try {
      const results = await db
        .select({
          month: extract({ from: timeEntries.date, unit: "month" }),
          year: extract({ from: timeEntries.date, unit: "year" }),
          totalHours: sql < number > `SUM(${timeEntries.hours})`,
          totalEntries: count(timeEntries.id),
          uniqueProjects:
            sql < number > `COUNT(DISTINCT ${timeEntries.projectId})`,
          uniqueUsers: sql < number > `COUNT(DISTINCT ${timeEntries.userId})`,
        })
        .from(timeEntries)
        .where(
          and(
            eq(extract({ from: timeEntries.date, unit: "year" }), year),
            filters.projectId
              ? eq(timeEntries.projectId, filters.projectId)
              : undefined,
            filters.workType
              ? eq(timeEntries.workType, filters.workType)
              : undefined,
          ),
        )
        .groupBy(
          extract({ from: timeEntries.date, unit: "month" }),
          extract({ from: timeEntries.date, unit: "year" }),
        )
        .orderBy(
          extract({ from: timeEntries.date, unit: "year" }),
          extract({ from: timeEntries.date, unit: "month" }),
        );

      const trends = results.map((row) => ({
        month: Number(row.month),
        year: Number(row.year),
        totalHours: Number(row.totalHours) || 0,
        totalEntries: Number(row.totalEntries) || 0,
        uniqueProjects: Number(row.uniqueProjects) || 0,
        uniqueUsers: Number(row.uniqueUsers) || 0,
      }));

      this.setCachedData(cacheKey, trends);
      return trends;
    } catch (error) {
      console.error("Error fetching monthly trends:", error);
      throw error;
    }
  }

  // Clear cache method for admin use
  static clearCache() {
    this.cache.clear();
  }
}

export default ProjectInsightsService;
