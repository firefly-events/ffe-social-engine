/**
 * PATCH  /api/schedule/[id] — reschedule or update status
 * DELETE /api/schedule/[id] — cancel a scheduled post
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
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '../../../../../convex/_generated/api'
import type { ScheduleItem, ScheduleStatus, UpdateScheduleBody } from '@/lib/api-types'
import type { Platform } from '@/types/export'

interface RouteContext {
  params: Promise<{ id: string }>
}

/** Map a Convex schedule document to the public ScheduleItem shape. */
function toScheduleItem(doc: Record<string, unknown>): ScheduleItem {
  return {
    id:           doc.externalId as string,
    contentId:    doc.contentId as string,
    userId:       doc.userId as string,
    platform:     doc.platform as Platform,
    scheduledAt:  new Date(doc.scheduledAt as number).toISOString(),
    status:       doc.status as ScheduleStatus,
    postedAt:     doc.postedAt != null ? new Date(doc.postedAt as number).toISOString() : undefined,
    errorMessage: doc.errorMessage as string | undefined,
    createdAt:    new Date(doc.createdAt as number).toISOString(),
    updatedAt:    new Date(doc.updatedAt as number).toISOString(),
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const doc = await convexClient.query(api.schedules.getByExternalId, { externalId: id })
    if (!doc) return notFound('Schedule')

    const entry = toScheduleItem(doc as Record<string, unknown>)
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

    const updated = await convexClient.mutation(api.schedules.update, {
      externalId:  id,
      ...(body.scheduledAt !== undefined && { scheduledAt: new Date(body.scheduledAt).getTime() }),
      ...(body.status      !== undefined && { status:      body.status }),
      updatedAt: Date.now(),
    })

    if (!updated) return notFound('Schedule')

    return ok(toScheduleItem(updated as Record<string, unknown>))
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
    const doc = await convexClient.query(api.schedules.getByExternalId, { externalId: id })
    if (!doc) return notFound('Schedule')

    const entry = toScheduleItem(doc as Record<string, unknown>)
    if (!assertOwner(entry.userId, session.userId)) return forbidden()

    if (entry.status === 'posted') {
      return badRequest('Cannot cancel an already-posted schedule')
    }

    // Soft-cancel: mark as cancelled rather than deleting the record
    await convexClient.mutation(api.schedules.update, {
      externalId: id,
      status:     'cancelled',
      updatedAt:  Date.now(),
    })

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/schedule/[id]]', err)
    return serverError()
  }
}
