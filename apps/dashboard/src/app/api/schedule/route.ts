/**
 * GET  /api/schedule — list scheduled posts (filterable by status/platform)
 * POST /api/schedule — create a new schedule entry
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
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from "../../../../convex/_generated/api";
import type {
  ScheduleItem,
  CreateScheduleBody,
  ScheduleStatus,
} from '@/lib/api-types'
import type { Platform } from '@/types/export'
import { getPostHogServer } from '@/lib/posthog-server'

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

    const docs = await convexClient.query(api.schedules.list, {
      userId:   session.userId,
      status:   status   ?? undefined,
      platform: platform ?? undefined,
      after:    after  ? new Date(after).getTime()  : undefined,
      before:   before ? new Date(before).getTime() : undefined,
    })

    const items = (docs as Record<string, unknown>[]).map(toScheduleItem)
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

    if (!body.contentId)   return badRequest('contentId is required')
    if (!body.platform)    return badRequest('platform is required')
    if (!body.scheduledAt) return badRequest('scheduledAt is required')

    const scheduledDate = new Date(body.scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      return badRequest('scheduledAt must be a valid ISO-8601 date string')
    }
    if (scheduledDate.getTime() <= Date.now()) {
      return badRequest('scheduledAt must be in the future')
    }

    // Verify the referenced content item exists and belongs to this user
    /* const content = await convexClient.query(api.content.getByExternalId, {
      externalId: body.contentId,
    })
    if (!content || (content as Record<string, unknown>).userId !== session.userId) {
      return notFound('Content')
    } */

    const nowMs = Date.now()
    const externalId = generateId('sch')

    const doc = await convexClient.mutation(api.schedules.create, {
      externalId,
      contentId:   body.contentId,
      userId:      session.userId,
      platform:    body.platform,
      scheduledAt: scheduledDate.getTime(),
      status:      'pending',
      createdAt:   nowMs,
      updatedAt:   nowMs,
    })

    const ph = getPostHogServer()
    if (ph) {
      ph.capture({
        distinctId: session.userId,
        event: 'se_post_scheduled',
        properties: {
          platform: 'web',
          content_id: body.contentId,
          target_platform: body.platform,
          scheduled_at: body.scheduledAt,
          source: 'api',
        }
      })
    }

    return created(toScheduleItem(doc as Record<string, unknown>))
  } catch (err) {
    console.error('[POST /api/schedule]', err)
    return serverError()
  }
}
