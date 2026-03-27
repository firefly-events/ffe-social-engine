import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// Create a new generation job.
// Called from server-side API routes (ConvexHttpClient) that authenticate via Clerk.
// userId is passed as an arg because the HTTP client has no auth context.
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

// Update job with result (server-side only — called from API routes)
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

// Mark job as failed (server-side only — called from API routes)
export const failJob = mutation({
  args: {
    id: v.id("generationJobs"),
    error: v.string(),
  },
  handler: async (ctx, { id, error }) => {
    await ctx.db.patch(id, { status: "failed", error, completedAt: Date.now() });
  },
});

// List authenticated user's recent jobs
export const listJobs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    const userId = identity.subject;

    const safeLimit = Math.min(100, Math.max(1, limit ?? 20));
    const jobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(safeLimit);
    return jobs;
  },
});
