import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const save = mutation({
  args: {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    const userId = identity.subject;

    return await ctx.db.insert("savedVariants", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    assetType: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("video"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    const userId = identity.subject;

    const limit = Math.min(100, Math.max(1, args.limit ?? 50));

    if (args.assetType) {
      return await ctx.db
        .query("savedVariants")
        .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("assetType", args.assetType!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("savedVariants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const remove = mutation({
  args: { id: v.id("savedVariants") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    const userId = identity.subject;

    const record = await ctx.db.get(args.id);
    if (!record) throw new ConvexError("Record not found");
    if (record.userId !== userId) throw new ConvexError("Forbidden");

    await ctx.db.delete(args.id);
  },
});
