import posthog from 'posthog-js'

// Event names - must match PostHog dashboard funnels
export const ANALYTICS_EVENTS = {
  POST_CREATED: 'post_created',
  SOCIAL_CONNECTED: 'social_connected',
  WORKFLOW_CREATED: 'workflow_created',
  API_CALL_MADE: 'api_call_made',
  SIGNUP_COMPLETE: 'signup_complete',
} as const

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}
