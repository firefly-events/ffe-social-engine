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
    isBanned: v.optional(v.boolean()),
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
    handle: v.string(),
    platformUserId: v.optional(v.string()),
    encryptedAccessToken: v.optional(v.string()),
    encryptedRefreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.optional(v.array(v.string())),
    zernioAccountId: v.optional(v.string()),
    connectedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_platform", ["userId", "platform"]),

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
    externalId: v.optional(v.string()),
    userId: v.string(),
    name: v.string(),
    voiceId: v.optional(v.string()),
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
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    nodes: v.any(),
    edges: v.any(),
    config: v.any(),
    runCount: v.number(),
    lastRunAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"]),

  workflow_runs: defineTable({
    workflowId: v.id('workflows'),
    userId: v.string(),
    status: v.string(),
    triggeredBy: v.string(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    output: v.optional(v.any()),
    logs: v.optional(v.array(v.string())),
  })
    .index("by_userId", ["userId"])
    .index("by_workflowId", ["workflowId"]),

  composedVideos: defineTable({
    userId: v.string(),
    platform: v.string(),
    format: v.string(),
    textOverlay: v.optional(v.string()),
    sourceVideoUrl: v.string(),
    composerJobId: v.optional(v.string()),
    status: v.string(),
    storageId: v.optional(v.id("_storage")),
    resultUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  mediaFiles: defineTable({
    userId: v.string(),
    storageId: v.string(),
    filename: v.string(),
    mimeType: v.string(),
    size: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  generationJobs: defineTable({
    userId: v.string(),
    type: v.string(),           // "single" | "batch" | "thread" | "hashtags"
    topic: v.string(),
    platform: v.optional(v.string()),
    template: v.optional(v.string()),
    model: v.string(),
    status: v.string(),         // "pending" | "completed" | "failed"
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    // Iteration tracking
    regenerateCount: v.optional(v.number()),
    iterationGroupId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_topic", ["topic"]),

  assetVariants: defineTable({
    userId: v.string(),
    sessionId: v.optional(v.string()),
    parentJobId: v.id("generationJobs"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    result: v.string(),         // JSON string of the asset data
    model: v.optional(v.string()),
    costUsd: v.optional(v.number()),
    savedAt: v.number(),
    label: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_parent_job", ["parentJobId"])
    .index("by_session", ["userId", "sessionId"]),

  contentSessions: defineTable({
    userId: v.string(),
    name: v.string(),
    template: v.optional(v.string()),
    platform: v.optional(v.string()),
    messages: v.array(v.object({
      role: v.string(),        // "user" | "assistant"
      content: v.string(),
      timestamp: v.number(),
      model: v.optional(v.string()),
    })),
    extractedContent: v.optional(v.array(v.object({
      text: v.string(),
      savedAt: v.number(),
    }))),
    status: v.string(),        // "active" | "archived"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  exportHistory: defineTable({
    externalId: v.string(),
    userId: v.string(),
    assetIds: v.array(v.string()),
    format: v.string(),        // "zip" | "json" | "webhook"
    platform: v.optional(v.string()),
    n8nResponse: v.optional(v.any()),
    exportedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_externalId", ["externalId"]),

  socialTierConfigs: defineTable({
    tierId: v.string(), // "free", "starter", "basic", "pro", "business", "agency"
    tierName: v.string(), // "Free", "Starter", "Basic", "Pro", "Business", "Agency"
    monthlyPrice: v.number(),
    aiCaptionsLimit: v.number(),
    videoGenLimit: v.number(),
    voiceClonesLimit: v.number(),
    directPosting: v.boolean(),
    platforms: v.array(v.string()), // ["twitter", "linkedin", "instagram", "tiktok"]
    scheduling: v.boolean(),
    analyticsAccess: v.boolean(),
    analyticsDepth: v.string(), // "basic", "advanced", "full"
    automations: v.boolean(),
    flowLimit: v.number(),
    apiAccess: v.boolean(),
    rateLimit: v.number(),
    whiteLabel: v.boolean(),
    prioritySupport: v.boolean(),
    exportQualityCap: v.string(), // "720p", "1080p", "4k"
    customFeatures: v.any(), // Record<string, any>
    updatedAt: v.number(),
    updatedBy: v.string(), // clerkId of admin
  }).index("by_tierId", ["tierId"]),

  superAdminAuditLogs: defineTable({
    adminId: v.string(),
    action: v.string(), // "update_tier_config", "impersonate_user", "ban_user", "force_tier_change"
    targetId: v.optional(v.string()), // userId or tierId
    details: v.any(),
    timestamp: v.number(),
  })
    .index("by_adminId", ["adminId"])
    .index("by_action", ["action"]),

  impersonations: defineTable({
    adminId: v.string(), // clerkId of admin
    targetUserId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_adminId", ["adminId"]),

  storageQuota: defineTable({
    userId: v.string(),
    bytesUsed: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

});
