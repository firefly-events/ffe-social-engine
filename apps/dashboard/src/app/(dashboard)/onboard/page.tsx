'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook' | 'youtube'
type Tone = 'professional' | 'casual' | 'playful' | 'bold' | 'inspirational'
type ContentType = 'events' | 'behind-the-scenes' | 'educational' | 'promotional' | 'storytelling'
type FrequencyId = '1' | '3' | '5' | '7' | '14'
type ScheduleDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
type ScheduleTime = '8am' | '12pm' | '3pm' | '6pm' | '9pm'

interface Step {
  id: number
  label: string
  description: string
}

const STEPS: Step[] = [
  { id: 1, label: 'Connect Accounts', description: 'Link your social platforms' },
  { id: 2, label: 'Brand Voice', description: 'Set your tone and style' },
  { id: 3, label: 'First Content', description: 'Generate your first post' },
  { id: 4, label: 'Schedule', description: 'Plan your first post' },
]

// ─── Step 1 — Connect Accounts ───────────────────────────────────────────────

interface PlatformCardProps {
  id: Platform
  label: string
  icon: React.ReactNode
  color: string
  connected: boolean
  onToggle: (id: Platform) => void
}

const PLATFORM_CONFIGS: Omit<PlatformCardProps, 'connected' | 'onToggle'>[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z" />
      </svg>
    ),
    color: 'bg-black text-white',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.646-8.74L2.25 2.25h6.748l4.248 5.613 5-5.613zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
    color: 'bg-black text-white',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: 'bg-blue-600 text-white',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: 'bg-[#1877F2] text-white',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: 'bg-red-600 text-white',
  },
]

function Step1ConnectAccounts({
  connected,
  onToggle,
}: {
  connected: Set<Platform>
  onToggle: (id: Platform) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Connect your social accounts</h3>
        <p className="text-gray-500 text-sm">Select the platforms you want SocialEngine to post to. You can always add more later.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PLATFORM_CONFIGS.map((p) => {
          const isConnected = connected.has(p.id)
          return (
            <button
              key={p.id}
              onClick={() => onToggle(p.id)}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                isConnected
                  ? 'border-purple-400 bg-purple-50 shadow-md shadow-purple-100'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {isConnected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.color}`}>
                {p.icon}
              </div>
              <span className={`text-sm font-medium ${isConnected ? 'text-purple-700' : 'text-gray-700'}`}>
                {p.label}
              </span>
            </button>
          )
        })}
      </div>

      {connected.size > 0 && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-emerald-700">
            <span className="font-semibold">{connected.size} platform{connected.size > 1 ? 's' : ''} selected</span>
            {' '}— {[...connected].map((id) => PLATFORM_CONFIGS.find((p) => p.id === id)?.label).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Step 2 — Brand Voice ─────────────────────────────────────────────────────

const TONES: { id: Tone; label: string; example: string; emoji: string }[] = [
  { id: 'professional', label: 'Professional', example: 'Trusted by thousands of event professionals.', emoji: '👔' },
  { id: 'casual', label: 'Casual & Friendly', example: 'Hey! Big news — our summer lineup just dropped.', emoji: '😊' },
  { id: 'playful', label: 'Playful', example: 'Spoiler: this is the event you didn\'t know you needed.', emoji: '🎉' },
  { id: 'bold', label: 'Bold & Direct', example: 'Stop scrolling. This lineup is insane. Buy tickets.', emoji: '⚡' },
  { id: 'inspirational', label: 'Inspirational', example: 'Every great night starts with a single ticket.', emoji: '✨' },
]

const CONTENT_TYPES_CONFIG: { id: ContentType; label: string; description: string; icon: string }[] = [
  { id: 'events', label: 'Event Announcements', description: 'Lineups, dates, tickets', icon: '📅' },
  { id: 'behind-the-scenes', label: 'Behind the Scenes', description: 'Team, setup, process', icon: '🎬' },
  { id: 'educational', label: 'Educational', description: 'Tips, how-tos, insights', icon: '📚' },
  { id: 'promotional', label: 'Promotional', description: 'Offers, urgency, CTAs', icon: '🔥' },
  { id: 'storytelling', label: 'Storytelling', description: 'Narratives, case studies', icon: '💬' },
]

function Step2BrandVoice({
  tone,
  onTone,
  contentTypes,
  onContentType,
  brandName,
  onBrandName,
}: {
  tone: Tone | null
  onTone: (t: Tone) => void
  contentTypes: Set<ContentType>
  onContentType: (id: ContentType) => void
  brandName: string
  onBrandName: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Set your brand voice</h3>
        <p className="text-gray-500 text-sm">SocialEngine will match your tone across all AI-generated content.</p>
      </div>

      {/* Brand name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand / Organization name</label>
        <input
          type="text"
          className="input max-w-sm"
          placeholder="e.g. Firefly Events"
          value={brandName}
          onChange={(e) => onBrandName(e.target.value)}
        />
      </div>

      {/* Tone selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Tone of voice</label>
        <div className="space-y-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTone(t.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                tone === t.id
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-xl leading-none">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${tone === t.id ? 'text-purple-700' : 'text-gray-900'}`}>
                  {t.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 italic">"{t.example}"</div>
              </div>
              {tone === t.id && (
                <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content focus <span className="text-gray-400 font-normal">(pick all that apply)</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {CONTENT_TYPES_CONFIG.map((ct) => {
            const isSelected = contentTypes.has(ct.id)
            return (
              <button
                key={ct.id}
                onClick={() => onContentType(ct.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{ct.icon}</span>
                <div>
                  <div className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>{ct.label}</div>
                  <div className="text-xs text-gray-400">{ct.description}</div>
                </div>
                {isSelected && (
                  <svg className="w-4 h-4 text-purple-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Step 3 — Generate First Content ──────────────────────────────────────────

const GENERATED_POSTS = [
  {
    id: 'a',
    platform: 'Instagram',
    platformColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    text: "We're thrilled to announce our biggest event of the year is coming this summer! Three stages, 40+ artists, and the best food trucks in the city. Early bird tickets are on sale NOW — don't miss out. 🎵✨",
    hashtags: '#FireflyEvents #SummerFest #LiveMusic',
    type: 'Image post',
  },
  {
    id: 'b',
    platform: 'LinkedIn',
    platformColor: 'bg-blue-600',
    text: "3 things we've learned from producing 50+ events this year: (1) The line-up matters less than the experience. (2) The best marketing is a great crowd. (3) Timing is everything — and Thursday evenings win every time.\n\nWhat's your biggest event lesson?",
    hashtags: '#EventManagement #EventIndustry #FireflyEvents',
    type: 'Article',
  },
  {
    id: 'c',
    platform: 'Twitter/X',
    platformColor: 'bg-black',
    text: "Spoiler: the lineup we're dropping this Friday is going to break the internet. Set your alarm. 🔥",
    hashtags: '#FireflyEvents #SummerFest',
    type: 'Tweet',
  },
]

function Step3GenerateContent({
  selectedPost,
  onSelectPost,
  generating,
  onGenerate,
}: {
  selectedPost: string | null
  onSelectPost: (id: string) => void
  generating: boolean
  onGenerate: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Generate your first content</h3>
        <p className="text-gray-500 text-sm">AI-generated posts matched to your brand voice — pick one to schedule.</p>
      </div>

      {generating ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">Generating content...</p>
            <p className="text-sm text-gray-500 mt-1">Matching your brand voice and tone preferences</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {GENERATED_POSTS.map((post) => (
              <button
                key={post.id}
                onClick={() => onSelectPost(post.id)}
                className={`w-full text-left border-2 rounded-2xl p-5 transition-all ${
                  selectedPost === post.id
                    ? 'border-purple-400 bg-purple-50 shadow-md shadow-purple-100'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-md ${post.platformColor} flex items-center justify-center text-white text-xs font-bold`}>
                    {post.platform.slice(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{post.platform}</span>
                  <span className="badge-gray text-xs">{post.type}</span>
                  {selectedPost === post.id && (
                    <div className="ml-auto w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{post.text}</p>
                <p className="text-xs text-purple-600 mt-2">{post.hashtags}</p>
              </button>
            ))}
          </div>

          <button
            onClick={onGenerate}
            className="btn-secondary w-full justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate suggestions
          </button>
        </>
      )}
    </div>
  )
}

// ─── Step 4 — Schedule First Post ────────────────────────────────────────────

const FREQUENCIES: { id: FrequencyId; label: string; description: string }[] = [
  { id: '1', label: '1x / week', description: 'Light — great for starting out' },
  { id: '3', label: '3x / week', description: 'Recommended for most brands' },
  { id: '5', label: '5x / week', description: 'Active presence' },
  { id: '7', label: 'Daily', description: 'High volume — needs content pipeline' },
  { id: '14', label: '2x / day', description: 'Power user mode' },
]

const DAYS_LIST: ScheduleDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIMES_LIST: ScheduleTime[] = ['8am', '12pm', '3pm', '6pm', '9pm']

function Step4Schedule({
  frequency,
  onFrequency,
  days,
  onDay,
  time,
  onTime,
}: {
  frequency: FrequencyId | null
  onFrequency: (id: FrequencyId) => void
  days: Set<ScheduleDay>
  onDay: (d: ScheduleDay) => void
  time: ScheduleTime | null
  onTime: (t: ScheduleTime) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Schedule your first post</h3>
        <p className="text-gray-500 text-sm">Set your posting cadence and we'll build a content calendar automatically.</p>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">How often do you want to post?</label>
        <div className="space-y-2">
          {FREQUENCIES.map((f) => (
            <button
              key={f.id}
              onClick={() => onFrequency(f.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                frequency === f.id
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                frequency === f.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {f.id}
              </div>
              <div>
                <div className={`text-sm font-semibold ${frequency === f.id ? 'text-purple-700' : 'text-gray-900'}`}>{f.label}</div>
                <div className="text-xs text-gray-500">{f.description}</div>
              </div>
              {frequency === f.id && (
                <svg className="w-5 h-5 text-purple-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred days */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred posting days</label>
        <div className="flex flex-wrap gap-2">
          {DAYS_LIST.map((d) => (
            <button
              key={d}
              onClick={() => onDay(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                days.has(d)
                  ? 'border-purple-400 bg-purple-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred posting time</label>
        <div className="flex flex-wrap gap-2">
          {TIMES_LIST.map((t) => (
            <button
              key={t}
              onClick={() => onTime(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                time === t
                  ? 'border-purple-400 bg-purple-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {frequency && days.size > 0 && time && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Your content calendar is ready</p>
              <p className="text-xs text-gray-600 mt-1">
                Posting <span className="font-medium text-purple-700">{FREQUENCIES.find((f) => f.id === frequency)?.label}</span> on{' '}
                <span className="font-medium text-purple-700">{[...days].join(', ')}</span> at{' '}
                <span className="font-medium text-purple-700">{time}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Your first post is queued for next {[...days][0]} at {time}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const colors = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${(i * 1.7) % 100}%`,
    delay: `${(i * 0.05) % 1.5}s`,
    duration: `${1.2 + (i % 8) * 0.15}s`,
    size: 6 + (i % 5) * 2,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-bounce"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '2px' : '0',
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.id * 13}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Step 1 state
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<Platform>>(new Set())

  // Step 2 state
  const [tone, setTone] = useState<Tone | null>(null)
  const [contentTypes, setContentTypes] = useState<Set<ContentType>>(new Set())
  const [brandName, setBrandName] = useState('')

  // Step 3 state
  const [selectedPost, setSelectedPost] = useState<string | null>(null)

  // Step 4 state
  const [frequency, setFrequency] = useState<FrequencyId | null>(null)
  const [days, setDays] = useState<Set<ScheduleDay>>(new Set(['Tue', 'Thu']))
  const [time, setTime] = useState<ScheduleTime | null>('6pm')

  function togglePlatform(id: Platform) {
    setConnectedPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleContentType(id: ContentType) {
    setContentTypes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleDay(d: ScheduleDay) {
    setDays((prev) => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  function handleRegenerate() {
    setGenerating(true)
    setSelectedPost(null)
    setTimeout(() => setGenerating(false), 1600)
  }

  function canProceed() {
    if (step === 1) return connectedPlatforms.size > 0
    if (step === 2) return tone !== null && brandName.trim().length > 0
    if (step === 3) return selectedPost !== null
    if (step === 4) return frequency !== null && days.size > 0 && time !== null
    return false
  }

  function handleNext() {
    trackEvent(ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED, {
      step,
      label: STEPS.find(s => s.id === step)?.label,
      user_id: user?.id
    })

    if (step < 4) {
      setStep((s) => s + 1)
    } else {
      trackEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETE, {
        user_id: user?.id
      })
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 3500)
    }
  }

  function handleSkip() {
    if (step < 4) setStep((s) => s + 1)
  }

  const SKIPPABLE = [1, 3]

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  if (done) {
    return (
      <>
        <Confetti />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">You're all set!</h2>
            <p className="text-gray-500 mt-2 text-lg">Your first post is queued. Welcome to SocialEngine.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">Redirecting to your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Get started</h2>
        <p className="text-gray-500 mt-0.5 text-sm">Set up SocialEngine in under 3 minutes.</p>
      </div>

      {/* Progress bar + steps */}
      <div className="card p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Step {step} of {STEPS.length}</span>
            <span className="text-sm text-gray-400">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress + (100 / STEPS.length) * (step === STEPS.length ? 1 : 0)}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const isComplete = step > s.id
            const isActive = step === s.id
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isComplete
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-300'
                        : isActive
                        ? 'bg-white border-2 border-purple-600 text-purple-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-semibold leading-tight ${isActive ? 'text-purple-700' : isComplete ? 'text-gray-700' : 'text-gray-400'}`}>
                      {s.label}
                    </div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${step > s.id ? 'bg-purple-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="card p-6 min-h-[400px]">
        {step === 1 && (
          <Step1ConnectAccounts connected={connectedPlatforms} onToggle={togglePlatform} />
        )}
        {step === 2 && (
          <Step2BrandVoice
            tone={tone}
            onTone={setTone}
            contentTypes={contentTypes}
            onContentType={toggleContentType}
            brandName={brandName}
            onBrandName={setBrandName}
          />
        )}
        {step === 3 && (
          <Step3GenerateContent
            selectedPost={selectedPost}
            onSelectPost={setSelectedPost}
            generating={generating}
            onGenerate={handleRegenerate}
          />
        )}
        {step === 4 && (
          <Step4Schedule
            frequency={frequency}
            onFrequency={setFrequency}
            days={days}
            onDay={toggleDay}
            time={time}
            onTime={setTime}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          {SKIPPABLE.includes(step) && (
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === STEPS.length ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch my account
            </>
          ) : (
            <>
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
