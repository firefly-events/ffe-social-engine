/** SOURCE OF TRUTH: All social-engine events are defined here. Auto-synced to apps/dashboard/src/lib/ via provisioning. */

// ── Event Name Constants ──────────────────────────────────────────────────────

export const SE_EVENTS = {
  // User lifecycle
  USER_SIGNED_UP: 'se_user_signed_up',
  ONBOARDING_STARTED: 'se_onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'se_onboarding_step_completed',
  ONBOARDING_COMPLETED: 'se_onboarding_completed',
  EMAIL_VERIFIED: 'se_email_verified',

  // Account & Integration
  PLATFORM_CONNECTED: 'se_platform_connected',
  PLATFORM_DISCONNECTED: 'se_platform_disconnected',

  // Content pipeline
  CONTENT_CREATED: 'se_content_created',
  CONTENT_EXPORTED: 'se_content_exported',
  CONTENT_SCHEDULED: 'se_content_scheduled',
  CONTENT_POSTED: 'se_content_posted',
  CONTENT_FAILED: 'se_content_failed',
  AI_CONTENT_GENERATED: 'se_ai_content_generated',

  // Feature adoption
  VOICE_CLONE_STARTED: 'se_voice_clone_started',
  VOICE_CLONE_COMPLETED: 'se_voice_clone_completed',
  WORKFLOW_CREATED: 'se_workflow_created',
  WORKFLOW_EXECUTED: 'se_workflow_executed',
  AUTOMATION_TRIGGERED: 'se_automation_triggered',

  // Revenue
  PLAN_UPGRADED: 'se_plan_upgraded',
  PLAN_DOWNGRADED: 'se_plan_downgraded',
  SUBSCRIPTION_CANCELLED: 'se_subscription_cancelled',
  TRIAL_STARTED: 'se_trial_started',
  TRIAL_CONVERTED: 'se_trial_converted',
  CHECKOUT_STARTED: 'se_checkout_started',
  CHECKOUT_COMPLETED: 'se_checkout_completed',
} as const

export type SEEventName = (typeof SE_EVENTS)[keyof typeof SE_EVENTS]

// ── Shared Types ──────────────────────────────────────────────────────────────

export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'youtube'

export type Plan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

export type AIModel =
  | 'gpt-4o'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3-5-sonnet'
  | 'claude-3-haiku'
  | 'gemini-1.5-pro'
  | 'gemini-flash'

export type OnboardingStep =
  | 'connect_accounts'
  | 'brand_voice'
  | 'first_content'
  | 'first_schedule'

export type ContentStatus = 'draft' | 'published' | 'scheduled'

export type ContentType =
  | 'events'
  | 'behind-the-scenes'
  | 'educational'
  | 'promotional'
  | 'storytelling'

export type SignupMethod = 'email' | 'google' | 'github'

export type CheckoutTrigger = 'pricing_page' | 'feature_gate' | 'trial_end' | 'manual'

export type CancelReason =
  | 'too_expensive'
  | 'missing_features'
  | 'switching_product'
  | 'other'

export type BillingInterval = 'month' | 'year'

export type WorkflowTriggerType = 'schedule' | 'webhook' | 'new-event'

export type ExportFormat = 'text' | 'image' | 'full'

// ── Event Property Types ──────────────────────────────────────────────────────

export interface SeUserSignedUpProps {
  user_id: string
  email_domain: string
  signup_method: SignupMethod
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export interface SeOnboardingStartedProps {
  user_id: string
  returning?: boolean
}

export interface SeOnboardingStepCompletedProps {
  user_id: string
  step: OnboardingStep
  step_number: 1 | 2 | 3 | 4
  platforms_selected?: Platform[]
  tone_selected?: string
  time_spent_seconds?: number
}

export interface SeOnboardingCompletedProps {
  user_id: string
  platforms_count: number
  tone: string
  frequency: string
  total_time_seconds?: number
  steps_skipped?: OnboardingStep[]
}

export interface SeEmailVerifiedProps {
  user_id: string
  method?: 'link' | 'code'
}

export interface SePlatformConnectedProps {
  user_id: string
  platform: Platform
}

export interface SePlatformDisconnectedProps {
  user_id: string
  platform: Platform
}

export interface SeContentCreatedProps {
  user_id: string
  content_id: string
  platforms: Platform[]
  status: ContentStatus
  ai_model?: AIModel
  has_image?: boolean
  has_audio?: boolean
  has_video?: boolean
  content_type?: ContentType
}

export interface SeContentExportedProps {
  user_id: string
  content_id: string
  platform: Platform
  export_format?: ExportFormat
}

export interface SeContentScheduledProps {
  user_id: string
  content_id: string
  platforms: Platform[]
  scheduled_for: string
  hours_until_post?: number
  frequency_slot?: string
}

export interface SeContentPostedProps {
  user_id: string
  content_id: string
  platform: Platform
  post_id: string
  scheduled?: boolean
  retry_count?: number
}

export interface SeContentFailedProps {
  user_id: string
  content_id: string
  platform: Platform
  error_type: 'auth_revoked' | 'rate_limited' | 'platform_error' | 'timeout'
  error_message?: string
  retry_count?: number
  retryable?: boolean
}

export interface SeAiContentGeneratedProps {
  user_id: string
  model: AIModel
  platforms: Platform[]
  prompt_tokens?: number
  completion_tokens?: number
  generation_time_ms?: number
  tone?: string
  content_type?: ContentType
}

export interface SeVoiceCloneStartedProps {
  user_id: string
  mime_type?: string
  file_size_bytes?: number
}

export interface SeVoiceCloneCompletedProps {
  user_id: string
  clone_id: string
  processing_time_ms?: number
}

export interface SeWorkflowCreatedProps {
  user_id: string
  workflow_id: string
  node_count: number
  trigger_type?: WorkflowTriggerType
  has_ai_node?: boolean
}

export interface SeWorkflowExecutedProps {
  user_id: string
  workflow_id: string
  trigger_type: WorkflowTriggerType
  execution_id?: string
  node_count?: number
}

export interface SeAutomationTriggeredProps {
  user_id: string
  automation_type: string
  source_event?: string
  target_platform?: Platform
}

export interface SePlanUpgradedProps {
  user_id: string
  from_plan: Plan
  to_plan: Plan
  mrr_delta_cents?: number
  trigger?: CheckoutTrigger
}

export interface SePlanDowngradedProps {
  user_id: string
  from_plan: Plan
  to_plan: Plan
  mrr_delta_cents?: number
  reason?: CancelReason
}

export interface SeSubscriptionCancelledProps {
  user_id: string
  plan: Plan
  cancel_at: string
  reason?: CancelReason
  feedback?: string
  months_active?: number
}

export interface SeTrialStartedProps {
  user_id: string
  trial_plan: Plan
  trial_ends_at: string
  trial_length_days?: number
  trigger?: CheckoutTrigger
}

export interface SeTrialConvertedProps {
  user_id: string
  plan: Plan
  amount_cents: number
  trial_length_days?: number
  days_remaining_at_convert?: number
}

export interface SeCheckoutStartedProps {
  user_id: string
  target_plan: Plan
  current_plan?: Plan
  trigger?: CheckoutTrigger
}

export interface SeCheckoutCompletedProps {
  user_id: string
  plan: Plan
  amount_cents: number
  interval: BillingInterval
  stripe_session_id?: string
  coupon_applied?: boolean
  discount_percent?: number
}

// ── Event Map (event name → property type) ────────────────────────────────────

export interface SEEventPropertiesMap {
  se_user_signed_up: SeUserSignedUpProps
  se_onboarding_started: SeOnboardingStartedProps
  se_onboarding_step_completed: SeOnboardingStepCompletedProps
  se_onboarding_completed: SeOnboardingCompletedProps
  se_email_verified: SeEmailVerifiedProps
  se_platform_connected: SePlatformConnectedProps
  se_platform_disconnected: SePlatformDisconnectedProps
  se_content_created: SeContentCreatedProps
  se_content_exported: SeContentExportedProps
  se_content_scheduled: SeContentScheduledProps
  se_content_posted: SeContentPostedProps
  se_content_failed: SeContentFailedProps
  se_ai_content_generated: SeAiContentGeneratedProps
  se_voice_clone_started: SeVoiceCloneStartedProps
  se_voice_clone_completed: SeVoiceCloneCompletedProps
  se_workflow_created: SeWorkflowCreatedProps
  se_workflow_executed: SeWorkflowExecutedProps
  se_automation_triggered: SeAutomationTriggeredProps
  se_plan_upgraded: SePlanUpgradedProps
  se_plan_downgraded: SePlanDowngradedProps
  se_subscription_cancelled: SeSubscriptionCancelledProps
  se_trial_started: SeTrialStartedProps
  se_trial_converted: SeTrialConvertedProps
  se_checkout_started: SeCheckoutStartedProps
  se_checkout_completed: SeCheckoutCompletedProps
}

// ── User Traits ───────────────────────────────────────────────────────────────

export interface SEUserTraits {
  email?: string
  name?: string
  created_at?: string
  plan?: Plan
  plan_interval?: BillingInterval
  trial_active?: boolean
  trial_ends_at?: string
  onboarding_completed?: boolean
  platforms_connected?: Platform[]
  content_count?: number
  app?: 'social-engine'
}
