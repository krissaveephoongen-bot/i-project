import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET() {
  try {
    const client = await redis.getClient();

    // Get all keys with pattern matching
    const keys = await client.keys("*");

    // Get detailed information for each key
    const keyDetails = [];

    for (const key of keys) {
      try {
        const type = await client.type(key);
        const ttl = await client.ttl(key);
        const size = (await client.memoryUsage)
          ? await client.memoryUsage(key)
          : 0;

        keyDetails.push({
          key,
          type,
          ttl: ttl === -1 ? "No TTL" : `${ttl}s`,
          size: `${size} bytes`,
          created_at: new Date().toISOString(),
          accessed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error getting details for key ${key}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      keys: keys,
      details: keyDetails,
      total: keys.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Redis keys error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        keys: [],
        total: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const client = await redis.getClient();

    // Get all keys
    const keys = await client.keys("*");

    // Delete all keys
    let deletedCount = 0;
    if (keys.length > 0) {
      deletedCount = await client.del(keys);
    }

    return NextResponse.json({
      success: true,
      deleted_keys: deletedCount,
      message: `Deleted ${deletedCount} keys`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Redis flush error:", error);

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
