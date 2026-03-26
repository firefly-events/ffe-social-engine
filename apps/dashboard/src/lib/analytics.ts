/**
 * Legacy analytics wrapper.
 * Recommended to use `@/lib/posthog` directly for new code.
 *
 * Ticket: FIR-1179
 */

import { track } from './posthog'
import { SE_EVENTS, type SEEventName } from './posthog-events'

// Map legacy events to new ones where possible
export const ANALYTICS_EVENTS = {
  POST_CREATED: SE_EVENTS.CONTENT_POSTED,
  SOCIAL_CONNECTED: SE_EVENTS.ONBOARDING_STEP_COMPLETED,
  WORKFLOW_CREATED: SE_EVENTS.WORKFLOW_CREATED,
  API_CALL_MADE: SE_EVENTS.AUTOMATION_TRIGGERED,
  SIGNUP_COMPLETE: SE_EVENTS.USER_SIGNED_UP,
} as const

/**
 * Legacy trackEvent function.
 * Use track() from @/lib/posthog for typed properties.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  // If it's a known SE event, track it typed (via casting)
  // Otherwise, just use the underlying capture mechanism if needed.
  // For simplicity, we cast all legacy calls to SEEventName to reuse track()
  track(event as SEEventName, properties as any)
}
