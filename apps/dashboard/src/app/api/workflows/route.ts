/**
 * GET  /api/workflows — list workflows for the authenticated user
 * POST /api/workflows — create a new workflow (tier-limited, FIR-1305)
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
  generateId,
  paginate,
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '@convex/_generated/api'
import type { WorkflowItem, CreateWorkflowBody, WorkflowStatus } from '@/lib/api-types'
import { planToTier, getWorkflowLimit } from '@/lib/tier-limits'

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

    // ── Tier limit check (FIR-1305) — done atomically inside the mutation ──
    const userDoc = await convexClient.query(api.users.getUser, { clerkId: session.userId })
    const plan = (userDoc as Record<string, unknown> | null)?.plan as string | undefined
    const tier = planToTier(plan)
    const limit = getWorkflowLimit(tier)
    // Pass -1 for unlimited tiers (business / agency) so the mutation skips the check.
    const tierLimit = isFinite(limit) ? limit : -1
    // ── End tier check (count + create is atomic inside createWithLimitCheck) ─

    const externalId = generateId('wf')

    let doc: Record<string, unknown>
    try {
      doc = await convexClient.mutation(api.workflows.createWithLimitCheck, {
        externalId,
        userId:      session.userId,
        name:        body.name.trim(),
        description: body.description,
        nodes:       body.nodes  ?? [],
        edges:       body.edges  ?? [],
        config:      body.config ?? {},
        tierLimit,
      }) as Record<string, unknown>
    } catch (err: unknown) {
      // ConvexError thrown by createWithLimitCheck when limit is exceeded
      const convexData = (err as { data?: { code?: string; used?: number; limit?: number } }).data
      if (convexData?.code === 'LIMIT_EXCEEDED') {
        const { used, limit: lim } = convexData
        return forbidden(
          `Upgrade to Pro for more automations (${used}/${lim} used)`
        )
      }
      throw err
    }

    return created(toWorkflowItem(doc))
  } catch (err) {
    console.error('[POST /api/workflows]', err)
    return serverError()
  }
}
