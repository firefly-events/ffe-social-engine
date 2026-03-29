/**
 * tier-limits.ts — Tier-based workflow limit enforcement.
 *
 * FIR-1305: n8n as core automation engine — tiered by plan.
 */

export type Tier = 'free' | 'starter' | 'basic' | 'pro' | 'business' | 'agency'

export const WORKFLOW_LIMITS: Record<Tier, number> = {
  free: 3,
  starter: 3,
  basic: 7,
  pro: 15,
  business: Infinity,
  agency: Infinity,
}

export function getWorkflowLimit(tier: Tier): number {
  return WORKFLOW_LIMITS[tier] ?? 3
}

export function isWithinWorkflowLimit(tier: Tier, currentCount: number): boolean {
  const limit = getWorkflowLimit(tier)
  return currentCount < limit
}

// Storage quota limits in bytes per tier (FIR-1344)
export const STORAGE_LIMITS_BYTES: Record<Tier, number> = {
  free: 100 * 1024 * 1024,          // 100 MB
  starter: 1 * 1024 * 1024 * 1024,  // 1 GB
  pro: 10 * 1024 * 1024 * 1024,     // 10 GB
  business: 50 * 1024 * 1024 * 1024, // 50 GB
  agency: Infinity,
}

export function getStorageLimit(tier: Tier): number {
  return STORAGE_LIMITS_BYTES[tier] ?? STORAGE_LIMITS_BYTES.free
}

export function formatBytes(bytes: number): string {
  if (bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'
  if (bytes === Infinity) return 'Unlimited'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/** Map a Convex user plan string to a Tier. Falls back to 'free'. */
export function planToTier(plan: string | undefined | null): Tier {
  const normalized = (plan ?? '').toLowerCase()
  if (normalized === 'pro') return 'pro'
  if (normalized === 'business') return 'business'
  if (normalized === 'agency') return 'agency'
  if (normalized === 'starter') return 'starter'
  if (normalized === 'basic') return 'basic'
  return 'free'
}
