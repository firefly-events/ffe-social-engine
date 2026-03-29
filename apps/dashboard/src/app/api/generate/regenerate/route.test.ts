/**
 * Tests for /api/generate/regenerate route (FIR-1320)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('ai', () => ({
  generateText: vi.fn(),
}))

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn().mockReturnValue('mock-google-model'),
}))

vi.mock('@/lib/convex-client', () => ({
  convexClient: {
    query: vi.fn(),
    mutation: vi.fn(),
  },
}))

vi.mock('@convex/_generated/api', () => ({
  api: {
    generations: {
      listJobs: 'listJobs',
      createJob: 'createJob',
      completeJob: 'completeJob',
      failJob: 'failJob',
    },
  },
}))

// ── Imports after mocks ───────────────────────────────────────────────────────

import { auth } from '@clerk/nextjs/server'
import { generateText } from 'ai'
import { convexClient } from '@/lib/convex-client'
import { POST } from './route'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/generate/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/generate/regenerate', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const res = await POST(makeRequest({ jobId: 'job_1', type: 'text' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when jobId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const res = await POST(makeRequest({ type: 'text' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('jobId is required')
  })

  it('returns 400 when type is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const res = await POST(makeRequest({ jobId: 'job_1', type: 'audio' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/type must be/)
  })

  it('returns 404 when the original job is not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
    vi.mocked(convexClient.query).mockResolvedValue([])

    const res = await POST(makeRequest({ jobId: 'job_nonexistent', type: 'text' }))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Job not found')
  })

  it('returns 404 when user B tries to regenerate user A\'s job', async () => {
    // Auth returns user_2, but the job belongs to user_1
    vi.mocked(auth).mockResolvedValue({ userId: 'user_2' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const mockJob = {
      _id: 'job_1',
      userId: 'user_1',
      topic: 'Summer Festival',
      platform: 'instagram',
      model: 'gemini-1.5-flash',
    }
    vi.mocked(convexClient.query).mockResolvedValue([mockJob])

    const res = await POST(makeRequest({ jobId: 'job_1', type: 'text' }))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Job not found')
  })

  it('creates a new generation job and returns variations for text type', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const mockJob = {
      _id: 'job_1',
      userId: 'user_1',
      topic: 'Summer Festival',
      platform: 'instagram',
      model: 'gemini-1.5-flash',
    }
    vi.mocked(convexClient.query).mockResolvedValue([mockJob])
    vi.mocked(convexClient.mutation).mockResolvedValueOnce('new_job_id')
    vi.mocked(convexClient.mutation).mockResolvedValueOnce(undefined)

    vi.mocked(generateText).mockResolvedValue({
      text: '{"short":"Fresh caption","long":"Longer post...","hashtags":"#test"}',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    } as Awaited<ReturnType<typeof generateText>>)

    const res = await POST(makeRequest({ jobId: 'job_1', type: 'text' }))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.jobId).toBe('new_job_id')
    expect(body.parentJobId).toBe('job_1')
    expect(body.type).toBe('text')
    expect(body.variations).toBeDefined()
    expect(body.usage).toBeDefined()
  })

  it('returns stub response for image type', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const mockJob = {
      _id: 'job_1',
      userId: 'user_1',
      topic: 'Festival',
      model: 'flux-schnell',
    }
    vi.mocked(convexClient.query).mockResolvedValue([mockJob])
    vi.mocked(convexClient.mutation).mockResolvedValueOnce('new_job_id_img')
    vi.mocked(convexClient.mutation).mockResolvedValueOnce(undefined)

    const res = await POST(makeRequest({ jobId: 'job_1', type: 'image' }))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.stub).toBe(true)
    expect(body.type).toBe('image')
  })

  it('marks job as failed and returns 500 on generation error', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)

    const mockJob = {
      _id: 'job_1',
      userId: 'user_1',
      topic: 'Festival',
      model: 'gemini-1.5-flash',
    }
    vi.mocked(convexClient.query).mockResolvedValue([mockJob])
    vi.mocked(convexClient.mutation).mockResolvedValueOnce('new_job_id_fail')
    vi.mocked(generateText).mockRejectedValue(new Error('AI service unavailable'))
    vi.mocked(convexClient.mutation).mockResolvedValueOnce(undefined)

    const res = await POST(makeRequest({ jobId: 'job_1', type: 'text' }))
    expect(res.status).toBe(500)

    const body = await res.json()
    expect(body.error).toBe('Regeneration failed')
  })
})
