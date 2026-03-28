import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { ConvexError } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'


/** Get a single workflow run by its ID. */
export const get = query({
  args: { id: v.id('workflow_runs') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/** Get all runs for a given workflow */
export const getRunsForWorkflow = query({
  args: { workflowId: v.id('workflows') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workflow_runs')
      .withIndex('by_workflowId', q => q.eq('workflowId', args.workflowId))
      .order('desc')
      .collect()
  }
})

/** Get the most recent run for a workflow */
export const getLastRunForWorkflow = query({
  args: { workflowId: v.id('workflows') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workflow_runs')
      .withIndex('by_workflowId', q => q.eq('workflowId', args.workflowId))
      .order('desc')
      .first()
  }
})

/** Create a new workflow run record. Returns the new run's ID. */
export const create = mutation({
  args: {
    workflowId: v.id('workflows'),
    status: v.string(),
    triggeredBy: v.string(), // e.g. "manual", "schedule", "webhook"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError('Not authenticated')

    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) throw new ConvexError('Workflow not found')

    const docId = await ctx.db.insert('workflow_runs', {
      workflowId: args.workflowId,
      userId: identity.subject,
      status: args.status,
      triggeredBy: args.triggeredBy,
    })
    return docId
  },
})

/** Patch an existing workflow run by ID. Returns the updated document. */
export const update = mutation({
  args: {
    id: v.id('workflow_runs'),
    status: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    output: v.optional(v.any()),
    logs: v.optional(v.array(v.string())),
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
