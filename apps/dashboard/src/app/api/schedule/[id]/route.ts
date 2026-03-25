/**
 * PATCH  /api/schedule/[id] — reschedule or update status
 * DELETE /api/schedule/[id] — cancel a scheduled post
 *
 * TODO(migration): Replace scheduleStore Map calls with Convex / MongoDB.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  assertOwner,
  nowISO,
} from '@/lib/api-helpers'
import { scheduleStore } from '@/lib/api-store'
import type { UpdateScheduleBody } from '@/lib/api-types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    // TODO(migration): → Convex / MongoDB findOne
    const entry = scheduleStore.get(id)
    if (!entry) return notFound('Schedule')

    if (!assertOwner(entry.userId, session.userId)) return forbidden()

    // Cannot modify an already-completed or cancelled entry
    if (entry.status === 'posted' || entry.status === 'cancelled') {
      return badRequest(`Cannot update a schedule with status "${entry.status}"`)
    }

    let body: UpdateScheduleBody
    try {
      body = await request.json() as UpdateScheduleBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (body.scheduledAt !== undefined) {
      const scheduledDate = new Date(body.scheduledAt)
      if (isNaN(scheduledDate.getTime())) {
        return badRequest('scheduledAt must be a valid ISO-8601 date string')
      }
      if (scheduledDate.getTime() <= Date.now()) {
        return badRequest('scheduledAt must be in the future')
      }
    }

    const updated = {
      ...entry,
      ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt }),
      ...(body.status      !== undefined && { status:      body.status }),
      updatedAt: nowISO(),
    }

    // TODO(migration): → Convex mutation / MongoDB updateOne
    scheduleStore.set(id, updated)

    return ok(updated)
  } catch (err) {
    console.error('[PATCH /api/schedule/[id]]', err)
    return serverError()
  }
}

// ── DELETE (cancel) ───────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    // TODO(migration): → Convex / MongoDB findOne
    const entry = scheduleStore.get(id)
    if (!entry) return notFound('Schedule')

    if (!assertOwner(entry.userId, session.userId)) return forbidden()

    if (entry.status === 'posted') {
      return badRequest('Cannot cancel an already-posted schedule')
    }

    // Soft-cancel: mark as cancelled rather than deleting the record
    const cancelled = {
      ...entry,
      status:    'cancelled' as const,
      updatedAt: nowISO(),
    }

    // TODO(migration): → Convex mutation / MongoDB updateOne
    scheduleStore.set(id, cancelled)

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/schedule/[id]]', err)
    return serverError()
  }
}
