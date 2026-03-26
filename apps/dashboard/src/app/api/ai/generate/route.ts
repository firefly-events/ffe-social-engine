import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const TEXT_GEN_URL = process.env.TEXT_GEN_SERVICE_URL || 'http://localhost:3004';

// Tier-based model access
const TIER_MODELS: Record<string, string[]> = {
  free:     ['gemini-flash'],
  starter:  ['gemini-flash', 'claude-haiku'],
  basic:    ['gemini-flash', 'gemini-pro', 'claude-haiku'],
  pro:      ['gemini-flash', 'gemini-pro', 'claude-haiku', 'claude-sonnet'],
  business: ['gemini-flash', 'gemini-pro', 'claude-haiku', 'claude-sonnet', 'llama3'],
  agency:   ['gemini-flash', 'gemini-pro', 'claude-haiku', 'claude-sonnet', 'llama3'],
};

// Tier-based batch limits
const TIER_BATCH_LIMITS: Record<string, number> = {
  free: 1, starter: 3, basic: 5, pro: 5, business: 5, agency: 5,
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type = 'single', topic, template, tone, platform, model = 'gemini-flash', count } = body;

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    // Default tier to 'free' — real gating will use Convex user lookup
    const userTier = (body.tier as string) || 'free';
    const allowedModels = TIER_MODELS[userTier] || TIER_MODELS.free;

    if (!allowedModels.includes(model)) {
      return NextResponse.json(
        { error: `Model '${model}' requires a higher plan. Allowed: ${allowedModels.join(', ')}` },
        { status: 403 }
      );
    }

    let endpoint: string;
    let payload: Record<string, unknown>;

    if (type === 'batch') {
      const batchLimit = TIER_BATCH_LIMITS[userTier] ?? 1;
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
    return NextResponse.json({ ...data, userId, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[/api/ai/generate]', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
