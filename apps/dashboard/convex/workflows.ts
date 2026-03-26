/**
 * workflows.ts — Convex queries and mutations for the "workflows" table.
 *
 * Called from Next.js API routes via ConvexHttpClient. userId is passed as an
 * argument because ctx.auth is not available when using the HTTP client without
 * a forwarded auth token.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/server";

/** List workflows for a user with optional status filter, newest-first by updatedAt. */
export const list = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("workflows")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.status) {
      items = items.filter((w) => w.status === args.status);
    }

    // Newest-updated first
    items.sort((a, b) => b.updatedAt - a.updatedAt);

    return items;
  },
});

/** Fetch a single workflow by its externalId. */
export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

/** Create a new workflow. Returns the stored document. */
export const create = mutation({
  args: {
    externalId: v.string(),
    userId: v.string(), // Clerk ID
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    nodes: v.any(),
    edges: v.any(),
    config: v.any(),
    runCount: v.number(),
    lastRunAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // 2. Count existing workflows
    const existingWorkflows = await ctx.db
      .query("workflows")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const count = existingWorkflows.length;

    // 3. Enforce limits
    const plan = (user.plan || "free").toLowerCase();
    let limit = Infinity;

    if (plan === "free" || plan === "starter") {
      limit = 3;
    } else if (plan === "pro") {
      limit = 15;
    }

    if (count >= limit) {
      throw new ConvexError(`Automation limit reached for ${plan} plan (max ${limit}). Upgrade for more.`);
    }

    const now = Date.now();
    const docId = await ctx.db.insert("workflows", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(docId);
  },
});

/** Patch an existing workflow by externalId. Returns the updated document. */
export const update = mutation({
  args: {
    externalId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    nodes: v.optional(v.any()),
    edges: v.optional(v.any()),
    config: v.optional(v.any()),
    runCount: v.optional(v.number()),
    lastRunAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { externalId, ...patch } = args;
    const existing = await ctx.db
      .query("workflows")
      .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
      .first();
    if (!existing) return null;

    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    
    await ctx.db.patch(existing._id, {
      ...cleanPatch,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(existing._id);
  },
});

/** Hard-delete a workflow by externalId. */
export const remove = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workflows")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!existing) return false;
    await ctx.db.delete(existing._id);
    return true;
  },
});
