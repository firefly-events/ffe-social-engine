// Server-side PostHog helper (Node.js / Edge runtime — no 'use client').
// Copy this file to apps/<your-app>/src/lib/posthog-server.ts
// See posthog-client.ts for the browser-side equivalent.
// NOTE: Do NOT import this module in client components — it depends on posthog-node
// which is a server-only package.

import { PostHog } from 'posthog-node'
import type { PostHogEvent } from './posthog-events'

let client: PostHog | null = null

/**
 * Server-side PostHog client for capturing events in API routes.
 * Gracefully handles missing API keys by returning null.
 */
export function getPostHogServer(): PostHog | null {
  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const phHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com'

  if (!phKey) {
    return null
  }

  if (!client) {
    client = new PostHog(phKey, {
      host: phHost,
    })
  }
  return client
}

/**
 * Capture an event on the server side.
 */
export async function trackServer(
  distinctId: string,
  event: PostHogEvent,
  properties?: Record<string, unknown>,
): Promise<void> {
  const ph = getPostHogServer()
  if (ph) {
    ph.capture({ distinctId, event, properties })
  }
}
