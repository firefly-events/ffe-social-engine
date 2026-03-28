import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser as getCurrentUserFromAuth } from "./authHelpers";

/**
 * Upsert a user record from Clerk webhook data.
 * Called by the Convex httpAction in http.ts (primary) and the Next.js webhook route (legacy).
 */
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Soft-delete a user by clearing their clerkId.
 * Posts and other data are preserved; the user can no longer authenticate.
 */
export const softDeleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        clerkId: undefined,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Hard-delete a user record. Kept for admin use cases.
 * Prefer softDeleteUser for normal user deletion flows.
 */
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.delete(existingUser._id);
    }
  },
});

/**
 * Query the currently authenticated user from ctx.auth.
 * Returns null if the user is not authenticated or not yet synced.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUserFromAuth(ctx);
  },
});

/**
 * Query a user by their Clerk ID. Useful for server-side lookups.
 */
export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const markFreeTrialUsed = mutation({
  args: { clerkId: v.string(), feature: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!existingUser) {
      throw new Error("User not found for clerkId");
    }

    const usedFreeTrials = existingUser.usedFreeTrials || [];
    if (!usedFreeTrials.includes(args.feature)) {
      await ctx.db.patch(existingUser._id, {
        usedFreeTrials: [...usedFreeTrials, args.feature],
      });
    }
  },
});

const VALID_PLANS = ['free', 'starter', 'basic', 'pro', 'business', 'agency'] as const;
type ValidPlan = typeof VALID_PLANS[number];

/**
 * Update the subscription plan for a user identified by Clerk ID.
 * Called by the Clerk webhook when a subscription event fires.
 */
export const updatePlan = mutation({
  args: {
    clerkId: v.string(),
    plan: v.union(
      v.literal('free'),
      v.literal('starter'),
      v.literal('basic'),
      v.literal('pro'),
      v.literal('business'),
      v.literal('agency'),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { plan: args.plan, updatedAt: Date.now() });
  },
});

/**
 * Update the Zernio profile ID for a user identified by Clerk ID.
 */
export const updateZernioProfileId = mutation({
  args: { clerkId: v.string(), zernioProfileId: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        zernioProfileId: args.zernioProfileId,
        updatedAt: Date.now(),
      });
    }
  },
});
