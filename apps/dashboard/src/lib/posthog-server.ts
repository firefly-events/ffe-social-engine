import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

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

  if (!posthogClient) {
    posthogClient = new PostHog(phKey, { host: phHost })
  }
  return posthogClient
}
