/**
 * GET /api/content/quota — return current storage usage for authenticated user
 * FIR-1344
 */

import { auth } from '@clerk/nextjs/server'
import { ok, unauthorized, serverError } from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '@convex/_generated/api'
import { planToTier, getStorageLimit, formatBytes } from '@/lib/tier-limits'

export async function GET() {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const [user, quota] = await Promise.all([
      convexClient.query(api.users.getByClerkId, { clerkId: session.userId }),
      convexClient.query(api.storageQuota.getQuota, { userId: session.userId }),
    ])

    const tier = planToTier(user?.plan)
    const limit = getStorageLimit(tier)
    const bytesUsed = quota?.bytesUsed ?? 0

    return ok({
      bytesUsed,
      limit,
      tier,
      bytesUsedFormatted: formatBytes(bytesUsed),
      limitFormatted: formatBytes(limit),
      percentUsed: limit === Infinity ? 0 : Math.min(100, (bytesUsed / limit) * 100),
    })
  } catch (err) {
    console.error('[GET /api/content/quota]', err)
    return serverError()
  }
}
