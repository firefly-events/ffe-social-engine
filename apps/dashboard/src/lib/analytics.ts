import posthog from 'posthog-js'

/**
 * Social Engine PostHog Event Schema
 * All events must be prefixed with se_ for easy filtering in PostHog
 */
export const ANALYTICS_EVENTS = {
  // Authentication & Onboarding
  SIGNUP_COMPLETE: 'se_signup_complete',
  ONBOARDING_STEP_COMPLETED: 'se_onboarding_step_completed',
  
  // Social Connections
  SOCIAL_CONNECTED: 'se_social_connected',
  SOCIAL_DISCONNECTED: 'se_social_disconnected',
  
  // Content & Workflows
  POST_CREATED: 'se_post_created',
  POST_PUBLISHED: 'se_post_published',
  WORKFLOW_CREATED: 'se_workflow_created',
  WORKFLOW_UPDATED: 'se_workflow_updated',
  WORKFLOW_DELETED: 'se_workflow_deleted',
  
  // API & Credits
  API_CALL_MADE: 'se_api_call_made',
  CREDITS_DEPLETED: 'se_credits_depleted',
  TIER_UPGRADED: 'se_tier_upgraded',
} as const

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

export interface EventProperties {
  [key: string]: any
}

/**
 * Client-side event tracking
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, properties)
  }
}

/**
 * Identify user in PostHog (Clerk Integration)
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined' && userId && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, traits)
  }
}

/**
 * Reset PostHog session (Logout)
 */
export function resetAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset()
  }
}
