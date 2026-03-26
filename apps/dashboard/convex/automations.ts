import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// Queries

export const listRules = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("automationRules")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getRule = query({
  args: { id: v.id("automationRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listQueueItems = query({
  args: { userId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("automationQueue")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("status"), args.status))
        .collect();
    }
    return await ctx.db
      .query("automationQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Mutations

export const createRule = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    triggerType: v.union(
      v.literal("event_created"),
      v.literal("event_updated"),
      v.literal("weekly_digest"),
      v.literal("analytics_threshold")
    ),
    platforms: v.array(v.string()),
    actions: v.array(
      v.union(
        v.literal("generate_post"),
        v.literal("send_newsletter"),
        v.literal("publish_post")
      )
    ),
    config: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (args.name.length > 255) {
      throw new Error("Rule name must be 255 characters or less");
    }
    const now = Date.now();
    return await ctx.db.insert("automationRules", {
      userId: args.userId,
      name: args.name,
      triggerType: args.triggerType,
      platforms: args.platforms,
      actions: args.actions,
      enabled: true,
      config: args.config,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateRule = mutation({
  args: {
    id: v.id("automationRules"),
    userId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      triggerType: v.optional(
        v.union(
          v.literal("event_created"),
          v.literal("event_updated"),
          v.literal("weekly_digest"),
          v.literal("analytics_threshold")
        )
      ),
      platforms: v.optional(v.array(v.string())),
      actions: v.optional(
        v.array(
          v.union(
            v.literal("generate_post"),
            v.literal("send_newsletter"),
            v.literal("publish_post")
          )
        )
      ),
      enabled: v.optional(v.boolean()),
      config: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    if (args.updates.name !== undefined && args.updates.name.length > 255) {
      throw new Error("Rule name must be 255 characters or less");
    }
    const rule = await ctx.db.get(args.id);
    if (!rule || rule.userId !== args.userId) {
      throw new Error("Rule not found or access denied");
    }
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteRule = mutation({
  args: {
    id: v.id("automationRules"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.id);
    if (!rule || rule.userId !== args.userId) {
      throw new Error("Rule not found or access denied");
    }
    await ctx.db.delete(args.id);
  },
});

export const toggleRule = mutation({
  args: {
    id: v.id("automationRules"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.id);
    if (!rule || rule.userId !== args.userId) {
      throw new Error("Rule not found or access denied");
    }
    await ctx.db.patch(args.id, {
      enabled: !rule.enabled,
      updatedAt: Date.now(),
    });
  },
});

// Internal Mutations

export const enqueueItem = internalMutation({
  args: {
    ruleId: v.id("automationRules"),
    userId: v.string(),
    triggerData: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("automationQueue", {
      ruleId: args.ruleId,
      userId: args.userId,
      triggerData: args.triggerData,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateQueueItem = internalMutation({
  args: {
    id: v.id("automationQueue"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("posted"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("rejected")
    ),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    if (args.result !== undefined) {
      updates.result = args.result;
    }
    if (args.error !== undefined) {
      updates.error = args.error;
    }
    if (args.status === "posted") {
      updates.postedAt = Date.now();
    }
    if (args.status === "completed" || args.status === "failed") {
      updates.processedAt = Date.now();
    }
    await ctx.db.patch(args.id, updates);
  },
});
