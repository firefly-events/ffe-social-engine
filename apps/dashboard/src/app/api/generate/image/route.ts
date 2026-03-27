/**
 * POST /api/generate/image
 *
 * Generates an image from a text prompt.
 * Primary provider: Replicate FLUX.1-schnell (if REPLICATE_API_TOKEN is set)
 * Fallback: visual-gen service (VISUAL_SERVICE_URL)
 *
 * Request body:
 *   prompt      string   required — text description of the image
 *   style       string   optional — "photorealistic" | "illustration" | "abstract" (default: "photorealistic")
 *   aspectRatio string   optional — "1:1" | "16:9" | "9:16" | "4:3" (default: "1:1")
 *
 * Response:
 *   jobId       string   — Convex generationJobs document ID
 *   imageUrl    string   — URL of generated image
 *   provider    string   — which provider was used
 *   metadata    object   — width, height, estimatedCost, promptTokens (if applicable)
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { convexClient } from '@/lib/convex-client'
import { api } from '@convex/_generated/api'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const VISUAL_SERVICE_URL = process.env.VISUAL_SERVICE_URL ?? 'http://localhost:8003'

// FLUX.1-schnell on Replicate — ~$0.003/image
const REPLICATE_MODEL = 'black-forest-labs/flux-schnell'

// Aspect ratio → width/height mapping
const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '1:1':  { width: 1024, height: 1024 },
  '16:9': { width: 1360, height: 768  },
  '9:16': { width: 768,  height: 1360 },
  '4:3':  { width: 1024, height: 768  },
}

async function generateWithReplicate(
  prompt: string,
  style: string,
  aspectRatio: string,
): Promise<{ imageUrl: string; estimatedCost: number }> {
  const dims = ASPECT_DIMENSIONS[aspectRatio] ?? ASPECT_DIMENSIONS['1:1']
  const styledPrompt = style !== 'photorealistic' ? `${style} style, ${prompt}` : prompt

  // Create prediction
  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      input: {
        prompt:  styledPrompt,
        width:   dims.width,
        height:  dims.height,
        num_inference_steps: 4,
        go_fast: true,
      },
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`Replicate create failed: ${createRes.status} ${err}`)
  }

  const prediction = await createRes.json()

  // Poll until complete (max 60s)
  const pollUrl = prediction.urls?.get ?? `https://api.replicate.com/v1/predictions/${prediction.id}`
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 2000))
    const pollRes = await fetch(pollUrl, {
      headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
    })
    if (!pollRes.ok) throw new Error(`Replicate poll failed: ${pollRes.status}`)
    const polled = await pollRes.json()
    if (polled.status === 'succeeded') {
      const imageUrl = Array.isArray(polled.output) ? polled.output[0] : polled.output
      return { imageUrl, estimatedCost: 0.003 }
    }
    if (polled.status === 'failed' || polled.status === 'canceled') {
      throw new Error(`Replicate generation ${polled.status}: ${polled.error ?? ''}`)
    }
  }
  throw new Error('Replicate generation timed out after 60s')
}

async function generateWithVisualService(
  prompt: string,
  style: string,
): Promise<{ imageUrl: string; estimatedCost: number }> {
  const res = await fetch(`${VISUAL_SERVICE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: style !== 'photorealistic' ? `${style}: ${prompt}` : prompt }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Visual service error: ${res.status} ${err}`)
  }
  const data = await res.json()
  // visual-gen returns video_url — use as imageUrl for now (stub)
  return { imageUrl: data.video_url ?? data.image_url ?? '', estimatedCost: 0 }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { prompt?: string; style?: string; aspectRatio?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const prompt = body.prompt?.trim()
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const style       = body.style ?? 'photorealistic'
    const aspectRatio = body.aspectRatio ?? '1:1'
    const dims        = ASPECT_DIMENSIONS[aspectRatio] ?? ASPECT_DIMENSIONS['1:1']

    // Create Convex job
    const jobId = await convexClient.mutation(api.generations.createJob, {
      userId,
      type:   'image',
      topic:  prompt,
      model:  REPLICATE_API_TOKEN ? REPLICATE_MODEL : 'visual-gen-stub',
    })

    try {
      const provider = REPLICATE_API_TOKEN ? 'replicate' : 'visual-gen'
      const { imageUrl, estimatedCost } = REPLICATE_API_TOKEN
        ? await generateWithReplicate(prompt, style, aspectRatio)
        : await generateWithVisualService(prompt, style)

      await convexClient.mutation(api.generations.completeJob, {
        id: jobId,
        result: {
          imageUrl,
          provider,
          metadata: { width: dims.width, height: dims.height, style, aspectRatio, estimatedCost },
        },
      })

      return NextResponse.json({
        jobId,
        imageUrl,
        provider,
        metadata: { width: dims.width, height: dims.height, style, aspectRatio, estimatedCost },
      })
    } catch (genErr: any) {
      console.error('[POST /api/generate/image] generation error:', genErr)
      await convexClient.mutation(api.generations.failJob, {
        id: jobId,
        error: genErr.message ?? 'Image generation failed',
      })
      return NextResponse.json(
        { error: 'Image generation failed', details: genErr.message },
        { status: 500 },
      )
    }
  } catch (err: any) {
    console.error('[POST /api/generate/image]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
