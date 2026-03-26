/**
 * GET  /api/workflows — list workflows for the authenticated user
 * POST /api/workflows — create a new workflow
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
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '@convex/_generated/api'
import type { WorkflowItem, CreateWorkflowBody, WorkflowStatus } from '@/lib/api-types'

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

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const sp     = request.nextUrl.searchParams
    const status = sp.get('status') as WorkflowStatus | null
    const cursor = sp.get('cursor') ?? undefined
    const limit  = Math.min(Number(sp.get('limit') ?? 20), 100)

    const docs = await convexClient.query(api.workflows.list, {
      userId: session.userId,
      status: status ?? undefined,
    })

    const items = (docs as Record<string, unknown>[]).map(toWorkflowItem)
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

    const nowMs = Date.now()
    const externalId = generateId('wf')

    const doc = await convexClient.mutation(api.workflows.create, {
      externalId,
      userId:      session.userId,
      name:        body.name.trim(),
      description: body.description,
      status:      'draft',
      nodes:       body.nodes  ?? [],
      edges:       body.edges  ?? [],
      config:      body.config ?? {},
      runCount:    0,
      createdAt:   nowMs,
      updatedAt:   nowMs,
    })

    return created(toWorkflowItem(doc as Record<string, unknown>))
  } catch (err) {
    console.error('[POST /api/workflows]', err)
    return serverError()
  }
}
