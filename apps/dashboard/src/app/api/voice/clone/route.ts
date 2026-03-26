/**
 * POST /api/voice/clone — upload an audio sample and create a voice clone.
 *
 * Converts the base64 audio payload to a WAV blob, uploads it to the
 * XTTSv2 voice-gen service (POST /voices), stores the resulting record
 * in Convex, and returns the Convex _id as the clone identifier.
 *
 * The voice-gen /voices endpoint is synchronous — it stores the WAV file
 * and returns immediately, so we mark the clone "ready" right away.
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@convex/_generated/api'
import {
  created,
  badRequest,
  unauthorized,
  serverError,
} from '@/lib/api-helpers'
import type { CreateVoiceCloneBody } from '@/lib/api-types'

const SUPPORTED_MIME_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm']
const MAX_SAMPLE_SIZE_BYTES = 10 * 1024 * 1024  // 10 MB base64-encoded budget

const VOICE_GEN_URL = process.env.VOICE_GEN_URL ?? 'http://localhost:8002'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { has } = session
    if (!has({ feature: 'voice_cloning' })) {
      return NextResponse.json({ error: 'Upgrade to Pro to use voice cloning' }, { status: 402 })
    }

    let body: CreateVoiceCloneBody
    try {
      body = await request.json() as CreateVoiceCloneBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (!body.name?.trim()) {
      return badRequest('name is required')
    }
    if (!body.audioData) {
      return badRequest('audioData is required')
    }
    if (!body.mimeType || !SUPPORTED_MIME_TYPES.includes(body.mimeType)) {
      return badRequest(`mimeType must be one of: ${SUPPORTED_MIME_TYPES.join(', ')}`)
    }
    if (body.audioData.length > MAX_SAMPLE_SIZE_BYTES) {
      return badRequest('Audio sample exceeds the 10 MB size limit')
    }

    // Decode base64 audio to binary
    const audioBuffer = Buffer.from(body.audioData, 'base64')
    const audioBlob = new Blob([audioBuffer], { type: body.mimeType })

    // Generate a stable voice_id — used as the filename stem on the voice-gen service
    const safeUserId = session.userId.replace(/[^a-z0-9]/gi, '_')
    const voiceId = `${safeUserId}_${Date.now()}`
    const fileName = `${voiceId}.wav`

    // Upload to voice-gen service via multipart form
    // POST /voices expects: file (UploadFile) + voice_id (Form field)
    const form = new FormData()
    form.append('file', audioBlob, fileName)
    form.append('voice_id', voiceId)

    let voiceGenResponse: Response
    try {
      voiceGenResponse = await fetch(`${VOICE_GEN_URL}/voices`, {
        method: 'POST',
        body: form,
      })
    } catch (fetchErr) {
      console.error('[POST /api/voice/clone] voice-gen fetch error:', fetchErr)
      return serverError('Voice generation service is unavailable')
    }

    if (!voiceGenResponse.ok) {
      const detail = await voiceGenResponse.text().catch(() => '')
      console.error('[POST /api/voice/clone] voice-gen error:', voiceGenResponse.status, detail)
      return serverError('Voice generation service returned an error')
    }

    // Store in Convex — voice-gen is synchronous so we mark as "ready" immediately
    const sampleUrl = `data:${body.mimeType};base64,${body.audioData}`
    const nowMs = Date.now()
    const cloneId = await fetchMutation(api.voiceClones.create, {
      externalId: `vc_${voiceId}`,
      userId:    session.userId,
      name:      body.name.trim(),
      sampleUrl,
      status:    'ready',
      createdAt: nowMs,
      updatedAt: nowMs,
    })

    const now = new Date().toISOString()
    return created({
      id:        cloneId,
      userId:    session.userId,
      name:      body.name.trim(),
      voiceId,
      sampleUrl,
      status:    'ready',
      createdAt: now,
      updatedAt: now,
    })
  } catch (err) {
    console.error('[POST /api/voice/clone]', err)
    return serverError()
  }
}
