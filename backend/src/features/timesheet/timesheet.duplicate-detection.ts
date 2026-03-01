/**
 * Timesheet Duplicate Detection & Parallel Work Handling
 * Implements Option 3 (Hybrid Approach):
 * - Allow 1 project alone
 * - Allow 1 project + 1 non-project (meeting)
 * - Allow max 2 projects parallel with reason
 * - Block 3+ projects at same time
 * - Block all work on leave days
 */

import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";

const prisma = new PrismaClient();

export interface DuplicateDetectionResult {
  valid: boolean;
  error?: string;
  warnings: string[];
  isConcurrent: boolean;
  requiresComment: boolean;
  overlappingEntries?: Array<{
    id: string;
    projectName?: string;
    startTime: string;
    endTime: string;
    hours: number;
    overlapMinutes: number;
  }>;
}

/**
 * Calculate overlap time in minutes between two time ranges
 */
function calculateOverlapMinutes(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): number {
  const parse = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = parse(start1);
  const end1Min = parse(end1);
  const start2Min = parse(start2);
  const end2Min = parse(end2);

  const overlapStart = Math.max(start1Min, start2Min);
  const overlapEnd = Math.min(end1Min, end2Min);

  return Math.max(0, overlapEnd - overlapStart);
}

/**
 * Format hours from decimal to string (e.g., 1.5 -> "1.5h")
 */
function formatHours(decimal: number): string {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Main duplicate detection function
 */
export async function detectDuplicateOrParallelWork(
  data: {
    userId: string;
    date: Date;
    startTime: string;
    endTime: string;
    projectId?: string;
    workType: string;
  },
  excludeEntryId?: string,
): Promise<DuplicateDetectionResult> {
  try {
    // 1. Check for leave conflict (HARD BLOCK)
    const leaveConflict = await checkLeaveConflict(data.userId, data.date);
    if (leaveConflict) {
      throw new AppError(
        400,
        "LEAVE_CONFLICT",
        `ไม่สามารถบันทึกเวลาทำงานในวันลา: ${leaveConflict}`,
      );
    }

    // 2. Find overlapping entries
    const overlappingEntries = await findOverlappingEntries(
      data.userId,
      data.date,
      data.startTime,
      data.endTime,
      excludeEntryId,
    );

    if (overlappingEntries.length === 0) {
      // No overlaps - everything OK
      return {
        valid: true,
        warnings: [],
        isConcurrent: false,
        requiresComment: false,
      };
    }

    // 3. Analyze overlap type and determine if allowed
    return await analyzeOverlapAndDecide(data, overlappingEntries);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      500,
      "DUPLICATE_CHECK_FAILED",
      "ไม่สามารถตรวจสอบการซ้ำของบันทึกได้",
    );
  }
}

/**
 * Check if date falls within approved/submitted leave
 */
async function checkLeaveConflict(
  userId: string,
  date: Date,
): Promise<string | null> {
  const leaveRequest = await prisma.leave_requests.findFirst({
    where: {
      user_id: userId,
      start_date: { lte: date },
      end_date: { gte: date },
      status: { in: ["approved", "pending"] },
    },
  });

  if (leaveRequest) {
    return `${leaveRequest.leave_type} (${leaveRequest.start_date.toLocaleDateString(
      "th-TH",
    )}-${leaveRequest.end_date.toLocaleDateString("th-TH")})`;
  }

  return null;
}

/**
 * Find all entries that overlap with the given time range
 */
async function findOverlappingEntries(
  userId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeEntryId?: string,
) {
  const entries = await prisma.time_entries.findMany({
    where: {
      userId,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ["pending", "approved"] },
      ...(excludeEntryId && { id: { not: excludeEntryId } }),
    },
    include: {
      projects: { select: { name: true } },
    },
  });

  // Filter for actual time overlaps
  return entries
    .map((entry) => ({
      ...entry,
      overlapMinutes: calculateOverlapMinutes(
        startTime,
        endTime,
        entry.startTime,
        entry.endTime || "",
      ),
    }))
    .filter((entry) => entry.overlapMinutes > 0);
}

/**
 * Analyze overlap and determine if allowed based on Option 3 rules
 */
async function analyzeOverlapAndDecide(
  newEntry: {
    userId: string;
    date: Date;
    startTime: string;
    endTime: string;
    projectId?: string;
    workType: string;
  },
  overlappingEntries: any[],
): Promise<DuplicateDetectionResult> {
  // Check for exact duplicate
  const exactDuplicate = overlappingEntries.find(
    (entry) =>
      entry.startTime === newEntry.startTime &&
      entry.endTime === newEntry.endTime &&
      entry.projectId === newEntry.projectId &&
      entry.workType === newEntry.workType,
  );

  if (exactDuplicate) {
    throw new AppError(
      400,
      "EXACT_DUPLICATE",
      "บันทึกนี้มีอยู่แล้วในวันเดียวกัน",
    );
  }

  // 1. Same project, overlapping times = BLOCK
  const sameProjectOverlap = overlappingEntries.find(
    (entry) =>
      entry.projectId === newEntry.projectId &&
      entry.workType === "project" &&
      newEntry.workType === "project",
  );

  if (sameProjectOverlap) {
    throw new AppError(
      400,
      "SAME_PROJECT_OVERLAP",
      `ไม่สามารถทำงานโครงการเดียวกันได้ (${newEntry.projectId}) ในเวลาเดียวกัน`,
    );
  }

  // 2. Count project overlaps (excluding non-project work)
  const projectOverlaps = overlappingEntries.filter(
    (entry) => entry.workType === "project" && newEntry.workType === "project",
  );

  // 3+ concurrent projects = BLOCK
  if (projectOverlaps.length >= 2) {
    throw new AppError(
      400,
      "TOO_MANY_PARALLEL_PROJECTS",
      `ไม่สามารถทำ 3 งานขนานพร้อมกันได้ (จะมี ${projectOverlaps.length + 1} งาน)`,
    );
  }

  // Project + Non-Project mix (meeting/training during work) = ALLOW
  // Real-world: office, training, other work types can overlap with project work
  if (
    projectOverlaps.length === 0 &&
    !["project"].includes(newEntry.workType)
  ) {
    return {
      valid: true,
      warnings: [],
      isConcurrent: false,
      requiresComment: false,
    };
  }

  if (
    projectOverlaps.length === 1 &&
    !["project"].includes(newEntry.workType)
  ) {
    return {
      valid: true,
      warnings: [],
      isConcurrent: false,
      requiresComment: false,
    };
  }

  // 2 projects in parallel = WARN + REQUIRE COMMENT
  if (projectOverlaps.length === 1 && newEntry.workType === "project") {
    const overlapEntry = projectOverlaps[0];
    const overlapMinutes = calculateOverlapMinutes(
      newEntry.startTime,
      newEntry.endTime,
      overlapEntry.startTime,
      overlapEntry.endTime || "",
    );
    const overlapHours = overlapMinutes / 60;

    return {
      valid: true,
      warnings: [
        `พบการทำงานขนาน: ${overlapEntry.projects?.name || "โครงการ"} | ${
          overlapEntry.startTime
        }-${overlapEntry.endTime || "N/A"} (ซ้ำกัน ${overlapHours.toFixed(
          1,
        )}h)`,
        "โปรดอธิบายเหตุผลการทำงานแบบขนาน",
      ],
      isConcurrent: true,
      requiresComment: true,
      overlappingEntries: overlappingEntries
        .filter((entry) => entry.workType === "project")
        .map((entry) => ({
          id: entry.id,
          projectName: entry.projects?.name,
          startTime: entry.startTime,
          endTime: entry.endTime || "",
          hours: Number(entry.hours),
          overlapMinutes: calculateOverlapMinutes(
            newEntry.startTime,
            newEntry.endTime,
            entry.startTime,
            entry.endTime || "",
          ),
        })),
    };
  }

  // Default: ALLOW (should not reach here)
  return {
    valid: true,
    warnings: [],
    isConcurrent: false,
    requiresComment: false,
  };
}

/**
 * Update concurrent entries with relationship info
 * Call after creating/updating an entry that is concurrent
 */
export async function updateConcurrentRelationships(
  entryId: string,
  concurrentEntryIds: string[],
  reason: string,
) {
  // Update the new entry
  await prisma.time_entries.update({
    where: { id: entryId },
    data: {
      isConcurrent: true,
      concurrentEntryIds,
      concurrentReason: reason,
    },
  });

  // Update all related entries to link back
  if (concurrentEntryIds.length > 0) {
    await Promise.all(
      concurrentEntryIds.map((relatedId) =>
        prisma.time_entries.update({
          where: { id: relatedId },
          data: {
            isConcurrent: true,
            concurrentEntryIds: {
              push: entryId,
            },
          },
        }),
      ),
    );
  }
}

/**
 * Check if daily total exceeds 24 hours
 */
export async function checkDailyTotalHours(
  userId: string,
  date: Date,
  excludeEntryId?: string,
): Promise<{ total: number; exceeds: boolean }> {
  const entries = await prisma.time_entries.findMany({
    where: {
      userId,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ["draft", "submitted", "approved"] },
      ...(excludeEntryId && { id: { not: excludeEntryId } }),
    },
  });

  const total = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
  return {
    total,
    exceeds: total > 24,
  };
}

/**
 * Format concurrent entries for warning display
 */
export function formatConcurrentWarning(overlapping: any[]): string {
  const entries = overlapping
    .map(
      (e) =>
        `${e.projectName || "Project"}: ${e.startTime}-${e.endTime} (${formatHours(e.hours)})`,
    )
    .join("\n  ");

  return `พบการทำงานขนานกับ:\n  ${entries}`;
}

export default {
  detectDuplicateOrParallelWork,
  updateConcurrentRelationships,
  checkDailyTotalHours,
  formatConcurrentWarning,
};
