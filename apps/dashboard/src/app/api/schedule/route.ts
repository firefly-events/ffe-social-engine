/**
 * GET  /api/schedule — list scheduled posts (filterable by status/platform)
 * POST /api/schedule — create a new schedule entry
 *
 * TODO(migration): Replace scheduleStore / contentStore Map calls with Convex
 * queries/mutations or MongoDB driver calls against the "schedules" collection.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  notFound,
  serverError,
  generateId,
  paginate,
  nowISO,
} from '@/lib/api-helpers'
import { scheduleStore, contentStore } from '@/lib/api-store'
import type {
  ScheduleItem,
  CreateScheduleBody,
  ScheduleStatus,
} from '@/lib/api-types'
import type { Platform } from '@/types/export'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const sp      = request.nextUrl.searchParams
    const status   = sp.get('status')   as ScheduleStatus | null
    const platform = sp.get('platform') as Platform | null
    const after    = sp.get('after')
    const before   = sp.get('before')
    const cursor   = sp.get('cursor')  ?? undefined
    const limit    = Math.min(Number(sp.get('limit') ?? 20), 100)

    // TODO(migration): push filters into Convex query / MongoDB $match
    let items = Array.from(scheduleStore.values())
      .filter((s) => s.userId === session.userId)

    if (status)   items = items.filter((s) => s.status   === status)
    if (platform) items = items.filter((s) => s.platform === platform)
    if (after) {
      const afterMs = new Date(after).getTime()
      items = items.filter((s) => new Date(s.scheduledAt).getTime() > afterMs)
    }
    if (before) {
      const beforeMs = new Date(before).getTime()
      items = items.filter((s) => new Date(s.scheduledAt).getTime() < beforeMs)
    }

    // Sort by scheduledAt ascending (soonest first)
    items.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )

    const { page, nextCursor } = paginate(items, cursor, limit)

    return ok({ items: page, nextCursor, total: items.length })
  } catch (err) {
    console.error('[GET /api/schedule]', err)
    return serverError()
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    let body: CreateScheduleBody
    try {
      body = await request.json() as CreateScheduleBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (!body.contentId) return badRequest('contentId is required')
    if (!body.platform)  return badRequest('platform is required')
    if (!body.scheduledAt) return badRequest('scheduledAt is required')

    const scheduledDate = new Date(body.scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      return badRequest('scheduledAt must be a valid ISO-8601 date string')
    }
    if (scheduledDate.getTime() <= Date.now()) {
      return badRequest('scheduledAt must be in the future')
    }

    // Verify the referenced content item exists and belongs to this user
    // TODO(migration): → Convex query / MongoDB findOne
    const content = contentStore.get(body.contentId)
    if (!content || content.userId !== session.userId) {
      return notFound('Content')
    }

    const now   = nowISO()
    const entry: ScheduleItem = {
      id:          generateId('sch'),
      contentId:   body.contentId,
      userId:      session.userId,
      platform:    body.platform,
      scheduledAt: body.scheduledAt,
      status:      'pending',
      createdAt:   now,
      updatedAt:   now,
    }

    // TODO(migration): → Convex mutation / MongoDB insertOne
    scheduleStore.set(entry.id, entry)

    return created(entry)
  } catch (err) {
    console.error('[POST /api/schedule]', err)
    return serverError()
  }
}
