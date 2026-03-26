/**
 * PostHog client wrapper for FFE Social Engine.
 *
 * Provides a typed `track()` function, `identifyUser()`, and session replay
 * initialization for the dashboard Next.js app.
 *
 * Ticket: FIR-1179
 */

'use client'

import posthog from 'posthog-js'
import type {
  SEEventName,
  SEEventPropertiesMap,
  SEUserTraits,
} from './posthog-events'

// ── Constants ────────────────────────────────────────────────────────────────

/** URL patterns that should receive 100% session replay sample rate */
const HIGH_VALUE_URL_PATTERNS = ['/onboard', '/checkout', '/pricing']

// ── Initialisation ───────────────────────────────────────────────────────────

let _initialized = false

/**
 * Initialize the PostHog client-side SDK.
 */
export function initPostHog(): void {
  if (typeof window === 'undefined') return
  if (_initialized) return

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — analytics disabled')
    }
    return
  }

  posthog.init(apiKey, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,

    // Session replay base config
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      blockClass: 'ph-no-capture',
      maskTextClass: 'ph-mask',
    },

    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug()
      }

      // Initial evaluation of session recording
      evaluateSessionRecording(window.location.pathname)
    },
  })

  // Re-evaluate session recording on route changes
  if (typeof window !== 'undefined') {
    const originalPushState = window.history.pushState
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args)
      evaluateSessionRecording(window.location.pathname)
    }

    window.addEventListener('popstate', () => {
      evaluateSessionRecording(window.location.pathname)
    })
  }

  _initialized = true
}

/**
 * Internal helper to start/stop recording based on URL.
 */
function evaluateSessionRecording(pathname: string): void {
  if (!posthog) return

  const isHighValue = HIGH_VALUE_URL_PATTERNS.some((p) =>
    pathname.startsWith(p)
  )

  if (isHighValue) {
    posthog.startSessionRecording()
  } else {
    // Record 20% of other sessions
    if (Math.random() > 0.2) {
      posthog.stopSessionRecording()
    } else {
      posthog.startSessionRecording()
    }
  }
}

// ── Client-side tracking ─────────────────────────────────────────────────────

/**
 * Track a typed Social Engine event.
 */
export function track<T extends SEEventName>(
  event: T,
  properties: SEEventPropertiesMap[T]
): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.capture(event, properties as unknown as Record<string, unknown>)
}

/**
 * Identify the current user and set their traits.
 */
export function identifyUser(userId: string, traits: SEUserTraits): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.identify(userId, {
    ...traits,
    app: 'social-engine',
  })
}

/**
 * Reset the PostHog identity (call on logout).
 */
export function resetIdentity(): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.reset()
}

/**
 * Start session recording for the current page.
 */
export function startSessionRecording(): void {
  if (typeof window === 'undefined') return
  if (!_initialized) return

  posthog.startSessionRecording()
}
