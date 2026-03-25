/**
 * GET /api/analytics — return engagement metrics, post performance, and platform breakdown.
 *
 * Query parameters:
 *   dateRange    — "7d" | "30d" | "90d" | "custom"  (default: "30d")
 *   platform     — filter to a specific platform
 *   contentType  — filter to a specific content type
 *   startDate    — ISO-8601 (required when dateRange="custom")
 *   endDate      — ISO-8601 (required when dateRange="custom")
 *
 * The response shape is defined by AnalyticsResponse in api-types.ts so that
 * when real platform analytics APIs are wired in (Instagram Graph, LinkedIn,
 * TikTok, etc.) no frontend changes are needed — only this route changes.
 *
 * TODO(real-data): Replace generateMockAnalytics with calls to:
 *   - Instagram Graph API  (/me/insights)
 *   - LinkedIn Marketing API (/organizationalEntityShareStatistics)
 *   - TikTok Business API (/business/get/stats)
 *   - Twitter v2 API (/tweets/search/recent + public_metrics)
 * Aggregate and normalise results into AnalyticsResponse shape.
 *
 * TODO(cache): Cache responses per userId+dateRange for ~5 min (Redis / Upstash).
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  badRequest,
  unauthorized,
  serverError,
} from '@/lib/api-helpers'
import type {
  AnalyticsResponse,
  AnalyticsDateRange,
  TimeSeriesPoint,
  PlatformBreakdown,
  PostPerformance,
} from '@/lib/api-types'
import type { Platform } from '@/types/export'

// ── HELPERS ───────────────────────────────────────────────────────────────────

function dateRangeBounds(
  range: AnalyticsDateRange,
  startDateParam?: string | null,
  endDateParam?:   string | null,
): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  if (range === 'custom') {
    if (!startDateParam || !endDateParam) throw new Error('custom')
    return {
      startDate: new Date(startDateParam),
      endDate:   new Date(endDateParam),
    }
  }

  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  return { startDate, endDate }
}

/** Generate a deterministic pseudo-random number from a seed string. */
function seededRand(seed: string, min: number, max: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const t = Math.abs(hash) / 2147483647
  return Math.floor(t * (max - min) + min)
}

// ── MOCK DATA GENERATORS ──────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook', 'youtube',
]

function generateTimeSeries(
  startDate: Date,
  endDate:   Date,
  baseImpressions: number,
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  const cursor = new Date(startDate)

  while (cursor <= endDate) {
    const dateStr = cursor.toISOString().split('T')[0]
    const seed    = dateStr ?? ''
    const impressions  = seededRand(seed + 'imp', baseImpressions * 0.6, baseImpressions * 1.4)
    const engagements  = Math.floor(impressions * (seededRand(seed + 'er', 3, 8) / 100))
    const clicks       = Math.floor(engagements * seededRand(seed + 'clk', 2, 5) / 10)
    const followers    = seededRand(seed + 'fol', 10, 80)

    points.push({ date: seed, impressions, engagements, clicks, followers })
    cursor.setDate(cursor.getDate() + 1)
  }

  return points
}

function generatePlatformBreakdown(filter?: Platform): PlatformBreakdown[] {
  const platforms = filter ? [filter] : PLATFORMS

  return platforms.map((platform) => ({
    platform,
    impressions:     seededRand(platform + 'imp', 5000, 50000),
    engagements:     seededRand(platform + 'eng', 200,  5000),
    engagementRate:  seededRand(platform + 'er',  20,   80) / 10,  // 2.0 – 8.0 %
    posts:           seededRand(platform + 'pst', 5,    30),
    followerGrowth:  seededRand(platform + 'fol', 50,   500),
  }))
}

const SAMPLE_CAPTIONS: string[] = [
  'Behind the scenes at our SXSW setup — 48 hours to go!',
  '3 things we learned from 10,000 event attendees this year',
  'POV: You just found out your favourite artist is playing 5 miles away',
  'Tickets on sale NOW — link in bio',
  'How we use AI to write better event descriptions in half the time',
  'Weekly tip: Use countdown timers to double your ticket conversions',
  'The future of live events — a thread',
  'Our team just hit 10K followers. Here's what worked.',
]

function generateTopPosts(filter?: Platform): PostPerformance[] {
  const platforms = filter ? [filter] : PLATFORMS
  const posts: PostPerformance[] = []

  for (let i = 0; i < 6; i++) {
    const platform = platforms[i % platforms.length]!
    const caption  = SAMPLE_CAPTIONS[i % SAMPLE_CAPTIONS.length]!
    const seed     = `post${i}`

    const impressions  = seededRand(seed + 'imp', 5000, 50000)
    const likes        = Math.floor(impressions * seededRand(seed + 'lk', 2, 8) / 100)
    const comments     = Math.floor(likes * seededRand(seed + 'cm', 5, 20) / 100)
    const shares       = Math.floor(likes * seededRand(seed + 'sh', 3, 15) / 100)

    posts.push({
      contentId:       `mock_content_${i}`,
      platform,
      text:            caption,
      scheduledAt:     new Date(Date.now() - i * 86400000).toISOString(),
      postedAt:        new Date(Date.now() - i * 86400000 + 60000).toISOString(),
      impressions,
      likes,
      comments,
      shares,
      engagementRate:  Math.round(((likes + comments + shares) / impressions) * 1000) / 10,
    })
  }

  // Sort by engagement rate descending
  return posts.sort((a, b) => b.engagementRate - a.engagementRate)
}

// ── ROUTE HANDLER ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const sp          = request.nextUrl.searchParams
    const rangeParam  = (sp.get('dateRange') ?? '30d') as AnalyticsDateRange
    const platform    = sp.get('platform') as Platform | null
    const startDateP  = sp.get('startDate')
    const endDateP    = sp.get('endDate')

    const validRanges: AnalyticsDateRange[] = ['7d', '30d', '90d', 'custom']
    if (!validRanges.includes(rangeParam)) {
      return badRequest(`dateRange must be one of: ${validRanges.join(', ')}`)
    }

    let startDate: Date
    let endDate:   Date

    try {
      const bounds = dateRangeBounds(rangeParam, startDateP, endDateP)
      startDate    = bounds.startDate
      endDate      = bounds.endDate
    } catch {
      return badRequest('startDate and endDate are required when dateRange is "custom"')
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return badRequest('startDate and endDate must be valid ISO-8601 date strings')
    }
    if (startDate >= endDate) {
      return badRequest('startDate must be before endDate')
    }

    const timeSeries         = generateTimeSeries(startDate, endDate, 8000)
    const platformBreakdown  = generatePlatformBreakdown(platform ?? undefined)
    const topPosts           = generateTopPosts(platform ?? undefined)

    const totals = timeSeries.reduce(
      (acc, pt) => ({
        impressions:    acc.impressions    + pt.impressions,
        engagements:    acc.engagements    + pt.engagements,
        clicks:         acc.clicks         + pt.clicks,
        followerGrowth: acc.followerGrowth + pt.followers,
      }),
      { impressions: 0, engagements: 0, clicks: 0, followerGrowth: 0 },
    )

    const postsPublished     = platformBreakdown.reduce((s, p) => s + p.posts, 0)
    const avgEngagementRate  = totals.impressions
      ? Math.round((totals.engagements / totals.impressions) * 1000) / 10
      : 0

    const response: AnalyticsResponse = {
      dateRange:          rangeParam,
      startDate:          startDate.toISOString(),
      endDate:            endDate.toISOString(),
      totals: {
        ...totals,
        postsPublished,
        avgEngagementRate,
      },
      timeSeries,
      platformBreakdown,
      topPosts,
    }

    return ok(response)
  } catch (err) {
    console.error('[GET /api/analytics]', err)
    return serverError()
  }
}
