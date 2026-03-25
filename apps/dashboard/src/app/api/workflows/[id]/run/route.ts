/**
 * POST /api/workflows/[id]/run — trigger a workflow run.
 *
 * Creates a WorkflowRun record and (in production) hands off execution to the
 * workflow engine. Currently returns a stub "running" run immediately.
 *
 * TODO(engine): After creating the WorkflowRun record, enqueue the job with
 * the workflow engine (e.g. a Upstash QStash task, a Redis queue, or a direct
 * call to the Express workflow-engine service).
 *
 * TODO(migration): Replace workflowStore / workflowRunStore with Convex / MongoDB.
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
  nowISO,
} from '@/lib/api-helpers'
import { workflowStore, workflowRunStore } from '@/lib/api-store'
import type { WorkflowRun } from '@/lib/api-types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await context.params
    // TODO(migration): → Convex query / MongoDB findOne
    const workflow = workflowStore.get(id)
    if (!workflow) return notFound('Workflow')

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

    const now = nowISO()
    const run: WorkflowRun = {
      id:         generateId('run'),
      workflowId: id,
      userId:     session.userId,
      status:     'running',
      snapshot:   {
        nodes: workflow.nodes,
        edges: workflow.edges,
      },
      startedAt: now,
    }

    // TODO(migration): → Convex mutation / MongoDB insertOne
    workflowRunStore.set(run.id, run)

    // Update the workflow's run counter and lastRunAt
    workflowStore.set(id, {
      ...workflow,
      runCount:  workflow.runCount + 1,
      lastRunAt: now,
      updatedAt: now,
    })

    // TODO(engine): Enqueue execution job here (QStash, BullMQ, etc.)
    // For now, simulate immediate completion in the background.
    void simulateRun(run.id)

    return created(run)
  } catch (err) {
    console.error('[POST /api/workflows/[id]/run]', err)
    return serverError()
  }
}

/** Placeholder: simulate workflow execution completing. Remove when real engine is wired. */
async function simulateRun(runId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 2000))
  const run = workflowRunStore.get(runId)
  if (run) {
    workflowRunStore.set(runId, {
      ...run,
      status:      'completed',
      completedAt: nowISO(),
      output:      { message: 'Workflow completed successfully (simulated)' },
    })
  }
}
