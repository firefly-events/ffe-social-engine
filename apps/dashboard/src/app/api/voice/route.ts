/**
 * GET    /api/voice    — list voice clones for the authenticated user
 * DELETE /api/voice    — (not on collection level; use /api/voice/[id] instead)
 *
 * TODO(inference): Wire up calls to the Mac Studio inference API over Tailscale.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  unauthorized,
  serverError,
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '../../../../convex/_generated/api'
import type { VoiceClone, VoiceCloneStatus } from '@/lib/api-types'

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

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const docs = await convexClient.query(api.voiceClones.list, { userId: session.userId })
    const clones = (docs as Record<string, unknown>[]).map(toVoiceClone)

    return ok({ items: clones, total: clones.length })
  } catch (err) {
    console.error('[GET /api/voice]', err)
    return serverError()
  }
}
