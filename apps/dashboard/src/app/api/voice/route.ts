/**
 * GET    /api/voice    — list voice clones for the authenticated user
 * DELETE /api/voice    — (not on collection level; use /api/voice/[id] instead)
 *
 * TODO(migration): Replace voiceCloneStore with Convex / MongoDB "voice_clones" collection.
 * TODO(inference): Wire up calls to the Mac Studio inference API over Tailscale.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  unauthorized,
  serverError,
} from '@/lib/api-helpers'
import { voiceCloneStore } from '@/lib/api-store'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    // TODO(migration): → Convex query / MongoDB find({ userId })
    const clones = Array.from(voiceCloneStore.values())
      .filter((c) => c.userId === session.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return ok({ items: clones, total: clones.length })
  } catch (err) {
    console.error('[GET /api/voice]', err)
    return serverError()
  }
}
