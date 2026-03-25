/**
 * GET  /api/workflows — list workflows for the authenticated user
 * POST /api/workflows — create a new workflow
 *
 * TODO(migration): Replace workflowStore Map calls with Convex / MongoDB "workflows" collection.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  serverError,
  generateId,
  paginate,
  nowISO,
} from '@/lib/api-helpers'
import { workflowStore } from '@/lib/api-store'
import type { WorkflowItem, CreateWorkflowBody, WorkflowStatus } from '@/lib/api-types'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const sp     = request.nextUrl.searchParams
    const status = sp.get('status') as WorkflowStatus | null
    const cursor = sp.get('cursor') ?? undefined
    const limit  = Math.min(Number(sp.get('limit') ?? 20), 100)

    // TODO(migration): → Convex query / MongoDB find({ userId }) with optional status filter
    let items = Array.from(workflowStore.values())
      .filter((w) => w.userId === session.userId)

    if (status) items = items.filter((w) => w.status === status)

    // Sort newest-first
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const { page, nextCursor } = paginate(items, cursor, limit)

    return ok({ items: page, nextCursor, total: items.length })
  } catch (err) {
    console.error('[GET /api/workflows]', err)
    return serverError()
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    let body: CreateWorkflowBody
    try {
      body = await request.json() as CreateWorkflowBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (!body.name?.trim()) return badRequest('name is required')

    const now      = nowISO()
    const workflow: WorkflowItem = {
      id:          generateId('wf'),
      userId:      session.userId,
      name:        body.name.trim(),
      description: body.description,
      status:      'draft',
      nodes:       body.nodes  ?? [],
      edges:       body.edges  ?? [],
      config:      body.config ?? {},
      runCount:    0,
      createdAt:   now,
      updatedAt:   now,
    }

    // TODO(migration): → Convex mutation / MongoDB insertOne
    workflowStore.set(workflow.id, workflow)

    return created(workflow)
  } catch (err) {
    console.error('[POST /api/workflows]', err)
    return serverError()
  }
}
