// API Related Types

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}