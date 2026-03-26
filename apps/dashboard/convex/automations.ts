import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// Query enabled rules by type (no auth required - for webhook/cron use)
export const listEnabledRulesByType = query({
  args: { type: v.union(v.literal("event-to-social"), v.literal("event-to-newsletter"), v.literal("weekly-digest")) },
  handler: async (ctx, args) => {
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
    return rules.filter((r) => r.enabled);
  },
});

// List automation rules for the current user
export const listRules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return await ctx.db
      .query("automationRules")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get a single rule by ID
export const getRule = query({
  args: { ruleId: v.id("automationRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ruleId);
  },
});

// Create a new automation rule
export const createRule = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("event-to-social"), v.literal("event-to-newsletter"), v.literal("weekly-digest")),
    config: v.object({
      eventFilters: v.optional(v.object({
        categories: v.optional(v.array(v.string())),
        location: v.optional(v.string()),
        dateRange: v.optional(v.object({
          start: v.optional(v.string()),
          end: v.optional(v.string()),
        })),
      })),
      platforms: v.optional(v.array(v.string())),
      newsletterConfig: v.optional(v.object({
        subject: v.optional(v.string()),
        recipientListId: v.optional(v.string()),
        template: v.optional(v.string()),
      })),
      schedule: v.optional(v.string()),
      aiPromptOverride: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;
    const now = Date.now();
    return await ctx.db.insert("automationRules", {
      userId,
      name: args.name,
      description: args.description,
      type: args.type,
      enabled: true,
      config: args.config,
      runCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an automation rule
export const updateRule = mutation({
  args: {
    ruleId: v.id("automationRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    config: v.optional(v.object({
      eventFilters: v.optional(v.object({
        categories: v.optional(v.array(v.string())),
        location: v.optional(v.string()),
        dateRange: v.optional(v.object({
          start: v.optional(v.string()),
          end: v.optional(v.string()),
        })),
      })),
      platforms: v.optional(v.array(v.string())),
      newsletterConfig: v.optional(v.object({
        subject: v.optional(v.string()),
        recipientListId: v.optional(v.string()),
        template: v.optional(v.string()),
      })),
      schedule: v.optional(v.string()),
      aiPromptOverride: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const rule = await ctx.db.get(args.ruleId);
    if (!rule) throw new Error("Rule not found");
    if (rule.userId !== identity.subject) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.enabled !== undefined) updates.enabled = args.enabled;
    if (args.config !== undefined) updates.config = args.config;

    await ctx.db.patch(args.ruleId, updates);
  },
});

// Delete an automation rule
export const deleteRule = mutation({
  args: { ruleId: v.id("automationRules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const rule = await ctx.db.get(args.ruleId);
    if (!rule) throw new Error("Rule not found");
    if (rule.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.delete(args.ruleId);
  },
});

// Enqueue an automation job
export const enqueueJob = mutation({
  args: {
    ruleId: v.id("automationRules"),
    triggerData: v.object({
      eventIds: v.optional(v.array(v.string())),
      source: v.string(),
      triggeredAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    if (!rule) throw new Error("Rule not found");

    return await ctx.db.insert("automationQueue", {
      ruleId: args.ruleId,
      userId: rule.userId,
      status: "pending",
      triggerData: args.triggerData,
      createdAt: Date.now(),
    });
  },
});

// Update queue item status
export const updateQueueItem = mutation({
  args: {
    queueId: v.id("automationQueue"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    result: v.optional(v.object({
      postIds: v.optional(v.array(v.string())),
      newsletterId: v.optional(v.string()),
      error: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    if (args.result) updates.result = args.result;
    if (args.status === "completed" || args.status === "failed") {
      updates.processedAt = Date.now();
    }
    await ctx.db.patch(args.queueId, updates);
  },
});

// List queue items for a rule
export const listQueueItems = query({
  args: { ruleId: v.optional(v.id("automationRules")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (args.ruleId) {
      return await ctx.db
        .query("automationQueue")
        .withIndex("by_ruleId", (q) => q.eq("ruleId", args.ruleId!))
        .order("desc")
        .take(50);
    }

    return await ctx.db
      .query("automationQueue")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
  },
});

// Internal mutation called by cron - processes all enabled weekly-digest rules
export const processWeeklyDigests = internalMutation({
  args: {},
  handler: async (ctx) => {
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_type", (q) => q.eq("type", "weekly-digest"))
      .collect();

    const enabledRules = rules.filter((r) => r.enabled);

    for (const rule of enabledRules) {
      await ctx.db.insert("automationQueue", {
        ruleId: rule._id,
        userId: rule.userId,
        status: "pending",
        triggerData: {
          source: "cron-weekly-digest",
          triggeredAt: Date.now(),
        },
        createdAt: Date.now(),
      });
    }
  },
});
