import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Save a variant for a generation job
export const saveVariant = mutation({
  args: {
    userId: v.string(),
    sessionId: v.optional(v.string()),
    parentJobId: v.id("generationJobs"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    result: v.string(),
    model: v.optional(v.string()),
    costUsd: v.optional(v.number()),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("assetVariants", {
      ...args,
      savedAt: Date.now(),
      isFavorite: false,
    });
  },
});

// List saved variants for a user, optionally filtered by parentJobId or sessionId
export const listVariants = query({
  args: {
    userId: v.string(),
    parentJobId: v.optional(v.id("generationJobs")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, parentJobId, sessionId }) => {
    if (parentJobId) {
      return await ctx.db
        .query("assetVariants")
        .withIndex("by_parent_job", (q) => q.eq("parentJobId", parentJobId))
        .order("desc")
        .collect();
    }

    if (sessionId) {
      return await ctx.db
        .query("assetVariants")
        .withIndex("by_session", (q) =>
          q.eq("userId", userId).eq("sessionId", sessionId)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("assetVariants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Delete a saved variant
export const deleteVariant = mutation({
  args: {
    id: v.id("assetVariants"),
    userId: v.string(),
  },
  handler: async (ctx, { id, userId }) => {
    const variant = await ctx.db.get(id);
    if (!variant || variant.userId !== userId) {
      throw new Error("Variant not found or unauthorized");
    }
    await ctx.db.delete(id);
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: {
    id: v.id("assetVariants"),
    userId: v.string(),
  },
  handler: async (ctx, { id, userId }) => {
    const variant = await ctx.db.get(id);
    if (!variant || variant.userId !== userId) {
      throw new Error("Variant not found or unauthorized");
    }
    await ctx.db.patch(id, { isFavorite: !variant.isFavorite });
  },
});
