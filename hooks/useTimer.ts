/**
 * useTimer Hook
 * Custom React hook for managing timer/stopwatch functionality
 */

import { useState, useCallback, useEffect, useRef } from "react";

export interface TimerState {
  isRunning: boolean;
  elapsedSeconds: number;
  totalSeconds: number;
}

export interface UseTimerReturn {
  isRunning: boolean;
  elapsedSeconds: number;
  formattedTime: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
  addSeconds: (seconds: number) => void;
}

/**
 * Custom hook for managing timer state and controls
 */
export function useTimer(initialSeconds: number = 0): UseTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, "0"));
    parts.push(minutes.toString().padStart(2, "0"));
    parts.push(secs.toString().padStart(2, "0"));

    return parts.join(":");
  }, []);

  // Start timer
  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Resume timer
  const resume = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  // Stop timer and reset
  const stop = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
  }, []);

  // Reset timer without stopping
  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
  }, []);

  // Set timer to specific time
  const setTime = useCallback((seconds: number) => {
    setElapsedSeconds(Math.max(0, seconds));
  }, []);

  // Add seconds to timer
  const addSeconds = useCallback((seconds: number) => {
    setElapsedSeconds((prev) => Math.max(0, prev + seconds));
  }, []);

  // Effect to handle timer increment
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    isRunning,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    start,
    pause,
    resume,
    stop,
    reset,
    setTime,
    addSeconds,
  };
}

/**
 * Hook for countdown timer
 */
export function useCountdownTimer(
  initialSeconds: number
): UseTimerReturn & { totalSeconds: number; remaining: number } {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, "0"));
    parts.push(minutes.toString().padStart(2, "0"));
    parts.push(secs.toString().padStart(2, "0"));

    return parts.join(":");
  }, []);

  const start = useCallback(() => {
    if (isRunning || remaining <= 0) return;
    setIsRunning(true);
  }, [isRunning, remaining]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (isRunning || remaining <= 0) return;
    setIsRunning(true);
  }, [isRunning, remaining]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    setRemaining(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const setTime = useCallback((seconds: number) => {
    setRemaining(Math.max(0, seconds));
  }, []);

  const addSeconds = useCallback((seconds: number) => {
    setRemaining((prev) => Math.max(0, prev + seconds));
  }, []);

  // Effect to handle countdown
  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      if (isRunning && remaining <= 0) {
        setIsRunning(false);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remaining]);

  return {
    isRunning,
    elapsedSeconds: initialSeconds - remaining,
    totalSeconds: initialSeconds,
    formattedTime: formatTime(remaining),
    remaining,
    start,
    pause,
    resume,
    stop,
    reset,
    setTime,
    addSeconds,
  };
}

/**
 * Hook for stopwatch with lap functionality
 */
export function useStopwatch() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousLapTimeRef = useRef(0);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, "0"));
    parts.push(minutes.toString().padStart(2, "0"));
    parts.push(secs.toString().padStart(2, "0"));

    return parts.join(":");
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setLaps([]);
    previousLapTimeRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    setLaps([]);
    previousLapTimeRef.current = 0;
  }, []);

  const recordLap = useCallback(() => {
    if (!isRunning) return;

    const lapTime = elapsedSeconds - previousLapTimeRef.current;
    setLaps((prev) => [...prev, lapTime]);
    previousLapTimeRef.current = elapsedSeconds;
  }, [elapsedSeconds, isRunning]);

  const clearLaps = useCallback(() => {
    setLaps([]);
    previousLapTimeRef.current = 0;
  }, []);

  // Effect to handle timer increment
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    isRunning,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    laps,
    lapTimes: laps.map((lap) => formatTime(lap)),
    start,
    pause,
    resume,
    stop,
    reset,
    recordLap,
    clearLaps,
  };
}

/**
 * Hook for interval timer (work/break cycles)
 */
export function useIntervalTimer(
  workSeconds: number,
  breakSeconds: number
) {
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"work" | "break">("work");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, "0"));
    parts.push(minutes.toString().padStart(2, "0"));
    parts.push(secs.toString().padStart(2, "0"));

    return parts.join(":");
  }, []);

  const getCurrentPhaseSeconds = useCallback(() => {
    return phase === "work" ? workSeconds : breakSeconds;
  }, [phase, workSeconds, breakSeconds]);

  const getPhaseElapsed = useCallback(() => {
    if (phase === "work") {
      return totalElapsed % (workSeconds + breakSeconds);
    }
    return totalElapsed % (workSeconds + breakSeconds) - workSeconds;
  }, [phase, totalElapsed, workSeconds, breakSeconds]);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTotalElapsed(0);
    setPhase("work");
  }, []);

  // Effect to handle interval timer
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTotalElapsed((prev) => {
        const cycleLength = workSeconds + breakSeconds;
        const newTotal = prev + 1;
        const position = newTotal % cycleLength;

        // Switch phase when position reaches work seconds
        if (position === workSeconds) {
          setPhase("break");
        } else if (position === 0) {
          setPhase("work");
        }

        return newTotal;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, workSeconds, breakSeconds]);

  const phaseElapsed = getPhaseElapsed();
  const cycleLength = workSeconds + breakSeconds;
  const phaseProgress = (phaseElapsed / getCurrentPhaseSeconds()) * 100;

  return {
    isRunning,
    phase,
    totalElapsed,
    phaseElapsed,
    formattedTotal: formatTime(totalElapsed),
    formattedPhase: formatTime(phaseElapsed),
    phaseProgress,
    cycleLength,
    start,
    pause,
    resume,
    reset,
  };
}
