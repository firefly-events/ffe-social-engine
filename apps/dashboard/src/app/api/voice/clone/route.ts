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
 * only the resulting URL in the database.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  created,
  badRequest,
  unauthorized,
  serverError,
  generateId,
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '../../../../../convex/_generated/api'
import type { VoiceClone, VoiceCloneStatus, CreateVoiceCloneBody } from '@/lib/api-types'

const SUPPORTED_MIME_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm']
const MAX_SAMPLE_SIZE_BYTES = 10 * 1024 * 1024  // 10 MB base64-encoded budget

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

    const nowMs = Date.now()
    const externalId = generateId('vc')

    const doc = await convexClient.mutation(api.voiceClones.create, {
      externalId,
      userId:    session.userId,
      name:      body.name.trim(),
      // TODO(storage): Upload body.audioData to GCS/S3 and store the URL here.
      sampleUrl: `data:${body.mimeType};base64,${body.audioData}`,
      status:    'processing',
      createdAt: nowMs,
      updatedAt: nowMs,
    })

    const clone = toVoiceClone(doc as Record<string, unknown>)

    // TODO(inference): Dispatch async job to Mac Studio inference API over Tailscale.
    // For now, immediately mark as ready so the UI can proceed during development.
    void simulateProcessing(externalId)

    return created(clone)
  } catch (err) {
    console.error('[POST /api/voice/clone]', err)
    return serverError()
  }
}

/** Placeholder: simulate inference completing after a short delay. Remove when real inference is wired. */
async function simulateProcessing(externalId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 3000))
  await convexClient.mutation(api.voiceClones.update, {
    externalId,
    status:    'ready',
    updatedAt: Date.now(),
  })
}

