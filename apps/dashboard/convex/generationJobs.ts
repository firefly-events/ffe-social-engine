/**
 * generationJobs.ts — Convex queries and mutations for the "generationJobs" table.
 *
 * FIR-1317: Supports PipelineDAG real-time subscriptions via useQuery.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List generation jobs for a user, optionally filtered by sessionId (stored in topic field).
 *  userId validated by API layer before calling this mutation. */
export const list = query({
  args: {
    userId: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("generationJobs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    if (args.sessionId) {
      items = items.filter((j) => j.topic === args.sessionId);
    }

    return items;
  },
});

/** Get a single generation job by its externalId (stored in topic field as a unique id). */
export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    // externalId is stored in the topic field; use the by_topic index for O(log n) lookup
    return await ctx.db
      .query("generationJobs")
      .withIndex("by_topic", (q) => q.eq("topic", args.externalId))
      .first();
  },
});

/** Create a new generation job. Returns the stored document. */
export const create = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    topic: v.string(),
    platform: v.optional(v.string()),
    template: v.optional(v.string()),
    model: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("generationJobs", {
      userId: args.userId,
      type: args.type,
      topic: args.topic,
      platform: args.platform,
      template: args.template,
      model: args.model,
      status: args.status ?? "pending",
      createdAt: Date.now(),
    });
    return await ctx.db.get(docId);
  },
});

/** Patch a generation job by its Convex _id. Returns the updated document. */
export const update = mutation({
  args: {
    id: v.id("generationJobs"),
    status: v.optional(v.string()),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleanPatch);
    return await ctx.db.get(id);
  },
});
