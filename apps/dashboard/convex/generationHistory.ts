import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const log = mutation({
  args: {
    assetType: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    generationJobId: v.optional(v.id("generationJobs")),
    action: v.union(v.literal("generate"), v.literal("regenerate"), v.literal("retry")),
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    result: v.optional(v.string()),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    const userId = identity.subject;

    return await ctx.db.insert("generationHistory", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const listByJob = query({
  args: {
    generationJobId: v.id("generationJobs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    const userId = identity.subject;

    const records = await ctx.db
      .query("generationHistory")
      .withIndex("by_job", (q) => q.eq("generationJobId", args.generationJobId))
      .order("desc")
      .collect();

    // Only return records owned by the authenticated user
    return records.filter((r) => r.userId === userId);
  },
});

export const listByUser = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    const userId = identity.subject;

    const limit = Math.min(1000, Math.max(1, args.limit ?? 50));

    return await ctx.db
      .query("generationHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});
