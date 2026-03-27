import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const save = mutation({
  args: {
    userId: v.string(),
    assetType: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    generationJobId: v.optional(v.id("generationJobs")),
    content: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("savedVariants", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    userId: v.string(),
    assetType: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("video"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    if (args.assetType) {
      return await ctx.db
        .query("savedVariants")
        .withIndex("by_user_type", (q) => q.eq("userId", args.userId).eq("assetType", args.assetType!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("savedVariants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const remove = mutation({
  args: { id: v.id("savedVariants") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
