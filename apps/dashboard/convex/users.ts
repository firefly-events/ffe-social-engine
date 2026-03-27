import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
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

/**
 * Update a user's plan. Called by the Clerk subscription webhook.
 */
export const updatePlan = mutation({
  args: { clerkId: v.string(), plan: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        plan: args.plan,
        updatedAt: Date.now(),
      });
    }
  },
});
