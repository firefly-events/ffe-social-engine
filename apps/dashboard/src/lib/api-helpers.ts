/**
 * api-helpers.ts — Shared utilities for API route handlers.
 */

import { NextResponse } from 'next/server'
import type { ApiError } from '@/lib/api-types'

// ── ID GENERATION ─────────────────────────────────────────────────────────────

/** Generate a short random ID. Replace with cuid2 / nanoid when adding the dep. */
export function generateId(prefix?: string): string {
  const rand = Math.random().toString(36).slice(2, 11)
  const ts   = Date.now().toString(36)
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`
}

// ── RESPONSE HELPERS ─────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(message: string, code?: string): NextResponse<ApiError> {
  return NextResponse.json({ error: message, code }, { status: 400 })
}

export function unauthorized(message = 'Unauthorized'): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'Forbidden'): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFound(resource = 'Resource'): NextResponse<ApiError> {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function serverError(message = 'Internal server error'): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status: 500 })
}

// ── CURSOR PAGINATION ─────────────────────────────────────────────────────────

/**
 * Apply cursor-based pagination to an already-filtered array.
 * Items are expected to be in chronological (ascending createdAt) order.
 */
export function paginate<T extends { id: string; createdAt: string }>(
  items: T[],
  cursor: string | undefined,
  limit: number,
): { page: T[]; nextCursor: string | null } {
  let startIndex = 0

  if (cursor) {
    const idx = items.findIndex((item) => item.id === cursor)
    if (idx !== -1) startIndex = idx + 1
  }

  const page       = items.slice(startIndex, startIndex + limit)
  const nextCursor = startIndex + limit < items.length
    ? items[startIndex + limit - 1]?.id ?? null
    : null

  return { page, nextCursor }
}

// ── DATE HELPERS ──────────────────────────────────────────────────────────────

export function nowISO(): string {
  return new Date().toISOString()
}

// ── OWNERSHIP CHECK ───────────────────────────────────────────────────────────

export function assertOwner(
  resourceUserId: string,
  requestUserId: string,
): boolean {
  return resourceUserId === requestUserId
}
