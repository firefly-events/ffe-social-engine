import { Request, Response, NextFunction } from 'express';
import { prisma } from '@ffe/db';

/**
 * Monthly generation limits per plan tier.
 * FREE=10, STARTER=100, PRO=500, ENTERPRISE=unlimited (-1)
 */
const TIER_LIMITS: Record<string, number> = {
  FREE: 10,
  STARTER: 100,
  PRO: 500,
  ENTERPRISE: -1,
};

/**
 * Checks whether the authenticated user has remaining generation capacity
 * for the current calendar month.
 *
 * - Reads the user's tier from the DB via @ffe/db prisma instance.
 * - Counts Content rows created this month for this user.
 * - Returns 429 if the limit is reached.
 *
 * IMPORTANT: the actual increment happens implicitly via Content.create()
 * inside the content route — not here. This middleware only gates the request.
 */
export async function usageLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ success: false, error: 'Unauthenticated' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      // First-time user — create with FREE tier and allow this request
      await prisma.user.create({
        data: {
          id: req.userId,
          email: `${req.userId}@unknown.local`,
          tier: 'FREE',
        },
      });
      next();
      return;
    }

    const tier = user.tier ?? 'FREE';
    const limit = TIER_LIMITS[tier] ?? TIER_LIMITS['FREE'];

    // Unlimited plan — skip counting
    if (limit === -1) {
      next();
      return;
    }

    // Count generations for the current calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usageCount = await prisma.content.count({
      where: {
        userId: req.userId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (usageCount >= limit) {
      res.status(429).json({
        success: false,
        error: 'Monthly generation limit reached',
        data: {
          tier,
          limit,
          used: usageCount,
          resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        },
      });
      return;
    }

    next();
  } catch (err) {
    console.error('[UsageLimiter] Error checking usage:', err);
    // Fail open: don't block the user on a transient DB error
    next();
  }
}
