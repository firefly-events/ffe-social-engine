'use client'

// Client-side PostHog helper (browser only).
// Copy this file to apps/<your-app>/src/lib/posthog-client.ts
// See posthog-server.ts for the server-side (Node / Edge) equivalent.

import posthog from 'posthog-js'
import type { PostHogEvent } from './posthog-events'

export function initPostHogClient(): void {
  if (typeof window === 'undefined') return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    autocapture: true,
  })
}

export function trackClient(
  event: PostHogEvent,
  properties?: Record<string, unknown>,
): void {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}
