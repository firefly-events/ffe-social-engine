'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Initialize PostHog client-side with configuration.
 */
function initPostHog() {
  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const phHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com'

  if (typeof window !== 'undefined' && phKey) {
    posthog.init(phKey, {
      api_host: phHost,
      autocapture: true,
      capture_pageview: false, // We'll handle this manually on route changes
      session_recording: {
        maskAllInputs: false,
        maskTextSelector: undefined,
      },
      enable_heatmaps: true,
      persistence: 'localStorage+cookie',
    })
  }
}

/**
 * Handles route tracking and Clerk identification.
 * Wrapped in Suspense because it uses useSearchParams.
 */
function PostHogTracking() {
  const { user } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // ─── Route Change Tracking & Re-evaluation ────────────────────────────────
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      
      posthog.capture('$pageview', { $current_url: url })
      
      if (posthog.sessionRecording) {
        posthog.capture('$recording_config_update', { pathname })
      }
    }
  }, [pathname, searchParams])

  // ─── Clerk Integration ─────────────────────────────────────────────────────
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username,
        full_name: user.fullName,
        tier: user.publicMetadata?.tier || 'free',
        organization: user.publicMetadata?.orgId || 'personal',
      })
    } else if (!user && typeof window !== 'undefined') {
      posthog.reset()
    }
  }, [user])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogTracking />
      </Suspense>
      {children}
    </PHProvider>
  )
}
