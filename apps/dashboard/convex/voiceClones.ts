/**
 * voiceClones.ts — Convex queries and mutations for the "voice_clones" table.
 *
 * Called from Next.js API routes via ConvexHttpClient. userId is passed as an
 * argument because ctx.auth is not available when using the HTTP client without
 * a forwarded auth token.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List voice clones for a user, newest-first. */
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("voice_clones")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    items.sort((a, b) => b.createdAt - a.createdAt);
    return items;
  },
});

/** Fetch a single voice clone by its externalId. */
export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voice_clones")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

/** Create a new voice clone record. Returns the stored document. */
export const create = mutation({
  args: {
    externalId: v.string(),
    userId: v.string(),
    name: v.string(),
    sampleUrl: v.string(),
    status: v.string(),
    durationSeconds: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("voice_clones", args);
    return await ctx.db.get(docId);
  },
});

/** Patch an existing voice clone by externalId. Returns the updated document. */
export const update = mutation({
  args: {
    externalId: v.string(),
    name: v.optional(v.string()),
    sampleUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { externalId, ...patch } = args;
    const existing = await ctx.db
      .query("voice_clones")
      .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
      .first();
    if (!existing) return null;

    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(existing._id, cleanPatch);
    return await ctx.db.get(existing._id);
  },
});

/** Hard-delete a voice clone by externalId. */
export const remove = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("voice_clones")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!existing) return false;
    await ctx.db.delete(existing._id);
    return true;
  },
});
