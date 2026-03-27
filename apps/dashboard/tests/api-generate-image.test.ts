import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../src/app/api/generate/image/route'
import { auth } from '@clerk/nextjs/server'
import { convexClient } from '@/lib/convex-client'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))

vi.mock('@/lib/convex-client', () => ({
  convexClient: { mutation: vi.fn() },
}))

vi.mock('@convex/_generated/api', () => ({
  api: {
    generations: {
      createJob:   'generations:createJob',
      completeJob: 'generations:completeJob',
      failJob:     'generations:failJob',
    },
  },
}))

// Stub fetch so no real HTTP calls happen
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('POST /api/generate/image', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // No REPLICATE_API_TOKEN → falls through to visual-gen stub
    delete process.env.REPLICATE_API_TOKEN
  })

  it('returns 401 when unauthenticated', async () => {
    ;(auth as any).mockResolvedValue({ userId: null })
    const req = new Request('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'sunset over mountains' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when prompt is missing', async () => {
    ;(auth as any).mockResolvedValue({ userId: 'user_1' })
    const req = new Request('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/prompt/i)
  })

  it('generates image via visual-gen fallback and stores in Convex', async () => {
    ;(auth as any).mockResolvedValue({ userId: 'user_1' })
    ;(convexClient.mutation as any).mockResolvedValue('job_abc')
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ video_url: 'https://example.com/image.png' }),
    })

    const req = new Request('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'a futuristic city', style: 'illustration', aspectRatio: '16:9' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.jobId).toBe('job_abc')
    expect(data.imageUrl).toBe('https://example.com/image.png')
    expect(data.provider).toBe('visual-gen')
    expect(data.metadata.style).toBe('illustration')

    expect(convexClient.mutation).toHaveBeenCalledWith(
      'generations:createJob',
      expect.objectContaining({ userId: 'user_1', topic: 'a futuristic city' }),
    )
    expect(convexClient.mutation).toHaveBeenCalledWith(
      'generations:completeJob',
      expect.objectContaining({ id: 'job_abc' }),
    )
  })

  it('handles generation errors and marks job failed', async () => {
    ;(auth as any).mockResolvedValue({ userId: 'user_1' })
    ;(convexClient.mutation as any).mockResolvedValue('job_abc')
    mockFetch.mockRejectedValue(new Error('Service down'))

    const req = new Request('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect(convexClient.mutation).toHaveBeenCalledWith(
      'generations:failJob',
      expect.objectContaining({ id: 'job_abc', error: 'Service down' }),
    )
  })
})
