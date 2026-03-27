import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))
vi.mock('@/lib/convex-client', () => ({
  convexClient: {
    query: vi.fn(),
    mutation: vi.fn(),
  },
}))
vi.mock('@convex/_generated/api', () => ({
  api: {
    users: { getByClerkId: 'users:getByClerkId' },
    storageQuota: { checkAndIncrement: 'storageQuota:checkAndIncrement', decrement: 'storageQuota:decrement' },
    media: { generateUploadUrl: 'media:generateUploadUrl', saveUploadedFile: 'media:saveUploadedFile' },
  },
}))

import { auth } from '@clerk/nextjs/server'
import { convexClient } from '@/lib/convex-client'
import { POST } from './route'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockConvex = convexClient as { query: ReturnType<typeof vi.fn>; mutation: ReturnType<typeof vi.fn> }

describe('POST /api/content/upload', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })
    const req = new Request('http://localhost/api/content/upload', { method: 'POST', body: new FormData() })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
  })

  it('returns 400 if no file provided', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    const formData = new FormData()
    const req = new Request('http://localhost/api/content/upload', { method: 'POST', body: formData })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 for disallowed file type', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    const formData = new FormData()
    formData.append('file', new File(['data'], 'test.pdf', { type: 'application/pdf' }))
    const req = new Request('http://localhost/api/content/upload', { method: 'POST', body: formData })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('returns 413 when storage quota exceeded', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockConvex.query.mockResolvedValue({ plan: 'free' })
    mockConvex.mutation.mockRejectedValue({
      data: { code: 'STORAGE_QUOTA_EXCEEDED', bytesUsed: 100 * 1024 * 1024, limit: 100 * 1024 * 1024 }
    })
    const formData = new FormData()
    formData.append('file', new File(['x'.repeat(1000)], 'img.jpg', { type: 'image/jpeg' }))
    const req = new Request('http://localhost/api/content/upload', { method: 'POST', body: formData })
    const res = await POST(req as never)
    expect(res.status).toBe(413)
  })
})
