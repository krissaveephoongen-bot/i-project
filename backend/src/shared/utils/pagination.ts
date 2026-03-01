/**
 * Pagination Utilities
 * Handles pagination validation and offset calculation
 */

export interface PaginationParams {
  page: number;
  limit: number;
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
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Validate and normalize pagination parameters
 */
export function validatePagination(
  page?: any,
  limit?: any,
): { page: number; limit: number; offset: number } {
  // Parse page
  let parsedPage = DEFAULT_PAGE;
  if (page) {
    const parsed = parseInt(String(page), 10);
    if (!isNaN(parsed) && parsed >= 1) {
      parsedPage = parsed;
    }
  }

  // Parse limit
  let parsedLimit = DEFAULT_LIMIT;
  if (limit) {
    const parsed = parseInt(String(limit), 10);
    if (!isNaN(parsed)) {
      parsedLimit = Math.max(MIN_LIMIT, Math.min(parsed, MAX_LIMIT));
    }
  }

  // Calculate offset
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
}

/**
 * Build pagination response metadata
 */
export function buildPagination<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}

/**
 * Validate sort order
 */
export function validateSortOrder(sortOrder?: string): "asc" | "desc" {
  return sortOrder?.toLowerCase() === "desc" ? "desc" : "asc";
}

/**
 * Validate sort field
 */
export function validateSortField<T extends Record<string, any>>(
  sortBy: string | undefined,
  allowedFields: (keyof T)[],
): keyof T | undefined {
  if (!sortBy) return undefined;

  const field = sortBy as keyof T;
  if (allowedFields.includes(field)) {
    return field;
  }

  return undefined;
}
