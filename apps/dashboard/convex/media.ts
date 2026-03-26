import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveMediaFile = mutation({
  args: {
    userId: v.string(),
    storageId: v.string(),
    filename: v.string(),
    mimeType: v.string(),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mediaFiles", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getMediaFile = query({
  args: { id: v.id("mediaFiles") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) return null;
    const url = await ctx.storage.getUrl(file.storageId);
    return { ...file, url };
  },
});

export const listMediaFiles = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("mediaFiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
    return files;
  },
});
