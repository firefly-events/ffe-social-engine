/**
 * POST /api/workflows/[id]/run — trigger a workflow run.
 *
 * Creates a WorkflowRun record and (in production) hands off execution to the
 * workflow engine. Currently returns a stub "running" run immediately.
 *
 * TODO(engine): After creating the WorkflowRun record, enqueue the job with
 * the workflow engine (e.g. a Upstash QStash task, a Redis queue, or a direct
 * call to the Express workflow-engine service).
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  assertOwner,
  generateId,
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '../../../../../../convex/_generated/api'
import type { WorkflowItem, WorkflowRun, WorkflowRunStatus, WorkflowStatus } from '@/lib/api-types'

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

/** Map a Convex workflow_runs document to the public WorkflowRun shape. */
function toWorkflowRun(doc: Record<string, unknown>): WorkflowRun {
  return {
    id:          doc.externalId as string,
    workflowId:  doc.workflowId as string,
    userId:      doc.userId as string,
    status:      doc.status as WorkflowRunStatus,
    snapshot:    doc.snapshot as WorkflowRun['snapshot'],
    startedAt:   new Date(doc.startedAt as number).toISOString(),
    completedAt: doc.completedAt != null ? new Date(doc.completedAt as number).toISOString() : undefined,
    error:       doc.error as string | undefined,
    output:      doc.output as Record<string, unknown> | undefined,
  }
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    const workflowDoc = await convexClient.query(api.workflows.getByExternalId, { externalId: id })
    if (!workflowDoc) return notFound('Workflow')

    const workflow = toWorkflowItem(workflowDoc as Record<string, unknown>)
    if (!assertOwner(workflow.userId, session.userId)) return forbidden()

    if (workflow.status === 'archived') {
      return badRequest('Cannot run an archived workflow')
    }
    if (workflow.status === 'paused') {
      return badRequest('Cannot run a paused workflow. Resume it first.')
    }
    if (workflow.nodes.length === 0) {
      return badRequest('Cannot run an empty workflow. Add at least one node.')
    }

    const nowMs = Date.now()
    const runExternalId = generateId('run')

    const runDoc = await convexClient.mutation(api.workflowRuns.create, {
      externalId:  runExternalId,
      workflowId:  id,
      userId:      session.userId,
      status:      'running',
      snapshot:    { nodes: workflow.nodes, edges: workflow.edges },
      startedAt:   nowMs,
    })

    // Update the workflow's run counter and lastRunAt
    await convexClient.mutation(api.workflows.update, {
      externalId: id,
      runCount:   workflow.runCount + 1,
      lastRunAt:  nowMs,
      updatedAt:  nowMs,
    })

    const run = toWorkflowRun(runDoc as Record<string, unknown>)

    // TODO(engine): Enqueue execution job here (QStash, BullMQ, etc.)
    // For now, simulate immediate completion in the background.
    void simulateRun(runExternalId)

    return created(run)
  } catch (err) {
    console.error('[POST /api/workflows/[id]/run]', err)
    return serverError()
  }
}

/** Placeholder: simulate workflow execution completing. Remove when real engine is wired. */
async function simulateRun(runExternalId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 2000))
  await convexClient.mutation(api.workflowRuns.update, {
    externalId:  runExternalId,
    status:      'completed',
    completedAt: Date.now(),
    output:      { message: 'Workflow completed successfully (simulated)' },
  })
}
