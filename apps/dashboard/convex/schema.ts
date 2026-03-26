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
    enabled: v.boolean(),
    config: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_triggerType", ["triggerType"]),

  automationQueue: defineTable({
    ruleId: v.id("automationRules"),
    userId: v.string(),
    triggerData: v.any(),
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
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    postedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_userId", ["userId"])
    .index("by_ruleId", ["ruleId"]),
});
