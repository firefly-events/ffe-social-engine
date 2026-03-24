import { Router, Request, Response, IRouter } from 'express';

const router: IRouter = Router();

/**
 * GET /health
 * Returns service liveness status. No auth required.
 * Used by Docker/k8s health probes.
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
