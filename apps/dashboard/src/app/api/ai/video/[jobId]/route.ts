import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getVideoJob } from '../_store';

export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { jobId } = await params;
  const job = getVideoJob(jobId);

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  if (job.userId && job.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({
    jobId,
    status: job.status,
    videoUrl: job.videoUrl,
    error: job.error,
  });
}
