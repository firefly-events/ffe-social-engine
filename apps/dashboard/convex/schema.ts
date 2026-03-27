import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    zernioProfileId: v.optional(v.string()),
    usedFreeTrials: v.optional(v.array(v.string())),
    plan: v.string(),          // "free" | "pro" | "agency" | "enterprise"
    stripeCustomerId: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),
  
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

  subscriptions: defineTable({
    userId: v.string(),               // Clerk user ID
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.string(),                 // "free" | "pro" | "agency" | "enterprise"
    status: v.string(),               // "active" | "past_due" | "canceled" | "trialing" | "incomplete"
    currentPeriodStart: v.number(),   // Unix timestamp
    currentPeriodEnd: v.number(),     // Unix timestamp
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  billingUsage: defineTable({
    userId: v.string(),
    periodStart: v.number(),          // Unix timestamp of billing period start
    tier: v.string(),
    captions: v.number(),
    videos: v.number(),
    posts: v.number(),
    voiceClones: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId_period", ["userId", "periodStart"]),
});
