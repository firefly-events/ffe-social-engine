/**
 * GET /api/voice — list voice clones for the authenticated user.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '../../../../convex/_generated/api'
import {
  ok,
  unauthorized,
  serverError,
} from '@/lib/api-helpers'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const clones = await fetchQuery(api.voices.getVoiceClonesByUser, {
      userId: session.userId,
    })

    // Map Convex documents to API shape (createdAt/updatedAt as ISO strings)
    const items = clones.map((c) => ({
      id:              c._id,
      userId:          c.userId,
      name:            c.name,
      voiceId:         c.voiceId,
      sampleUrl:       c.sampleUrl,
      status:          c.status,
      errorMessage:    c.errorMessage,
      durationSeconds: c.durationSeconds,
      createdAt:       new Date(c.createdAt).toISOString(),
      updatedAt:       new Date(c.updatedAt).toISOString(),
    }))

    return ok({ items, total: items.length })
  } catch (err) {
    console.error('[GET /api/voice]', err)
    return serverError()
  }
}
