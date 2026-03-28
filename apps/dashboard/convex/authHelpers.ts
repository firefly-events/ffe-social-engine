import { ConvexError } from 'convex/values';
import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';

export type AuthContext = QueryCtx | MutationCtx;

/**
 * Returns the current authenticated user's Convex document, or null if not authenticated.
 * Looks up the user by clerkId (identity.subject).
 */
export async function getCurrentUser(ctx: AuthContext): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
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
 */
export async function requireAuth(ctx: AuthContext): Promise<Id<'users'>> {
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

  return user._id;
}
