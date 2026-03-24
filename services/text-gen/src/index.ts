import express, { Application, Request, Response, NextFunction } from 'express';
import { generateCaption, generateMultiPlatform, generateVariants } from './generator';
import type { Platform, Tone } from './prompts';

const app: Application = express();
const PORT = process.env.PORT ?? 3001;

// Internal service — only accepts JSON, no auth (network-level access control)
app.use(express.json({ limit: '512kb' }));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'text-gen',
      model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
      timestamp: new Date().toISOString(),
    },
  });
});

// ---------------------------------------------------------------------------
// POST /generate/caption
// Single-platform caption generation
// ---------------------------------------------------------------------------

app.post('/generate/caption', async (req: Request, res: Response): Promise<void> => {
  const { topic, tone, platform, brandVoiceExamples } = req.body as {
    topic?: string;
    tone?: Tone;
    platform?: Platform;
    brandVoiceExamples?: string[];
  };

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    res.status(400).json({ success: false, error: 'topic is required' });
    return;
  }

  try {
    const result = await generateCaption({ topic: topic.trim(), tone, platform, brandVoiceExamples });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[text-gen/caption] error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Generation failed',
    });
  }
});

// ---------------------------------------------------------------------------
// POST /generate/multi-platform
// All platforms in one Gemini call
// ---------------------------------------------------------------------------

app.post('/generate/multi-platform', async (req: Request, res: Response): Promise<void> => {
  const { topic, tone, platforms, brandVoiceExamples } = req.body as {
    topic?: string;
    tone?: Tone;
    platforms?: Platform[];
    brandVoiceExamples?: string[];
  };

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    res.status(400).json({ success: false, error: 'topic is required' });
    return;
  }

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    res.status(400).json({ success: false, error: 'platforms array is required' });
    return;
  }

  try {
    const result = await generateMultiPlatform({
      topic: topic.trim(),
      tone,
      platforms,
      brandVoiceExamples,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[text-gen/multi-platform] error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Generation failed',
    });
  }
});

// ---------------------------------------------------------------------------
// POST /generate/variants
// Caption variation generator
// ---------------------------------------------------------------------------

app.post('/generate/variants', async (req: Request, res: Response): Promise<void> => {
  const { caption, count } = req.body as { caption?: string; count?: number };

  if (!caption || typeof caption !== 'string' || caption.trim().length === 0) {
    res.status(400).json({ success: false, error: 'caption is required' });
    return;
  }

  try {
    const result = await generateVariants({ caption: caption.trim(), count });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[text-gen/variants] error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Generation failed',
    });
  }
});

// ---------------------------------------------------------------------------
// 404 & error handlers
// ---------------------------------------------------------------------------

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[text-gen] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[text-gen] Listening on port ${PORT}`);
  });
}

export default app;
