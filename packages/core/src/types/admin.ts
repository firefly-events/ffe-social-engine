import type { Plan } from './subscription.js';

/**
 * A feature flag controls availability of a product feature.
 * Resolution order: per-user override → per-plan override → global default.
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  /** Global default — applies when no plan/user override exists */
  enabledByDefault: boolean;
  /** Per-plan overrides. Key is Plan enum value. */
  planOverrides: Partial<Record<Plan, boolean>>;
  /** Per-user overrides. Key is User.id (MongoDB ObjectId as string). */
  userOverrides: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierConfig {
  plan: Plan;
  displayName: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
  /** Stripe Price IDs for each billing interval */
  stripePriceIds: {
    monthly?: string;
    yearly?: string;
  };
  isPublic: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin-level override for a specific user.
 * Used for support, comp accounts, beta testers, etc.
 */
export interface UserOverride {
  id: string;
  userId: string;
  /** Override the user's plan for limit calculations */
  planOverride?: Plan;
  /** Per-feature boolean overrides */
  featureOverrides: Record<string, boolean>;
  /** Custom limit overrides — null means use plan default */
  limitOverrides: {
    captionsPerMonth?: number | null;
    videosPerMonth?: number | null;
    postsPerMonth?: number | null;
    platformsAllowed?: number | null;
    voiceClonesAllowed?: number | null;
  };
  reason?: string;
  createdByAdminId?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
