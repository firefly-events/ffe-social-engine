import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new generation job
export const createJob = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    topic: v.string(),
    platform: v.optional(v.string()),
    template: v.optional(v.string()),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generationJobs", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Update job with result
export const completeJob = mutation({
  args: {
    id: v.id("generationJobs"),
    result: v.any(),
  },
  handler: async (ctx, { id, result }) => {
    await ctx.db.patch(id, {
      status: "completed",
      result,
      completedAt: Date.now(),
    });
  },
});

// Mark job as failed
export const failJob = mutation({
  args: {
    id: v.id("generationJobs"),
    error: v.string(),
  },
  handler: async (ctx, { id, error }) => {
    await ctx.db.patch(id, { status: "failed", error, completedAt: Date.now() });
  },
});

// Get a single job by ID
export const getJob = query({
  args: { id: v.id("generationJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List user's recent jobs
export const listJobs = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const jobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 20);
    return jobs;
  },
});
