/**
 * PostHog server-side utilities for FFE Social Engine.
 *
 * Use this in Route Handlers (app/api/**\/route.ts) and Stripe webhooks.
 *
 * Ticket: FIR-1179
 */

import { PostHog } from 'posthog-node'
import type { SEEventName, SEEventPropertiesMap } from './posthog-events'

let posthogClient: PostHog | null = null

/**
 * Get the PostHog Node.js client instance.
 */
export function getPostHogServer(): PostHog {
  if (!posthogClient) {
    const apiKey = process.env.POSTHOG_API_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

    if (!apiKey) {
      throw new Error('[PostHog/server] No API key configured')
    }

    posthogClient = new PostHog(apiKey, { host, flushAt: 1, flushInterval: 0 })
  }
  return posthogClient
}

/**
 * Track an event server-side using posthog-node.
 *
 * @example
 * await trackServer(SE_EVENTS.CHECKOUT_COMPLETED, {
 *   user_id: userId,
 *   plan: 'pro',
 *   amount_cents: 2900,
 *   interval: 'month',
 * })
 */
export async function trackServer<T extends SEEventName>(
  event: T,
  properties: SEEventPropertiesMap[T] & { user_id: string }
): Promise<void> {
  const client = getPostHogServer()

  try {
    const { user_id, ...rest } = properties
    client.capture({
      distinctId: user_id,
      event,
      properties: rest as Record<string, unknown>,
    })
    await client.shutdown()
  } catch (err) {
    console.error('[PostHog/server] Failed to track event:', event, err)
  }
}

/**
 * Legacy server-side capture helper.
 */
export async function trackEventServer<T extends SEEventName>(
  event: T,
  properties: SEEventPropertiesMap[T] & { user_id: string }
): Promise<void> {
  return trackServer(event, properties)
}
