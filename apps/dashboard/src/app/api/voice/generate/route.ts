/**
 * POST /api/voice/generate — generate TTS audio from a voice clone.
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { badRequest, unauthorized, serverError } from '@/lib/api-helpers'

const VOICE_GEN_URL = process.env.VOICE_GEN_URL ?? 'http://localhost:8002'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { text, voiceId } = await request.json()

    if (!text) return badRequest('text is required')
    if (!voiceId) return badRequest('voiceId is required')

    const voiceGenResponse = await fetch(`${VOICE_GEN_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_id: voiceId }),
    })

    if (!voiceGenResponse.ok) {
      const detail = await voiceGenResponse.text().catch(() => '')
      console.error('[POST /api/voice/generate] voice-gen error:', voiceGenResponse.status, detail)
      return serverError('Voice generation service returned an error')
    }

    // Stream the audio back to the client
    const headers = new Headers()
    headers.set('Content-Type', 'audio/wav')
    const readableStream = voiceGenResponse.body
    return new Response(readableStream, { headers })

  } catch (err) {
    console.error('[POST /api/voice/generate]', err)
    return serverError()
  }
}
