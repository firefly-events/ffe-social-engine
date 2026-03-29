import { track, identifyUser as phIdentifyUser, resetIdentity, SE_EVENTS } from './posthog'
import type { SEEventName, SEUserTraits } from './posthog-events'

/**
 * Social Engine PostHog Event Schema
 * All events must be prefixed with se_ for easy filtering in PostHog
 */
export const ANALYTICS_EVENTS = {
  // Authentication & Onboarding
  SIGNUP_COMPLETE: SE_EVENTS.SIGNUP_COMPLETE,
  ONBOARDING_STEP_COMPLETED: SE_EVENTS.ONBOARDING_STEP_COMPLETED,
  
  // Social Connections
  SOCIAL_CONNECTED: SE_EVENTS.SOCIAL_CONNECTED,
  SOCIAL_DISCONNECTED: SE_EVENTS.SOCIAL_DISCONNECTED,
  
  // Content & Workflows
  POST_CREATED: SE_EVENTS.POST_CREATED,
  POST_PUBLISHED: SE_EVENTS.POST_PUBLISHED,
  WORKFLOW_CREATED: SE_EVENTS.WORKFLOW_CREATED,
  WORKFLOW_UPDATED: SE_EVENTS.WORKFLOW_UPDATED,
  WORKFLOW_DELETED: SE_EVENTS.WORKFLOW_DELETED,
  
  // API & Credits
  API_CALL_MADE: SE_EVENTS.API_CALL_MADE,
  CREDITS_DEPLETED: SE_EVENTS.CREDITS_DEPLETED,
  TIER_UPGRADED: SE_EVENTS.TIER_UPGRADED,
} as const

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

export interface EventProperties {
  [key: string]: any
}

/**
 * Client-side event tracking
 * Backward compatibility wrapper for trackEvent
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
) {
  track(event as SEEventName, properties as any)
}

/**
 * Identify user in PostHog (Clerk Integration)
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  phIdentifyUser(userId, {
    ...traits,
    app: 'social-engine',
  } as SEUserTraits)
}

/**
 * Reset PostHog session (Logout)
 */
export function resetAnalytics() {
  resetIdentity()
}
