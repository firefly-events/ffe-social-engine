import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Called from Stripe webhook when checkout completes or subscription updates
export const upsertSubscription = mutation({
  args: {
    userId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
    } else {
      await ctx.db.insert("subscriptions", { ...args, createdAt: now, updatedAt: now });
    }

    // Update user's plan and stripeCustomerId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    if (user) {
      await ctx.db.patch(user._id, {
        plan: args.tier,
        stripeCustomerId: args.stripeCustomerId,
        updatedAt: now,
      });
    }
  },
});

// Called from Stripe webhook when subscription is deleted/canceled
export const cancelSubscription = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();

    if (sub) {
      await ctx.db.patch(sub._id, {
        status: "canceled",
        updatedAt: Date.now(),
      });

      // Downgrade user to free
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", sub.userId))
        .first();
      if (user) {
        await ctx.db.patch(user._id, { plan: "free", updatedAt: Date.now() });
      }
    }
  },
});

export const getSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getUsage = query({
  args: { userId: v.string(), periodStart: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("billingUsage")
      .withIndex("by_userId_period", (q) =>
        q.eq("userId", args.userId).eq("periodStart", args.periodStart))
      .first();
  },
});

export const incrementUsage = mutation({
  args: {
    userId: v.string(),
    periodStart: v.number(),
    tier: v.string(),
    field: v.union(
      v.literal("captions"),
      v.literal("videos"),
      v.literal("posts"),
      v.literal("voiceClones")
    ),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("billingUsage")
      .withIndex("by_userId_period", (q) =>
        q.eq("userId", args.userId).eq("periodStart", args.periodStart))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        [args.field]: (existing[args.field] ?? 0) + args.amount,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("billingUsage", {
        userId: args.userId,
        periodStart: args.periodStart,
        tier: args.tier,
        captions: args.field === "captions" ? args.amount : 0,
        videos: args.field === "videos" ? args.amount : 0,
        posts: args.field === "posts" ? args.amount : 0,
        voiceClones: args.field === "voiceClones" ? args.amount : 0,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
