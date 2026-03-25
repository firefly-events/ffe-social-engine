'use client';

import * as Sentry from '@sentry/nextjs';
import React from 'react';

export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred.</p>}>
      {children}
    </Sentry.ErrorBoundary>
  );
}