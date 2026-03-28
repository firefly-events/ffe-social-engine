'use client'

// DEPRECATED: This combined template has been split into separate files.
// Use the following instead:
//   - posthog-client.ts  — browser / React client components ('use client')
//   - posthog-server.ts  — server-side / API routes (no 'use client', uses posthog-node)
//   - posthog-events.ts  — shared event name constants
//
// This file is kept for reference only. Do NOT use trackServer() from a client
// component — it imports posthog-node which is server-only.

import posthog from 'posthog-js'
import type { PostHogEvent } from './posthog-events'

export function trackClient(
  event: PostHogEvent,
  properties?: Record<string, unknown>,
): void {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}
