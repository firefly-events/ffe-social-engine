'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { initPostHog, identifyUser, resetIdentity } from '@/lib/posthog'

/**
 * PostHogProvider integrates analytics and session recording into the dashboard.
 * It identifies the user via Clerk once authentication is loaded.
 * 
 * Ticket: FIR-1179
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Initialize PostHog once on client mount
  useEffect(() => {
    initPostHog()
  }, [])

  const { user, isLoaded, isSignedIn } = useUser()

  // Sync user identity with PostHog
  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user) {
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
        created_at: user.createdAt?.toISOString(),
        app: 'social-engine',
      })
    } else if (!isSignedIn) {
      resetIdentity()
    }
  }, [isLoaded, isSignedIn, user])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
