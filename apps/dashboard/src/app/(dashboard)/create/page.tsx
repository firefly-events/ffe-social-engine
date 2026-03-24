'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { generateContent, getMockContent, type Platform, type Tone, type PlatformContent } from '@/app/actions/generate'
import type { ContentExport } from '@/types/export'

type TabId = 'chat' | 'wizard' | 'pipeline'

const TABS: { id: TabId; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'chat',
    label: 'Chat Mode',
    description: 'Describe what you want in plain language',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'wizard',
    label: 'Wizard Mode',
    description: 'Step-by-step guided content creation',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'pipeline',
    label: 'Pipeline Mode',
    description: 'Automate a full content campaign',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
]

const WIZARD_TEMPLATES = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Announce a new feature or product with high-impact copy',
    platforms: ['Instagram', 'LinkedIn', 'Twitter/X'],
    estimatedTime: '5 min',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    description: 'Show your team, process, and culture authentically',
    platforms: ['Instagram', 'TikTok'],
    estimatedTime: '3 min',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'tutorial',
    name: 'Tutorial / How-To',
    description: 'Teach your audience a skill or concept',
    platforms: ['YouTube', 'TikTok', 'LinkedIn'],
    estimatedTime: '8 min',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'event-promo',
    name: 'Event Promotion',
    description: 'Drive ticket sales and event awareness',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    estimatedTime: '4 min',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'testimonial',
    name: 'Customer Story',
    description: 'Share a success story or testimonial',
    platforms: ['LinkedIn', 'Instagram', 'Twitter/X'],
    estimatedTime: '4 min',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'trending',
    name: 'Trending Topic',
    description: 'Join a viral conversation in your niche',
    platforms: ['Twitter/X', 'TikTok', 'Instagram'],
    estimatedTime: '2 min',
    gradient: 'from-violet-500 to-purple-700',
  },
]

const PIPELINE_TEMPLATES = [
  {
    id: 'event-launch',
    name: 'Event Launch Campaign',
    steps: ['Announcement post', 'Countdown series (7 days)', 'Day-of content', 'Post-event recap'],
    posts: 12,
    duration: '2 weeks',
    badge: 'Most used',
  },
  {
    id: 'product-series',
    name: 'Product Feature Series',
    steps: ['Teaser', '3x feature spotlights', 'Social proof', 'CTA post'],
    posts: 6,
    duration: '1 week',
    badge: null,
  },
  {
    id: 'weekly-brand',
    name: 'Weekly Brand Presence',
    steps: ['Monday motivation', 'Mid-week value post', 'Friday engagement'],
    posts: 3,
    duration: '1 week',
    badge: 'Recurring',
  },
]

// ─────────────────────────────────────────────
// Platform icons (inline SVG to avoid extra deps)
// ─────────────────────────────────────────────
const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  Instagram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  TikTok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
    </svg>
  ),
  YouTube: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  ),
  X: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  LinkedIn: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Facebook: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
}

const PLATFORM_COLORS: Record<Platform, string> = {
  Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  TikTok: 'bg-gray-900',
  YouTube: 'bg-red-500',
  X: 'bg-gray-900',
  LinkedIn: 'bg-blue-600',
  Facebook: 'bg-blue-700',
}

const ALL_PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'YouTube', 'X', 'LinkedIn', 'Facebook']
const TONES: Tone[] = ['Professional', 'Casual', 'Humorous', 'Inspirational']

// ─────────────────────────────────────────────
// Types for chat history
// ─────────────────────────────────────────────
interface UserMessage {
  id: string
  role: 'user'
  content: string
  platforms: Platform[]
  tone: Tone
  timestamp: number
}

interface AiMessage {
  id: string
  role: 'ai'
  content: Partial<Record<Platform, PlatformContent>>
  timestamp: number
  isMock?: boolean
}

interface ErrorMessage {
  id: string
  role: 'error'
  content: string
  missingApiKey?: boolean
  retryData?: { message: string; platforms: Platform[]; tone: Tone }
  timestamp: number
}

type ChatMessage = UserMessage | AiMessage | ErrorMessage

const STORAGE_KEY = 'ffe-social-chat-history'

function loadHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return []
  }
}

function saveHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    // Keep last 50 messages to avoid localStorage bloat
    const trimmed = messages.slice(-50)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // Storage full — silently ignore
  }
}

// ─────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full inline-block animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Content card for a single platform
// ─────────────────────────────────────────────
function PlatformContentCard({
  platform,
  content,
  isMock,
}: {
  platform: Platform
  content: PlatformContent
  isMock?: boolean
}) {
  const [copied, setCopied] = useState<'caption' | 'all' | null>(null)

  const copyCaption = async () => {
    const text = [content.caption, '', content.hashtags.join(' '), '', content.callToAction]
      .filter(Boolean)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied('caption')
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = async () => {
    const text = [content.caption, '', content.hashtags.join(' '), '', content.callToAction]
      .filter(Boolean)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Platform header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md ${PLATFORM_COLORS[platform]} flex items-center justify-center text-white shadow-sm`}>
            {PLATFORM_ICONS[platform]}
          </div>
          <span className="text-sm font-semibold text-gray-800">{platform}</span>
          {isMock && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Demo</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyCaption}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied === 'caption' || copied === 'all' ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600">Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="p-4">
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {content.caption}
        </p>

        {/* Hashtags */}
        {content.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {content.hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200 transition-colors"
                onClick={() => navigator.clipboard.writeText(tag)}
                title="Click to copy"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {content.callToAction && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-purple-700 font-medium">{content.callToAction}</span>
            <button
              onClick={copyAll}
              className="ml-auto text-xs text-gray-400 hover:text-purple-600 transition-colors"
              title="Copy full post including CTA"
            >
              Copy full post
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI response message with platform tabs
// ─────────────────────────────────────────────
function AiResponseCard({
  msg,
  onExportJson,
  onExportText,
  onExportModal,
}: {
  msg: AiMessage
  onExportJson: (content: Partial<Record<Platform, PlatformContent>>) => void
  onExportText: (content: Partial<Record<Platform, PlatformContent>>) => void
  onExportModal: (content: Partial<Record<Platform, PlatformContent>>) => void
}) {
  const platforms = Object.keys(msg.content) as Platform[]
  const [activeTab, setActiveTab] = useState<Platform>(platforms[0])

  if (!platforms.length) return null

  const currentContent = msg.content[activeTab]

  return (
    <div className="flex items-start gap-3 mb-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        {/* Header with export actions */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">
            SocialEngine AI
            {msg.isMock && (
              <span className="ml-2 text-amber-600 font-medium">(demo mode — no API key)</span>
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onExportText(msg.content)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Download as text file"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              TXT
            </button>
            <button
              onClick={() => onExportJson(msg.content)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Download as JSON"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              JSON
            </button>
            <button
              onClick={() => onExportModal(msg.content)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
              title="Open export options"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Platform tabs */}
        {platforms.length > 1 && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setActiveTab(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === p
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className={activeTab === p ? 'text-white' : 'text-gray-500'}>
                  {PLATFORM_ICONS[p]}
                </span>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Content card */}
        {currentContent && (
          <PlatformContentCard
            platform={activeTab}
            content={currentContent}
            isMock={msg.isMock}
          />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main ChatModePanel component
// ─────────────────────────────────────────────
function ChatModePanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory())
  const [input, setInput] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['Instagram', 'LinkedIn'])
  const [tone, setTone] = useState<Tone>('Professional')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  useEffect(() => {
    saveHistory(messages)
  }, [messages])

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleExportJson = (content: Partial<Record<Platform, PlatformContent>>) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `social-content-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportText = (content: Partial<Record<Platform, PlatformContent>>) => {
    const lines: string[] = []
    for (const [platform, data] of Object.entries(content)) {
      lines.push(`=== ${platform} ===`)
      lines.push(data.caption)
      if (data.hashtags.length) lines.push('\n' + data.hashtags.join(' '))
      if (data.callToAction) lines.push('\nCTA: ' + data.callToAction)
      lines.push('\n')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `social-content-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [exportModalData, setExportModalData] = useState<ContentExport | null>(null)

  const handleExportModal = (content: Partial<Record<Platform, PlatformContent>>) => {
    const variants = Object.entries(content).map(([platform, data]) => ({
      platform:    platform.toLowerCase() as ContentExport['variants'][number]['platform'],
      text:        data.caption,
      hashtags:    data.hashtags,
      callToAction: data.callToAction,
    }))
    const exportData: ContentExport = {
      id:          crypto.randomUUID(),
      title:       variants[0]?.text.slice(0, 60) ?? 'Untitled',
      variants,
      generatedAt: new Date().toISOString(),
    }
    setExportModalData(exportData)
  }

  const send = useCallback(
    async (messageText: string, overridePlatforms?: Platform[], overrideTone?: Tone) => {
      const text = messageText.trim()
      if (!text || isLoading) return

      const platforms = overridePlatforms ?? selectedPlatforms
      const currentTone = overrideTone ?? tone

      if (!platforms.length) return

      const userMsg: UserMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        platforms,
        tone: currentTone,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsLoading(true)

      try {
        const result = await generateContent({
          message: text,
          platforms,
          tone: currentTone,
        })

        if (result.success) {
          const aiMsg: AiMessage = {
            id: crypto.randomUUID(),
            role: 'ai',
            content: result.data.platforms,
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, aiMsg])
        } else if (result.missingApiKey) {
          // Show mock content alongside the API key error
          const mockData = await getMockContent(platforms)
          const mockMsg: AiMessage = {
            id: crypto.randomUUID(),
            role: 'ai',
            content: mockData.platforms,
            timestamp: Date.now(),
            isMock: true,
          }
          const errMsg: ErrorMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: result.error,
            missingApiKey: true,
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, mockMsg, errMsg])
        } else {
          const errMsg: ErrorMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: result.error,
            retryData: { message: text, platforms, tone: currentTone },
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, errMsg])
        }
      } catch (err) {
        const errMsg: ErrorMessage = {
          id: crypto.randomUUID(),
          role: 'error',
          content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          retryData: { message: text, platforms, tone: currentTone },
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, selectedPlatforms, tone]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const isEmpty = messages.length === 0

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0 card overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">SocialEngine AI</p>
              <p className="text-xs text-gray-400 mt-0.5">Content generation</p>
            </div>
          </div>
          {!isEmpty && (
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Start a conversation</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Describe what you want to create. Select your platforms and tone, then press Send.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {[
                  'Write a product launch post for our new event app',
                  'Behind-the-scenes content for our team at SXSW',
                  'Announce our partnership with a major venue chain',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setInput(example)
                      textareaRef.current?.focus()
                    }}
                    className="px-3 py-1.5 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end mb-4">
                      <div className="max-w-[80%]">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <div className="flex gap-1">
                            {msg.platforms.slice(0, 3).map((p) => (
                              <span key={p} className={`w-5 h-5 rounded ${PLATFORM_COLORS[p]} flex items-center justify-center text-white`}>
                                {PLATFORM_ICONS[p]}
                              </span>
                            ))}
                            {msg.platforms.length > 3 && (
                              <span className="text-xs text-gray-400">+{msg.platforms.length - 3}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 capitalize">{msg.tone}</span>
                        </div>
                        <div className="bg-purple-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                }

                if (msg.role === 'ai') {
                  return (
                    <AiResponseCard
                      key={msg.id}
                      msg={msg}
                      onExportJson={handleExportJson}
                      onExportText={handleExportText}
                      onExportModal={handleExportModal}
                    />
                  )
                }

                if (msg.role === 'error') {
                  return (
                    <div key={msg.id} className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        {msg.missingApiKey ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-bl-sm px-4 py-3">
                            <p className="text-sm font-semibold text-amber-800 mb-1">API key not configured</p>
                            <p className="text-xs text-amber-700 mb-3">{msg.content}</p>
                            <div className="bg-amber-100 rounded-lg px-3 py-2 font-mono text-xs text-amber-900">
                              {'# apps/dashboard/.env.local'}<br />
                              {'GOOGLE_API_KEY=your_key_here'}
                            </div>
                            <p className="text-xs text-amber-600 mt-2">
                              Get a free key at{' '}
                              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline font-medium">
                                aistudio.google.com
                              </a>
                            </p>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-sm px-4 py-3">
                            <p className="text-sm text-red-800 mb-2">{msg.content}</p>
                            {msg.retryData && (
                              <button
                                onClick={() => send(msg.retryData!.message, msg.retryData!.platforms, msg.retryData!.tone)}
                                className="flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-900 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                return null
              })}

              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 bg-gray-50/50">
          {/* Platform chips above input */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Platforms:</span>
            {ALL_PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedPlatforms.includes(p)
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                <span className={selectedPlatforms.includes(p) ? 'text-white' : 'text-gray-400'}>
                  {PLATFORM_ICONS[p]}
                </span>
                {p}
              </button>
            ))}
          </div>

          {/* Tone row */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 font-medium">Tone:</span>
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  tone === t
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Text input + send */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the content you want to create... (Shift+Enter for new line)"
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors leading-relaxed min-h-[52px] max-h-[160px]"
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 160) + 'px'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !selectedPlatforms.length}
              className="flex-shrink-0 w-11 h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
              title="Send (Enter)"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">
            Enter to send · Shift+Enter for new line · {selectedPlatforms.length === 0 ? <span className="text-red-400 font-medium">Select at least one platform</span> : `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''} selected`}
          </p>
        </div>
      </div>

      {/* Right sidebar — tips */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
        <div className="card p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tips</h4>
          <ul className="space-y-2.5">
            {[
              { icon: '🎯', text: 'Be specific about your topic, audience, and goal' },
              { icon: '📏', text: 'Mention word count or length if you have a preference' },
              { icon: '🔁', text: 'Ask for variations by sending follow-up messages' },
              { icon: '🏷️', text: 'Include brand keywords to get more on-brand output' },
            ].map((tip) => (
              <li key={tip.text} className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5 flex-shrink-0">{tip.icon}</span>
                <span className="text-xs text-gray-600 leading-relaxed">{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform limits</h4>
          <div className="space-y-2">
            {[
              { p: 'X', limit: '280 chars' },
              { p: 'Instagram', limit: '2,200 chars' },
              { p: 'TikTok', limit: '2,200 chars' },
              { p: 'LinkedIn', limit: '3,000 chars' },
              { p: 'Facebook', limit: '63k chars' },
              { p: 'YouTube', limit: '5,000 chars' },
            ].map(({ p, limit }) => (
              <div key={p} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded ${PLATFORM_COLORS[p as Platform]} flex items-center justify-center text-white flex-shrink-0`}>
                    {PLATFORM_ICONS[p as Platform]}
                  </span>
                  <span className="text-xs text-gray-700">{p}</span>
                </div>
                <span className="text-xs text-gray-400">{limit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {exportModalData && (
      <ExportModalLazy
        content={exportModalData}
        onClose={() => setExportModalData(null)}
      />
    )}
    </>
  )
}

// ── Lazy ExportModal wrapper for ChatModePanel ──────────────────────────────

function ExportModalLazy({
  content,
  onClose,
}: {
  content: ContentExport
  onClose: () => void
}) {
  const [Modal, setModal] = useState<React.ComponentType<{
    content: ContentExport
    onClose: () => void
  }> | null>(null)

  useState(() => {
    import('@/components/ExportModal').then((m) => {
      setModal(() => m.default)
    })
  })

  if (!Modal) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <svg className="w-6 h-6 animate-spin text-purple-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  return <Modal content={content} onClose={onClose} />
}

function WizardModePanel() {
  const [selected, setSelected] = useState<string | null>(null)

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="btn-secondary text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h3 className="font-semibold text-gray-900">
            {WIZARD_TEMPLATES.find((t) => t.id === selected)?.name}
          </h3>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {['Topic', 'Audience', 'Key Points', 'Tone', 'Generate'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-xs ${i === 0 ? 'text-purple-700 font-medium' : 'text-gray-400'} hidden sm:block`}>{step}</span>
              {i < 4 && <div className="w-6 h-px bg-gray-200 hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is the main topic?
            </label>
            <input className="input" placeholder="e.g. The future of event ticketing in 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who is your target audience?
            </label>
            <input className="input" placeholder="e.g. Event organizers and venue managers" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any specific points to include? (optional)
            </label>
            <textarea className="textarea h-24" placeholder="e.g. AI-driven personalization, mobile-first purchasing, real-time inventory..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1">Save Draft</button>
            <button className="btn-primary flex-1">
              Next Step
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-gray-900">Choose a Template</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Templates provide a proven structure — AI fills in the details.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WIZARD_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelected(template.id)}
            className="card p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.gradient} mb-4 flex items-center justify-center shadow-sm`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
              {template.name}
            </h4>
            <p className="text-xs text-gray-500 mb-3">{template.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {template.platforms.slice(0, 2).map((p) => (
                  <span key={p} className="badge-gray text-xs">{p}</span>
                ))}
                {template.platforms.length > 2 && (
                  <span className="badge-gray text-xs">+{template.platforms.length - 2}</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{template.estimatedTime}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PipelineModePanel() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="card p-5 border-amber-200 bg-amber-50/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">Pro Feature</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Pipelines automate entire content campaigns. You&apos;re on the Free plan — upgrade to unlock full pipeline execution.{' '}
              <a href="/settings#billing" className="underline font-medium">Upgrade now</a>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Content Pipelines</h3>
        <p className="text-sm text-gray-500">
          Select a pipeline template to auto-generate a full content campaign.
        </p>
      </div>

      <div className="space-y-4">
        {PIPELINE_TEMPLATES.map((pipeline) => (
          <div
            key={pipeline.id}
            className={`card p-5 cursor-pointer transition-all duration-150 hover:shadow-md ${
              selected === pipeline.id ? 'ring-2 ring-purple-500 border-transparent' : ''
            }`}
            onClick={() => setSelected(selected === pipeline.id ? null : pipeline.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{pipeline.name}</h4>
                  {pipeline.badge && (
                    <span className="badge-purple text-xs">{pipeline.badge}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span>{pipeline.posts} posts</span>
                  <span>{pipeline.duration}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pipeline.steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-xs text-gray-600">{step}</span>
                      {i < pipeline.steps.length - 1 && (
                        <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-colors ${
                  selected === pipeline.id
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300'
                }`}
              >
                {selected === pipeline.id && (
                  <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">Configure Pipeline</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Campaign topic / product
            </label>
            <input className="input" placeholder="e.g. SxSW 2026 ticket launch" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {['Instagram', 'TikTok', 'LinkedIn', 'Twitter/X'].map((p) => (
                <button key={p} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full justify-center opacity-60 cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Run Pipeline (Pro only)
          </button>
        </div>
      )}
    </div>
  )
}

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<TabId>('chat')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Content</h2>
        <p className="text-gray-500 mt-0.5 text-sm">
          Choose your creation mode and let AI do the heavy lifting.
        </p>
      </div>

      {/* Tab bar */}
      <div className="card p-1.5 inline-flex gap-1 bg-gray-100 border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-purple-600' : ''}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-sm text-gray-500 -mt-3">
        {TABS.find((t) => t.id === activeTab)?.description}
      </p>

      {/* Panel */}
      <div>
        {activeTab === 'chat' && <ChatModePanel />}
        {activeTab === 'wizard' && <WizardModePanel />}
        {activeTab === 'pipeline' && <PipelineModePanel />}
      </div>
    </div>
  )
}
