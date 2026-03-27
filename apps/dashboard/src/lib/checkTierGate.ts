import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { TIER_LIMITS, TierName, UsageField } from "./stripe";

export interface TierGateResult {
  allowed: boolean;
  tier: TierName;
  used: number;
  limit: number;
  remaining: number;
  reason?: string;
}

/**
 * Server-side tier gate check.
 * Returns whether the user can perform the given operation.
 * Throws if the user is not authenticated.
 */
export async function checkTierGate(
  field: UsageField,
  amount = 1
): Promise<TierGateResult> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get current subscription
  const subscription = await fetchQuery(api.subscriptions.getSubscription, {
    userId,
  });
  const tier = (
    subscription?.status === "active" ? subscription.tier : "free"
  ) as TierName;
  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  const limit = limits[field] as number;

  if (limit === Infinity) {
    return {
      allowed: true,
      tier,
      used: 0,
      limit: Infinity,
      remaining: Infinity,
    };
  }

  // Calculate billing period start: use subscription period or fall back to
  // the first of the current calendar month (for free-tier users)
  const periodStart =
    subscription?.currentPeriodStart ??
    Math.floor(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).getTime() / 1000
    );

  const usage = await fetchQuery(api.subscriptions.getUsage, {
    userId,
    periodStart,
  });
  const used = (usage?.[field] as number | undefined) ?? 0;
  const remaining = Math.max(0, limit - used);

  if (used + amount > limit) {
    return {
      allowed: false,
      tier,
      used,
      limit,
      remaining,
      reason: `${tier} plan allows ${limit} ${field}/mo. Used: ${used}/${limit}.`,
    };
  }

  return { allowed: true, tier, used, limit, remaining };
}
