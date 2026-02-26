import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function POST() {
  try {
    const client = await redis.getClient();

    // Get all keys
    const keys = await client.keys("*");
    let cleanedCount = 0;

    // Check each key's TTL and delete expired ones
    for (const key of keys) {
      try {
        const ttl = await client.ttl(key);

        // Delete keys that are expired (TTL = -2) or have no TTL (-1) but are old
        if (ttl === -2) {
          await client.del(key);
          cleanedCount++;
        } else if (ttl === -1) {
          // For keys with no TTL, check if they're older than 24 hours
          // This is a simple heuristic - in production you might want to store creation time
          const keyAge = Date.now() - parseInt(key.split("_").pop() || "0");
          if (keyAge > 24 * 60 * 60 * 1000) {
            // 24 hours in milliseconds
            await client.del(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        console.error(`Error cleaning key ${key}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Redis cleanup completed",
      cleaned_keys: cleanedCount,
      total_keys_before: keys.length,
      remaining_keys: keys.length - cleanedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Redis cleanup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
