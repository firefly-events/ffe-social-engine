/**
 * PostHog client wrapper for FFE Social Engine.
 *
 * Provides a typed `track()` function, `identifyUser()`, and session replay
 * initialization for the dashboard Next.js app.
 *
 * Ticket: FIR-1179
 *
 * DEPLOY: Copy to apps/dashboard/src/lib/posthog.ts
 *
 * SETUP:
 *   1. Add posthog-js and posthog-node to apps/dashboard/package.json
 *   2. Add NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST to .secrets/.env
 *   3. Import PostHogProvider and wrap your root layout (see bottom of file)
 */

'use client'

import posthog from 'posthog-js'
import type {
  SEEventName,
  SEEventPropertiesMap,
  SEUserTraits,
} from './posthog-events'

// ── Constants ────────────────────────────────────────────────────────────────

/** URL patterns that should receive 100% session replay sample rate */
const HIGH_VALUE_URL_PATTERNS = ['/onboard', '/checkout', '/pricing']

// ── Initialisation ───────────────────────────────────────────────────────────

let _initialized = false

/**
 * Initialize the PostHog client-side SDK.
 *
 * Call this once, e.g. in a `<PostHogProvider>` component or in
 * `useEffect` at the root layout level.
 */
export function initPostHog(): void {
  if (typeof window === 'undefined') return
  if (_initialized) return

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — analytics disabled')
    }
    return
  }

  posthog.init(apiKey, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,

    // Session replay — base config; URL-specific sampling applied below
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      blockClass: 'ph-no-capture',
      maskTextClass: 'ph-mask',
    },

    // Reduce noise in development
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug()
      }

      // Enable 100% session replay for high-value flows; 20% elsewhere
      const pathname = window.location.pathname
      const isHighValue = HIGH_VALUE_URL_PATTERNS.some((p) =>
        pathname.startsWith(p)
      )
      if (!isHighValue) {
        // For non-high-value pages, only record 20% of sessions
        if (Math.random() > 0.2) {
          ph.stopSessionRecording()
        }
      }
    },
  })

  _initialized = true
}

// ── Client-side tracking ─────────────────────────────────────────────────────

/**
 * Track a typed Social Engine event.
 *
 * @example
 * track(SE_EVENTS.CONTENT_CREATED, {
 *   user_id: userId,
 *   content_id: item.id,
 *   platforms: item.platforms,
 *   status: item.status,
 * })
 */
export function track<T extends SEEventName>(
  event: T,
  properties: SEEventPropertiesMap[T]
): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.capture(event, properties as unknown as Record<string, unknown>)
}

/**
 * Identify the current user and set their traits.
 *
 * Call this after the user logs in (e.g. in a useEffect that watches
 * Clerk's `useUser()` hook).
 */
export function identifyUser(userId: string, traits: SEUserTraits): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.identify(userId, {
    ...traits,
    app: 'social-engine',
  })
}

/**
 * Reset the PostHog identity (call on logout).
 */
export function resetIdentity(): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.reset()
}

/**
 * Start session recording for the current page.
 *
 * Call this explicitly on high-value pages if you need to guarantee
 * recording regardless of the global sample rate.
 */
export function startSessionRecording(): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.startSessionRecording()
}

// ── PostHog Provider (copy to a separate providers.tsx if preferred) ─────────

/*
  Add this provider to apps/dashboard/src/app/layout.tsx:

  import { PostHogProvider } from './posthog-provider'

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <ClerkProvider>
        <PostHogProvider>
          <html lang="en">
            ...
          </html>
        </PostHogProvider>
      </ClerkProvider>
    )
  }

  ── posthog-provider.tsx ────────────────────────────────────────────────────

  'use client'

  import { useEffect } from 'react'
  import { useUser } from '@clerk/nextjs'
  import { initPostHog, identifyUser } from '@/lib/posthog'

  export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      initPostHog()
    }, [])

    const { user, isLoaded } = useUser()

    useEffect(() => {
      if (!isLoaded || !user) return
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
        created_at: user.createdAt?.toISOString(),
        app: 'social-engine',
      })
    }, [isLoaded, user])

    return <>{children}</>
  }
*/
