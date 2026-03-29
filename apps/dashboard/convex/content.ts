import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const saveGeneration = mutation({
  args: {
    type: v.string(),
    topic: v.string(),
    platform: v.optional(v.string()),
    template: v.optional(v.string()),
    model: v.string(),
    result: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const generationJobId = await ctx.db.insert('generationJobs', {
      userId,
      type: args.type,
      topic: args.topic,
      platform: args.platform,
      template: args.template,
      model: args.model,
      status: 'completed',
      result: args.result,
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    return generationJobId;
  },
});

export const list = query({
  args: {
    userId: v.string(),
    filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    if (identity.subject !== args.userId) {
      throw new Error('Not authorized');
    }

    let items = await ctx.db
      .query('content')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    if (args.filter) {
      items = items.filter((item) => item.status === args.filter);
    }

    return items;
  },
});

export const deleteItem = mutation({
  args: { id: v.id('content') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error('Content not found');
    }

    if (item.userId !== identity.subject) {
      throw new Error('Not authorized');
    }

    await ctx.db.delete(args.id);
  },
});
