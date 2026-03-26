/**
 * workflowRuns.ts — Convex queries and mutations for the "workflow_runs" table.
 *
 * Called from Next.js API routes via ConvexHttpClient. userId is passed as an
 * argument because ctx.auth is not available when using the HTTP client without
 * a forwarded auth token.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List workflow runs for a user (optionally filtered by workflowId). */
export const list = query({
  args: {
    userId: v.string(),
    workflowId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("workflow_runs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.workflowId) {
      items = items.filter((r) => r.workflowId === args.workflowId);
    }

    // Most-recent first
    items.sort((a, b) => b.startedAt - a.startedAt);

    return items;
  },
});

/** Fetch a single workflow run by its externalId. */
export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflow_runs")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

/** Create a new workflow run record. Returns the stored document. */
export const create = mutation({
  args: {
    externalId: v.string(),
    workflowId: v.string(),
    userId: v.string(),
    status: v.string(),
    snapshot: v.any(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    output: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("workflow_runs", args);
    return await ctx.db.get(docId);
  },
});

/** Patch an existing workflow run by externalId. Returns the updated document. */
export const update = mutation({
  args: {
    externalId: v.string(),
    status: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    output: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { externalId, ...patch } = args;
    const existing = await ctx.db
      .query("workflow_runs")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!existing) return null;

    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(existing._id, cleanPatch);
    return await ctx.db.get(existing._id);
  },
});
