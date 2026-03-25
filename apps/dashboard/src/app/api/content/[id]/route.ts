/**
 * GET    /api/content/[id] — fetch a single content item
 * PATCH  /api/content/[id] — update a content item
 * DELETE /api/content/[id] — delete a content item
 *
 * TODO(migration): Replace contentStore calls with Convex / MongoDB operations.
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
import { contentStore } from '@/lib/api-store'
import type { UpdateContentBody } from '@/lib/api-types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    // TODO(migration): contentStore.get → Convex query / MongoDB findOne({ _id: id })
    const item = contentStore.get(id)
    if (!item) return notFound('Content')

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
    // TODO(migration): → Convex / MongoDB findOne
    const item = contentStore.get(id)
    if (!item) return notFound('Content')

    if (!assertOwner(item.userId, session.userId)) return forbidden()

    let body: UpdateContentBody
    try {
      body = await request.json() as UpdateContentBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (body.platforms !== undefined && body.platforms.length === 0) {
      return badRequest('platforms must not be empty')
    }

    const updated = {
      ...item,
      ...(body.text      !== undefined && { text:      body.text.trim() }),
      ...(body.imageUrl  !== undefined && { imageUrl:  body.imageUrl }),
      ...(body.audioUrl  !== undefined && { audioUrl:  body.audioUrl }),
      ...(body.videoUrl  !== undefined && { videoUrl:  body.videoUrl }),
      ...(body.platforms !== undefined && { platforms: body.platforms }),
      ...(body.status    !== undefined && { status:    body.status }),
      ...(body.aiModel   !== undefined && { aiModel:   body.aiModel }),
      ...(body.prompt    !== undefined && { prompt:    body.prompt }),
      updatedAt: nowISO(),
    }

    // TODO(migration): → Convex mutation / MongoDB updateOne
    contentStore.set(id, updated)

    return ok(updated)
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
    // TODO(migration): → Convex / MongoDB findOne
    const item = contentStore.get(id)
    if (!item) return notFound('Content')

    if (!assertOwner(item.userId, session.userId)) return forbidden()

    // TODO(migration): → Convex mutation / MongoDB deleteOne
    contentStore.delete(id)

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/content/[id]]', err)
    return serverError()
  }
}
