import { Router, Request, Response, IRouter } from 'express';
import { prisma } from '@ffe/db';
import { clerkClient } from '../middleware/auth';

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// GET /api/admin/users
// ---------------------------------------------------------------------------

router.get('/users', async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '50', 10)));
  const skip = (page - 1) * limit;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          tier: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          currentPeriodEnd: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    // Attach monthly usage counts
    const usageCounts = await Promise.all(
      users.map((u: { id: string }) =>
        prisma.content.count({
          where: { userId: u.id, createdAt: { gte: startOfMonth } },
        })
      )
    );

    const enriched = users.map((u, i: number) => ({
      ...(u as object),
      monthlyUsage: usageCounts[i],
    }));

    res.status(200).json({
      success: true,
      data: {
        items: enriched,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error('[admin/users] error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/users/:id/features
// ---------------------------------------------------------------------------

interface FeatureOverrideRequest {
  tier?: string;
  features?: Record<string, boolean>;
}

router.put('/users/:id/features', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { tier, features } = req.body as FeatureOverrideRequest;

  if (!tier && !features) {
    res.status(400).json({ success: false, error: 'tier or features is required' });
    return;
  }

  const validTiers = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  if (tier && !validTiers.includes(tier)) {
    res.status(400).json({
      success: false,
      error: `tier must be one of: ${validTiers.join(', ')}`,
    });
    return;
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { ...(tier ? { tier } : {}) },
    });

    // Optionally sync feature flags to Clerk public metadata
    if (features) {
      try {
        await clerkClient.users.updateUser(id, {
          publicMetadata: { featureOverrides: features },
        });
      } catch (clerkErr) {
        console.warn('[admin/features] Clerk metadata update failed:', clerkErr);
        // Non-fatal: Postgres is the source of truth for tier
      }
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('[admin/users/:id/features] error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Tier config (in-memory for v1; a Tier Prisma model is a v2 task)
// ---------------------------------------------------------------------------

export const tierConfig: Record<
  string,
  { monthlyLimit: number; price: number; features: string[] }
> = {
  FREE: { monthlyLimit: 10, price: 0, features: ['basic_generation'] },
  STARTER: {
    monthlyLimit: 100,
    price: 9,
    features: ['basic_generation', 'variants', 'export'],
  },
  PRO: {
    monthlyLimit: 500,
    price: 29,
    features: ['basic_generation', 'variants', 'export', 'brand_voice', 'scheduling'],
  },
  ENTERPRISE: {
    monthlyLimit: -1,
    price: 99,
    features: [
      'basic_generation',
      'variants',
      'export',
      'brand_voice',
      'scheduling',
      'white_label',
      'api_access',
    ],
  },
};

// ---------------------------------------------------------------------------
// GET /api/admin/tiers
// ---------------------------------------------------------------------------

router.get('/tiers', (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, data: tierConfig });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/tiers
// ---------------------------------------------------------------------------

router.put('/tiers', (req: Request, res: Response): void => {
  const updates = req.body as typeof tierConfig;

  if (!updates || typeof updates !== 'object') {
    res.status(400).json({ success: false, error: 'Request body must be a tier config object' });
    return;
  }

  for (const [tierName, config] of Object.entries(updates)) {
    if (typeof config.monthlyLimit !== 'number') {
      res.status(400).json({
        success: false,
        error: `Invalid config for tier "${tierName}": monthlyLimit must be a number`,
      });
      return;
    }
    tierConfig[tierName] = { ...tierConfig[tierName], ...config };
  }

  res.status(200).json({ success: true, data: tierConfig });
});

// ---------------------------------------------------------------------------
// POST /api/admin/impersonate/:userId
// ---------------------------------------------------------------------------

router.post('/impersonate/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const tokenResource = await clerkClient.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 3600,
    });

    res.status(200).json({
      success: true,
      data: {
        targetUserId: userId,
        token: tokenResource.token,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        warning: 'This token grants full access as the target user. Handle with care.',
      },
    });
  } catch (err) {
    console.error('[admin/impersonate] error:', err);
    res.status(500).json({ success: false, error: 'Failed to create impersonation token' });
  }
});

export default router;
