/**
 * useTimer Hook Test Suite
 * Tests for timer and stopwatch functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTimer, useCountdownTimer, useStopwatch, useIntervalTimer } from "../useTimer";

// Mock timers
vi.useFakeTimers();

describe("useTimer", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it("should initialize with correct state", () => {
    const { result } = renderHook(() => useTimer(0));
    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.formattedTime).toBe("00:00:00");
  });

  it("should initialize with custom seconds", () => {
    const { result } = renderHook(() => useTimer(300));
    expect(result.current.elapsedSeconds).toBe(300);
    expect(result.current.formattedTime).toBe("00:05:00");
  });

  it("should start timer", async () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.elapsedSeconds).toBe(1);
    });
  });

  it("should pause timer", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);
    const paused = result.current.elapsedSeconds;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedSeconds).toBe(paused);
  });

  it("should resume timer", async () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.pause();
    });

    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.elapsedSeconds).toBe(2);
    });
  });

  it("should reset timer", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.elapsedSeconds).toBe(5);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("should set specific time", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setTime(120);
    });

    expect(result.current.elapsedSeconds).toBe(120);
    expect(result.current.formattedTime).toBe("00:02:00");
  });

  it("should add seconds", () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.addSeconds(30);
    });

    expect(result.current.elapsedSeconds).toBe(90);
  });

  it("should format time correctly", () => {
    const { result } = renderHook(() => useTimer(3661)); // 1h 1m 1s

    expect(result.current.formattedTime).toBe("01:01:01");
  });

  it("should not allow negative time when setting", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setTime(-100);
    });

    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("should track elapsed time accurately", async () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000); // 5 seconds
    });

    await waitFor(() => {
      expect(result.current.elapsedSeconds).toBe(5);
    });
  });
});

describe("useCountdownTimer", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it("should initialize countdown", () => {
    const { result } = renderHook(() => useCountdownTimer(300));
    expect(result.current.remaining).toBe(300);
    expect(result.current.formattedTime).toBe("00:05:00");
  });

  it("should countdown correctly", async () => {
    const { result } = renderHook(() => useCountdownTimer(10));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.remaining).toBe(7);
    });
  });

  it("should stop at zero", async () => {
    const { result } = renderHook(() => useCountdownTimer(2));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.remaining).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });
  });

  it("should not go below zero", async () => {
    const { result } = renderHook(() => useCountdownTimer(1));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.remaining).toBe(0);
    });
  });

  it("should allow pause and resume", () => {
    const { result } = renderHook(() => useCountdownTimer(100));

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it("should reset countdown", () => {
    const { result } = renderHook(() => useCountdownTimer(60));

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.remaining).toBeLessThan(60);

    act(() => {
      result.current.reset();
    });

    expect(result.current.remaining).toBe(60);
    expect(result.current.isRunning).toBe(false);
  });
});

describe("useStopwatch", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it("should initialize stopwatch", () => {
    const { result } = renderHook(() => useStopwatch());
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.laps.length).toBe(0);
  });

  it("should track elapsed time", async () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.elapsedSeconds).toBe(3);
    });
  });

  it("should record lap times", async () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.recordLap();
    });

    expect(result.current.laps.length).toBe(1);
    expect(result.current.laps[0]).toBe(2);
  });

  it("should record multiple laps", async () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
      result.current.recordLap();

      vi.advanceTimersByTime(3000);
      result.current.recordLap();
    });

    expect(result.current.laps.length).toBe(2);
    expect(result.current.laps[0]).toBe(2);
    expect(result.current.laps[1]).toBe(3);
  });

  it("should clear laps", () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(1000);
      result.current.recordLap();
    });

    expect(result.current.laps.length).toBe(1);

    act(() => {
      result.current.clearLaps();
    });

    expect(result.current.laps.length).toBe(0);
  });

  it("should stop and reset", () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000);
      result.current.recordLap();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.laps.length).toBe(0);
  });
});

describe("useIntervalTimer", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it("should initialize interval timer", () => {
    const { result } = renderHook(() => useIntervalTimer(300, 60)); // 5min work, 1min break
    expect(result.current.phase).toBe("work");
    expect(result.current.totalElapsed).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it("should start work phase", async () => {
    const { result } = renderHook(() => useIntervalTimer(10, 5));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.phase).toBe("work");
  });

  it("should switch to break phase", async () => {
    const { result } = renderHook(() => useIntervalTimer(5, 3)); // 5s work, 3s break

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000); // Advance past work time
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("break");
    });
  });

  it("should switch back to work phase", async () => {
    const { result } = renderHook(() => useIntervalTimer(3, 2)); // 3s work, 2s break

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000); // Work + break
    });

    await waitFor(() => {
      expect(result.current.phase).toBe("work");
    });
  });

  it("should track progress percentage", () => {
    const { result } = renderHook(() => useIntervalTimer(100, 50));

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(50000); // 50s into 100s work
    });

    // Progress should be around 50%
    expect(result.current.phaseProgress).toBeGreaterThan(40);
    expect(result.current.phaseProgress).toBeLessThan(60);
  });

  it("should reset interval timer", () => {
    const { result } = renderHook(() => useIntervalTimer(60, 30));

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(10000);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.totalElapsed).toBe(0);
    expect(result.current.phase).toBe("work");
    expect(result.current.isRunning).toBe(false);
  });

  it("should handle pause and resume", () => {
    const { result } = renderHook(() => useIntervalTimer(60, 30));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(true);
  });
});
