import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');

    // Validate critical env vars at server startup. Logs clear errors when
    // Clerk dev keys are deployed to production (the root cause of 404s on
    // protected routes like /dashboard, /create, /content).
    const { validateEnv } = await import('./lib/env');
    validateEnv();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;