import { useFeatureFlagEnabled } from 'posthog-js/react'

// Feature flag names - must match PostHog dashboard
export const FEATURE_FLAGS = {
  SOCIAL_POSTING_ENABLED: 'social_posting_enabled',
  VOICE_CLONING_ENABLED: 'voice_cloning_enabled',
  WORKFLOW_BUILDER_ENABLED: 'workflow_builder_enabled',
  API_ACCESS_ENABLED: 'api_access_enabled',
} as const

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS]

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return useFeatureFlagEnabled(flag) ?? false
}
