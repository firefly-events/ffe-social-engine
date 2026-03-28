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
