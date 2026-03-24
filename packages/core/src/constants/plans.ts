import { Plan } from '../types/subscription.js';
import type { PlanLimits } from '../types/subscription.js';

/**
 * Canonical plan limits. These are the source of truth for feature gating.
 * All services must import from here — never hardcode limits inline.
 *
 * Enterprise values are soft caps; support can raise them via UserOverride.
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.Free]: {
    captionsPerMonth: 5,
    videosPerMonth: 1,
    postsPerMonth: 0,
    platformsAllowed: 0,
    voiceClonesAllowed: 0,
  },
  [Plan.Starter]: {
    captionsPerMonth: 50,
    videosPerMonth: 5,
    postsPerMonth: 0,
    platformsAllowed: 0,
    voiceClonesAllowed: 0,
  },
  [Plan.Basic]: {
    captionsPerMonth: 100,
    videosPerMonth: 10,
    postsPerMonth: 30,
    platformsAllowed: 3,
    voiceClonesAllowed: 0,
  },
  [Plan.Pro]: {
    captionsPerMonth: 500,
    videosPerMonth: 25,
    postsPerMonth: 100,
    platformsAllowed: 5,
    voiceClonesAllowed: 5,
  },
  [Plan.Business]: {
    captionsPerMonth: 2000,
    videosPerMonth: 100,
    postsPerMonth: 500,
    platformsAllowed: 14,
    voiceClonesAllowed: 20,
  },
  [Plan.Enterprise]: {
    // Soft caps — raise via UserOverride for specific accounts
    captionsPerMonth: 10_000,
    videosPerMonth: 500,
    postsPerMonth: 5_000,
    platformsAllowed: 14,
    voiceClonesAllowed: 50,
  },
} as const;

/**
 * Returns the limits for the given plan. Falls back to Free if plan is unknown.
 */
export function getLimitsForPlan(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS[Plan.Free];
}

/**
 * Returns true if the plan is a paid tier.
 */
export function isPaidPlan(plan: Plan): boolean {
  return plan !== Plan.Free;
}

/**
 * Plans that support scheduling/posting.
 */
export const PLANS_WITH_POSTING = [Plan.Basic, Plan.Pro, Plan.Business, Plan.Enterprise] as const;

/**
 * Plans that support voice cloning.
 */
export const PLANS_WITH_VOICE = [Plan.Pro, Plan.Business, Plan.Enterprise] as const;

/**
 * Display order for pricing pages (ascending by price).
 */
export const PLAN_DISPLAY_ORDER: Plan[] = [
  Plan.Free,
  Plan.Starter,
  Plan.Basic,
  Plan.Pro,
  Plan.Business,
  Plan.Enterprise,
];
