// Central registry of PostHog event names for the Social Engine.
// SOURCE OF TRUTH: posthog/social-engine/src-templates/posthog-events.ts
// Dashboard copy:  apps/dashboard/src/lib/posthog-events.ts
// These two files must be identical. CI enforces this with a diff check.

export const SE_EVENTS = {
  // Auth
  SIGNUP_COMPLETE: 'se_signup_complete',
  ONBOARDING_STARTED: 'se_onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'se_onboarding_step_completed',
  ONBOARDING_COMPLETED: 'se_onboarding_completed',
  EMAIL_VERIFIED: 'se_email_verified',

  // Social / Accounts
  PLATFORM_CONNECTED: 'se_platform_connected',
  PLATFORM_DISCONNECTED: 'se_platform_disconnected',
  SOCIAL_CONNECTED: 'se_social_connected', // Legacy from analytics.ts
  SOCIAL_DISCONNECTED: 'se_social_disconnected', // Legacy from analytics.ts

  // Content
  CONTENT_CREATED: 'se_content_created',
  CONTENT_EXPORTED: 'se_content_exported',
  CONTENT_SCHEDULED: 'se_content_scheduled',
  CONTENT_POSTED: 'se_content_posted',
  CONTENT_FAILED: 'se_content_failed',
  AI_CONTENT_GENERATED: 'se_ai_content_generated',
  POST_CREATED: 'se_post_created', // Legacy
  POST_PUBLISHED: 'se_post_published', // Legacy

  // Feature Adoption
  VOICE_CLONE_STARTED: 'se_voice_clone_started',
  VOICE_CLONE_COMPLETED: 'se_voice_clone_completed',
  WORKFLOW_CREATED: 'se_workflow_created',
  WORKFLOW_UPDATED: 'se_workflow_updated',
  WORKFLOW_DELETED: 'se_workflow_deleted',
  WORKFLOW_EXECUTED: 'se_workflow_executed',
  AUTOMATION_TRIGGERED: 'se_automation_triggered',

  // API / Revenue
  API_CALL_MADE: 'se_api_call_made',
  CREDITS_DEPLETED: 'se_credits_depleted',
  PLAN_UPGRADED: 'se_plan_upgraded',
  PLAN_DOWNGRADED: 'se_plan_downgraded',
  SUBSCRIPTION_CANCELLED: 'se_subscription_cancelled',
  TRIAL_STARTED: 'se_trial_started',
  TRIAL_CONVERTED: 'se_trial_converted',
  CHECKOUT_STARTED: 'se_checkout_started',
  CHECKOUT_COMPLETED: 'se_checkout_completed',
  TIER_UPGRADED: 'se_tier_upgraded', // Legacy
} as const

/** Backward compatibility alias */
export const POSTHOG_EVENTS = SE_EVENTS

export type SEEventName = (typeof SE_EVENTS)[keyof typeof SE_EVENTS]
export type PostHogEvent = SEEventName

export interface SEEventPropertiesMap {
  [SE_EVENTS.SIGNUP_COMPLETE]: { user_id: string; email_domain: string; signup_method: string; referrer?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string }
  [SE_EVENTS.ONBOARDING_STARTED]: { user_id: string; returning?: boolean }
  [SE_EVENTS.ONBOARDING_STEP_COMPLETED]: { user_id: string; step: string; step_number: number; platforms_selected?: string[]; tone_selected?: string; time_spent_seconds?: number }
  [SE_EVENTS.ONBOARDING_COMPLETED]: { user_id: string; platforms_count: number; tone: string; frequency: string; total_time_seconds?: number; steps_skipped?: string[] }
  [SE_EVENTS.EMAIL_VERIFIED]: { user_id: string; method?: string }
  [SE_EVENTS.PLATFORM_CONNECTED]: { user_id: string; platform: string }
  [SE_EVENTS.PLATFORM_DISCONNECTED]: { user_id: string; platform: string }
  [SE_EVENTS.SOCIAL_CONNECTED]: { platform: string; [key: string]: unknown }
  [SE_EVENTS.SOCIAL_DISCONNECTED]: { platform: string; [key: string]: unknown }
  [SE_EVENTS.CONTENT_CREATED]: { user_id: string; content_id: string; platforms: string[]; status: string; ai_model?: string; has_image?: boolean; has_audio?: boolean; has_video?: boolean; content_type?: string }
  [SE_EVENTS.CONTENT_EXPORTED]: { user_id: string; content_id: string; platform: string; export_format?: string }
  [SE_EVENTS.CONTENT_SCHEDULED]: { user_id: string; content_id: string; platforms: string[]; scheduled_for: string; hours_until_post?: number; frequency_slot?: string }
  [SE_EVENTS.CONTENT_POSTED]: { user_id: string; content_id: string; platform: string; post_id: string; scheduled?: boolean; retry_count?: number }
  [SE_EVENTS.CONTENT_FAILED]: { user_id: string; content_id: string; platform: string; error_type: string; error_message?: string; retry_count?: number; retryable?: boolean }
  [SE_EVENTS.AI_CONTENT_GENERATED]: { user_id: string; model: string; platforms: string[]; prompt_tokens?: number; completion_tokens?: number; generation_time_ms?: number; tone?: string; content_type?: string }
  [SE_EVENTS.POST_CREATED]: Record<string, unknown>
  [SE_EVENTS.POST_PUBLISHED]: Record<string, unknown>
  [SE_EVENTS.VOICE_CLONE_STARTED]: { user_id: string; mime_type?: string; file_size_bytes?: number }
  [SE_EVENTS.VOICE_CLONE_COMPLETED]: { user_id: string; clone_id: string; processing_time_ms?: number }
  [SE_EVENTS.WORKFLOW_CREATED]: { user_id: string; workflow_id: string; node_count: number; trigger_type?: string; has_ai_node?: boolean }
  [SE_EVENTS.WORKFLOW_UPDATED]: { user_id: string; workflow_id: string; [key: string]: unknown }
  [SE_EVENTS.WORKFLOW_DELETED]: { user_id: string; workflow_id: string }
  [SE_EVENTS.WORKFLOW_EXECUTED]: { user_id: string; workflow_id: string; trigger_type: string; execution_id?: string; node_count?: number }
  [SE_EVENTS.AUTOMATION_TRIGGERED]: { user_id: string; automation_type: string; source_event?: string; target_platform?: string }
  [SE_EVENTS.API_CALL_MADE]: { user_id: string; endpoint?: string; status?: number }
  [SE_EVENTS.CREDITS_DEPLETED]: { user_id: string; [key: string]: unknown }
  [SE_EVENTS.PLAN_UPGRADED]: { user_id: string; from_plan: string; to_plan: string; mrr_delta_cents?: number; trigger?: string }
  [SE_EVENTS.PLAN_DOWNGRADED]: { user_id: string; from_plan: string; to_plan: string; mrr_delta_cents?: number; reason?: string }
  [SE_EVENTS.SUBSCRIPTION_CANCELLED]: { user_id: string; plan: string; cancel_at: string; reason?: string; feedback?: string; months_active?: number }
  [SE_EVENTS.TRIAL_STARTED]: { user_id: string; trial_plan: string; trial_ends_at: string; trial_length_days?: number; trigger?: string }
  [SE_EVENTS.TRIAL_CONVERTED]: { user_id: string; plan: string; amount_cents: number; trial_length_days?: number; days_remaining_at_convert?: number }
  [SE_EVENTS.CHECKOUT_STARTED]: { user_id: string; target_plan: string; current_plan?: string; trigger?: string }
  [SE_EVENTS.CHECKOUT_COMPLETED]: { user_id: string; plan: string; amount_cents: number; interval: string; stripe_session_id?: string; coupon_applied?: boolean; discount_percent?: number }
  [SE_EVENTS.TIER_UPGRADED]: Record<string, unknown>
}

export interface SEUserTraits {
  email?: string
  username?: string
  full_name?: string
  tier?: string
  organization?: string
  plan?: string
  plan_interval?: string
  trial_active?: boolean
  trial_ends_at?: string
  onboarding_completed?: boolean
  platforms_connected?: string[]
  content_count?: number
  app: 'social-engine'
}
