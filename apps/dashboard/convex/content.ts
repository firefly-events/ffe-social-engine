import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    userId: v.string(),
    text: v.string(),
    status: v.string(),
    platforms: v.array(v.string()),
    prompt: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    externalId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const contentId = await ctx.db.insert('content', {
      userId: args.userId,
      externalId: args.externalId ?? `content-${now}`,
      text: args.text,
      status: args.status,
      platforms: args.platforms,
      prompt: args.prompt,
      aiModel: args.aiModel,
      imageUrl: args.imageUrl,
      videoUrl: args.videoUrl,
      audioUrl: args.audioUrl,
      createdAt: args.createdAt ?? now,
      updatedAt: args.updatedAt ?? now,
    });

    return contentId;
  },
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

export const update = mutation({
  args: {
    id: v.id("content"),
    externalId: v.optional(v.string()),
    text: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    prompt: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: fields.updatedAt ?? Date.now() });
  },
});

export const updateByExternalId = mutation({
  args: {
    externalId: v.string(),
    text: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    prompt: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { externalId, ...fields } = args;
    const doc = await ctx.db
      .query("content")
      .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
      .first();
    if (!doc) throw new Error(`Content not found: ${externalId}`);
    await ctx.db.patch(doc._id, { ...fields, updatedAt: fields.updatedAt ?? Date.now() });
    return doc._id;
  },
});

export const remove = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("content")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (doc) await ctx.db.delete(doc._id);
  },
});

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

export const get = query({
  args: {
    _id: v.string(),
    tableName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Look up in the generationJobs table (primary content source)
    const jobs = await ctx.db
      .query('generationJobs')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();

    const match = jobs.find((j) => j._id.toString() === args._id);
    if (match) return match;

    // Fallback: try content table
    const content = await ctx.db
      .query('content')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();

    return content.find((c) => c._id.toString() === args._id) || null;
  },
});

export const list = query({
  args: {
    userId: v.string(),
    filter: v.optional(v.string()),
    status: v.optional(v.string()),
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
    after: v.optional(v.number()),
    before: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
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
