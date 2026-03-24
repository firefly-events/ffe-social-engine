import { Router, Request, Response, IRouter } from 'express';
import { prisma } from '@ffe/db';
import axios from 'axios';
import { usageLimiter } from '../middleware/usage-limiter';

const router: IRouter = Router();

const TEXT_GEN_URL = process.env.TEXT_GEN_URL || 'http://text-gen:3001';

// ---------------------------------------------------------------------------
// POST /api/content/generate
// ---------------------------------------------------------------------------

interface GenerateRequest {
  topic: string;
  tone?: string;
  platforms?: string[];
  brandVoiceExamples?: string[];
  sessionId?: string;
}

router.post(
  '/generate',
  usageLimiter,
  async (req: Request, res: Response): Promise<void> => {
    const {
      topic,
      tone = 'professional',
      platforms = ['instagram'],
      brandVoiceExamples,
      sessionId,
    } = req.body as GenerateRequest;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({ success: false, error: 'topic is required' });
      return;
    }

    try {
      // Call the internal text-gen service
      const genResponse = await axios.post(
        `${TEXT_GEN_URL}/generate/multi-platform`,
        { topic: topic.trim(), tone, platforms, brandVoiceExamples },
        { timeout: 30_000 }
      );

      const generated = genResponse.data as Record<
        string,
        { caption: string; hashtags: string[]; callToAction?: string }
      >;

      // Persist to DB — this is also what the usage-limiter counts for the next request
      const content = await prisma.content.create({
        data: {
          userId: req.userId!,
          type: 'social_caption',
          status: 'completed',
          text: JSON.stringify(generated),
          platforms,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: content.id,
          platforms: generated,
          createdAt: content.createdAt,
          sessionId: sessionId ?? null,
        },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('[content/generate] text-gen error:', err.message);
        res.status(502).json({ success: false, error: 'Text generation service unavailable' });
      } else {
        console.error('[content/generate] unexpected error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/content/export
// ---------------------------------------------------------------------------

interface ExportRequest {
  contentId: string;
  format?: 'json' | 'text';
  platform?: string;
}

router.post('/export', async (req: Request, res: Response): Promise<void> => {
  const { contentId, format = 'json', platform } = req.body as ExportRequest;

  if (!contentId) {
    res.status(400).json({ success: false, error: 'contentId is required' });
    return;
  }

  try {
    const content = await prisma.content.findFirst({
      where: { id: contentId, userId: req.userId! },
    });

    if (!content) {
      res.status(404).json({ success: false, error: 'Content not found' });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content.text ?? '{}') as Record<string, unknown>;
    } catch {
      parsed = { raw: content.text };
    }

    // Filter to a single platform if requested
    const output =
      platform && typeof parsed[platform] !== 'undefined' ? parsed[platform] : parsed;

    if (format === 'text') {
      const lines: string[] = [];
      const flatten = (obj: unknown, prefix = ''): void => {
        if (typeof obj === 'string') {
          lines.push(prefix ? `${prefix}: ${obj}` : obj);
        } else if (Array.isArray(obj)) {
          lines.push(`${prefix}: ${(obj as unknown[]).join(' ')}`);
        } else if (typeof obj === 'object' && obj !== null) {
          for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
            flatten(v, prefix ? `${prefix}.${k}` : k);
          }
        }
      };
      flatten(output);
      res.type('text/plain').send(lines.join('\n'));
      return;
    }

    res.status(200).json({ success: true, data: { contentId, format, output } });
  } catch (err) {
    console.error('[content/export] error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/content/:id
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const content = await prisma.content.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!content) {
      res.status(404).json({ success: false, error: 'Content not found' });
      return;
    }

    let parsed: unknown = content.text;
    try {
      parsed = JSON.parse(content.text ?? '{}');
    } catch {
      // keep as raw string
    }

    res.status(200).json({
      success: true,
      data: {
        id: content.id,
        type: content.type,
        status: content.status,
        platforms: content.platforms,
        content: parsed,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      },
    });
  } catch (err) {
    console.error('[content/:id] error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/content
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10)));
  const skip = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          status: true,
          platforms: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.content.count({ where: { userId: req.userId! } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error('[content/list] error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
