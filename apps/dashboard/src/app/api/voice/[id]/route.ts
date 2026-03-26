/**
 * GET    /api/voice/[id] — fetch a single voice clone
 * DELETE /api/voice/[id] — remove a voice clone
 *
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
import { convexClient } from '@/lib/convex-client'
import { api } from '../../../../../convex/_generated/api'
import type { VoiceClone, VoiceCloneStatus } from '@/lib/api-types'

interface RouteContext {
  params: Promise<{ id: string }>
}

/** Map a Convex voice_clones document to the public VoiceClone shape. */
function toVoiceClone(doc: Record<string, unknown>): VoiceClone {
  return {
    id:              doc.externalId as string,
    userId:          doc.userId as string,
    name:            doc.name as string,
    sampleUrl:       doc.sampleUrl as string,
    status:          doc.status as VoiceCloneStatus,
    durationSeconds: doc.durationSeconds as number | undefined,
    errorMessage:    doc.errorMessage as string | undefined,
    createdAt:       new Date(doc.createdAt as number).toISOString(),
    updatedAt:       new Date(doc.updatedAt as number).toISOString(),
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const doc = await convexClient.query(api.voiceClones.getByExternalId, { externalId: id })
    if (!doc) return notFound('Voice clone')

    const clone = toVoiceClone(doc as Record<string, unknown>)
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
    const doc = await convexClient.query(api.voiceClones.getByExternalId, { externalId: id })
    if (!doc) return notFound('Voice clone')

    const clone = toVoiceClone(doc as Record<string, unknown>)
    if (!assertOwner(clone.userId, session.userId)) return forbidden()

    if (clone.status === 'processing') {
      return badRequest('Cannot delete a voice clone that is still being processed')
    }

    // TODO(inference): Notify Mac Studio inference API to release the model resources.
    // TODO(storage): Delete the sample audio file from GCS/S3.

    await convexClient.mutation(api.voiceClones.remove, { externalId: id })

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/voice/[id]]', err)
    return serverError()
  }
}
