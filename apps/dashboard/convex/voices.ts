/**
 * voices.ts — Convex mutations and queries for voice_clones table.
 *
 * Called from Next.js API routes via ConvexHttpClient (server-side).
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── MUTATIONS ─────────────────────────────────────────────────────────────────

/**
 * Insert a new voice clone record.
 * Returns the Convex _id for the created record.
 */
export const createVoiceClone = mutation({
  args: {
    userId:    v.string(),
    name:      v.string(),
    /** The ID used by the voice-gen service (filename stem). */
    voiceId:   v.string(),
    sampleUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("voice_clones", {
      userId:    args.userId,
      name:      args.name,
      voiceId:   args.voiceId,
      sampleUrl: args.sampleUrl,
      status:    "ready",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update the status (and optional error message) of a voice clone.
 */
export const updateVoiceCloneStatus = mutation({
  args: {
    id:           v.id("voice_clones"),
    status:       v.union(v.literal("processing"), v.literal("ready"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status:       args.status,
      errorMessage: args.errorMessage,
      updatedAt:    Date.now(),
    });
  },
});

/**
 * Delete a voice clone record by ID.
 * Caller must validate ownership before invoking.
 */
export const deleteVoiceClone = mutation({
  args: {
    id:     v.id("voice_clones"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const clone = await ctx.db.get(args.id);
    if (!clone) return;
    if (clone.userId !== args.userId) {
      throw new Error("Forbidden: voice clone does not belong to this user");
    }
    await ctx.db.delete(args.id);
  },
});

// ── QUERIES ───────────────────────────────────────────────────────────────────

/**
 * List all voice clones for a given user, sorted newest-first.
 */
export const getVoiceClonesByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voice_clones")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Fetch a single voice clone by its Convex _id and validate ownership.
 * Returns null if not found or if the userId doesn't match.
 */
export const getVoiceCloneById = query({
  args: {
    id:     v.id("voice_clones"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const clone = await ctx.db.get(args.id);
    if (!clone) return null;
    if (clone.userId !== args.userId) return null;
    return clone;
  },
});
