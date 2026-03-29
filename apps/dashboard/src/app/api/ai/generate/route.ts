import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPostHogServer } from '@/lib/posthog-server';

const TEXT_GEN_URL = process.env.TEXT_GEN_SERVICE_URL || 'http://localhost:3004';

const FREE_MODELS = ['gemini-flash'];
const ALL_MODELS = ['gemini-flash', 'gemini-pro', 'claude-haiku', 'claude-sonnet', 'llama3'];

export async function POST(req: Request) {
  const { userId, has } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type = 'single', topic, template, tone, platform, model = 'gemini-flash', count } = body;

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const allowedModels = has({ feature: 'premium_models' }) ? ALL_MODELS : FREE_MODELS;

    if (!allowedModels.includes(model)) {
      return NextResponse.json(
        { error: `Model '${model}' requires a higher plan. Allowed: ${allowedModels.join(', ')}` },
        { status: 402 }
      );
    }

    let endpoint: string;
    let payload: Record<string, unknown>;

    if (type === 'batch') {
      const batchLimit = has({ feature: 'batch_generation' }) ? 5 : 1;
      endpoint = '/generate/batch';
      payload = { topic, template, tone, platform, model, count: Math.min(count ?? 5, batchLimit) };
    } else if (type === 'thread') {
      endpoint = '/generate/thread';
      payload = { topic, platform, model, maxPosts: count ?? 5 };
    } else if (type === 'hashtags') {
      endpoint = '/generate/hashtags';
      payload = { topic, platform, model, count: count ?? 10 };
    } else {
      endpoint = '/generate';
      payload = { topic, template, tone, platform, model };
    }

    const response = await fetch(`${TEXT_GEN_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Service error' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();

    const ph = getPostHogServer()
    if (ph) {
      ph.capture({
        distinctId: userId,
        event: 'se_content_generated',
        properties: {
          platform: 'web',
          content_type: type,
          model,
          source: 'api',
        }
      })
    }

    return NextResponse.json({ ...data, userId, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[/api/ai/generate]', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
