import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { api } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'


/** List workflows for a user with optional status filter, newest-first by updatedAt. */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError('Not authenticated')
    const items = await ctx.db
      .query('workflows')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .collect()

    // Newest-created first
    items.sort((a, b) => b._creationTime - a._creationTime)

    return items
  },
})

/** Get a single workflow by its ID. */
export const get = query({
  args: { id: v.id('workflows') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})


/** Create a new workflow. Returns the stored document's ID. */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError('Not authenticated')
    const docId = await ctx.db.insert('workflows', {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      status: 'draft',
      nodes: [],
      edges: [],
      config: {},
      runCount: 0,
    })
    return docId
  },
})

/** Patch an existing workflow by its ID. Returns the updated document. */
export const update = mutation({
  args: {
    id: v.id('workflows'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    nodes: v.optional(v.any()),
    edges: v.optional(v.any()),
    config: v.optional(v.any()),
    runCount: v.optional(v.number()),
    lastRunAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args
    const existing = await ctx.db.get(id)
    if (!existing) return null

    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    )
    await ctx.db.patch(id, cleanPatch)
    return await ctx.db.get(id)
  },
})

/** Hard-delete a workflow by ID. */
export const remove = mutation({
  args: { id: v.id('workflows') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) return false
    await ctx.db.delete(args.id)
    return true
  },
})

/** Get aggregate stats for all workflows for the current user. */
export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const allWorkflows = await ctx.db
      .query('workflows')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .collect()

    const allRuns = await ctx.db
      .query('workflow_runs')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .collect()

    return {
      total: allWorkflows.length,
      active: allWorkflows.filter(w => w.status === 'active').length,
      totalRuns: allRuns.length,
    }
  }
})

