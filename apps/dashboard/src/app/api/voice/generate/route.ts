/**
 * POST /api/voice/generate — generate speech from a voice clone.
 *
 * Validates the clone exists and is ready, then delegates to the Mac Studio
 * inference API over Tailscale. Returns a URL to the generated audio file.
 *
 * TODO(inference): Replace the stub response with a real call to:
 *   POST http://<tailscale-hostname>:<port>/api/v1/voice/generate
 *   { cloneId, text, speed, format }
 * The inference service should return { audioUrl, durationSeconds }.
 *
 * TODO(storage): Store generated audio files in GCS/S3 and return a signed URL.
 *
 * TODO(migration): Replace voiceCloneStore with Convex / MongoDB reads.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  assertOwner,
} from '@/lib/api-helpers'
import { voiceCloneStore } from '@/lib/api-store'
import type { GenerateVoiceBody, GenerateVoiceResult } from '@/lib/api-types'

const MAX_TEXT_LENGTH = 5000

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    let body: GenerateVoiceBody
    try {
      body = await request.json() as GenerateVoiceBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (!body.cloneId)     return badRequest('cloneId is required')
    if (!body.text?.trim()) return badRequest('text is required')
    if (body.text.length > MAX_TEXT_LENGTH) {
      return badRequest(`text must not exceed ${MAX_TEXT_LENGTH} characters`)
    }

    const format = body.format ?? 'mp3'
    if (!['mp3', 'wav', 'ogg'].includes(format)) {
      return badRequest('format must be one of: mp3, wav, ogg')
    }

    const speed = body.speed ?? 1.0
    if (speed < 0.5 || speed > 2.0) {
      return badRequest('speed must be between 0.5 and 2.0')
    }

    // TODO(migration): → Convex query / MongoDB findOne
    const clone = voiceCloneStore.get(body.cloneId)
    if (!clone) return notFound('Voice clone')

    if (!assertOwner(clone.userId, session.userId)) return forbidden()

    if (clone.status !== 'ready') {
      return badRequest(`Voice clone is not ready (current status: ${clone.status})`)
    }

    // TODO(inference): Call Mac Studio inference API over Tailscale here.
    // Stub response for frontend development:
    const result: GenerateVoiceResult = {
      audioUrl:        `/api/voice/generated/${body.cloneId}-${Date.now()}.${format}`,
      durationSeconds: Math.ceil(body.text.split(' ').length / 2.5 / speed), // rough WPM estimate
      format,
    }

    return ok(result)
  } catch (err) {
    console.error('[POST /api/voice/generate]', err)
    return serverError()
  }
}
