import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, posted: 0, scheduled: 0, drafts: 0 };
    const userId = identity.subject;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const total = posts.length;
    const posted = posts.filter((p) => p.status === "posted").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    return { total, posted, scheduled, drafts };
  },
});

export const getRecentPosts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
    return posts.map((p) => ({
      _id: p._id,
      content: p.content,
      platforms: p.platforms,
      status: p.status,
      scheduledAt: p.scheduledAt,
      createdAt: p.createdAt,
    }));
  },
});

export const getScheduledToday = query({
  args: { startOfDay: v.number(), endOfDay: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return posts
      .filter(
        (p) =>
          p.status === "scheduled" &&
          p.scheduledAt !== undefined &&
          p.scheduledAt >= args.startOfDay &&
          p.scheduledAt < args.endOfDay
      )
      .map((p) => ({
        _id: p._id,
        content: p.content,
        platforms: p.platforms,
        scheduledAt: p.scheduledAt!,
      }));
  },
});

export const getPerformanceData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { byPlatform: [], totals: { impressions: 0, engagement: 0, clicks: 0 } };
    const userId = identity.subject;
    const userPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    if (userPosts.length === 0) {
      return { byPlatform: [], totals: { impressions: 0, engagement: 0, clicks: 0 } };
    }
    // NOTE: This fans out N queries (one per post) to fetch analytics rows.
    // If the analytics table grows large, consider adding a compound index
    // (e.g., by_userId_postId) to allow a single indexed query instead of N+1.
    const analyticsRows = await Promise.all(
      userPosts.map((post) =>
        ctx.db
          .query("analytics")
          .withIndex("by_postId", (q) => q.eq("postId", post._id))
          .collect()
      )
    );
    const flat = analyticsRows.flat();
    const byPlatformMap = new Map<string, { impressions: number; engagement: number; clicks: number }>();
    for (const row of flat) {
      const existing = byPlatformMap.get(row.platform) ?? { impressions: 0, engagement: 0, clicks: 0 };
      byPlatformMap.set(row.platform, {
        impressions: existing.impressions + row.impressions,
        engagement: existing.engagement + row.engagement,
        clicks: existing.clicks + row.clicks,
      });
    }
    const byPlatform = Array.from(byPlatformMap.entries()).map(([platform, stats]) => ({ platform, ...stats }));
    const totals = flat.reduce(
      (acc, row) => ({ impressions: acc.impressions + row.impressions, engagement: acc.engagement + row.engagement, clicks: acc.clicks + row.clicks }),
      { impressions: 0, engagement: 0, clicks: 0 }
    );
    return { byPlatform, totals };
  },
});
