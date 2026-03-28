import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authHelpers";

const PLATFORM_DETAILS: Record<string, { color: string; lightColor: string }> = {
  TikTok: { color: '#000000', lightColor: '#f3f4f6' },
  Instagram: { color: '#E1306C', lightColor: '#fdf2f8' },
  LinkedIn: { color: '#0A66C2', lightColor: '#eff6ff' },
  Facebook: { color: '#1877F2', lightColor: '#eff6ff' },
  'Twitter/X': { color: '#000000', lightColor: '#f3f4f6' },
};

const CONTENT_TYPE_DETAILS: Record<string, { color: string; widthClass: string }> = {
  Video: { color: 'bg-purple-500', widthClass: 'w-[92%]' },
  Image: { color: 'bg-blue-500', widthClass: 'w-[63%]' },
  'Voice / Audio': { color: 'bg-emerald-500', widthClass: 'w-[53%]' },
  'Text Only': { color: 'bg-amber-500', widthClass: 'w-[36%]' },
};


export const getAnalyticsData = query({
  args: { range: v.union(v.literal("7d"), v.literal("30d"), v.literal("90d")) },
  handler: async (ctx, { range }) => {
    const user = await requireUser(ctx);
    if (!user) {
      return null;
    }

    const days = parseInt(range.replace('d', ''));
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const prevStartDate = startDate - days * 24 * 60 * 60 * 1000;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId as string))
      .filter((q) => q.gt(q.field("createdAt"), prevStartDate))
      .collect();

    if (posts.length === 0) {
      return null;
    }

    const postIds = posts.map((p) => p._id);
    const analytics = await Promise.all(
      postIds.map(postId =>
        ctx.db.query("analytics").withIndex("by_postId", q => q.eq("postId", postId)).collect()
      )
    ).then(results => results.flat());

    const currentPosts = posts.filter(p => p.createdAt >= startDate);
    const prevPosts = posts.filter(p => p.createdAt < startDate);

    const currentAnalytics = analytics.filter(a => currentPosts.some(p => p._id === a.postId));
    const prevAnalytics = analytics.filter(a => prevPosts.some(p => p._id === a.postId));

    const currentImpressions = currentAnalytics.reduce((sum, a) => sum + a.impressions, 0);
    const prevImpressions = prevAnalytics.reduce((sum, a) => sum + a.impressions, 0);

    const currentEngagements = currentAnalytics.reduce((sum, a) => sum + a.engagement, 0);
    const prevEngagements = prevAnalytics.reduce((sum, a) => sum + a.engagement, 0);

    const impressionsDelta = prevImpressions > 0 ? ((currentImpressions - prevImpressions) / prevImpressions) * 100 : 100;
    const engagementsDelta = prevEngagements > 0 ? ((currentEngagements - prevEngagements) / prevEngagements) * 100 : 100;

    const currentEngagementRate = currentImpressions > 0 ? (currentEngagements / currentImpressions) * 100 : 0;
    const prevEngagementRate = prevImpressions > 0 ? (prevEngagements / prevImpressions) * 100 : 0;
    const engagementRateDelta = prevEngagementRate > 0 ? currentEngagementRate - prevEngagementRate : currentEngagementRate;

    const overview = {
      impressions: {
        value: `${(currentImpressions / 1000).toFixed(1)}K`,
        delta: `${Math.abs(impressionsDelta).toFixed(0)}%`,
        positive: impressionsDelta >= 0,
      },
      engagements: {
        value: `${(currentEngagements / 1000).toFixed(1)}K`,
        delta: `${Math.abs(engagementsDelta).toFixed(0)}%`,
        positive: engagementsDelta >= 0,
      },
      engagementRate: {
        value: `${currentEngagementRate.toFixed(1)}%`,
        delta: `${Math.abs(engagementRateDelta).toFixed(1)}%`,
        positive: engagementRateDelta >= 0,
      },
      followers: {
        value: '0', // Placeholder
        delta: '0%',
        positive: true,
      },
    };

    const sparklines = {
        imp: Array.from({ length: days }, (_, i) => {
            const dayStart = startDate + i * 24 * 60 * 60 * 1000;
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;
            const dayPosts = currentPosts.filter(p => p.createdAt >= dayStart && p.createdAt < dayEnd);
            const dayPostIds = dayPosts.map(p => p._id);
            const dayAnalytics = analytics.filter(a => dayPostIds.includes(a.postId));
            return dayAnalytics.reduce((sum, a) => sum + a.impressions, 0);
        }),
        eng: Array.from({ length: days }, (_, i) => {
            const dayStart = startDate + i * 24 * 60 * 60 * 1000;
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;
            const dayPosts = currentPosts.filter(p => p.createdAt >= dayStart && p.createdAt < dayEnd);
            const dayPostIds = dayPosts.map(p => p._id);
            const dayAnalytics = analytics.filter(a => dayPostIds.includes(a.postId));
            return dayAnalytics.reduce((sum, a) => sum + a.engagement, 0);
        }),
    };

    const heatmap: Record<string, number[]> = {
      Mon: [0, 0, 0, 0, 0, 0],
      Tue: [0, 0, 0, 0, 0, 0],
      Wed: [0, 0, 0, 0, 0, 0],
      Thu: [0, 0, 0, 0, 0, 0],
      Fri: [0, 0, 0, 0, 0, 0],
      Sat: [0, 0, 0, 0, 0, 0],
      Sun: [0, 0, 0, 0, 0, 0],
    };

    const platformAnalytics = posts.flatMap(p => 
        p.platforms.map(platform => ({
            ...p,
            platform,
            analytics: analytics.find(a => a.postId === p._id && a.platform === platform) || {impressions: 0, engagement: 0}
        }))
    );

    const platformComparison = Object.entries(
        platformAnalytics.reduce((acc, pa) => {
            if (!acc[pa.platform]) {
                acc[pa.platform] = { impressions: 0, engagement: 0, posts: 0 };
            }
            acc[pa.platform].impressions += pa.analytics.impressions;
            acc[pa.platform].engagement += pa.analytics.engagement;
            acc[pa.platform].posts += 1;
            return acc;
        }, {} as Record<string, { impressions: number; engagement: number; posts: number }>)
    ).map(([name, data]) => ({
        name,
        impressions: data.impressions,
        engagement: data.engagement,
        er: data.impressions > 0 ? (data.engagement / data.impressions) * 100 : 0,
        ...PLATFORM_DETAILS[name],
    }));

    const generationJobs = await ctx.db.query("generationJobs").withIndex("by_userId", q => q.eq("userId", user.clerkId as string)).collect();

    const contentTypePerformance = Object.entries(
        generationJobs.reduce((acc, job) => {
            const type = job.template || 'Text Only'; // Assume 'Text Only' if no template
            if (!acc[type]) {
                acc[type] = { posts: 0, impressions: 0, engagement: 0 };
            }
            acc[type].posts += 1;
            // This is a simplification. We'd need to link jobs to posts to get real impressions/engagement
            return acc;
        }, {} as Record<string, { posts: number; impressions: number; engagement: number }>)
    ).map(([type, data]) => ({
        type,
        avg_er: 0, // Placeholder
        posts: data.posts,
        impressions: '0K', // Placeholder
        ...CONTENT_TYPE_DETAILS[type] || { color: 'bg-gray-500', widthClass: 'w-[10%]' }
    }));

    return {
      overview,
      sparklines,
      heatmap,
      platformComparison,
      contentTypePerformance
    };
  },
});
