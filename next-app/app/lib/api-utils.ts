import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  status: number;
}

export function apiResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      success: true,
      status,
    },
    { status }
  );
}

export function apiError(message: string, status = 500, details?: any): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      error: message,
      success: false,
      status,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())]: toCamelCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)]: toSnakeCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}
