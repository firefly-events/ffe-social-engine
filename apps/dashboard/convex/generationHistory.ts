import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const log = mutation({
  args: {
    userId: v.string(),
    assetType: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    generationJobId: v.optional(v.id("generationJobs")),
    action: v.union(v.literal("generate"), v.literal("regenerate"), v.literal("retry")),
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    result: v.optional(v.string()),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generationHistory", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listByJob = query({
  args: {
    generationJobId: v.id("generationJobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generationHistory")
      .withIndex("by_job", (q) => q.eq("generationJobId", args.generationJobId))
      .order("desc")
      .collect();
  },
});

export const listByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generationHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});
