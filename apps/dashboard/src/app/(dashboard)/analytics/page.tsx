'use client'

import { useState } from 'react'
import Link from 'next/link'

type DateRange = '7d' | '30d' | '90d'

const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
]

// Seeded, deterministic demo data — consistent on every render

function seededValues(seed: number, count: number, min: number, max: number): number[] {
  const arr: number[] = []
  let s = seed
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    arr.push(min + ((s >>> 0) % (max - min)))
  }
  return arr
}

const IMPRESSIONS_30D = seededValues(42, 30, 1800, 9800)
const ENGAGEMENTS_30D = seededValues(99, 30, 80, 620)
const IMPRESSIONS_7D = IMPRESSIONS_30D.slice(-7)
const ENGAGEMENTS_7D = ENGAGEMENTS_30D.slice(-7)
const IMPRESSIONS_90D = [
  ...seededValues(7, 30, 1200, 5000),
  ...seededValues(13, 30, 2000, 7000),
  ...IMPRESSIONS_30D,
]
const ENGAGEMENTS_90D = [
  ...seededValues(7, 30, 50, 300),
  ...seededValues(13, 30, 80, 450),
  ...ENGAGEMENTS_30D,
]

const SPARKLINES: Record<DateRange, { imp: number[]; eng: number[] }> = {
  '7d': { imp: IMPRESSIONS_7D, eng: ENGAGEMENTS_7D },
  '30d': { imp: IMPRESSIONS_30D, eng: ENGAGEMENTS_30D },
  '90d': { imp: IMPRESSIONS_90D, eng: ENGAGEMENTS_90D },
}

// Best posting times heatmap data — higher = better engagement
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['6am', '9am', '12pm', '3pm', '6pm', '9pm']

const HEATMAP_DATA: Record<string, number[]> = {
  Mon: [12, 48, 62, 54, 71, 45],
  Tue: [14, 82, 74, 60, 88, 50],
  Wed: [10, 55, 68, 58, 76, 48],
  Thu: [16, 70, 80, 65, 92, 55],
  Fri: [20, 45, 55, 50, 60, 72],
  Sat: [35, 40, 58, 72, 68, 82],
  Sun: [40, 38, 62, 66, 70, 78],
}

// Platform comparison
const PLATFORM_COMPARISON = [
  { name: 'TikTok', impressions: 104000, engagement: 6360, er: 6.1, color: '#000000', lightColor: '#f3f4f6' },
  { name: 'Instagram', impressions: 48200, engagement: 2314, er: 4.8, color: '#E1306C', lightColor: '#fdf2f8' },
  { name: 'LinkedIn', impressions: 22100, engagement: 707, er: 3.2, color: '#0A66C2', lightColor: '#eff6ff' },
  { name: 'Facebook', impressions: 18600, engagement: 521, er: 2.8, color: '#1877F2', lightColor: '#eff6ff' },
  { name: 'Twitter/X', impressions: 14300, engagement: 286, er: 2.0, color: '#000000', lightColor: '#f3f4f6' },
]

// Content type performance
const CONTENT_TYPES = [
  { type: 'Video', avg_er: 7.2, posts: 14, impressions: '48K', color: 'bg-purple-500', widthClass: 'w-[92%]' },
  { type: 'Image', avg_er: 4.9, posts: 32, impressions: '82K', color: 'bg-blue-500', widthClass: 'w-[63%]' },
  { type: 'Voice / Audio', avg_er: 4.1, posts: 8, impressions: '19K', color: 'bg-emerald-500', widthClass: 'w-[53%]' },
  { type: 'Text Only', avg_er: 2.8, posts: 24, impressions: '55K', color: 'bg-amber-500', widthClass: 'w-[36%]' },
]

// AI recommendations
const AI_RECS = [
  {
    icon: '📈',
    headline: 'Post more on Tuesdays',
    body: 'Tuesday posts average 88% higher engagement than your weekly mean. You currently post 1x/week on Tuesday — try 3x.',
    action: 'Schedule for Tue',
    href: '/schedule',
    color: 'bg-purple-50 border-purple-200',
    badge: 'AI Insight',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: '🚀',
    headline: 'LinkedIn engagement up 40%',
    body: 'Your LinkedIn content has outperformed all other platforms this week. Consider repurposing your top Twitter threads as long-form LinkedIn posts.',
    action: 'Create LinkedIn post',
    href: '/create',
    color: 'bg-blue-50 border-blue-200',
    badge: 'Trending',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🎥',
    headline: 'Video converts 2.4x better',
    body: 'Your video posts average 7.2% engagement rate vs 3.0% for static images. Your last 3 top posts were all video — double down.',
    action: 'Create video post',
    href: '/create',
    color: 'bg-emerald-50 border-emerald-200',
    badge: 'Opportunity',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: '⏰',
    headline: 'Optimal window: 6–9pm Thu',
    body: 'Thursday 6pm is your single highest-engagement time slot across all platforms. You have no posts scheduled for this Thursday.',
    action: 'Schedule now',
    href: '/schedule',
    color: 'bg-amber-50 border-amber-200',
    badge: 'Action needed',
    badgeColor: 'bg-amber-100 text-amber-700',
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
    type: 'Video',
    typeColor: 'bg-purple-100 text-purple-700',
    thumb: null,
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
    type: 'Text',
    typeColor: 'bg-amber-100 text-amber-700',
    thumb: null,
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
    type: 'Image',
    typeColor: 'bg-blue-100 text-blue-700',
    thumb: null,
  },
  {
    id: 4,
    title: 'We asked 500 event-goers what makes them buy a ticket. The answers surprised us.',
    platform: 'Twitter/X',
    platformColor: 'bg-black',
    date: 'Mar 10',
    impressions: '9,200',
    likes: '380',
    comments: '92',
    shares: '510',
    engagement: '10.7%',
    type: 'Thread',
    typeColor: 'bg-gray-100 text-gray-700',
    thumb: null,
  },
  {
    id: 5,
    title: 'Voice note: What we learned from selling out 3 events in 72 hours',
    platform: 'Instagram',
    platformColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    date: 'Mar 8',
    impressions: '19,600',
    likes: '1,140',
    comments: '224',
    shares: '188',
    engagement: '7.9%',
    type: 'Audio',
    typeColor: 'bg-emerald-100 text-emerald-700',
    thumb: null,
  },
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

function SparklineSVG({
  data,
  color = '#9333ea',
  gradientId,
}: {
  data: number[]
  color?: string
  gradientId?: string
}) {
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
  const gId = gradientId || `fill-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gId})`} />
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
  gradientId,
}: {
  label: string
  value: string
  delta: string
  positive: boolean
  data: number[]
  locked?: boolean
  gradientId?: string
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
        <SparklineSVG data={data} color={positive ? '#10b981' : '#ef4444'} gradientId={gradientId} />
      </div>
    </div>
  )
}

// Dual-line chart for engagement + impressions
function DualLineChart({ impData, engData }: { impData: number[]; engData: number[] }) {
  const w = 600
  const h = 120
  const padL = 0
  const padR = 0
  const padT = 8
  const padB = 0

  function toPath(data: number[]) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    return data
      .map((v, i) => {
        const x = padL + (i / (data.length - 1)) * (w - padL - padR)
        const y = padT + (1 - (v - min) / range) * (h - padT - padB)
        return `${x},${y}`
      })
      .join('L')
  }

  const impPath = `M${toPath(impData)}`
  const engPath = `M${toPath(engData)}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="imp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9333ea" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="eng-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill areas */}
      <path d={`${impPath}L${w},${h}L0,${h}Z`} fill="url(#imp-grad)" />
      <path d={`${engPath}L${w},${h}L0,${h}Z`} fill="url(#eng-grad)" />
      {/* Lines */}
      <path d={impPath} fill="none" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={engPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />
    </svg>
  )
}

// Best posting time heatmap
function HeatmapCell({ value }: { value: number }) {
  const opacity = value / 100
  const bg =
    value > 80
      ? 'bg-purple-600'
      : value > 60
      ? 'bg-purple-400'
      : value > 40
      ? 'bg-purple-300'
      : value > 20
      ? 'bg-purple-100'
      : 'bg-gray-100'
  const text =
    value > 60 ? 'text-white' : value > 20 ? 'text-purple-800' : 'text-gray-400'

  return (
    <div
      className={`${bg} rounded text-center py-1.5 px-1 cursor-default transition-all hover:opacity-80`}
      title={`Engagement index: ${value}`}
    >
      <span className={`text-xs font-medium ${text}`}>{value}</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>('30d')
  const [showAllPosts, setShowAllPosts] = useState(false)
  const { imp: impData, eng: engData } = SPARKLINES[range]

  const visiblePosts = showAllPosts ? TOP_POSTS : TOP_POSTS.slice(0, 3)

  const maxImpressions = Math.max(...PLATFORM_COMPARISON.map((p) => p.impressions))

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
            data={impData}
            gradientId="imp-tile-grad"
          />
          <MetricTile
            label="Total Engagements"
            value="8,240"
            delta="+12% vs prev"
            positive
            data={engData}
            gradientId="eng-tile-grad"
          />
          <MetricTile
            label="Avg Engagement Rate"
            value="4.7%"
            delta="+0.5% vs prev"
            positive
            data={impData.map((v, i) => v * 0.04 + engData[i] * 0.02)}
            gradientId="er-tile-grad"
          />
          <MetricTile
            label="New Followers"
            value="1,548"
            delta="+22% vs prev"
            positive
            data={impData.map((v) => v * 0.009)}
            gradientId="fol-tile-grad"
          />
        </div>
      </div>

      {/* Engagement rate chart — last 30 days line chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Engagement Rate — Last {range === '7d' ? '7' : range === '30d' ? '30' : '90'} Days</h3>
            <p className="text-sm text-gray-400 mt-0.5">Impressions (solid) vs Engagements (dashed)</p>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-purple-500" />
              Impressions
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px bg-emerald-500 border-dashed border-t border-emerald-500 [border-top-style:dashed]" />
              Engagements
            </div>
          </div>
        </div>

        <div className="relative h-40 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between py-2 pl-2">
            {['50K', '40K', '30K', '20K', '10K', '0'].map((v) => (
              <span key={v} className="text-xs text-gray-300">{v}</span>
            ))}
          </div>
          {/* Grid lines */}
          <div className="absolute inset-0 pl-10 flex flex-col justify-between py-2 pb-8 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100 w-full" />
            ))}
          </div>
          {/* Chart */}
          <div className="absolute inset-0 pl-10 pt-2 pb-8 pr-2">
            <DualLineChart impData={impData} engData={engData} />
          </div>
          {/* X-axis */}
          <div className="absolute bottom-0 left-10 right-0 flex justify-between px-2 pb-1.5">
            {range === '7d'
              ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d} className="text-xs text-gray-300">{d}</span>
                ))
              : range === '30d'
              ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
                  <span key={w} className="text-xs text-gray-300">{w}</span>
                ))
              : ['Jan', 'Feb', 'Mar'].map((m) => (
                  <span key={m} className="text-xs text-gray-300">{m}</span>
                ))}
          </div>
        </div>
      </div>

      {/* Best posting times heatmap + platform comparison — 2 col */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Best Posting Times</h3>
            <p className="text-sm text-gray-400 mt-0.5">Engagement index by day and hour</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[340px]">
              {/* Header row */}
              <div className="grid gap-1.5 mb-1.5" className="[grid-template-columns:36px_repeat(6,1fr)]">
                <div />
                {HOURS.map((h) => (
                  <div key={h} className="text-center text-xs text-gray-400 font-medium">{h}</div>
                ))}
              </div>
              {/* Data rows */}
              {DAYS.map((day) => (
                <div key={day} className="grid gap-1.5 mb-1.5" className="[grid-template-columns:36px_repeat(6,1fr)]">
                  <div className="flex items-center text-xs text-gray-500 font-medium">{day}</div>
                  {HEATMAP_DATA[day].map((v, i) => (
                    <HeatmapCell key={i} value={v} />
                  ))}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">Low</span>
                {['bg-gray-100', 'bg-purple-100', 'bg-purple-300', 'bg-purple-400', 'bg-purple-600'].map((c) => (
                  <div key={c} className={`w-5 h-3 rounded ${c}`} />
                ))}
                <span className="text-xs text-gray-400">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform comparison bar chart */}
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Platform Comparison</h3>
            <p className="text-sm text-gray-400 mt-0.5">Impressions and engagement rate by platform</p>
          </div>
          <div className="space-y-4">
            {PLATFORM_COMPARISON.map((p) => {
              const barPct = (p.impressions / maxImpressions) * 100
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{(p.impressions / 1000).toFixed(0)}K impressions</span>
                      <span className="badge-green text-xs">{p.er}% ER</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%`, backgroundColor: p.color === '#000000' ? '#374151' : p.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content type performance */}
      <div className="card p-6">
        <div className="mb-5">
          <h3 className="font-semibold text-gray-900">Content Type Performance</h3>
          <p className="text-sm text-gray-400 mt-0.5">Which formats drive the most engagement</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTENT_TYPES.map((ct) => (
            <div key={ct.type} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">{ct.type}</span>
                <span className="badge-green">{ct.avg_er}% ER</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div className={`h-full ${ct.color} ${ct.widthClass} rounded-full transition-all duration-500`} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{ct.posts} posts</span>
                <span>{ct.impressions} impressions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="section-header">AI Recommendations</h3>
          <span className="badge bg-purple-100 text-purple-700 text-xs">
            <svg className="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Powered by AI
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AI_RECS.map((rec) => (
            <div key={rec.headline} className={`border rounded-xl p-5 ${rec.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{rec.headline}</span>
                    <span className={`badge text-xs ${rec.badgeColor}`}>{rec.badge}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{rec.body}</p>
                  <Link
                    href={rec.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    {rec.action}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
          <button
            onClick={() => setShowAllPosts((v) => !v)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {showAllPosts ? 'Show less' : `View all ${TOP_POSTS.length}`}
          </button>
        </div>
        <div className="space-y-4">
          {visiblePosts.map((post, i) => (
            <div key={post.id} className="card p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                {/* Thumbnail placeholder */}
                <div className={`w-12 h-12 rounded-lg flex-shrink-0 ${post.platformColor} flex items-center justify-center text-white text-xs font-bold overflow-hidden`}>
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">{post.platform} · {post.date}</p>
                    <span className={`badge text-xs ${post.typeColor}`}>{post.type}</span>
                  </div>
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
