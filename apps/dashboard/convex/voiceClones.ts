import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        if (identity.subject !== args.userId) {
            throw new Error("Not authorized");
        }

        return await ctx.db
            .query("voice_clones")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const get = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        if (identity.subject !== args.userId) {
            throw new Error("Not authorized");
        }

        return await ctx.db
            .query("voice_clones")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.string(),
        name: v.string(),
        voiceId: v.string(),
        sampleUrl: v.string(),
        status: v.string(),
        externalId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        if (identity.subject !== args.userId) {
            throw new Error("Not authorized");
        }

        return await ctx.db.insert("voice_clones", {
            userId: args.userId,
            name: args.name,
            voiceId: args.voiceId,
            sampleUrl: args.sampleUrl,
            status: args.status,
            externalId: args.externalId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});
