// Server-side PostHog helper (Node.js / Edge runtime — no 'use client').
// Copy this file to apps/<your-app>/src/lib/posthog-server.ts
// See posthog-client.ts for the browser-side equivalent.
// NOTE: Do NOT import this module in client components — it depends on posthog-node
// which is a server-only package.

import { PostHog } from 'posthog-node'
import type { PostHogEvent } from './posthog-events'

let client: PostHog | null = null

export function getPostHogServer(): PostHog {
  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    })
  }
  return client
}

export async function trackServer(
  distinctId: string,
  event: PostHogEvent,
  properties?: Record<string, unknown>,
): Promise<void> {
  getPostHogServer().capture({ distinctId, event, properties })
}
