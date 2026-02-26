import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

// GET /api/redis - Retrieve data from Redis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 },
      );
    }

    const value = await redis.get(key);

    if (value === null) {
      return NextResponse.json(
        { key, value: null, found: false },
        { status: 200 },
      );
    }

    // Try to parse JSON, fallback to string
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }

    return NextResponse.json(
      {
        key,
        value: parsedValue,
        found: true,
        type: typeof parsedValue,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Redis GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve data from Redis",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// POST /api/redis - Store data in Redis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        {
          error: "Key and value are required",
        },
        { status: 400 },
      );
    }

    // Convert value to JSON string if it's an object
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);

    let result;
    if (ttl && typeof ttl === "number" && ttl > 0) {
      // Set with TTL (Time To Live) in seconds
      result = await redis.set(key, stringValue, { EX: ttl });
    } else {
      // Set without TTL
      result = await redis.set(key, stringValue);
    }

    return NextResponse.json(
      {
        success: true,
        key,
        value: typeof value === "string" ? value : JSON.parse(stringValue),
        ttl: ttl || null,
        result: "OK",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Redis POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to store data in Redis",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE /api/redis - Delete data from Redis
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 },
      );
    }

    const exists = await redis.exists(key);

    if (exists === 0) {
      return NextResponse.json(
        {
          key,
          deleted: false,
          message: "Key does not exist",
        },
        { status: 404 },
      );
    }

    const result = await redis.del(key);

    return NextResponse.json(
      {
        key,
        deleted: true,
        result: `${result} key(s) deleted`,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Redis DELETE error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete data from Redis",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT /api/redis - Update data in Redis (same as POST but requires existing key)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        {
          error: "Key and value are required",
        },
        { status: 400 },
      );
    }

    const exists = await redis.exists(key);

    if (exists === 0) {
      return NextResponse.json(
        {
          key,
          updated: false,
          message: "Key does not exist",
        },
        { status: 404 },
      );
    }

    // Convert value to JSON string if it's an object
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);

    let result;
    if (ttl && typeof ttl === "number" && ttl > 0) {
      // Update with TTL
      result = await redis.set(key, stringValue, { EX: ttl });
    } else {
      // Update without TTL
      result = await redis.set(key, stringValue);
    }

    return NextResponse.json(
      {
        success: true,
        key,
        value: typeof value === "string" ? value : JSON.parse(stringValue),
        ttl: ttl || null,
        updated: true,
        result: "OK",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Redis PUT error:", error);
    return NextResponse.json(
      {
        error: "Failed to update data in Redis",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
