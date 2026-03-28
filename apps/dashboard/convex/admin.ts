import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ADMIN_EMAILS = ["admin@firefly.events", "mathew@firefly.events", "don@firefly.events"];

async function checkAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  
  // In production, we should check for a specific role in publicMetadata or a list of admin emails
  // For now, let's assume if they have 'admin' in their role or are in the list
  const role = (identity as any).role;
  if (role !== "admin" && !ADMIN_EMAILS.includes(identity.email || "")) {
    throw new Error("Unauthorized: Admin access required");
  }
  return identity;
}

export const getTierConfigs = query({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);
    return await ctx.db.query("socialTierConfigs").collect();
  },
});

export const updateTierConfig = mutation({
  args: {
    id: v.id("socialTierConfigs"),
    updates: v.object({
      monthlyPrice: v.optional(v.number()),
      aiCaptionsLimit: v.optional(v.number()),
      videoGenLimit: v.optional(v.number()),
      voiceClonesLimit: v.optional(v.number()),
      directPosting: v.optional(v.boolean()),
      platforms: v.optional(v.array(v.string())),
      scheduling: v.optional(v.boolean()),
      analyticsAccess: v.optional(v.boolean()),
      analyticsDepth: v.optional(v.string()),
      automations: v.optional(v.boolean()),
      flowLimit: v.optional(v.number()),
      apiAccess: v.optional(v.boolean()),
      rateLimit: v.optional(v.number()),
      whiteLabel: v.optional(v.boolean()),
      prioritySupport: v.optional(v.boolean()),
      exportQualityCap: v.optional(v.string()),
      customFeatures: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const admin = await checkAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Tier config not found");

    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
      updatedBy: admin.subject,
    });

    await ctx.db.insert("superAdminAuditLogs", {
      adminId: admin.subject,
      action: "update_tier_config",
      targetId: existing.tierId,
      details: { old: existing, new: args.updates },
      timestamp: Date.now(),
    });
  },
});

export const getPlatformMetrics = query({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);
    
    const users = await ctx.db.query("users").collect();
    const posts = await ctx.db.query("posts").collect();
    
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => u.plan !== "free").length;
    
    // Simple MRR calculation based on plan (placeholder)
    const mrr = users.reduce((acc, u) => {
      if (u.plan === "starter") return acc + 9.99;
      if (u.plan === "basic") return acc + 14.99;
      if (u.plan === "pro") return acc + 29.99;
      if (u.plan === "business") return acc + 100;
      if (u.plan === "agency") return acc + 299;
      return acc;
    }, 0);

    return {
      totalUsers,
      activeSubscriptions,
      mrr,
      totalContent: posts.length,
      tierDistribution: {
        free: users.filter(u => u.plan === "free").length,
        starter: users.filter(u => u.plan === "starter").length,
        basic: users.filter(u => u.plan === "basic").length,
        pro: users.filter(u => u.plan === "pro").length,
        business: users.filter(u => u.plan === "business").length,
        agency: users.filter(u => u.plan === "agency").length,
      }
    };
  },
});

export const getUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
    tierFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    let users = await ctx.db.query("users").collect();

    if (args.searchTerm) {
      const search = args.searchTerm.toLowerCase();
      users = users.filter(u => 
        u.email.toLowerCase().includes(search) || 
        (u.name && u.name.toLowerCase().includes(search))
      );
    }

    if (args.tierFilter && args.tierFilter !== "all") {
      users = users.filter(u => u.plan === args.tierFilter);
    }

    // Add content count for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const content = await ctx.db
        .query("posts")
        .withIndex("by_userId", q => q.eq("userId", user.clerkId || user._id))
        .collect();
      return {
        ...user,
        contentCount: content.length,
      };
    }));

    return usersWithStats;
  },
});

export const forceTierChange = mutation({
  args: {
    userId: v.id("users"),
    newTier: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await checkAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      plan: args.newTier,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("superAdminAuditLogs", {
      adminId: admin.subject,
      action: "force_tier_change",
      targetId: user.clerkId || user._id,
      details: { oldTier: user.plan, newTier: args.newTier },
      timestamp: Date.now(),
    });
  },
});

export const toggleBanUser = mutation({
  args: {
    userId: v.id("users"),
    isBanned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await checkAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      isBanned: args.isBanned,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("superAdminAuditLogs", {
      adminId: admin.subject,
      action: "toggle_ban_user",
      targetId: user.clerkId || user._id,
      details: { isBanned: args.isBanned },
      timestamp: Date.now(),
    });
  },
});

export const startImpersonation = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await checkAdmin(ctx);
    const user = await ctx.db.get(args.targetUserId);
    if (!user) throw new Error("User not found");

    // Remove any existing impersonation for this admin
    const existing = await ctx.db
      .query("impersonations")
      .withIndex("by_adminId", q => q.eq("adminId", admin.subject))
      .collect();
    for (const imp of existing) {
      await ctx.db.delete(imp._id);
    }

    await ctx.db.insert("impersonations", {
      adminId: admin.subject,
      targetUserId: args.targetUserId,
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes (per AC)
    });

    await ctx.db.insert("superAdminAuditLogs", {
      adminId: admin.subject,
      action: "start_impersonation",
      targetId: user.clerkId || user._id,
      details: { targetUserId: user._id },
      timestamp: Date.now(),
    });
  },
});

export const endImpersonation = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await checkAdmin(ctx);
    const existing = await ctx.db
      .query("impersonations")
      .withIndex("by_adminId", q => q.eq("adminId", admin.subject))
      .collect();
    for (const imp of existing) {
      await ctx.db.delete(imp._id);
    }

    await ctx.db.insert("superAdminAuditLogs", {
      adminId: admin.subject,
      action: "end_impersonation",
      details: {},
      timestamp: Date.now(),
    });
  },
});

export const getImpersonation = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const imp = await ctx.db
      .query("impersonations")
      .withIndex("by_adminId", q => q.eq("adminId", identity.subject))
      .first();

    if (imp && imp.expiresAt > Date.now()) {
      const user = await ctx.db.get(imp.targetUserId);
      return {
        _id: imp._id,
        targetUserId: imp.targetUserId,
        userName: user?.name || user?.email || "Unknown",
        userTier: user?.plan || "free",
        expiresAt: imp.expiresAt,
      };
    }
    return null;
  },
});

export const seedTierConfigs = mutation({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);
    const existing = await ctx.db.query("socialTierConfigs").collect();
    if (existing.length > 0) return;

    const tiers = [
      {
        tierId: "free",
        tierName: "Free",
        monthlyPrice: 0,
        aiCaptionsLimit: 10,
        videoGenLimit: 2,
        voiceClonesLimit: 0,
        directPosting: false,
        platforms: [],
        scheduling: false,
        analyticsAccess: false,
        analyticsDepth: "none",
        automations: false,
        flowLimit: 0,
        apiAccess: false,
        rateLimit: 0,
        whiteLabel: false,
        prioritySupport: false,
        exportQualityCap: "720p",
        customFeatures: {},
      },
      {
        tierId: "starter",
        tierName: "Starter",
        monthlyPrice: 9.99,
        aiCaptionsLimit: 50,
        videoGenLimit: 10,
        voiceClonesLimit: 1,
        directPosting: true,
        platforms: ["twitter", "linkedin"],
        scheduling: true,
        analyticsAccess: true,
        analyticsDepth: "basic",
        automations: true,
        flowLimit: 3,
        apiAccess: false,
        rateLimit: 0,
        whiteLabel: false,
        prioritySupport: false,
        exportQualityCap: "1080p",
        customFeatures: {},
      },
      {
        tierId: "basic",
        tierName: "Basic",
        monthlyPrice: 14.99,
        aiCaptionsLimit: 100,
        videoGenLimit: 25,
        voiceClonesLimit: 3,
        directPosting: true,
        platforms: ["twitter", "linkedin", "instagram"],
        scheduling: true,
        analyticsAccess: true,
        analyticsDepth: "advanced",
        automations: true,
        flowLimit: 7,
        apiAccess: false,
        rateLimit: 0,
        whiteLabel: false,
        prioritySupport: false,
        exportQualityCap: "1080p",
        customFeatures: {},
      },
      {
        tierId: "pro",
        tierName: "Pro",
        monthlyPrice: 29.99,
        aiCaptionsLimit: 500,
        videoGenLimit: 100,
        voiceClonesLimit: 10,
        directPosting: true,
        platforms: ["twitter", "linkedin", "instagram", "tiktok", "facebook"],
        scheduling: true,
        analyticsAccess: true,
        analyticsDepth: "full",
        automations: true,
        flowLimit: 15,
        apiAccess: true,
        rateLimit: 100,
        whiteLabel: false,
        prioritySupport: true,
        exportQualityCap: "4k",
        customFeatures: {},
      },
      {
        tierId: "business",
        tierName: "Business",
        monthlyPrice: 100,
        aiCaptionsLimit: 2000,
        videoGenLimit: 500,
        voiceClonesLimit: 50,
        directPosting: true,
        platforms: ["twitter", "linkedin", "instagram", "tiktok", "facebook", "youtube"],
        scheduling: true,
        analyticsAccess: true,
        analyticsDepth: "full",
        automations: true,
        flowLimit: 50,
        apiAccess: true,
        rateLimit: 500,
        whiteLabel: true,
        prioritySupport: true,
        exportQualityCap: "4k",
        customFeatures: {},
      },
      {
        tierId: "agency",
        tierName: "Agency",
        monthlyPrice: 299,
        aiCaptionsLimit: 10000,
        videoGenLimit: 2000,
        voiceClonesLimit: 200,
        directPosting: true,
        platforms: ["all"],
        scheduling: true,
        analyticsAccess: true,
        analyticsDepth: "full",
        automations: true,
        flowLimit: 200,
        apiAccess: true,
        rateLimit: 1000,
        whiteLabel: true,
        prioritySupport: true,
        exportQualityCap: "4k",
        customFeatures: {},
      }
    ];

    for (const tier of tiers) {
      await ctx.db.insert("socialTierConfigs", {
        ...tier,
        updatedAt: Date.now(),
        updatedBy: "system",
      });
    }
  },
});
