import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

export async function POST(req: NextRequest) {
  const { runId } = await req.json()
  if (!runId) {
    return new NextResponse(JSON.stringify({ error: 'runId is required' }), { status: 400 })
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  try {
    const run = await convex.query(api.workflowRuns.get, { id: runId as Id<'workflow_runs'> })
    if (!run) {
      return new NextResponse(JSON.stringify({ error: 'Run not found' }), { status: 404 })
    }

    const workflow = await convex.query(api.workflows.get, { id: run.workflowId })
    if (!workflow) {
      return new NextResponse(JSON.stringify({ error: 'Workflow not found' }), { status: 404 })
    }

    await convex.mutation(api.workflowRuns.update, {
      id: runId,
      status: 'running',
      logs: ['Workflow run started...'],
    })

    if (process.env.N8N_WEBHOOK_URL) {
      // Execute via n8n webhook
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, workflow }),
      })
    } else {
      // Simulate local execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      await convex.mutation(api.workflowRuns.update, {
        id: runId,
        status: 'success',
        logs: ['Workflow run completed successfully.'],
        output: JSON.stringify({ result: 'OK' }),
      })
    }

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error running workflow:', error)
    await convex.mutation(api.workflowRuns.update, {
      id: runId,
      status: 'failed',
      logs: ['Workflow run failed.', JSON.stringify(error)],
    })
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
