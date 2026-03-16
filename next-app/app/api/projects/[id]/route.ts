// ============================================================
// app/api/projects/[id]/route.ts
// ============================================================
// Per-project CRUD handlers.
//
// All project-row reads/writes go through projectRepository
// (the single source of truth for project data).
//
// Dependency checks for DELETE still query auxiliary tables
// (tasks, time_entries, expenses, documents) directly via
// supabaseAdmin because those tables are not yet in the
// data layer; this will be migrated in Sprint 2.
// ============================================================

import { NextRequest } from "next/server";
import { projectRepository } from "@/lib/data";
import type { UpdateProjectData } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import redis from "@/lib/redis";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";

export const dynamic = "force-dynamic";

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

/**
 * Return true when `table` contains at least one row whose `column`
 * equals `id`.  Tries a list of candidate column names so the check
 * works even when column naming is inconsistent across migrations.
 */
async function hasRelatedRows(
  table: string,
  columnCandidates: string[],
  id: string,
): Promise<boolean> {
  if (!supabaseAdmin) return false;

  for (const col of columnCandidates) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq(col, id);

    if (!error) return (count ?? 0) > 0;

    // If the column doesn't exist in the schema cache just try the next one
    const msg = error.message ?? "";
    if (
      msg.includes("Could not find the") ||
      msg.includes("schema cache") ||
      msg.includes("column")
    ) {
      continue;
    }

    // Any other DB error — surface it
    console.error(`[hasRelatedRows] ${table}.${col}:`, msg);
    break;
  }

  return false;
}

async function projectHasDependencies(id: string): Promise<boolean> {
  const checks = await Promise.all([
    hasRelatedRows("tasks", ["project_id", "projectId"], id),
    hasRelatedRows("time_entries", ["project_id", "projectId"], id),
    hasRelatedRows("expenses", ["project_id", "projectId"], id),
    hasRelatedRows("documents", ["project_id", "projectId"], id),
  ]);
  return checks.some(Boolean);
}

// ----------------------------------------------------------
// Camel-to-snake field mapping for PUT payloads
// ----------------------------------------------------------

const CAMEL_TO_SNAKE: Record<string, string> = {
  startDate: "start_date",
  endDate: "end_date",
  managerId: "manager_id",
  clientId: "client_id",
  progressPlan: "progress_plan",
  riskLevel: "risk_level",
  hourlyRate: "hourly_rate",
  isArchived: "is_archived",
  isInternal: "is_internal",
  internalCategory: "internal_category",
  warrantyStartDate: "warranty_start_date",
  warrantyEndDate: "warranty_end_date",
  closureChecklist: "closure_checklist",
};

/** Columns the PUT handler is permitted to update. */
const ALLOWED_UPDATE_COLUMNS = new Set<string>([
  "name",
  "code",
  "description",
  "status",
  "progress",
  "progress_plan",
  "budget",
  "spent",
  "remaining",
  "spi",
  "cpi",
  "start_date",
  "end_date",
  "manager_id",
  "client_id",
  "category",
  "is_archived",
  "is_internal",
  "internal_category",
  "risk_level",
  "hourly_rate",
  "warranty_start_date",
  "warranty_end_date",
  "closure_checklist",
]);

function buildUpdatePayload(
  raw: Record<string, unknown>,
): UpdateProjectData | null {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    const snakeKey = CAMEL_TO_SNAKE[key] ?? key;
    if (!ALLOWED_UPDATE_COLUMNS.has(snakeKey)) continue;
    payload[snakeKey] = value;
  }

  return Object.keys(payload).length > 0
    ? (payload as unknown as UpdateProjectData)
    : null;
}

// ----------------------------------------------------------
// GET /api/projects/[id]
// ----------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const project = await projectRepository.findById(id);

    if (!project) {
      return apiError("Project not found", 404);
    }

    return apiResponse(toCamelCase(project));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    console.error(`[GET /api/projects/${params.id}]`, message);
    return apiError(message, 500);
  }
}

// ----------------------------------------------------------
// PUT /api/projects/[id]
// ----------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const body = await request.json();
    // Support both { updatedFields: {...} } and flat payloads
    const rawFields: Record<string, unknown> =
      body.updatedFields && typeof body.updatedFields === "object"
        ? body.updatedFields
        : body;

    const updateData = buildUpdatePayload(rawFields);

    if (!updateData) {
      return apiError("No valid fields to update", 400);
    }

    const updated = await projectRepository.update(id, updateData);

    if (!updated) {
      return apiError("Project not found", 404);
    }

    // ----------------------------------------------------------
    // Track progress history when progress changes
    // ----------------------------------------------------------
    const newProgress =
      "progress" in rawFields
        ? Number((rawFields as any).progress)
        : "progress" in updateData
          ? Number((updateData as any).progress)
          : NaN;

    if (!isNaN(newProgress) && supabaseAdmin) {
      const nowIso = new Date().toISOString();
      const { error: histErr } = await supabaseAdmin
        .from("project_progress_history")
        .insert({
          project_id: id,
          progress: newProgress,
          week_date: nowIso,
          created_at: nowIso,
        } as any);

      if (histErr) {
        // Non-fatal — log and continue
        console.warn(
          "[PUT /api/projects] progress history insert:",
          histErr.message,
        );
      }
    }

    await redis.del("projects:all");

    return apiResponse(toCamelCase(updated));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    console.error(`[PUT /api/projects/${params.id}]`, message);
    return apiError(message, 500);
  }
}

// ----------------------------------------------------------
// DELETE /api/projects/[id]
// ----------------------------------------------------------
// Strategy:
//   • When the project has dependent records (tasks, time entries,
//     expenses, documents) it is ARCHIVED instead of hard-deleted
//     so that financial history is preserved.
//   • When no dependencies exist the row is hard-deleted.
// ----------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const hasDeps = await projectHasDependencies(id);

    if (hasDeps) {
      // Soft delete — archive the project
      const archived = await projectRepository.archive(id);

      if (!archived) {
        return apiError("Project not found", 404);
      }

      await redis.del("projects:all");
      return apiResponse({ mode: "archived", id });
    }

    // Hard delete
    const deleted = await projectRepository.delete(id);

    if (!deleted) {
      return apiError("Project not found", 404);
    }

    await redis.del("projects:all");
    return apiResponse({ mode: "deleted", id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    console.error(`[DELETE /api/projects/${params.id}]`, message);
    return apiError(message, 500);
  }
}
