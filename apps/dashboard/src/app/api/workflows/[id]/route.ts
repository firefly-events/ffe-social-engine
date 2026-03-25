/**
 * GET    /api/workflows/[id] — fetch a single workflow
 * PATCH  /api/workflows/[id] — update workflow definition or status
 * DELETE /api/workflows/[id] — delete a workflow
 *
 * TODO(migration): Replace workflowStore Map calls with Convex / MongoDB.
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
  nowISO,
} from '@/lib/api-helpers'
import { workflowStore } from '@/lib/api-store'
import type { UpdateWorkflowBody } from '@/lib/api-types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    // TODO(migration): → Convex query / MongoDB findOne
    const workflow = workflowStore.get(id)
    if (!workflow) return notFound('Workflow')

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
    // TODO(migration): → Convex / MongoDB findOne
    const workflow = workflowStore.get(id)
    if (!workflow) return notFound('Workflow')

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

    const updated = {
      ...workflow,
      ...(body.name        !== undefined && { name:        body.name.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status      !== undefined && { status:      body.status }),
      ...(body.nodes       !== undefined && { nodes:       body.nodes }),
      ...(body.edges       !== undefined && { edges:       body.edges }),
      ...(body.config      !== undefined && { config:      body.config }),
      updatedAt: nowISO(),
    }

    // TODO(migration): → Convex mutation / MongoDB updateOne
    workflowStore.set(id, updated)

    return ok(updated)
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
    // TODO(migration): → Convex / MongoDB findOne
    const workflow = workflowStore.get(id)
    if (!workflow) return notFound('Workflow')

    if (!assertOwner(workflow.userId, session.userId)) return forbidden()

    if (workflow.status === 'active') {
      return badRequest('Cannot delete an active workflow. Pause or archive it first.')
    }

    // TODO(migration): → Convex mutation / MongoDB deleteOne
    workflowStore.delete(id)

    return noContent()
  } catch (err) {
    console.error('[DELETE /api/workflows/[id]]', err)
    return serverError()
  }
}
