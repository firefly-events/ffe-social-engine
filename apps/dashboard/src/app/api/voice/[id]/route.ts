/**
 * GET    /api/voice/[id] — fetch a single voice clone
 * DELETE /api/voice/[id] — remove a voice clone
 *
 * TODO(migration): Replace voiceCloneStore with Convex / MongoDB.
 * TODO(inference): On DELETE, also call Mac Studio API to free model resources.
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
import { voiceCloneStore } from '@/lib/api-store'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    // TODO(migration): → Convex query / MongoDB findOne
    const clone = voiceCloneStore.get(id)
    if (!clone) return notFound('Voice clone')

    if (!assertOwner(clone.userId, session.userId)) return forbidden()

    return ok(clone)
  } catch (err) {
    console.error('[GET /api/voice/[id]]', err)
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
    const clone = voiceCloneStore.get(id)
    if (!clone) return notFound('Voice clone')

    if (!assertOwner(clone.userId, session.userId)) return forbidden()

    if (clone.status === 'processing') {
      return badRequest('Cannot delete a voice clone that is still being processed')
    }

    // TODO(inference): Notify Mac Studio inference API to release the model resources.
    // TODO(storage): Delete the sample audio file from GCS/S3.

    // TODO(migration): → Convex mutation / MongoDB deleteOne
    voiceCloneStore.delete(id)

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/voice/[id]]', err)
    return serverError()
  }
}
