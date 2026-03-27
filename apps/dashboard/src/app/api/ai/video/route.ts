import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { convexClient } from '@/lib/convex-client';
import { api } from '@convex/_generated/api';
import { generateId } from '@/lib/api-helpers';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prompt, duration = 6, aspectRatio = '9:16' } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 });

    const isDemoMode = !process.env.HAILUO_API_KEY;

    // If using demo path, don't record as real generation
    if (isDemoMode) {
      const demoJobId = `demo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      // Run demo async without recording a real Hailuo job
      generateVideoAsync(null, userId, prompt, duration, aspectRatio, demoJobId, true);
      return NextResponse.json({ jobId: demoJobId, status: 'processing', demo: true });
    }

    // Create a job in Convex
    // We use the topic field as a unique jobId for polling (as per existing getByExternalId pattern)
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job = await convexClient.mutation(api.generationJobs.create, {
      userId,
      type: 'video',
      topic: jobId,
      model: 'hailuo-video-01',
      status: 'processing',
    });

    // Run async without blocking the response (fire-and-forget is intentional for long-running video gen)
    void generateVideoAsync(job._id, userId, prompt, duration, aspectRatio, jobId, false);

    return NextResponse.json({ jobId, status: 'processing' });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json({ error: 'Failed to start video generation' }, { status: 500 });
  }
}

async function generateVideoAsync(convexJobId: any, userId: string, prompt: string, duration: number, aspectRatio: string, jobId: string, isDemo: boolean) {
  const HAILUO_API_KEY = process.env.HAILUO_API_KEY;

  try {
    let videoUrl: string | undefined;

    if (!isDemo && HAILUO_API_KEY) {
      const response = await fetch('https://api.minimaxi.chat/v1/video_generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HAILUO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'video-01',
          prompt,
          duration,
          resolution: aspectRatio === '9:16' ? '720x1280' : aspectRatio === '16:9' ? '1280x720' : '720x720',
        }),
      });
      if (!response.ok) throw new Error(`Hailuo API error: ${response.status}`);
      const data = await response.json();
      const taskId = data.task_id;
      if (!taskId) throw new Error('No task_id returned');

      let attempts = 0;
      while (attempts < 40) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`https://api.minimaxi.chat/v1/query/video_generation?task_id=${taskId}`, {
          headers: { 'Authorization': `Bearer ${HAILUO_API_KEY}` },
        });
        const statusData = await statusRes.json();
        if (statusData.status === 'Success' && statusData.file_id) {
          const fileRes = await fetch(`https://api.minimaxi.chat/v1/files/retrieve?file_id=${statusData.file_id}`, {
            headers: { 'Authorization': `Bearer ${HAILUO_API_KEY}` },
          });
          const fileData = await fileRes.json();
          videoUrl = fileData.file?.download_url;
          break;
        } else if (statusData.status === 'Fail') {
          throw new Error('Hailuo generation failed');
        }
        attempts++;
      }
      if (!videoUrl) throw new Error('Timed out');
    } else {
      // Demo fallback
      await new Promise(r => setTimeout(r, 8000));
      videoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    }

    if (videoUrl && !isDemo && convexJobId) {
      // Update the job in Convex
      await convexClient.mutation(api.generationJobs.update, {
        id: convexJobId,
        status: 'ready',
        result: { videoUrl },
        completedAt: Date.now(),
      });

      // Persist to content table (AC fulfillment)
      const contentExternalId = generateId('cnt');
      await convexClient.mutation(api.content.create, {
        externalId: contentExternalId,
        userId,
        text: `Generated Video: ${prompt}`,
        videoUrl,
        platforms: ['tiktok', 'instagram'], // default platforms for video
        status: 'draft',
        aiModel: 'hailuo-video-01',
        prompt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error('generateVideoAsync error:', error);
    if (!isDemo && convexJobId) {
      await convexClient.mutation(api.generationJobs.update, {
        id: convexJobId,
        status: 'error',
        error: String(error),
        completedAt: Date.now(),
      });
    }
  }
}
