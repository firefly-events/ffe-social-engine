/**
 * exportHistory.ts — Convex queries and mutations for the "exportHistory" table.
 *
 * FIR-1319: Stores export records for the export page history section.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List export history for a user, newest first, with optional limit.
 *  userId validated by API layer before calling this mutation. */
export const list = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("exportHistory")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 20);
    return items;
  },
});

/** Create a new export history record. Returns the stored document.
 *  userId validated by API layer before calling this mutation. */
export const create = mutation({
  args: {
    externalId: v.string(),
    userId: v.string(),
    assetIds: v.array(v.string()),
    format: v.string(),
    platform: v.optional(v.string()),
    n8nResponse: v.optional(v.any()),
    exportedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("exportHistory", args);
    return await ctx.db.get(docId);
  },
});
