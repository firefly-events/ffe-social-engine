import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createComposedVideo = mutation({
  args: {
    userId: v.string(),
    platform: v.string(),
    format: v.string(),
    textOverlay: v.optional(v.string()),
    sourceVideoUrl: v.string(),
    composerJobId: v.optional(v.string()),
    status: v.string(),
    storageId: v.optional(v.id('_storage')),
    resultUrl: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => ctx.db.insert('composedVideos', args),
})

export const updateComposedVideo = mutation({
  args: {
    id: v.id('composedVideos'),
    status: v.optional(v.string()),
    resultUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    composerJobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args
    const updates = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined))
    await ctx.db.patch(id, updates)
  },
})

export const getComposedVideo = query({
  args: { id: v.id('composedVideos') },
  handler: async (ctx, { id }) => ctx.db.get(id),
})

export const listComposedVideos = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) =>
    ctx.db.query('composedVideos').withIndex('by_userId', (q) => q.eq('userId', userId)).order('desc').collect(),
})
