'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

type DateRange = '7d' | '30d' | '90d'

const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
]

// Best posting times heatmap data — higher = better engagement
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['6am', '9am', '12pm', '3pm', '6pm', '9pm']

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
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
          <svg className="w-5 h-5 text-muted-foreground/70 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <Link href="/settings#billing" className="text-xs text-purple-600 font-medium">Upgrade</Link>
        </div>
      )}
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
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
      : 'bg-muted'
  const text =
    value > 60 ? 'text-white' : value > 20 ? 'text-purple-800' : 'text-muted-foreground/70'

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
  const data = useQuery(api.analytics.getAnalyticsData, { range })

  if (data === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2"><div className="h-7 bg-muted rounded w-32" /><div className="h-4 bg-muted rounded w-64" /></div>
          <div className="h-9 bg-muted rounded-xl w-72" />
        </div>
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}</div>
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    )
  }

  if (data === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-foreground">No data yet</h2>
        <p className="text-muted-foreground mt-2">
          Start creating content to see your analytics.
        </p>
        <Link href="/create" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Create content
        </Link>
      </div>
    )
  }

  const {
    overview,
    sparklines,
    heatmap,
    platformComparison,
    contentTypePerformance,
  } = data

  const { imp: impData, eng: engData } = sparklines

  const maxImpressions = Math.max(...platformComparison.map((p) => p.impressions))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Track your content performance across all platforms.
          </p>
        </div>
        {/* Date range */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.id}
              onClick={() => setRange(dr.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === dr.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-gray-700'
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
            value={overview.impressions.value}
            delta={overview.impressions.delta}
            positive={overview.impressions.positive}
            data={impData}
            gradientId="imp-tile-grad"
          />
          <MetricTile
            label="Total Engagements"
            value={overview.engagements.value}
            delta={overview.engagements.delta}
            positive={overview.engagements.positive}
            data={engData}
            gradientId="eng-tile-grad"
          />
          <MetricTile
            label="Avg Engagement Rate"
            value={overview.engagementRate.value}
            delta={overview.engagementRate.delta}
            positive={overview.engagementRate.positive}
            data={impData.map((v, i) => v * 0.04 + engData[i] * 0.02)}
            gradientId="er-tile-grad"
          />
          <MetricTile
            label="New Followers"
            value={overview.followers.value}
            delta={overview.followers.delta}
            positive={overview.followers.positive}
            data={impData.map((v) => v * 0.009)}
            gradientId="fol-tile-grad"
          />
        </div>
      </div>

      {/* Engagement rate chart — last 30 days line chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">Engagement Rate — Last {range === '7d' ? '7' : range === '30d' ? '30' : '90'} Days</h3>
            <p className="text-sm text-muted-foreground/70 mt-0.5">Impressions (solid) vs Engagements (dashed)</p>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground/70">
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

        <div className="relative h-40 bg-muted/50 rounded-xl overflow-hidden border border-border">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between py-2 pl-2">
            {['50K', '40K', '30K', '20K', '10K', '0'].map((v) => (
              <span key={v} className="text-xs text-muted-foreground/50">{v}</span>
            ))}
          </div>
          {/* Grid lines */}
          <div className="absolute inset-0 pl-10 flex flex-col justify-between py-2 pb-8 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-border w-full" />
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
                  <span key={d} className="text-xs text-muted-foreground/50">{d}</span>
                ))
              : range === '30d'
              ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
                  <span key={w} className="text-xs text-muted-foreground/50">{w}</span>
                ))
              : ['Jan', 'Feb', 'Mar'].map((m) => (
                  <span key={m} className="text-xs text-muted-foreground/50">{m}</span>
                ))}
          </div>
        </div>
      </div>

      {/* Best posting times heatmap + platform comparison — 2 col */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Best Posting Times</h3>
            <p className="text-sm text-muted-foreground/70 mt-0.5">Engagement index by day and hour</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[340px]">
              {/* Header row */}
              <div className="grid gap-1.5 mb-1.5 [grid-template-columns:36px_repeat(6,1fr)]">
                <div />
                {HOURS.map((h) => (
                  <div key={h} className="text-center text-xs text-muted-foreground/70 font-medium">{h}</div>
                ))}
              </div>
              {/* Data rows */}
              {DAYS.map((day) => (
                <div key={day} className="grid gap-1.5 mb-1.5 [grid-template-columns:36px_repeat(6,1fr)]">
                  <div className="flex items-center text-xs text-muted-foreground font-medium">{day}</div>
                  {heatmap[day].map((v, i) => (
                    <HeatmapCell key={i} value={v} />
                  ))}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground/70">Low</span>
                {['bg-muted', 'bg-purple-100', 'bg-purple-300', 'bg-purple-400', 'bg-purple-600'].map((c) => (
                  <div key={c} className={`w-5 h-3 rounded ${c}`} />
                ))}
                <span className="text-xs text-muted-foreground/70">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform comparison bar chart */}
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Platform Comparison</h3>
            <p className="text-sm text-muted-foreground/70 mt-0.5">Impressions and engagement rate by platform</p>
          </div>
          <div className="space-y-4">
            {platformComparison.map((p) => {
              const barPct = (p.impressions / maxImpressions) * 100
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/70">{(p.impressions / 1000).toFixed(0)}K impressions</span>
                      <span className="badge-green text-xs">{p.er}% ER</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
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
          <h3 className="font-semibold text-foreground">Content Type Performance</h3>
          <p className="text-sm text-muted-foreground/70 mt-0.5">Which formats drive the most engagement</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentTypePerformance.map((ct) => (
            <div key={ct.type} className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">{ct.type}</span>
                <span className="badge-green">{ct.avg_er}% ER</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div className={`h-full ${ct.color} ${ct.widthClass} rounded-full transition-all duration-500`} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{ct.posts} posts</span>
                <span>{ct.impressions} impressions</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
