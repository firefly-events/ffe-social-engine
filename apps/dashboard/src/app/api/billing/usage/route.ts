import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { TIER_LIMITS, TierName } from "@/lib/stripe";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await fetchQuery(api.subscriptions.getSubscription, {
      userId,
    });
    const tier = (
      subscription?.status === "active" ? subscription.tier : "free"
    ) as TierName;

    // Fall back to first of current calendar month for free-tier users
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
    const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.free;

    return NextResponse.json({
      tier,
      periodStart,
      periodEnd: subscription?.currentPeriodEnd,
      usage: {
        captions: { used: usage?.captions ?? 0, limit: limits.captions },
        videos: { used: usage?.videos ?? 0, limit: limits.videos },
        posts: { used: usage?.posts ?? 0, limit: limits.posts },
        voiceClones: { used: usage?.voiceClones ?? 0, limit: limits.voiceClones },
      },
    });
  } catch (error) {
    console.error("Billing usage error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
