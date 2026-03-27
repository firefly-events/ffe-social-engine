/**
 * POST /api/generate/video
 *
 * Starts a video generation job from a text prompt.
 * Uses the visual-gen FastAPI service (VISUAL_SERVICE_URL) by default.
 * Future: Hailuo API / Replicate video models.
 *
 * Request body:
 *   prompt    string   required — description of the video
 *   style     string   optional — "cinematic" | "animation" | "social" (default: "social")
 *   duration  number   optional — target duration in seconds, 6–15 (default: 6)
 *
 * Response (while processing is synchronous stub):
 *   jobId     string   — Convex generationJobs ID (use for polling)
 *   status    string   — "completed" | "pending" | "failed"
 *   videoUrl  string?  — present when status = "completed"
 *   metadata  object
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { convexClient } from '@/lib/convex-client'
import { api } from '@convex/_generated/api'

const VISUAL_SERVICE_URL = process.env.VISUAL_SERVICE_URL ?? 'http://localhost:8003'
const MAX_DURATION = 15
const MIN_DURATION = 6

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { prompt?: string; style?: string; duration?: number }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const prompt = body.prompt?.trim()
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const style    = body.style ?? 'social'
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, body.duration ?? 6))

    // Create Convex job (status: pending)
    const jobId = await convexClient.mutation(api.generations.createJob, {
      userId,
      type:  'video',
      topic: prompt,
      model: 'visual-gen',
    })

    try {
      // Call visual-gen service (currently synchronous stub)
      const res = await fetch(`${VISUAL_SERVICE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: style !== 'social' ? `${style} style video: ${prompt}` : prompt,
          duration,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Visual service error: ${res.status} ${errText}`)
      }

      const data = await res.json()
      const videoUrl = data.video_url ?? ''

      await convexClient.mutation(api.generations.completeJob, {
        id: jobId,
        result: {
          videoUrl,
          provider: 'visual-gen',
          metadata: { style, duration, estimatedCost: 0 },
        },
      })

      return NextResponse.json({
        jobId,
        status:   'completed',
        videoUrl,
        metadata: { style, duration, estimatedCost: 0 },
      })
    } catch (genErr: any) {
      console.error('[POST /api/generate/video] generation error:', genErr)
      await convexClient.mutation(api.generations.failJob, {
        id: jobId,
        error: genErr.message ?? 'Video generation failed',
      })
      return NextResponse.json(
        { error: 'Video generation failed', details: genErr.message },
        { status: 500 },
      )
    }
  } catch (err: any) {
    console.error('[POST /api/generate/video]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
