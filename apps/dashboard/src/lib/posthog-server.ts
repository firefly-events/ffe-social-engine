import { PostHog } from 'posthog-node'
import type { SEEventName, SEEventPropertiesMap } from './posthog-events'

let posthogClient: PostHog | null = null

/**
 * Server-side PostHog client for capturing events in API routes.
 * Gracefully handles missing API keys by returning null.
 */
export function getPostHogServer(): PostHog | null {
  const phKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
  const phHost = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com'

  if (!phKey) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(phKey, { host: phHost })
  }
  return posthogClient
}

/**
 * Capture an event on the server side.
 */
export async function trackServer<T extends SEEventName>(
  event: T,
  properties: SEEventPropertiesMap[T] & { user_id: string },
): Promise<void> {
  const ph = getPostHogServer()
  if (ph) {
    const { user_id, ...rest } = properties
    ph.capture({
      distinctId: user_id,
      event,
      properties: rest as Record<string, unknown>,
    })
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
