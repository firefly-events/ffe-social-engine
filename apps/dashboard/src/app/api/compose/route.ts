import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const COMPOSER_URL = process.env.COMPOSER_SERVICE_URL || 'http://localhost:3003';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { audioUrl, videoUrl, textOverlay, format = '9:16' } = body;

    if (!audioUrl && !videoUrl) {
      return NextResponse.json(
        { error: 'At least audioUrl or videoUrl is required' },
        { status: 400 }
      );
    }

    const validFormats = ['9:16', '16:9', '1:1'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    const response = await fetch(`${COMPOSER_URL}/compose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_url: audioUrl,
        video_url: videoUrl,
        text_overlay: textOverlay,
        format,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Composer service error' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ ...data, composerUrl: COMPOSER_URL });
  } catch (error) {
    console.error('[/api/compose]', error);
    return NextResponse.json({ error: 'Composition request failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${COMPOSER_URL}/compose/${jobId}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/compose GET]', error);
    return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 });
  }
}
