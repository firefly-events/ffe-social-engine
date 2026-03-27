import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { convexClient } from '@/lib/convex-client';
import { api } from '@convex/_generated/api';

export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { jobId } = await params;
  
  // Query Convex for the job
  // getByExternalId uses the 'topic' field which we used to store jobId
  const job = await convexClient.query(api.generationJobs.getByExternalId, { externalId: jobId });

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  if (job.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({
    jobId,
    status: job.status === 'ready' ? 'ready' : job.status === 'error' ? 'error' : 'processing',
    videoUrl: job.result?.videoUrl,
    error: job.error,
  });
}
