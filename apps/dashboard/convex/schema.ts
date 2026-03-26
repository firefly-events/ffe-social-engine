import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    zernioProfileId: v.optional(v.string()),
    usedFreeTrials: v.optional(v.array(v.string())),
    plan: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  posts: defineTable({
    userId: v.string(),
    content: v.string(),
    platforms: v.array(v.string()),
    status: v.string(),
    scheduledAt: v.optional(v.number()),
    zernioPostId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  socialAccounts: defineTable({
    userId: v.string(),
    platform: v.string(),
    zernioAccountId: v.optional(v.string()),
    handle: v.string(),
    connectedAt: v.number(),
  }).index("by_userId", ["userId"]),

  analytics: defineTable({
    postId: v.id("posts"),
    platform: v.string(),
    impressions: v.number(),
    engagement: v.number(),
    clicks: v.number(),
    fetchedAt: v.number(),
  }).index("by_postId", ["postId"]),

  automationRules: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("event-to-social"), v.literal("event-to-newsletter"), v.literal("weekly-digest")),
    enabled: v.boolean(),
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
    lastRunAt: v.optional(v.number()),
    runCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_enabled", ["enabled"]),

  automationQueue: defineTable({
    ruleId: v.id("automationRules"),
    userId: v.string(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    triggerData: v.object({
      eventIds: v.optional(v.array(v.string())),
      source: v.string(),
      triggeredAt: v.number(),
    }),
    result: v.optional(v.object({
      postIds: v.optional(v.array(v.string())),
      newsletterId: v.optional(v.string()),
      error: v.optional(v.string()),
    })),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_ruleId", ["ruleId"])
    .index("by_status", ["status"])
    .index("by_userId", ["userId"]),
});
