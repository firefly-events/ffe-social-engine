/**
 * POST /api/voice/generate — generate speech from a voice clone.
 *
 * Looks up the clone in Convex, validates ownership and "ready" status,
 * then calls the XTTSv2 voice-gen service (POST /generate) and proxies
 * the audio stream back to the client.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api-helpers'
import type { GenerateVoiceBody } from '@/lib/api-types'

const MAX_TEXT_LENGTH = 5000
const VOICE_GEN_URL = process.env.VOICE_GEN_URL ?? 'http://localhost:8002'

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

    if (!body.cloneId)      return badRequest('cloneId is required')
    if (!body.text?.trim()) return badRequest('text is required')
    if (body.text.length > MAX_TEXT_LENGTH) {
      return badRequest(`text must not exceed ${MAX_TEXT_LENGTH} characters`)
    }

    const speed = body.speed ?? 1.0
    if (speed < 0.5 || speed > 2.0) {
      return badRequest('speed must be between 0.5 and 2.0')
    }

    // Look up clone in Convex and validate ownership
    let clone: Awaited<ReturnType<typeof fetchQuery<typeof api.voices.getVoiceCloneById>>>
    try {
      clone = await fetchQuery(api.voices.getVoiceCloneById, {
        id:     body.cloneId as Id<'voice_clones'>,
        userId: session.userId,
      })
    } catch {
      return notFound('Voice clone')
    }

    if (!clone) return notFound('Voice clone')

    if (clone.userId !== session.userId) return forbidden()

    if (clone.status !== 'ready') {
      return badRequest(`Voice clone is not ready (current status: ${clone.status})`)
    }

    // Call voice-gen service — POST /generate returns an audio/wav stream
    let voiceGenResponse: Response
    try {
      voiceGenResponse = await fetch(`${VOICE_GEN_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_id: clone.voiceId,
          text:     body.text.trim(),
          speed,
          language: 'en',
        }),
      })
    } catch (fetchErr) {
      console.error('[POST /api/voice/generate] voice-gen fetch error:', fetchErr)
      return serverError('Voice generation service is unavailable')
    }

    if (!voiceGenResponse.ok) {
      const detail = await voiceGenResponse.text().catch(() => '')
      console.error('[POST /api/voice/generate] voice-gen error:', voiceGenResponse.status, detail)
      if (voiceGenResponse.status === 404) return notFound('Voice ID on generation service')
      return serverError('Voice generation service returned an error')
    }

    // Proxy the audio stream back to the client
    const audioBuffer = await voiceGenResponse.arrayBuffer()
    const filename = `voice-${clone.voiceId}-${Date.now()}.wav`

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'audio/wav',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(audioBuffer.byteLength),
      },
    })
  } catch (err) {
    console.error('[POST /api/voice/generate]', err)
    return serverError()
  }
}
