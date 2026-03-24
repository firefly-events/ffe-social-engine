'use client'

import { useState } from 'react'

type TabId = 'cards' | 'week' | 'month'

const TABS: { id: TabId; label: string }[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
]

const SCHEDULED_POSTS = [
  {
    id: 1,
    title: 'Behind the scenes at our SXSW setup — 48 hours to go!',
    platform: 'Instagram',
    date: 'Today',
    time: '9:00 AM',
    status: 'Scheduled',
    type: 'Image',
    platformColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  {
    id: 2,
    title: '3 things we learned from 10,000 event attendees this year',
    platform: 'LinkedIn',
    date: 'Today',
    time: '12:00 PM',
    status: 'Scheduled',
    type: 'Article',
    platformColor: 'bg-blue-600',
  },
  {
    id: 3,
    title: 'POV: You just found out your favorite artist is playing 5 miles away',
    platform: 'TikTok',
    date: 'Tomorrow',
    time: '6:00 PM',
    status: 'Scheduled',
    type: 'Video',
    platformColor: 'bg-black',
  },
  {
    id: 4,
    title: 'Tickets on sale NOW — link in bio',
    platform: 'Instagram',
    date: 'Mar 26',
    time: '10:00 AM',
    status: 'Draft',
    type: 'Image',
    platformColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  {
    id: 5,
    title: 'How we use AI to write better event descriptions in half the time',
    platform: 'LinkedIn',
    date: 'Mar 27',
    time: '9:00 AM',
    status: 'Scheduled',
    type: 'Post',
    platformColor: 'bg-blue-600',
  },
  {
    id: 6,
    title: 'Weekly tip: Use countdown timers to double your ticket conversions',
    platform: 'Twitter/X',
    date: 'Mar 28',
    time: '11:00 AM',
    status: 'Scheduled',
    type: 'Thread',
    platformColor: 'bg-gray-900',
  },
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEK_DATES = ['24', '25', '26', '27', '28', '29', '30']
const HOURS = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM']

const WEEK_EVENTS = [
  { day: 0, hour: 1, title: 'Behind the scenes...', platform: 'Instagram', color: 'bg-pink-500' },
  { day: 0, hour: 4, title: '3 things we learned...', platform: 'LinkedIn', color: 'bg-blue-500' },
  { day: 2, hour: 2, title: 'Tickets on sale NOW', platform: 'Instagram', color: 'bg-pink-500' },
  { day: 3, hour: 1, title: 'AI writing tips', platform: 'LinkedIn', color: 'bg-blue-500' },
  { day: 4, hour: 3, title: 'Weekly tip thread', platform: 'Twitter/X', color: 'bg-gray-700' },
]

const MONTH_DATA = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  posts: [3, 0, 1, 2, 0, 0, 1, 3, 0, 2, 1, 0, 1, 2, 0, 1, 0, 2, 1, 3, 0, 1, 2, 0, 1, 0, 2, 1, 0, 3, 0][i] ?? 0,
}))

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Scheduled: 'badge-blue',
    Draft: 'badge-gray',
    Posted: 'badge-green',
    Failed: 'bg-red-100 text-red-700 badge',
  }
  return <span className={map[status] ?? 'badge-gray'}>{status}</span>
}

function CardsView() {
  const grouped: Record<string, typeof SCHEDULED_POSTS> = {}
  SCHEDULED_POSTS.forEach((post) => {
    if (!grouped[post.date]) grouped[post.date] = []
    grouped[post.date].push(post)
  })

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, posts]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-700">{date}</span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{posts.length} posts</span>
          </div>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${post.platformColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {post.platform.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {post.platform} · {post.time} · {post.type}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={post.status} />
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function WeekView() {
  return (
    <div className="card overflow-hidden">
      {/* Header row */}
      <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
        <div className="h-12 border-r border-gray-200" />
        {WEEK_DAYS.map((day, i) => (
          <div
            key={day}
            className={`h-12 flex flex-col items-center justify-center border-r border-gray-200 last:border-r-0 ${
              i === 0 ? 'bg-purple-50' : ''
            }`}
          >
            <span className="text-xs text-gray-400">{day}</span>
            <span className={`text-sm font-bold ${i === 0 ? 'text-purple-700' : 'text-gray-900'}`}>
              {WEEK_DATES[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Time rows */}
      <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
        {HOURS.map((hour, hourIdx) => (
          <div
            key={hour}
            className="grid border-b border-gray-100 last:border-b-0"
            style={{ gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: '52px' }}
          >
            <div className="flex items-start justify-end pr-3 pt-1.5 border-r border-gray-200">
              <span className="text-xs text-gray-400">{hour}</span>
            </div>
            {WEEK_DAYS.map((_, dayIdx) => {
              const events = WEEK_EVENTS.filter((e) => e.day === dayIdx && e.hour === hourIdx)
              return (
                <div
                  key={dayIdx}
                  className={`p-1 border-r border-gray-100 last:border-r-0 relative ${
                    dayIdx === 0 ? 'bg-purple-50/40' : ''
                  }`}
                >
                  {events.map((event, ei) => (
                    <div
                      key={ei}
                      className={`${event.color} text-white rounded px-1.5 py-1 text-xs truncate cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthView() {
  const startOffset = 1 // March 2026 starts on Sunday → but let's say Monday for our grid
  const blanks = Array.from({ length: startOffset })

  return (
    <div className="card overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="h-10 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500">{d}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-24 border-b border-r border-gray-100 bg-gray-50/50" />
        ))}
        {MONTH_DATA.map(({ day, posts }) => (
          <div
            key={day}
            className={`h-24 border-b border-r border-gray-100 p-2 hover:bg-gray-50 transition-colors cursor-pointer ${
              day === 24 ? 'bg-purple-50/60 border-purple-200' : ''
            }`}
          >
            <div className={`text-sm font-semibold mb-1.5 ${day === 24 ? 'text-purple-700' : 'text-gray-700'}`}>
              {day}
              {day === 24 && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 inline-block align-middle" />
              )}
            </div>
            {posts > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(posts * 25, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{posts} post{posts !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<TabId>('cards')

  const totalScheduled = SCHEDULED_POSTS.filter((p) => p.status === 'Scheduled').length
  const totalDrafts = SCHEDULED_POSTS.filter((p) => p.status === 'Draft').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            {totalScheduled} posts scheduled · {totalDrafts} drafts pending
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <a href="/create" className="btn-primary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Scheduled', value: String(totalScheduled), color: 'text-blue-600' },
          { label: 'Drafts', value: String(totalDrafts), color: 'text-gray-500' },
          { label: 'This week', value: '5', color: 'text-purple-600' },
          { label: 'This month', value: '24', color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View */}
      {activeTab === 'cards' && <CardsView />}
      {activeTab === 'week' && <WeekView />}
      {activeTab === 'month' && <MonthView />}
    </div>
  )
}
