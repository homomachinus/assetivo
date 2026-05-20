import { NextResponse } from "next/server";

/**
 * Require a non-empty string from request body.
 */
export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

/**
 * Require a numeric value from request body.
 */
export function requireNumber(value: unknown, field: string): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  throw new Error(`${field} is required and must be a number`);
}

/**
 * Parse an optional string field — returns trimmed string or null.
 */
export function optionalString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

/**
 * Parse an optional boolean field — returns boolean or default.
 */
export function optionalBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

/**
 * Standard error JSON response.
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success JSON response.
 */
export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Wrap handler with try/catch and return standard error.
 */
export function catchError(error: unknown, fallbackStatus: number = 400) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return errorResponse(message, fallbackStatus);
}

/**
 * Extract UUID id param from Next.js dynamic route context.
 */
export function getIdParam(params: { id: string }): string {
  const id = params.id?.trim();
  if (!id) {
    throw new Error("id parameter is required");
  }
  return id;
}
