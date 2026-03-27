import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../src/app/api/generate/video/route'
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

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('POST /api/generate/video', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    ;(auth as any).mockResolvedValue({ userId: null })
    const req = new Request('http://localhost/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'a sunset timelapse' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when prompt is missing', async () => {
    ;(auth as any).mockResolvedValue({ userId: 'user_1' })
    const req = new Request('http://localhost/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/prompt/i)
  })

  it('generates video via visual-gen and stores in Convex', async () => {
    ;(auth as any).mockResolvedValue({ userId: 'user_1' })
    ;(convexClient.mutation as any).mockResolvedValue('job_xyz')
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ video_url: 'https://example.com/video.mp4', status: 'success' }),
    })

    const req = new Request('http://localhost/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'product launch reveal', style: 'cinematic', duration: 10 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.jobId).toBe('job_xyz')
    expect(data.status).toBe('completed')
    expect(data.videoUrl).toBe('https://example.com/video.mp4')
    expect(data.metadata.style).toBe('cinematic')
    expect(data.metadata.duration).toBe(10)

    expect(convexClient.mutation).toHaveBeenCalledWith(
      'generations:createJob',
      expect.objectContaining({ userId: 'user_1', type: 'video' }),
    )
    expect(convexClient.mutation).toHaveBeenCalledWith(
      'generations:completeJob',
      expect.objectContaining({ id: 'job_xyz' }),
    )
  })

  it('handles generation errors and marks job failed', async () => {
    ;(auth as any).mockResolvedValue({ userId: 'user_1' })
    ;(convexClient.mutation as any).mockResolvedValue('job_xyz')
    mockFetch.mockRejectedValue(new Error('Visual service down'))

    const req = new Request('http://localhost/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test video' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect(convexClient.mutation).toHaveBeenCalledWith(
      'generations:failJob',
      expect.objectContaining({ id: 'job_xyz', error: 'Visual service down' }),
    )
  })

  it('clamps duration to 6-15 second range', async () => {
    ;(auth as any).mockResolvedValue({ userId: 'user_1' })
    ;(convexClient.mutation as any).mockResolvedValue('job_xyz')
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ video_url: 'https://example.com/video.mp4' }),
    })

    const req = new Request('http://localhost/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', duration: 999 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.metadata.duration).toBe(15)
  })
})
