import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET() {
  try {
    const client = await redis.getClient();
    const testResults = [];

    // Test 1: Basic SET/GET
    const testKey = `test_${Date.now()}`;
    const testValue = "Redis is working!";

    const setStart = Date.now();
    await client.set(testKey, testValue, { EX: 10 });
    const setTime = Date.now() - setStart;

    const getStart = Date.now();
    const retrievedValue = await client.get(testKey);
    const getTime = Date.now() - getStart;

    testResults.push({
      test: "SET/GET Operation",
      status: retrievedValue === testValue ? "PASS" : "FAIL",
      details: {
        set_time_ms: setTime,
        get_time_ms: getTime,
        value_match: retrievedValue === testValue,
      },
    });

    // Test 2: INCR operation
    const incrStart = Date.now();
    await client.incr("test_counter");
    const incrValue = await client.get("test_counter");
    const incrTime = Date.now() - incrStart;

    testResults.push({
      test: "INCR Operation",
      status: "PASS",
      details: {
        time_ms: incrTime,
        counter_value: incrValue,
      },
    });

    // Test 3: EXISTS operation
    const existsStart = Date.now();
    const exists = await client.exists(testKey);
    const existsTime = Date.now() - existsStart;

    testResults.push({
      test: "EXISTS Operation",
      status: exists ? "PASS" : "FAIL",
      details: {
        time_ms: existsTime,
        key_exists: exists,
      },
    });

    // Test 4: TTL operation
    const ttlStart = Date.now();
    const ttl = await client.ttl(testKey);
    const ttlTime = Date.now() - ttlStart;

    testResults.push({
      test: "TTL Operation",
      status: ttl > 0 ? "PASS" : "FAIL",
      details: {
        time_ms: ttlTime,
        ttl_seconds: ttl,
      },
    });

    // Test 5: DEL operation
    const delStart = Date.now();
    const deleted = await client.del(testKey);
    const delTime = Date.now() - delStart;

    testResults.push({
      test: "DEL Operation",
      status: deleted > 0 ? "PASS" : "FAIL",
      details: {
        time_ms: delTime,
        keys_deleted: deleted,
      },
    });

    // Test 6: Pipeline operation
    const pipeStart = Date.now();
    const pipeline = client.multi();
    pipeline.set("pipe_test1", "value1");
    pipeline.set("pipe_test2", "value2");
    pipeline.incr("pipe_counter");
    const pipeResults = await pipeline.exec();
    const pipeTime = Date.now() - pipeStart;

    testResults.push({
      test: "Pipeline Operation",
      status: pipeResults ? "PASS" : "FAIL",
      details: {
        time_ms: pipeTime,
        operations: pipeResults?.length || 0,
      },
    });

    // Cleanup test data
    await client.del("test_counter", "pipe_test1", "pipe_test2");

    // Calculate overall performance
    const totalTime = testResults.reduce((sum, test) => {
      const time = test.details.time_ms || test.details.set_time_ms || 0;
      return sum + time;
    }, 0);

    const avgTime = totalTime / testResults.length;
    const passedTests = testResults.filter(
      (test) => test.status === "PASS",
    ).length;

    return NextResponse.json({
      success: true,
      status: passedTests === testResults.length ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      results: testResults,
      summary: {
        total_tests: testResults.length,
        passed_tests: passedTests,
        failed_tests: testResults.length - passedTests,
        total_time_ms: totalTime,
        avg_time_ms: avgTime.toFixed(2),
      },
      performance: {
        avg_response_time_ms: avgTime.toFixed(2),
        fastest_test: Math.min(
          ...testResults.map(
            (t) => t.details.time_ms || t.details.set_time_ms || 0,
          ),
        ),
        slowest_test: Math.max(
          ...testResults.map(
            (t) => t.details.time_ms || t.details.set_time_ms || 0,
          ),
        ),
      },
    });
  } catch (error: any) {
    console.error("Redis test error:", error);

    return NextResponse.json(
      {
        success: false,
        status: "UNHEALTHY",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
