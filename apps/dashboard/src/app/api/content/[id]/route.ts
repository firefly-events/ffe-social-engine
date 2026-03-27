/**
 * GET    /api/content/[id] — fetch a single content item
 * PATCH  /api/content/[id] — update a content item
 * DELETE /api/content/[id] — delete a content item
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
import { api } from '@convex/_generated/api'
import type { ContentItem, UpdateContentBody } from '@/lib/api-types'

interface RouteContext {
  params: Promise<{ id: string }>
}

/** Map a Convex content document to the public ContentItem shape. */
function toContentItem(doc: Record<string, unknown>): ContentItem {
  return {
    id:        doc.externalId as string,
    userId:    doc.userId as string,
    text:      doc.text as string,
    imageUrl:  doc.imageUrl as string | undefined,
    audioUrl:  doc.audioUrl as string | undefined,
    videoUrl:  doc.videoUrl as string | undefined,
    platforms: doc.platforms as import('@/types/export').Platform[],
    status:    doc.status as ContentItem['status'],
    aiModel:   doc.aiModel as string | undefined,
    prompt:    doc.prompt as string | undefined,
    createdAt: new Date(doc.createdAt as number).toISOString(),
    updatedAt: new Date(doc.updatedAt as number).toISOString(),
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const doc = await convexClient.query(api.content.getByExternalId, { externalId: id })
    if (!doc) return notFound('Content')

    const item = toContentItem(doc as Record<string, unknown>)
    if (!assertOwner(item.userId, session.userId)) return forbidden()

    return ok(item)
  } catch (err) {
    console.error('[GET /api/content/[id]]', err)
    return serverError()
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const existing = await convexClient.query(api.content.getByExternalId, { externalId: id })
    if (!existing) return notFound('Content')

    const existingItem = toContentItem(existing as Record<string, unknown>)
    if (!assertOwner(existingItem.userId, session.userId)) return forbidden()

    let body: UpdateContentBody
    try {
      body = await request.json() as UpdateContentBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (body.platforms !== undefined && body.platforms.length === 0) {
      return badRequest('platforms must not be empty')
    }

    const updated = await convexClient.mutation(api.content.update, {
      externalId: id,
      ...(body.text      !== undefined && { text:      body.text.trim() }),
      ...(body.imageUrl  !== undefined && { imageUrl:  body.imageUrl }),
      ...(body.audioUrl  !== undefined && { audioUrl:  body.audioUrl }),
      ...(body.videoUrl  !== undefined && { videoUrl:  body.videoUrl }),
      ...(body.platforms !== undefined && { platforms: body.platforms }),
      ...(body.status    !== undefined && { status:    body.status }),
      ...(body.aiModel   !== undefined && { aiModel:   body.aiModel }),
      ...(body.prompt    !== undefined && { prompt:    body.prompt }),
      updatedAt: Date.now(),
    })

    if (!updated) return notFound('Content')

    return ok(toContentItem(updated as Record<string, unknown>))
  } catch (err) {
    console.error('[PATCH /api/content/[id]]', err)
    return serverError()
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const doc = await convexClient.query(api.content.getByExternalId, { externalId: id })
    if (!doc) return notFound('Content')

    const item = toContentItem(doc as Record<string, unknown>)
    if (!assertOwner(item.userId, session.userId)) return forbidden()

    await convexClient.mutation(api.content.remove, { externalId: id })

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/content/[id]]', err)
    return serverError()
  }
}
