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

  content: defineTable({
    userId: v.string(),
    externalId: v.string(),
    text: v.string(),
    imageUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    platforms: v.array(v.string()),
    status: v.string(),
    aiModel: v.optional(v.string()),
    prompt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_externalId", ["externalId"]),

  schedules: defineTable({
    externalId: v.string(),
    contentId: v.string(),
    userId: v.string(),
    platform: v.string(),
    scheduledAt: v.number(),
    status: v.string(),
    postedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_externalId", ["externalId"])
    .index("by_contentId", ["contentId"]),

  voice_clones: defineTable({
    externalId: v.string(),
    userId: v.string(),
    name: v.string(),
    sampleUrl: v.string(),
    status: v.string(),
    durationSeconds: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_externalId", ["externalId"]),

  workflows: defineTable({
    externalId: v.string(),
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    nodes: v.any(),
    edges: v.any(),
    config: v.any(),
    runCount: v.number(),
    lastRunAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_externalId", ["externalId"]),

  workflow_runs: defineTable({
    externalId: v.string(),
    workflowId: v.string(),
    userId: v.string(),
    status: v.string(),
    snapshot: v.any(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    output: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_externalId", ["externalId"])
    .index("by_workflowId", ["workflowId"]),
});
