/**
 * schedules.ts — Convex queries and mutations for the "schedules" table.
 *
 * Called from Next.js API routes via ConvexHttpClient. userId is passed as an
 * argument because ctx.auth is not available when using the HTTP client without
 * a forwarded auth token.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List schedules for a user with optional filters. */
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
      .query("schedules")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.status) {
      items = items.filter((s) => s.status === args.status);
    }
    if (args.platform) {
      items = items.filter((s) => s.platform === args.platform);
    }
    if (args.after !== undefined) {
      items = items.filter((s) => s.scheduledAt > args.after!);
    }
    if (args.before !== undefined) {
      items = items.filter((s) => s.scheduledAt < args.before!);
    }

    // Soonest-first
    items.sort((a, b) => a.scheduledAt - b.scheduledAt);

    return items;
  },
});

/** Fetch a single schedule by its externalId. */
export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schedules")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

/** Create a new schedule entry. Returns the stored document. */
export const create = mutation({
  args: {
    externalId: v.string(),
    contentId: v.string(),
    userId: v.string(),
    platform: v.string(),
    scheduledAt: v.number(),
    status: v.string(),
    postedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("schedules", args);
    return await ctx.db.get(docId);
  },
});

/** Patch an existing schedule identified by externalId. Returns the updated document. */
export const update = mutation({
  args: {
    externalId: v.string(),
    scheduledAt: v.optional(v.number()),
    status: v.optional(v.string()),
    postedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { externalId, ...patch } = args;
    const existing = await ctx.db
      .query("schedules")
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
