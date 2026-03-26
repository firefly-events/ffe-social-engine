/**
 * content.ts — Convex queries and mutations for the "content" table.
 *
 * Called from Next.js API routes via ConvexHttpClient. userId is passed as an
 * argument because ctx.auth is not available when using the HTTP client without
 * a forwarded auth token.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List content items for a user, with optional status and platform filters. */
export const list = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
    platform: v.optional(v.string()),
    after: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("content")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.status) {
      items = items.filter((c) => c.status === args.status);
    }
    if (args.platform) {
      items = items.filter((c) => c.platforms.includes(args.platform!));
    }
    if (args.after !== undefined) {
      items = items.filter((c) => c.createdAt > args.after!);
    }
    if (args.before !== undefined) {
      items = items.filter((c) => c.createdAt < args.before!);
    }

    // Newest-first
    items.sort((a, b) => b.createdAt - a.createdAt);

    return items;
  },
});

/** Fetch a single content item by its externalId (e.g. "cnt_..."). */
export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

/** Create a new content item. Returns the stored document. */
export const create = mutation({
  args: {
    externalId: v.string(),
    userId: v.string(),
    text: v.string(),
    imageUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    platforms: v.array(v.string()),
    status: v.string(),
    aiModel: v.optional(v.string()),
    prompt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("content", args);
    return await ctx.db.get(docId);
  },
});

/** Patch an existing content item identified by externalId. Returns the updated document. */
export const update = mutation({
  args: {
    externalId: v.string(),
    text: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    prompt: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { externalId, ...patch } = args;
    const existing = await ctx.db
      .query("content")
      .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
      .first();
    if (!existing) return null;

    // Strip undefined values so we don't accidentally overwrite with undefined
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(existing._id, cleanPatch);
    return await ctx.db.get(existing._id);
  },
});

/** Hard-delete a content item by externalId. */
export const remove = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("content")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!existing) return false;
    await ctx.db.delete(existing._id);
    return true;
  },
});
