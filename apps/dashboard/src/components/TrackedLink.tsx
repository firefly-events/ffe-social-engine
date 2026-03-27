'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'
import type { AnalyticsEvent, EventProperties } from '@/lib/analytics'

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  /** PostHog event name to fire on click */
  trackingEvent: AnalyticsEvent
  /** Extra properties to attach to the event */
  trackingProps?: EventProperties
}

/**
 * A thin wrapper around Next.js <Link> that fires a PostHog event on click.
 * Used primarily on marketing/landing pages where components are server-rendered.
 */
export function TrackedLink({
  trackingEvent,
  trackingProps,
  onClick,
  ...rest
}: TrackedLinkProps) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvent(trackingEvent, trackingProps)
        if (onClick) onClick(e)
      }}
    />
  )
}
