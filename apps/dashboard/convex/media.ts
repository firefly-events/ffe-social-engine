import { ConvexError } from "convex/values";
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

export const saveUploadedFile = mutation({
  args: {
    userId: v.string(),
    storageId: v.string(),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    const isVideo = args.mimeType.startsWith('video/');
    const isImage = args.mimeType.startsWith('image/');
    return await ctx.db.insert("content", {
      userId: args.userId,
      externalId: args.externalId,
      text: args.filename,
      imageUrl: isImage ? (url ?? undefined) : undefined,
      videoUrl: isVideo ? (url ?? undefined) : undefined,
      blobUrl: url ?? undefined,
      source: 'upload',
      fileSize: args.size,
      mimeType: args.mimeType,
      platforms: [],
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deleteUploadedFile = mutation({
  args: {
    userId: v.string(),
    storageId: v.string(),
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up content record first and verify ownership
    const doc = await ctx.db
      .query("content")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!doc) throw new ConvexError("Content record not found");
    if (doc.userId !== args.userId) throw new ConvexError("Unauthorized: you do not own this file");
    // Delete from storage
    await ctx.storage.delete(args.storageId);
    // Delete content record
    await ctx.db.delete(doc._id);
  },
});
