import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert a social account record by userId + platform.
 * Called from Next.js API routes after a successful OAuth callback.
 * Encryption is performed in the API route — this function receives already-encrypted tokens.
 */
export const upsertSocialAccount = mutation({
  args: {
    userId: v.string(),
    platform: v.string(),
    handle: v.string(),
    platformUserId: v.optional(v.string()),
    encryptedAccessToken: v.optional(v.string()),
    encryptedRefreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.optional(v.array(v.string())),
    zernioAccountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("socialAccounts")
      .withIndex("by_userId_platform", (q) =>
        q.eq("userId", args.userId).eq("platform", args.platform)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        handle: args.handle,
        platformUserId: args.platformUserId,
        encryptedAccessToken: args.encryptedAccessToken,
        encryptedRefreshToken: args.encryptedRefreshToken,
        tokenExpiresAt: args.tokenExpiresAt,
        scopes: args.scopes,
        zernioAccountId: args.zernioAccountId,
        connectedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("socialAccounts", {
      userId: args.userId,
      platform: args.platform,
      handle: args.handle,
      platformUserId: args.platformUserId,
      encryptedAccessToken: args.encryptedAccessToken,
      encryptedRefreshToken: args.encryptedRefreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
      scopes: args.scopes,
      zernioAccountId: args.zernioAccountId,
      connectedAt: now,
    });
  },
});

/**
 * Get all social accounts for the currently authenticated user.
 * Uses ctx.auth so the caller doesn't need to pass a userId — the identity
 * is derived from the Clerk JWT token embedded in the Convex request.
 */
export const getSocialAccounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("socialAccounts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

/**
 * Delete a social account by userId + platform.
 * Called from the disconnect API route after verifying Clerk auth.
 */
export const deleteSocialAccount = mutation({
  args: {
    userId: v.string(),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("socialAccounts")
      .withIndex("by_userId_platform", (q) =>
        q.eq("userId", args.userId).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
