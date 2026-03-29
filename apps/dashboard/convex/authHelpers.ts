import { ConvexError } from 'convex/values';
import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';

export type AuthContext = QueryCtx | MutationCtx;

/**
 * Returns the current authenticated user's Convex document, or null if not authenticated.
 * Looks up the user by clerkId (identity.subject).
 * Supports impersonation for admin users.
 */
export async function getCurrentUser(ctx: AuthContext): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Check for impersonation
  const impersonation = await ctx.db
    .query("impersonations")
    .withIndex("by_adminId", q => q.eq("adminId", identity.subject))
    .first();

  if (impersonation) {
    if (impersonation.expiresAt > Date.now()) {
      return await ctx.db.get(impersonation.targetUserId);
    }
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .first();

  return user;
}

/**
 * Returns a user by their clerkId.
 * Throws an error if the user is not found.
 */
export async function getUserByClerkId(ctx: AuthContext, clerkId: string): Promise<Doc<'users'>> {
    const user = await ctx.db
        .query('users')
        .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
        .first();

    if (!user) {
        throw new ConvexError('User not found');
    }

    return user;
}

/**
 * Returns the current authenticated user's Convex _id, or null if not authenticated.
 */
export async function getCurrentUserId(ctx: AuthContext): Promise<Id<'users'> | null> {
  const user = await getCurrentUser(ctx);
  return user ? user._id : null;
}

/**
 * Returns the current authenticated user's Convex document.
 * Throws an error if the user is not authenticated or not found in the database.
 */
export async function requireUser(ctx: AuthContext): Promise<Doc<'users'>> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError('Not authenticated');
    }

    const user = await ctx.db
        .query('users')
        .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
        .first();

    if (!user) {
        throw new ConvexError('User not found — Clerk webhook may not have synced yet');
    }

    return user;
}

/**
 * Returns the current authenticated user's Convex _id.
 * Throws an error if the user is not authenticated or not found in the database.
 * Supports impersonation for admin users.
 */
export async function requireAuth(ctx: AuthContext): Promise<Id<'users'>> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new ConvexError('User not found or not authenticated');
  }

  return user._id;
}
