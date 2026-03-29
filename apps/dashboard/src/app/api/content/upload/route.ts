/**
 * POST /api/content/upload — upload a file to Convex storage with quota enforcement
 *
 * v0: Uses Convex native storage. v1: Migrate to Vercel Blob / R2.
 * FIR-1344
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
import { api } from '@convex/_generated/api'
import { planToTier, getStorageLimit, formatBytes } from '@/lib/tier-limits'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm',
]
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB per file

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return badRequest('No file provided')

    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest(`File type not allowed: ${file.type}. Allowed: jpg, png, webp, gif, mp4, webm`)
    }
    if (file.size > MAX_FILE_SIZE) {
      return badRequest(`File too large: ${formatBytes(file.size)}. Max: 100 MB`)
    }

    // Get user plan for quota check
    const user = await convexClient.query(api.users.getByClerkId, { clerkId: session.userId })
    const tier = planToTier(user?.plan)
    const storageLimit = getStorageLimit(tier)

    // Check + increment quota (atomic, throws ConvexError if exceeded)
    let quotaResult: { bytesUsed: number; limit: number }
    try {
      quotaResult = await convexClient.mutation(api.storageQuota.checkAndIncrement, {
        userId: session.userId,
        plan: tier,
        bytes: file.size,
      })
    } catch (err: unknown) {
      const e = err as { data?: { code?: string; bytesUsed?: number; limit?: number } }
      if (e?.data?.code === 'STORAGE_QUOTA_EXCEEDED') {
        return new Response(
          JSON.stringify({
            error: 'Storage quota exceeded',
            bytesUsed: e.data.bytesUsed,
            limit: e.data.limit,
            limitFormatted: formatBytes(e.data.limit ?? storageLimit),
          }),
          { status: 413, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw err
    }

    // Get upload URL from Convex storage
    const uploadUrl = await convexClient.mutation(api.media.generateUploadUrl, {})

    // Upload file to Convex storage
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!uploadRes.ok) {
      // Rollback quota
      await convexClient.mutation(api.storageQuota.decrement, {
        userId: session.userId,
        bytes: file.size,
      })
      return serverError()
    }

    const { storageId } = await uploadRes.json() as { storageId: string }
    const externalId = generateId()

    // Save to content table with source='upload'
    try {
      await convexClient.mutation(api.media.saveUploadedFile, {
        userId: session.userId,
        storageId,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        externalId,
      })
    } catch (err) {
      console.error('[POST /api/content/upload] saveUploadedFile failed, rolling back quota', err)
      await convexClient.mutation(api.storageQuota.decrement, {
        userId: session.userId,
        bytes: file.size,
      })
      return serverError()
    }

    return created({
      id: externalId,
      storageId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      bytesUsed: quotaResult.bytesUsed,
    })
  } catch (err) {
    console.error('[POST /api/content/upload]', err)
    return serverError()
  }
}
