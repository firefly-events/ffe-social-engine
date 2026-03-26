// Central registry of PostHog event names for the Social Engine.
// SOURCE OF TRUTH: posthog/social-engine/src-templates/posthog-events.ts
// Dashboard copy:  apps/dashboard/src/lib/posthog-events.ts
// These two files must be identical. CI enforces this with a diff check.

export const POSTHOG_EVENTS = {
  // Auth
  SIGNUP_COMPLETE: 'se_signup_complete',
  EMAIL_VERIFIED: 'se_email_verified',

  // Social
  SOCIAL_CONNECTED: 'se_social_connected',

  // Content
  POST_CREATED: 'se_post_created',

  // Workflows / automation
  WORKFLOW_CREATED: 'se_workflow_created',
  AUTOMATION_TRIGGERED: 'se_automation_triggered',

  // API
  API_CALL_MADE: 'se_api_call_made',
} as const

export type PostHogEvent = (typeof POSTHOG_EVENTS)[keyof typeof POSTHOG_EVENTS]
