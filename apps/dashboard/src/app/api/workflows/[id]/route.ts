/**
 * GET    /api/workflows/[id] — fetch a single workflow
 * PATCH  /api/workflows/[id] — update workflow definition or status
 * DELETE /api/workflows/[id] — delete a workflow
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  assertOwner,
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '@convex/_generated/api'
import type { WorkflowItem, WorkflowStatus, UpdateWorkflowBody } from '@/lib/api-types'

interface RouteContext {
  params: Promise<{ id: string }>
}

/** Map a Convex workflow document to the public WorkflowItem shape. */
function toWorkflowItem(doc: Record<string, unknown>): WorkflowItem {
  return {
    id:          doc.externalId as string,
    userId:      doc.userId as string,
    name:        doc.name as string,
    description: doc.description as string | undefined,
    status:      doc.status as WorkflowStatus,
    nodes:       doc.nodes as WorkflowItem['nodes'],
    edges:       doc.edges as WorkflowItem['edges'],
    config:      doc.config as Record<string, unknown>,
    runCount:    doc.runCount as number,
    lastRunAt:   doc.lastRunAt != null ? new Date(doc.lastRunAt as number).toISOString() : undefined,
    createdAt:   new Date(doc.createdAt as number).toISOString(),
    updatedAt:   new Date(doc.updatedAt as number).toISOString(),
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const doc = await convexClient.query(api.workflows.getByExternalId, { externalId: id })
    if (!doc) return notFound('Workflow')

    const workflow = toWorkflowItem(doc as Record<string, unknown>)
    if (!assertOwner(workflow.userId, session.userId)) return forbidden()

    return ok(workflow)
  } catch (err) {
    console.error('[GET /api/workflows/[id]]', err)
    return serverError()
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const existing = await convexClient.query(api.workflows.getByExternalId, { externalId: id })
    if (!existing) return notFound('Workflow')

    const workflow = toWorkflowItem(existing as Record<string, unknown>)
    if (!assertOwner(workflow.userId, session.userId)) return forbidden()

    if (workflow.status === 'archived') {
      return badRequest('Cannot modify an archived workflow. Restore it first.')
    }

    let body: UpdateWorkflowBody
    try {
      body = await request.json() as UpdateWorkflowBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (body.name !== undefined && !body.name.trim()) {
      return badRequest('name must not be empty')
    }

    const updated = await convexClient.mutation(api.workflows.update, {
      externalId: id,
      ...(body.name        !== undefined && { name:        body.name.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status      !== undefined && { status:      body.status }),
      ...(body.nodes       !== undefined && { nodes:       body.nodes }),
      ...(body.edges       !== undefined && { edges:       body.edges }),
      ...(body.config      !== undefined && { config:      body.config }),
      updatedAt: Date.now(),
    })

    if (!updated) return notFound('Workflow')

    return ok(toWorkflowItem(updated as Record<string, unknown>))
  } catch (err) {
    console.error('[PATCH /api/workflows/[id]]', err)
    return serverError()
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const doc = await convexClient.query(api.workflows.getByExternalId, { externalId: id })
    if (!doc) return notFound('Workflow')

    const workflow = toWorkflowItem(doc as Record<string, unknown>)
    if (!assertOwner(workflow.userId, session.userId)) return forbidden()

    if (workflow.status === 'active') {
      return badRequest('Cannot delete an active workflow. Pause or archive it first.')
    }

    await convexClient.mutation(api.workflows.remove, { externalId: id })

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/workflows/[id]]', err)
    return serverError()
  }
}
