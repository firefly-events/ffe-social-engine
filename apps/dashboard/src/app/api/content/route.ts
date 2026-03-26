/**
 * GET  /api/content — list content items (paginated, filterable)
 * POST /api/content — create a new content item
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  serverError,
  generateId,
  paginate,
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '../../../../convex/_generated/api'
import { getPostHogServer } from '@/lib/posthog-server'
import type {
  ContentItem,
  CreateContentBody,
  ListContentParams,
} from '@/lib/api-types'

/** Map a Convex content document to the public ContentItem shape. */
function toContentItem(doc: Record<string, unknown>): ContentItem {
  return {
    id:        doc.externalId as string,
    userId:    doc.userId as string,
    text:      doc.text as string,
    imageUrl:  doc.imageUrl as string | undefined,
    audioUrl:  doc.audioUrl as string | undefined,
    videoUrl:  doc.videoUrl as string | undefined,
    platforms: doc.platforms as string[],
    status:    doc.status as ContentItem['status'],
    aiModel:   doc.aiModel as string | undefined,
    prompt:    doc.prompt as string | undefined,
    createdAt: new Date(doc.createdAt as number).toISOString(),
    updatedAt: new Date(doc.updatedAt as number).toISOString(),
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const sp = request.nextUrl.searchParams
    const params: ListContentParams = {
      platform: sp.get('platform') as ListContentParams['platform'] ?? undefined,
      status:   sp.get('status')   as ListContentParams['status']   ?? undefined,
      after:    sp.get('after')                                     ?? undefined,
      before:   sp.get('before')                                    ?? undefined,
      cursor:   sp.get('cursor')                                    ?? undefined,
      limit:    Math.min(Number(sp.get('limit') ?? 20), 100),
    }

    const docs = await convexClient.query(api.content.list, {
      userId:   session.userId,
      status:   params.status,
      platform: params.platform,
      after:    params.after  ? new Date(params.after).getTime()  : undefined,
      before:   params.before ? new Date(params.before).getTime() : undefined,
    })

    const items = (docs as Record<string, unknown>[]).map(toContentItem)
    const { page, nextCursor } = paginate(items, params.cursor, params.limit ?? 20)

    return ok({ items: page, nextCursor, total: items.length })
  } catch (err) {
    console.error('[GET /api/content]', err)
    return serverError()
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    let body: CreateContentBody
    try {
      body = await request.json() as CreateContentBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (!body.text?.trim()) {
      return badRequest('text is required')
    }
    if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
      return badRequest('platforms must be a non-empty array')
    }

    const nowMs = Date.now()
    const externalId = generateId('cnt')

    const doc = await convexClient.mutation(api.content.create, {
      externalId,
      userId:    session.userId,
      text:      body.text.trim(),
      imageUrl:  body.imageUrl,
      audioUrl:  body.audioUrl,
      videoUrl:  body.videoUrl,
      platforms: body.platforms,
      status:    body.status ?? 'draft',
      aiModel:   body.aiModel,
      prompt:    body.prompt,
      createdAt: nowMs,
      updatedAt: nowMs,
    })

    const item = toContentItem(doc as Record<string, unknown>)

    const ph = getPostHogServer()
    if (ph) {
      ph.capture({ 
        distinctId: session.userId, 
        event: 'se_api_call_made', 
        properties: { endpoint: '/api/content', method: 'POST' } 
      })
    }

    return created(item)
  } catch (err) {
    console.error('[POST /api/content]', err)
    return serverError()
  }
}
