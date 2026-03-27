import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { setVideoJob } from './_store';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prompt, duration = 6, aspectRatio = '9:16' } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 });

    const jobId = randomUUID();
    const createdAt = Date.now();
    setVideoJob(jobId, { status: 'processing', userId, createdAt });

    generateVideoAsync(jobId, userId, prompt, duration, aspectRatio, createdAt);

    return NextResponse.json({ jobId, status: 'processing' });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json({ error: 'Failed to start video generation' }, { status: 500 });
  }
}

async function generateVideoAsync(jobId: string, userId: string, prompt: string, duration: number, aspectRatio: string, createdAt: number) {
  const HAILUO_API_KEY = process.env.HAILUO_API_KEY;

  try {
    if (HAILUO_API_KEY) {
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
          setVideoJob(jobId, { status: 'ready', userId, videoUrl: fileData.file?.download_url, createdAt });
          return;
        } else if (statusData.status === 'Fail') {
          throw new Error('Hailuo generation failed');
        }
        attempts++;
      }
      throw new Error('Timed out');
    } else {
      // Demo fallback
      await new Promise(r => setTimeout(r, 8000));
      setVideoJob(jobId, {
        status: 'ready',
        userId,
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        createdAt,
      });
    }
  } catch (error) {
    setVideoJob(jobId, { status: 'error', userId, error: String(error), createdAt });
  }
}
