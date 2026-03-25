/**
 * POST /api/voice/clone — upload an audio sample and create a voice clone.
 *
 * The route validates the request and stores a clone record with status
 * "processing". The actual cloning is intended to be handled by the Mac Studio
 * inference service (accessible over Tailscale). For now the status transitions
 * to "ready" immediately to unblock frontend development.
 *
 * TODO(inference): After storing the record, POST to the Mac Studio API:
 *   POST http://<tailscale-hostname>:<port>/api/v1/voice/clone
 *   { sampleUrl, cloneId, userId }
 * Handle the async callback (webhook or polling) to update the status.
 *
 * TODO(storage): Replace base64 inline storage with a GCS/S3 upload and store
 * only the resulting URL in voiceCloneStore / the database.
 *
 * TODO(migration): Replace voiceCloneStore with Convex / MongoDB.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  created,
  badRequest,
  unauthorized,
  serverError,
  generateId,
  nowISO,
} from '@/lib/api-helpers'
import { voiceCloneStore } from '@/lib/api-store'
import type { VoiceClone, CreateVoiceCloneBody } from '@/lib/api-types'

const SUPPORTED_MIME_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm']
const MAX_SAMPLE_SIZE_BYTES = 10 * 1024 * 1024  // 10 MB base64-encoded budget

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

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

    const now = nowISO()
    const clone: VoiceClone = {
      id:          generateId('vc'),
      userId:      session.userId,
      name:        body.name.trim(),
      // TODO(storage): Upload body.audioData to GCS/S3 and store the URL here.
      sampleUrl:   `data:${body.mimeType};base64,${body.audioData}`,
      status:      'processing',
      createdAt:   now,
      updatedAt:   now,
    }

    // TODO(migration): → Convex mutation / MongoDB insertOne
    voiceCloneStore.set(clone.id, clone)

    // TODO(inference): Dispatch async job to Mac Studio inference API over Tailscale.
    // For now, immediately mark as ready so the UI can proceed during development.
    void simulateProcessing(clone.id)

    return created(clone)
  } catch (err) {
    console.error('[POST /api/voice/clone]', err)
    return serverError()
  }
}

/** Placeholder: simulate inference completing after a short delay. Remove when real inference is wired. */
async function simulateProcessing(cloneId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 3000))
  const clone = voiceCloneStore.get(cloneId)
  if (clone) {
    voiceCloneStore.set(cloneId, {
      ...clone,
      status:    'ready',
      updatedAt: nowISO(),
    })
  }
}
