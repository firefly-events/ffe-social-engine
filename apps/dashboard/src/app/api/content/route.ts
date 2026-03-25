/**
 * GET  /api/content — list content items (paginated, filterable)
 * POST /api/content — create a new content item
 *
 * TODO(migration): Replace contentStore Map calls with Convex queries/mutations
 * or MongoDB driver calls against the "content" collection.
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
  nowISO,
} from '@/lib/api-helpers'
import { contentStore } from '@/lib/api-store'
import { getPostHogServer } from '@/lib/posthog-server'
import type {
  ContentItem,
  CreateContentBody,
  ListContentParams,
} from '@/lib/api-types'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const sp = request.nextUrl.searchParams
    const params: ListContentParams = {
      platform:  sp.get('platform')  as ListContentParams['platform']  ?? undefined,
      status:    sp.get('status')    as ListContentParams['status']    ?? undefined,
      after:     sp.get('after')                                       ?? undefined,
      before:    sp.get('before')                                      ?? undefined,
      cursor:    sp.get('cursor')                                      ?? undefined,
      limit:     Math.min(Number(sp.get('limit') ?? 20), 100),
    }

    // TODO(migration): push these filters into a Convex query / MongoDB $match stage
    let items = Array.from(contentStore.values())
      .filter((c) => c.userId === session.userId)

    if (params.platform) {
      items = items.filter((c) => c.platforms.includes(params.platform!))
    }
    if (params.status) {
      items = items.filter((c) => c.status === params.status)
    }
    if (params.after) {
      const after = new Date(params.after).getTime()
      items = items.filter((c) => new Date(c.createdAt).getTime() > after)
    }
    if (params.before) {
      const before = new Date(params.before).getTime()
      items = items.filter((c) => new Date(c.createdAt).getTime() < before)
    }

    // Sort newest-first before paginating
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const { page, nextCursor } = paginate(items, params.cursor, params.limit ?? 20)

    return ok({
      items:      page,
      nextCursor,
      total:      items.length,
    })
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

    const now  = nowISO()
    const item: ContentItem = {
      id:        generateId('cnt'),
      userId:    session.userId,
      text:      body.text.trim(),
      imageUrl:  body.imageUrl,
      audioUrl:  body.audioUrl,
      videoUrl:  body.videoUrl,
      platforms: body.platforms,
      status:    body.status ?? 'draft',
      aiModel:   body.aiModel,
      prompt:    body.prompt,
      createdAt: now,
      updatedAt: now,
    }

    // TODO(migration): contentStore.set → Convex mutation / MongoDB insertOne
    contentStore.set(item.id, item)

    const ph = getPostHogServer()
    ph.capture({ distinctId: session.userId, event: 'api_call_made', properties: { endpoint: '/api/content', method: 'POST' } })

    return created(item)
  } catch (err) {
    console.error('[POST /api/content]', err)
    return serverError()
  }
}
