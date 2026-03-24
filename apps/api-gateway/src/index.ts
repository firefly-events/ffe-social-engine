import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { authMiddleware, requireAdmin } from './middleware/auth';
import healthRouter from './routes/health';
import contentRouter from './routes/content';
import sessionsRouter from './routes/sessions';
import socialRouter from './routes/social';
import adminRouter from './routes/admin';

const app: Application = express();
const PORT = process.env.PORT ?? 3000;

// ---------------------------------------------------------------------------
// Security & parsing middleware
// ---------------------------------------------------------------------------

app.use(helmet());

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Public routes — no auth required
// ---------------------------------------------------------------------------

app.use('/health', healthRouter);

// ---------------------------------------------------------------------------
// Protected routes — Clerk JWT verification required
// ---------------------------------------------------------------------------

app.use('/api', authMiddleware);

app.use('/api/content', contentRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/social', socialRouter);

// Admin routes require auth + admin role check
app.use('/api/admin', requireAdmin, adminRouter);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[api-gateway] Listening on port ${PORT}`);
  });
}

export default app;
