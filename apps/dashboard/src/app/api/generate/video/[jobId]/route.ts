/**
 * GET /api/generate/video/[jobId]
 *
 * Polls the status of a video generation job.
 * Returns current status, and videoUrl when complete.
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await params

    let job: any
    try {
      job = await fetchQuery(api.generations.getJob, { id: jobId as Id<'generationJobs'> })
    } catch {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      jobId:    job._id,
      status:   job.status,
      videoUrl: job.result?.videoUrl ?? null,
      metadata: job.result?.metadata ?? null,
      error:    job.error ?? null,
    })
  } catch (err: any) {
    console.error('[GET /api/generate/video/[jobId]]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
