import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { created, badRequest, unauthorized, serverError } from '@/lib/api-helpers'
import type { ComposeRequest } from '@/lib/api-types'

const COMPOSER_URL = process.env.COMPOSER_SERVICE_URL ?? 'http://localhost:8003'
const VALID_FORMATS = new Set(['9:16', '16:9', '1:1'])

const isValidUrl = (s: string): boolean => { try { new URL(s); return true } catch { return false } }

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    let body: ComposeRequest
    try { body = await request.json() as ComposeRequest } catch { return badRequest('Invalid JSON body') }

    if (!body.videoUrl?.trim()) return badRequest('videoUrl is required')
    if (!isValidUrl(body.videoUrl)) return badRequest('videoUrl must be a valid URL')
    if (!body.platform?.trim()) return badRequest('platform is required')
    if (!body.format || !VALID_FORMATS.has(body.format)) {
      return badRequest(`format must be one of: ${[...VALID_FORMATS].join(', ')}`)
    }

    let upstream: Response
    try {
      upstream = await fetch(`${COMPOSER_URL}/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: body.videoUrl,
          format: body.format,
          text_overlay: body.textOverlay ? { text: body.textOverlay } : undefined,
        }),
      })
    } catch { return serverError('Composer service unreachable') }

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}))
      return serverError(err.error ?? 'Composer service returned an error')
    }

    const data = await upstream.json()
    return created({ id: data.id, status: data.status, message: data.message })
  } catch (err) {
    console.error('[POST /api/compose]', err)
    return serverError()
  }
}