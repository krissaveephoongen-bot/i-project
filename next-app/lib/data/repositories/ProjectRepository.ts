// ============================================================
// ProjectRepository — Supabase JS single source of truth
// for all project-related database operations.
//
// Design principles:
//   • All DB access goes through supabaseAdmin (service role)
//     so Row Level Security is bypassed server-side.
//   • Types are derived from the actual Supabase schema; no Prisma,
//     no Drizzle, no raw SQL.
//   • Relations (manager, client) are fetched via Supabase's
//     foreign-table join syntax where FKs exist, with a safe
//     fallback to separate queries when they do not.
//   • Every public method throws a descriptive Error on DB failure
//     so route handlers can catch once and return 500.
// ============================================================

import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

// ----------------------------------------------------------
// Domain types
// ----------------------------------------------------------

/** Flat project row as it lives in the database. */
export interface ProjectRow {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  status: string;
  progress: number;
  progress_plan: number | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  spent: number;
  remaining: number;
  spi: number;
  cpi: number;
  manager_id: string | null;
  client_id: string | null;
  category: string | null;
  is_archived: boolean;
  is_internal: boolean | null;
  internal_category: string | null;
  created_at: string;
  updated_at: string;
}

/** Project row enriched with resolved manager / client objects. */
export interface ProjectWithRelations extends ProjectRow {
  manager: { id: string; name: string; email: string } | null;
  client: { id: string; name: string } | null;
}

// ----------------------------------------------------------
// Input / filter types
// ----------------------------------------------------------

export interface ProjectFilters {
  status?: string;
  manager_id?: string;
  client_id?: string;
  category?: string;
  /** Full-text search across name, code, description */
  search?: string;
  /** When undefined, both archived and non-archived rows are returned */
  is_archived?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  /** Column name (must be a valid projects column) */
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProjectData {
  /** If omitted a UUID is generated. */
  id?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  /** Defaults to "in_progress" */
  status?: string;
  /** 0–100, defaults to 0 */
  progress?: number;
  start_date?: string | null;
  end_date?: string | null;
  /** Numeric budget in the project's base currency */
  budget?: number;
  manager_id?: string | null;
  client_id?: string | null;
  category?: string | null;
  is_archived?: boolean;
  is_internal?: boolean;
  internal_category?: string | null;
}

export interface UpdateProjectData {
  name?: string;
  code?: string | null;
  description?: string | null;
  status?: string;
  progress?: number;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number;
  spent?: number;
  remaining?: number;
  spi?: number;
  cpi?: number;
  manager_id?: string | null;
  client_id?: string | null;
  category?: string | null;
  is_archived?: boolean;
  is_internal?: boolean;
  internal_category?: string | null;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalBudget: number;
  totalSpent: number;
}

// ----------------------------------------------------------
// Allowed sort columns (whitelist to prevent injection)
// ----------------------------------------------------------

const ALLOWED_SORT_COLUMNS = new Set([
  "name",
  "status",
  "progress",
  "start_date",
  "end_date",
  "budget",
  "spent",
  "created_at",
  "updated_at",
]);

function safeSortColumn(col: string | undefined): string {
  if (!col) return "created_at";
  return ALLOWED_SORT_COLUMNS.has(col) ? col : "created_at";
}

// ----------------------------------------------------------
// ProjectRepository
// ----------------------------------------------------------

export class ProjectRepository {
  // Lazy accessor so the client is only required when a method is
  // actually called (allows importing the module in tests without
  // the env vars set).
  private get db() {
    if (!supabaseAdmin) {
      throw new Error(
        "ProjectRepository: Supabase admin client is not initialised. " +
          "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
      );
    }
    return supabaseAdmin;
  }

  // --------------------------------------------------------
  // READ — list
  // --------------------------------------------------------

  /**
   * Return a paginated, filtered list of projects.
   *
   * Relations (manager / client) are resolved in two extra queries and
   * merged in memory so we don't depend on Supabase FK hints being
   * configured.
   */
  async findAll(
    filters: ProjectFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<ProjectWithRelations>> {
    const page = Math.max(1, pagination.page ?? 1);
    const limit = Math.min(100, Math.max(1, pagination.limit ?? 20));
    const sortBy = safeSortColumn(pagination.sortBy);
    const ascending = (pagination.sortOrder ?? "desc") === "asc";
    const offset = (page - 1) * limit;

    // -- Build base query -----------------------------------------
    let query = this.db
      .from("projects")
      .select("*", { count: "exact" });

    // -- Filters --------------------------------------------------
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.manager_id) {
      query = query.eq("manager_id", filters.manager_id);
    }
    if (filters.client_id) {
      query = query.eq("client_id", filters.client_id);
    }
    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (filters.is_archived !== undefined) {
      query = query.eq("is_archived", filters.is_archived);
    }
    if (filters.search) {
      const term = filters.search.replace(/[%_]/g, "\\$&"); // escape wildcards
      query = query.or(
        `name.ilike.%${term}%,code.ilike.%${term}%,description.ilike.%${term}%`,
      );
    }

    // -- Sort + pagination ----------------------------------------
    query = query
      .order(sortBy, { ascending })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`ProjectRepository.findAll: ${error.message}`);
    }

    const rows = (data ?? []) as ProjectRow[];
    const total = count ?? 0;

    // -- Resolve relations ----------------------------------------
    const enriched = await this._attachRelations(rows);

    return {
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // --------------------------------------------------------
  // READ — single
  // --------------------------------------------------------

  /**
   * Return a single project with resolved manager and client,
   * or `null` when the row does not exist.
   */
  async findById(id: string): Promise<ProjectWithRelations | null> {
    const { data, error } = await this.db
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`ProjectRepository.findById: ${error.message}`);
    }
    if (!data) return null;

    const [enriched] = await this._attachRelations([data as ProjectRow]);
    return enriched ?? null;
  }

  // --------------------------------------------------------
  // CREATE
  // --------------------------------------------------------

  /**
   * Insert a new project row and return the created record.
   */
  async create(input: CreateProjectData): Promise<ProjectRow> {
    const now = new Date().toISOString();
    const budget = input.budget ?? 0;

    const payload = {
      id: input.id ?? crypto.randomUUID(),
      name: input.name,
      code: input.code ?? null,
      description: input.description ?? null,
      status: input.status ?? "in_progress",
      progress: input.progress ?? 0,
      progress_plan: 0,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      budget,
      spent: 0,
      remaining: budget,
      spi: 1.0,
      cpi: 1.0,
      manager_id: input.manager_id ?? null,
      client_id: input.client_id ?? null,
      category: input.category ?? null,
      is_archived: input.is_archived ?? false,
      is_internal: input.is_internal ?? false,
      internal_category: input.internal_category ?? null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await this.db
      .from("projects")
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(`ProjectRepository.create: ${error.message}`);
    }

    return data as ProjectRow;
  }

  // --------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------

  /**
   * Partially update a project by ID.
   * Returns the updated row, or `null` when the project was not found.
   */
  async update(
    id: string,
    updates: UpdateProjectData,
  ): Promise<ProjectRow | null> {
    // Recalculate `remaining` when budget or spent changes without the
    // other value being supplied — fetch current values first.
    const needsRecalc =
      (updates.budget !== undefined) !== (updates.spent !== undefined);

    if (needsRecalc && updates.remaining === undefined) {
      const current = await this.findById(id);
      if (!current) return null;

      const budget =
        updates.budget !== undefined ? updates.budget : current.budget;
      const spent =
        updates.spent !== undefined ? updates.spent : current.spent;
      updates = { ...updates, remaining: Math.max(0, budget - spent) };
    }

    const { data, error } = await this.db
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`ProjectRepository.update: ${error.message}`);
    }

    return (data as ProjectRow) ?? null;
  }

  // --------------------------------------------------------
  // DELETE
  // --------------------------------------------------------

  /**
   * Hard-delete a project row.
   * Returns `true` if a row was deleted, `false` if not found.
   */
  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.db
      .from("projects")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      throw new Error(`ProjectRepository.delete: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  // --------------------------------------------------------
  // ARCHIVE (soft-delete)
  // --------------------------------------------------------

  /** Archive a project without deleting it. */
  async archive(id: string): Promise<ProjectRow | null> {
    return this.update(id, { is_archived: true });
  }

  /** Restore a previously archived project. */
  async restore(id: string): Promise<ProjectRow | null> {
    return this.update(id, { is_archived: false });
  }

  // --------------------------------------------------------
  // AGGREGATE STATS
  // --------------------------------------------------------

  /**
   * Return aggregate counts and budget totals used by the dashboard.
   * Only considers non-archived rows.
   */
  async getStats(): Promise<ProjectStats> {
    const { data, error } = await this.db
      .from("projects")
      .select("status, budget, spent, end_date")
      .eq("is_archived", false);

    if (error) {
      throw new Error(`ProjectRepository.getStats: ${error.message}`);
    }

    const today = new Date().toISOString().slice(0, 10);

    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let overdueProjects = 0;
    let totalBudget = 0;
    let totalSpent = 0;

    for (const row of data ?? []) {
      totalProjects++;
      totalBudget += Number(row.budget ?? 0);
      totalSpent += Number(row.spent ?? 0);

      const s = String(row.status ?? "").toLowerCase();

      if (s === "completed" || s === "done") {
        completedProjects++;
      } else if (s === "in_progress" || s === "active" || s === "planning") {
        activeProjects++;
      }

      if (
        row.end_date &&
        row.end_date < today &&
        s !== "completed" &&
        s !== "done"
      ) {
        overdueProjects++;
      }
    }

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalBudget,
      totalSpent,
    };
  }

  // --------------------------------------------------------
  // UTILITY
  // --------------------------------------------------------

  /**
   * Check whether a project code is already in use.
   * Optionally excludes one project ID (for "edit without changing code").
   */
  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    let query = this.db
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("code", code);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`ProjectRepository.codeExists: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  // --------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------

  /**
   * Enrich an array of flat project rows with resolved manager and
   * client objects.  Uses two batched queries (one for users, one for
   * clients) so the total number of DB round-trips is always 2
   * regardless of how many projects are in the list.
   */
  private async _attachRelations(
    rows: ProjectRow[],
  ): Promise<ProjectWithRelations[]> {
    if (rows.length === 0) return [];

    // Collect unique FK values
    const managerIds = [
      ...new Set(rows.map((r) => r.manager_id).filter(Boolean) as string[]),
    ];
    const clientIds = [
      ...new Set(rows.map((r) => r.client_id).filter(Boolean) as string[]),
    ];

    // Fetch in parallel
    const [managersRes, clientsRes] = await Promise.all([
      managerIds.length
        ? this.db
            .from("users")
            .select("id, name, email")
            .in("id", managerIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; email: string }>, error: null }),
      clientIds.length
        ? this.db
            .from("clients")
            .select("id, name")
            .in("id", clientIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string }>, error: null }),
    ]);

    // Build lookup maps
    const managerMap = new Map(
      (managersRes.data ?? []).map((u) => [u.id, u]),
    );
    const clientMap = new Map(
      (clientsRes.data ?? []).map((c) => [c.id, c]),
    );

    return rows.map((row) => ({
      ...row,
      manager: row.manager_id ? (managerMap.get(row.manager_id) ?? null) : null,
      client: row.client_id ? (clientMap.get(row.client_id) ?? null) : null,
    }));
  }
}

// ----------------------------------------------------------
// Singleton — import this in route handlers
// ----------------------------------------------------------
export const projectRepository = new ProjectRepository();
