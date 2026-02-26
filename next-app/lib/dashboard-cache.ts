import redis from "@/lib/redis";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalUsers: number;
  totalExpenses: number;
  pendingApprovals: number;
  lastUpdated: string;
}

export class DashboardCache {
  private static readonly STATS_KEY = "dashboard:stats";
  private static readonly STATS_TTL = 300; // 5 minutes

  // Get dashboard stats from cache
  static async getStats(): Promise<DashboardStats | null> {
    const cached = await redis.get(this.STATS_KEY);

    if (!cached) return null;

    const stats: DashboardStats = JSON.parse(cached);

    // Check if cache is still fresh (within TTL)
    const now = new Date();
    const lastUpdated = new Date(stats.lastUpdated);
    const ageInSeconds = (now.getTime() - lastUpdated.getTime()) / 1000;

    if (ageInSeconds > this.STATS_TTL) {
      await redis.del(this.STATS_KEY);
      return null;
    }

    return stats;
  }

  // Set dashboard stats cache
  static async setStats(stats: DashboardStats): Promise<void> {
    const statsWithTimestamp = {
      ...stats,
      lastUpdated: new Date().toISOString(),
    };

    await redis.set(this.STATS_KEY, JSON.stringify(statsWithTimestamp), {
      EX: this.STATS_TTL,
    });
  }

  // Invalidate dashboard cache
  static async invalidateCache(): Promise<void> {
    await redis.del(this.STATS_KEY);
  }

  // Cache project activity feed
  static async getActivityFeed(
    projectId?: string,
    ttl: number = 600,
  ): Promise<any[] | null> {
    const key = `activity_feed:${projectId || "all"}`;
    const cached = await redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  // Set project activity feed cache
  static async setActivityFeed(
    activities: any[],
    projectId?: string,
    ttl: number = 600,
  ): Promise<void> {
    const key = `activity_feed:${projectId || "all"}`;
    await redis.set(key, JSON.stringify(activities), { EX: ttl });
  }

  // Cache user notifications
  static async getUserNotifications(
    userId: string,
    ttl: number = 300,
  ): Promise<any[] | null> {
    const key = `notifications:${userId}`;
    const cached = await redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  // Set user notifications cache
  static async setUserNotifications(
    userId: string,
    notifications: any[],
    ttl: number = 300,
  ): Promise<void> {
    const key = `notifications:${userId}`;
    await redis.set(key, JSON.stringify(notifications), { EX: ttl });
  }

  // Cache frequently accessed data
  static async cacheData(
    key: string,
    data: any,
    ttl: number = 300,
  ): Promise<void> {
    await redis.set(key, JSON.stringify(data), { EX: ttl });
  }

  // Get cached data
  static async getCachedData(key: string): Promise<any | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Bulk cache operations
  static async setMultiple(
    keys: string[],
    data: any[],
    ttl: number = 300,
  ): Promise<void> {
    const client = await redis.getClient();
    const pipeline = client.multi();

    keys.forEach((key, index) => {
      pipeline.set(key, JSON.stringify(data[index]), { EX: ttl });
    });

    await pipeline.exec();
  }

  // Cache warming - pre-populate frequently accessed data
  static async warmCache(): Promise<void> {
    console.log("Warming up cache...");

    try {
      // This would typically fetch and cache common data
      // For now, we'll just log the operation
      const cacheKeys = await redis.getClient().keys("*");
      console.log(`Current cache keys: ${cacheKeys.length}`);
    } catch (error) {
      console.error("Cache warming error:", error);
    }
  }

  // Get cache statistics
  static async getCacheStats(): Promise<any> {
    try {
      const client = await redis.getClient();
      const info = await client.info();

      const lines = info.split("\r\n");
      const stats: Record<string, string> = {};

      lines.forEach((line) => {
        if (line.includes(":")) {
          const [key, value] = line.split(":");
          stats[key] = value;
        }
      });

      return {
        connected: true,
        memory: stats.used_memory_human || "unknown",
        keys: stats.db0?.keys || "unknown",
        hits: stats.keyspace_hits || "0",
        misses: stats.keyspace_misses || "0",
        hit_rate:
          stats.keyspace_hits && stats.keyspace_misses
            ? (
                (parseInt(stats.keyspace_hits) /
                  (parseInt(stats.keyspace_hits) +
                    parseInt(stats.keyspace_misses))) *
                100
              ).toFixed(2) + "%"
            : "0%",
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }
}
