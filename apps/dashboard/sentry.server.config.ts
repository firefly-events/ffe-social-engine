import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://5b824c48cbf15c4aeebe47d7cc50b339@o4507915194269696.ingest.us.sentry.io/4511102798528512',
  tracesSampleRate: 1.0,
});