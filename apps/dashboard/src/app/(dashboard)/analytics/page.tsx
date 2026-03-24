'use client'

import { useState } from 'react'
import Link from 'next/link'

type DateRange = '7d' | '30d' | '90d'

const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
]

const PLATFORM_STATS = [
  {
    name: 'Instagram',
    handle: '@fireflyevents',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    followers: '12.4K',
    growth: '+284',
    reach: '48.2K',
    engagement: '4.8%',
    posts: 28,
  },
  {
    name: 'LinkedIn',
    handle: 'Firefly Events',
    color: 'bg-blue-600',
    followers: '3.2K',
    growth: '+64',
    reach: '22.1K',
    engagement: '3.2%',
    posts: 19,
  },
  {
    name: 'TikTok',
    handle: '@fireflyevents',
    color: 'bg-black',
    followers: '8.9K',
    growth: '+1.2K',
    reach: '104K',
    engagement: '6.1%',
    posts: 14,
  },
]

const TOP_POSTS = [
  {
    id: 1,
    title: 'POV: You just discovered the best lineup of 2025 is only $45 away',
    platform: 'TikTok',
    platformColor: 'bg-black',
    date: 'Mar 18',
    impressions: '42,100',
    likes: '3,840',
    comments: '284',
    shares: '1,240',
    engagement: '12.4%',
  },
  {
    id: 2,
    title: '3 things every event organizer needs to do before they sell a single ticket',
    platform: 'LinkedIn',
    platformColor: 'bg-blue-600',
    date: 'Mar 15',
    impressions: '18,400',
    likes: '742',
    comments: '198',
    shares: '412',
    engagement: '7.3%',
  },
  {
    id: 3,
    title: 'SXSW 2025 — our team behind the scenes (swipe)',
    platform: 'Instagram',
    platformColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    date: 'Mar 12',
    impressions: '24,800',
    likes: '1,920',
    comments: '342',
    shares: '208',
    engagement: '9.9%',
  },
]

// Fake sparkline data
const SPARKLINE_POINTS = {
  '7d': [40, 55, 48, 70, 62, 88, 95],
  '30d': [30, 40, 35, 55, 48, 70, 62, 80, 75, 90, 85, 100, 95, 110, 105, 120, 115, 130, 125, 140, 135, 150, 145, 160, 155, 170, 165, 180, 175, 190],
  '90d': Array.from({ length: 90 }, (_, i) => 30 + i * 1.8 + Math.sin(i * 0.3) * 15),
}

function SparklineSVG({ data, color = '#9333ea' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 200
  const h = 60
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return `${x},${y}`
  })
  const pathD = `M${pts.join('L')}`
  const fillD = `${pathD}L${w},${h}L0,${h}Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#fill-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MetricTile({
  label,
  value,
  delta,
  positive,
  data,
  locked,
}: {
  label: string
  value: string
  delta: string
  positive: boolean
  data: number[]
  locked?: boolean
}) {
  return (
    <div className={`card p-5 relative overflow-hidden ${locked ? 'opacity-60' : ''}`}>
      {locked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
          <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <Link href="/settings#billing" className="text-xs text-purple-600 font-medium">Upgrade</Link>
        </div>
      )}
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs font-medium mt-1 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
        {positive ? '' : '-'}{delta}
      </div>
      <div className="mt-3 h-14">
        <SparklineSVG data={data} color={positive ? '#10b981' : '#ef4444'} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>('30d')
  const sparkData = SPARKLINE_POINTS[range]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            Track your content performance across all platforms.
          </p>
        </div>
        {/* Date range */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.id}
              onClick={() => setRange(dr.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === dr.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div>
        <h3 className="section-header mb-4">Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            label="Total Impressions"
            value="174.3K"
            delta="+18% vs prev"
            positive
            data={sparkData}
          />
          <MetricTile
            label="Total Engagements"
            value="8,240"
            delta="+12% vs prev"
            positive
            data={sparkData.map((v) => v * 0.6)}
          />
          <MetricTile
            label="Avg Engagement Rate"
            value="4.7%"
            delta="+0.5% vs prev"
            positive
            data={sparkData.map((v) => v * 0.4 + 20)}
          />
          <MetricTile
            label="New Followers"
            value="1,548"
            delta="+22% vs prev"
            positive
            data={sparkData.map((v) => v * 0.8 + 10)}
          />
        </div>
      </div>

      {/* Main chart area */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Impressions Over Time</h3>
            <p className="text-sm text-gray-400 mt-0.5">All platforms combined</p>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-purple-500" />
              Impressions
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-500" />
              Engagements
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-52 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-2 pl-2">
            {['50K', '40K', '30K', '20K', '10K', '0'].map((v) => (
              <span key={v} className="text-xs text-gray-300">{v}</span>
            ))}
          </div>
          {/* Chart lines */}
          <div className="absolute inset-0 pl-12 pt-2 pb-8">
            <SparklineSVG data={sparkData} color="#9333ea" />
          </div>
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-12 right-0 flex justify-between px-2 pb-1.5">
            {range === '7d'
              ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d} className="text-xs text-gray-300">{d}</span>
                ))
              : ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
                  <span key={w} className="text-xs text-gray-300">{w}</span>
                ))}
          </div>
        </div>
      </div>

      {/* Per-platform breakdown */}
      <div>
        <h3 className="section-header mb-4">Platform Breakdown</h3>
        <div className="space-y-4">
          {PLATFORM_STATS.map((p) => (
            <div key={p.name} className="card p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl ${p.color} flex-shrink-0 flex items-center justify-center text-white text-sm font-bold`}>
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.handle}</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="font-semibold text-gray-900">{p.followers}</div>
                  <div className="text-xs text-emerald-600">{p.growth} followers</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Reach', value: p.reach },
                  { label: 'Engagement', value: p.engagement },
                  { label: 'Posts', value: String(p.posts) },
                  { label: 'Followers', value: p.followers },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-sm font-semibold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header">Top Performing Posts</h3>
          <Link href="/schedule" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {TOP_POSTS.map((post, i) => (
            <div key={post.id} className="card p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className={`w-8 h-8 rounded-lg ${post.platformColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {post.platform.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.platform} · {post.date}</p>
                </div>
                <span className="badge-green flex-shrink-0">{post.engagement} ER</span>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center bg-gray-50 rounded-lg p-3">
                {[
                  { label: 'Impressions', value: post.impressions },
                  { label: 'Likes', value: post.likes },
                  { label: 'Comments', value: post.comments },
                  { label: 'Shares', value: post.shares },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-sm font-semibold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
