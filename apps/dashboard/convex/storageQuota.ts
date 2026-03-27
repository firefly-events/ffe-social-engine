import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Storage limits in bytes per tier
export const STORAGE_LIMITS: Record<string, number> = {
  free: 100 * 1024 * 1024,        // 100 MB
  starter: 1 * 1024 * 1024 * 1024, // 1 GB
  pro: 10 * 1024 * 1024 * 1024,   // 10 GB
  business: 50 * 1024 * 1024 * 1024, // 50 GB
  agency: Infinity,
  enterprise: Infinity,
};

export const getQuota = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const quota = await ctx.db
      .query("storageQuota")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    return quota ?? { userId: args.userId, bytesUsed: 0, updatedAt: Date.now() };
  },
});

export const checkAndIncrement = mutation({
  args: {
    userId: v.string(),
    plan: v.string(),
    bytes: v.number(),
  },
  handler: async (ctx, args) => {
    const limit = STORAGE_LIMITS[args.plan.toLowerCase()] ?? STORAGE_LIMITS.free;
    const existing = await ctx.db
      .query("storageQuota")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    const currentBytes = existing?.bytesUsed ?? 0;
    if (limit !== Infinity && currentBytes + args.bytes > limit) {
      throw new ConvexError({
        code: "STORAGE_QUOTA_EXCEEDED",
        message: `Storage quota exceeded. Used: ${currentBytes} bytes, limit: ${limit} bytes.`,
        bytesUsed: currentBytes,
        limit,
      });
    }
    if (existing) {
      await ctx.db.patch(existing._id, {
        bytesUsed: currentBytes + args.bytes,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("storageQuota", {
        userId: args.userId,
        bytesUsed: args.bytes,
        updatedAt: Date.now(),
      });
    }
    return { bytesUsed: currentBytes + args.bytes, limit };
  },
});

export const decrement = mutation({
  args: {
    userId: v.string(),
    bytes: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("storageQuota")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!existing) return;
    const newBytes = Math.max(0, existing.bytesUsed - args.bytes);
    await ctx.db.patch(existing._id, {
      bytesUsed: newBytes,
      updatedAt: Date.now(),
    });
  },
});
