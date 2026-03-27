import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardMetrics = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const total = posts.length;
    const posted = posts.filter((p) => p.status === "posted").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    return { total, posted, scheduled, drafts };
  },
});

export const getRecentPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
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
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startOfDay = now - (now % 86400000);
    const endOfDay = startOfDay + 86400000;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return posts
      .filter(
        (p) =>
          p.status === "scheduled" &&
          p.scheduledAt !== undefined &&
          p.scheduledAt >= startOfDay &&
          p.scheduledAt < endOfDay
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
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    if (userPosts.length === 0) {
      return { byPlatform: [], totals: { impressions: 0, engagement: 0, clicks: 0 } };
    }
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
