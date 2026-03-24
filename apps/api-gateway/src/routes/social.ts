import { Router, Request, Response, IRouter } from 'express';
import { listConnections, revokeToken } from '@ffe/db';

const router: IRouter = Router();

const SUPPORTED_PLATFORMS = ['instagram', 'twitter', 'linkedin', 'tiktok', 'facebook'] as const;
type Platform = (typeof SUPPORTED_PLATFORMS)[number];

// ---------------------------------------------------------------------------
// GET /api/social/accounts
// ---------------------------------------------------------------------------

router.get('/accounts', async (req: Request, res: Response): Promise<void> => {
  try {
    const connections = await listConnections(req.userId!);
    res.status(200).json({ success: true, data: connections });
  } catch (err) {
    console.error('[social/accounts] error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/social/connect/:platform  — OAuth initiation stub
// ---------------------------------------------------------------------------

router.post('/connect/:platform', (req: Request, res: Response): void => {
  const { platform } = req.params;

  if (!SUPPORTED_PLATFORMS.includes(platform as Platform)) {
    res.status(400).json({
      success: false,
      error: `Unsupported platform. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
    });
    return;
  }

  // v1 stub: return a placeholder OAuth URL.
  // Production: exchange for a real OAuth authorization URL from the platform's API.
  const oauthUrl = `https://oauth.${platform}.example.com/authorize?client_id=TODO&state=${req.userId}`;

  res.status(200).json({
    success: true,
    data: {
      platform,
      oauthUrl,
      message: 'OAuth integration is a v2 feature. Redirect the user to oauthUrl to connect.',
    },
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/social/disconnect/:platform
// ---------------------------------------------------------------------------

router.delete('/disconnect/:platform', async (req: Request, res: Response): Promise<void> => {
  const { platform } = req.params;

  if (!SUPPORTED_PLATFORMS.includes(platform as Platform)) {
    res.status(400).json({
      success: false,
      error: `Unsupported platform. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
    });
    return;
  }

  try {
    await revokeToken(req.userId!, platform);
    res.status(200).json({
      success: true,
      data: { platform, disconnected: true },
    });
  } catch (err) {
    console.error('[social/disconnect] error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
