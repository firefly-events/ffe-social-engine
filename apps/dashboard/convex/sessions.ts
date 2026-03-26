import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new content session
export const createSession = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    template: v.optional(v.string()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentSessions", {
      ...args,
      messages: [],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Append a message to a session
export const appendMessage = mutation({
  args: {
    sessionId: v.id("contentSessions"),
    role: v.string(),
    content: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, role, content, model }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    const message = { role, content, timestamp: Date.now(), ...(model ? { model } : {}) };
    await ctx.db.patch(sessionId, {
      messages: [...session.messages, message],
      updatedAt: Date.now(),
    });
  },
});

// Save extracted content from session
export const saveExtracted = mutation({
  args: {
    sessionId: v.id("contentSessions"),
    text: v.string(),
  },
  handler: async (ctx, { sessionId, text }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    const extracted = session.extractedContent ?? [];
    await ctx.db.patch(sessionId, {
      extractedContent: [...extracted, { text, savedAt: Date.now() }],
      updatedAt: Date.now(),
    });
  },
});

// List user's sessions
export const listSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("contentSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

// Get single session
export const getSession = query({
  args: { sessionId: v.id("contentSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db.get(sessionId);
  },
});
