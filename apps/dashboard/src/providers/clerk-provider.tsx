'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import { ReactNode } from 'react';

export function ClerkProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#7C3AED', // Firefly purple
          borderRadius: '0.5rem',
          fontFamily: 'var(--font-sans)',
        },
        elements: {
          card: 'shadow-xl border border-zinc-200 dark:border-zinc-800',
          headerTitle: 'font-semibold text-xl',
          formButtonPrimary: 'bg-violet-600 hover:bg-violet-700 transition-colors',
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
