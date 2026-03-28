'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { Doc } from '../../../../convex/_generated/dataModel'

// ─── Platform colors ───────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'from-purple-500 to-pink-500',
  Twitter: 'from-sky-400 to-blue-500',
  LinkedIn: 'bg-blue-600',
  TikTok: 'from-slate-900 to-slate-700',
}

function PlatformDot({ platform }: { platform: string }) {
  const gradient = PLATFORM_COLORS[platform]
  const isGradient = gradient?.startsWith('from-')
  return (
    <span
      title={platform}
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
        isGradient ? `bg-gradient-to-br ${gradient}` : (gradient ?? 'bg-slate-500')
      }`}
    />
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  active: { label: 'Active', bg: 'bg-emerald-900/50', text: 'text-emerald-400' },
  archived: { label: 'Archived', bg: 'bg-slate-800', text: 'text-slate-500' },
  draft: { label: 'Draft', bg: 'bg-slate-700', text: 'text-slate-300' },
  approved: { label: 'Approved', bg: 'bg-emerald-900/50', text: 'text-emerald-400' },
  posted: { label: 'Posted', bg: 'bg-purple-900/50', text: 'text-purple-300' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session }: { session: Doc<"contentSessions"> }) {
  const relativeTime = (date: number) => {
    const diffMs = Date.now() - date
    const diffDays = Math.floor(diffMs / 86_400_000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
  }

  const platform = session.platform ?? 'Default';

  return (
    <Link
      href={`/sessions/${session._id}`}
      className="block group bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-150 overflow-hidden"
    >
      {/* Colored top bar based on primary platform */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          PLATFORM_COLORS[platform] ?? 'from-slate-500 to-slate-600'
        }`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
              {session.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Updated {relativeTime(session.updatedAt)}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* Platform dots */}
        <div className="flex items-center gap-1.5 mt-3">
          {session.platform && <PlatformDot platform={session.platform} />}
          <span className="text-xs text-gray-400 ml-1">
            {session.platform}
          </span>
        </div>

        {/* Branch preview + meta */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-4 text-right">
            <div>
              <div className="text-lg font-bold text-gray-900">1</div>
              <div className="text-xs text-gray-400">versions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">1</div>
              <div className="text-xs text-gray-400">
                fork
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No sessions yet</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Sessions let you branch and compare content variations. Start by creating content.
      </p>
      <Link
        href="/create"
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create content
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type FilterStatus = 'all' | 'active' | 'archived'

const FILTER_OPTIONS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
]

export default function SessionsPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const sessions = useQuery(api.sessions.get)

  const filtered = sessions?.filter((s) => {
    const matchesSearch =
      !search || s.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || s.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sessions</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            Branch, compare, and merge your content variations.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New session
        </Link>
      </div>

      {/* Concept callout */}
      <div className="rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 px-5 py-4 flex gap-4 items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mt-0.5">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-purple-900">Content Branching</p>
          <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">
            Fork any content version, explore different AI models or tones, then compare results side-by-side and merge the winner back to your main branch.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder:text-gray-400"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === opt.id
                  ? 'bg-white text-gray-900 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {!filtered ? (
        // TODO: Add a loading spinner
        <div />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium mr-2 self-center">Legend:</p>
        {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[string]][]).map(
          ([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.bg}`} />
              <span className="text-xs text-gray-500">{cfg.label}</span>
            </span>
          )
        )}
      </div>
    </div>
  )
}
