import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert a social account record by userId + platform.
 * Called from Next.js API routes after a successful OAuth callback.
 * Encryption is performed in the API route — this function receives already-encrypted tokens.
 *
 * userId is derived from ctx.auth.getUserIdentity() — callers must not supply it.
 */
export const upsertSocialAccount = mutation({
  args: {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: must be signed in to connect a social account");
    }
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("socialAccounts")
      .withIndex("by_userId_platform", (q) =>
        q.eq("userId", userId).eq("platform", args.platform)
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
      userId,
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
 * Only returns safe public fields — never returns encrypted tokens or sensitive data.
 */
export const getSocialAccounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .collect();

    // Project only safe fields — never expose encrypted tokens
    return accounts.map((account) => ({
      _id: account._id,
      platform: account.platform,
      handle: account.handle,
      connectedAt: account.connectedAt,
    }));
  },
});

/**
 * Delete a social account for the currently authenticated user.
 * userId is derived from ctx.auth — callers must not supply it.
 */
export const deleteSocialAccount = mutation({
  args: {
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: must be signed in to disconnect a social account");
    }
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("socialAccounts")
      .withIndex("by_userId_platform", (q) =>
        q.eq("userId", userId).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
