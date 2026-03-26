/**
 * GET    /api/voice/[id] — fetch a single voice clone
 * DELETE /api/voice/[id] — remove a voice clone
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { fetchQuery, fetchMutation } from 'convex/nextjs'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import {
  ok,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params

    let clone: Awaited<ReturnType<typeof fetchQuery<typeof api.voices.getVoiceCloneById>>>
    try {
      clone = await fetchQuery(api.voices.getVoiceCloneById, {
        id:     id as Id<'voice_clones'>,
        userId: session.userId,
      })
    } catch {
      return notFound('Voice clone')
    }

    if (!clone) return notFound('Voice clone')
    if (clone.userId !== session.userId) return forbidden()

    return ok({
      id:              clone._id,
      userId:          clone.userId,
      name:            clone.name,
      voiceId:         clone.voiceId,
      sampleUrl:       clone.sampleUrl,
      status:          clone.status,
      errorMessage:    clone.errorMessage,
      durationSeconds: clone.durationSeconds,
      createdAt:       new Date(clone.createdAt).toISOString(),
      updatedAt:       new Date(clone.updatedAt).toISOString(),
    })
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

    let clone: Awaited<ReturnType<typeof fetchQuery<typeof api.voices.getVoiceCloneById>>>
    try {
      clone = await fetchQuery(api.voices.getVoiceCloneById, {
        id:     id as Id<'voice_clones'>,
        userId: session.userId,
      })
    } catch {
      return notFound('Voice clone')
    }

    if (!clone) return notFound('Voice clone')
    if (clone.userId !== session.userId) return forbidden()

    if (clone.status === 'processing') {
      return badRequest('Cannot delete a voice clone that is still being processed')
    }

    await fetchMutation(api.voices.deleteVoiceClone, {
      id:     id as Id<'voice_clones'>,
      userId: session.userId,
    })

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/voice/[id]]', err)
    return serverError()
  }
}
