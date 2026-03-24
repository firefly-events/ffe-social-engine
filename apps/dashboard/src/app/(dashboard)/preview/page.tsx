'use client'

import { useState } from 'react'

type Platform = 'instagram-feed' | 'instagram-story' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook'

interface PlatformConfig {
  id: Platform
  label: string
  icon: React.ReactNode
  maxChars: number
  aspectRatio: string
  bgColor: string
  accentColor: string
  frameClass: string
  contentWidth: string
  contentHeight: string
  isStory?: boolean
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram-feed',
    label: 'Instagram Feed',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    maxChars: 2200,
    aspectRatio: '1/1',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    accentColor: 'text-purple-600',
    frameClass: 'w-64 rounded-3xl',
    contentWidth: 'w-64',
    contentHeight: 'h-64',
  },
  {
    id: 'instagram-story',
    label: 'Instagram Story',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    maxChars: 2200,
    aspectRatio: '9/16',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    accentColor: 'text-purple-600',
    frameClass: 'w-40 rounded-3xl',
    contentWidth: 'w-40',
    contentHeight: 'h-72',
    isStory: true,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z" />
      </svg>
    ),
    maxChars: 2200,
    aspectRatio: '9/16',
    bgColor: 'bg-black',
    accentColor: 'text-pink-500',
    frameClass: 'w-40 rounded-3xl',
    contentWidth: 'w-40',
    contentHeight: 'h-72',
    isStory: true,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.646-8.74L2.25 2.25h6.748l4.248 5.613 5-5.613zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
    maxChars: 280,
    aspectRatio: 'auto',
    bgColor: 'bg-black',
    accentColor: 'text-sky-500',
    frameClass: 'w-72 rounded-2xl',
    contentWidth: 'w-72',
    contentHeight: 'h-auto',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    maxChars: 3000,
    aspectRatio: 'auto',
    bgColor: 'bg-blue-600',
    accentColor: 'text-blue-600',
    frameClass: 'w-72 rounded-2xl',
    contentWidth: 'w-72',
    contentHeight: 'h-auto',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    maxChars: 63206,
    aspectRatio: 'auto',
    bgColor: 'bg-blue-700',
    accentColor: 'text-blue-700',
    frameClass: 'w-72 rounded-2xl',
    contentWidth: 'w-72',
    contentHeight: 'h-auto',
  },
]

const SAMPLE_CONTENT = {
  text: "We're thrilled to announce our biggest event of the year is coming this summer! Three stages, 40+ artists, and the best food trucks in the city. Early bird tickets are on sale NOW — don't miss out on this incredible experience. 🎵✨",
  hashtags: ['#FireflyEvents', '#SummerFest', '#LiveMusic', '#Events', '#Tickets'],
  imageAlt: 'Summer Festival 2025 announcement graphic',
}

function CharCounter({ current, max, accent }: { current: number; max: number; accent: string }) {
  const pct = (current / max) * 100
  const isWarning = pct > 80
  const isOver = current > max
  return (
    <div className={`text-xs font-medium ${isOver ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-400'}`}>
      {current.toLocaleString()} / {max.toLocaleString()} chars
      {isOver && <span className="ml-1 text-red-500">OVER LIMIT</span>}
    </div>
  )
}

function InstagramFeedMockup({ text, hashtags, scheduled }: { text: string; hashtags: string[]; scheduled: boolean }) {
  return (
    <div className="w-64 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Status bar */}
      <div className="bg-white px-4 pt-3 pb-1 flex justify-between items-center">
        <span className="text-xs font-semibold text-black">9:41</span>
        <div className="flex gap-1 items-center">
          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M1.5 8.5C5 5 9 3 12 3s7 2 10.5 5.5M5 12c1.9-1.9 4.3-3 7-3s5.1 1.1 7 3M8.5 15.5c.9-.9 2.2-1.5 3.5-1.5s2.6.6 3.5 1.5M12 19h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none"/></svg>
          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="11" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/><path d="M22 11h1v2h-1" fill="currentColor"/></svg>
        </div>
      </div>
      {/* Instagram top bar */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100">
        <span className="font-semibold text-sm tracking-tight text-black" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>instagram</span>
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
      </div>
      {/* Post header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">FF</div>
        <div>
          <div className="text-xs font-semibold text-black">fireflyevents</div>
          <div className="text-xs text-gray-400">Sponsored</div>
        </div>
        <div className="ml-auto">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
        </div>
      </div>
      {/* Image placeholder */}
      <div className="w-full h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 flex flex-col items-center justify-center gap-2">
        <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        <span className="text-white/60 text-xs">Image Preview</span>
      </div>
      {/* Actions */}
      <div className="px-3 py-2 flex gap-4">
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        <div className="ml-auto">
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        </div>
      </div>
      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-xs text-black leading-relaxed line-clamp-3">
          <span className="font-semibold">fireflyevents</span> {text}
        </p>
        <p className="text-xs text-blue-500 mt-1 line-clamp-2">{hashtags.join(' ')}</p>
        {scheduled && (
          <div className="mt-2 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Scheduled
          </div>
        )}
      </div>
    </div>
  )
}

function InstagramStoryMockup({ text, scheduled }: { text: string; scheduled: boolean }) {
  return (
    <div className="w-40 bg-black rounded-3xl shadow-2xl overflow-hidden border border-gray-800" style={{ height: '280px' }}>
      {/* Background gradient */}
      <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        {/* Story progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1">
          <div className="flex-1 h-0.5 bg-white/50 rounded-full" />
          <div className="flex-1 h-0.5 bg-white rounded-full" />
          <div className="flex-1 h-0.5 bg-white/50 rounded-full" />
        </div>
        {/* Avatar */}
        <div className="absolute top-5 left-3 flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full border border-white bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">FF</div>
          <span className="text-white text-xs font-semibold">fireflyevents</span>
        </div>
        {/* Image placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        </div>
        {/* Text overlay */}
        <div className="absolute bottom-12 left-3 right-3">
          <p className="text-white text-xs leading-tight line-clamp-4 font-medium drop-shadow">{text}</p>
        </div>
        {/* Reply bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <div className="flex-1 bg-white/20 border border-white/40 rounded-full h-7 px-3 flex items-center">
            <span className="text-white/60 text-xs">Reply...</span>
          </div>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </div>
        {scheduled && (
          <div className="absolute top-12 right-2 inline-flex items-center gap-1 bg-emerald-500/80 text-white text-xs px-1.5 py-0.5 rounded-full">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        )}
      </div>
    </div>
  )
}

function TikTokMockup({ text, hashtags, scheduled }: { text: string; hashtags: string[]; scheduled: boolean }) {
  return (
    <div className="w-40 bg-black rounded-3xl shadow-2xl overflow-hidden border border-gray-800" style={{ height: '280px' }}>
      <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black">
        {/* Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
        </div>
        {/* Right sidebar icons */}
        <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center">
          <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">FF</div>
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z" /></svg>
          </div>
        </div>
        {/* Bottom text */}
        <div className="absolute bottom-4 left-2 right-10">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-white text-xs font-semibold">@fireflyevents</span>
          </div>
          <p className="text-white text-xs leading-tight line-clamp-3">{text}</p>
          <p className="text-pink-400 text-xs mt-0.5 line-clamp-1">{hashtags.slice(0, 2).join(' ')}</p>
        </div>
        {/* TikTok navbar */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/60 flex items-center justify-around px-2">
          {['H', 'D', '+', 'I', 'P'].map((l) => (
            <span key={l} className="text-white/60 text-xs">{l}</span>
          ))}
        </div>
        {scheduled && (
          <div className="absolute top-3 right-2 inline-flex items-center gap-1 bg-emerald-500/80 text-white text-xs px-1.5 py-0.5 rounded-full">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        )}
      </div>
    </div>
  )
}

function TwitterMockup({ text, hashtags, scheduled }: { text: string; hashtags: string[]; scheduled: boolean }) {
  const fullText = text + ' ' + hashtags.slice(0, 2).join(' ')
  const overLimit = fullText.length > 280
  return (
    <div className="w-72 bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
      {/* X top bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.646-8.74L2.25 2.25h6.748l4.248 5.613 5-5.613zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </div>
      </div>
      {/* Tweet */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">FF</div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-white text-sm font-bold">Firefly Events</span>
              <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81-.67-1.31-1.91-2.19-3.34-2.19-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91 1.31-.67 2.19-1.91 2.19-3.34z"/><path fill="black" d="M10.54 12.26l-1.82-1.79-1.42 1.43 3.24 3.2 6.29-6.28-1.43-1.42z"/></svg>
              <span className="text-gray-500 text-sm">@fireflyevents · now</span>
            </div>
            <p className={`text-white text-sm leading-relaxed ${overLimit ? 'line-clamp-4' : ''}`}>{text}</p>
            <p className="text-sky-400 text-sm mt-0.5">{hashtags.slice(0, 2).join(' ')}</p>
            {overLimit && (
              <p className="text-red-400 text-xs mt-1">Content truncated — over 280 char limit</p>
            )}
            {/* Actions */}
            <div className="flex gap-6 mt-3 text-gray-500">
              {[
                <svg key="c" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
                <svg key="r" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
                <svg key="l" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
                <svg key="s" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
              ]}
            </div>
          </div>
        </div>
      </div>
      {scheduled && (
        <div className="px-4 pb-3">
          <div className="inline-flex items-center gap-1 bg-emerald-900/40 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-800/50">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Scheduled for posting
          </div>
        </div>
      )}
    </div>
  )
}

function LinkedInMockup({ text, hashtags, scheduled }: { text: string; hashtags: string[]; scheduled: boolean }) {
  return (
    <div className="w-72 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* LinkedIn top bar */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-100">
        <svg className="w-16 h-4" viewBox="0 0 72 18" fill="#0A66C2"><path d="M13.8 0C6.18 0 0 6.18 0 13.8s6.18 13.8 13.8 13.8 13.8-6.18 13.8-13.8S21.42 0 13.8 0zm-3.67 20.43H6.65V10.44h3.48v9.99zM8.39 9.13a2.02 2.02 0 110-4.04 2.02 2.02 0 010 4.04zm14.17 11.3h-3.47v-4.87c0-1.16-.02-2.65-1.62-2.65-1.62 0-1.87 1.27-1.87 2.57v4.95H12.1V10.44h3.34v1.36h.05c.47-.88 1.6-1.8 3.3-1.8 3.52 0 4.18 2.32 4.18 5.33v5.1z"/><path d="M32.6 5.93h2.36l5.47 8.56 5.47-8.56h2.36L41.43 15.5v6.13h-2V15.5L32.6 5.93zm15.3 0h7.5v1.8h-5.5v4.2h5.13v1.8H49.9v4.43h5.6v1.7H47.9V5.93zm9.64 0h2l3.83 5.87 3.84-5.87h2L64.87 13l5 8.63h-2L64 15.77l-3.87 5.86h-2l4.98-8.6L57.54 5.93z"/></svg>
      </div>
      {/* Post */}
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">FF</div>
          <div>
            <div className="font-semibold text-sm text-gray-900">Firefly Events</div>
            <div className="text-xs text-gray-500">Event Management Company · now</div>
            <div className="flex items-center gap-1 mt-0.5">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
              <span className="text-xs text-gray-400">Public</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed line-clamp-4">{text}</p>
        <p className="text-blue-600 text-sm mt-1">{hashtags.slice(0, 3).join(' ')}</p>
        {/* Engagement */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex gap-3">
            {['Like', 'Comment', 'Repost', 'Send'].map((a) => (
              <button key={a} className="flex items-center gap-1 hover:text-blue-600 transition-colors">{a}</button>
            ))}
          </div>
        </div>
      </div>
      {scheduled && (
        <div className="px-4 pb-3 -mt-1">
          <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Scheduled
          </div>
        </div>
      )}
    </div>
  )
}

function FacebookMockup({ text, hashtags, scheduled }: { text: string; hashtags: string[]; scheduled: boolean }) {
  return (
    <div className="w-72 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Facebook top bar */}
      <div className="px-4 py-3 bg-[#1877F2] flex items-center justify-between">
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
          <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </div>
      </div>
      {/* Post */}
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">FF</div>
          <div>
            <div className="font-semibold text-sm text-gray-900">Firefly Events</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>now</span>
              <span>·</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed line-clamp-4">{text}</p>
        <p className="text-[#1877F2] text-sm mt-1">{hashtags.slice(0, 3).join(' ')}</p>
        {/* Image placeholder */}
        <div className="mt-3 h-28 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        </div>
        {/* Reactions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          {['Like', 'Comment', 'Share'].map((a) => (
            <button key={a} className="flex items-center gap-1 flex-1 justify-center hover:text-[#1877F2] transition-colors">{a}</button>
          ))}
        </div>
      </div>
      {scheduled && (
        <div className="px-4 pb-3 -mt-1">
          <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Scheduled
          </div>
        </div>
      )}
    </div>
  )
}

export default function PreviewPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>('instagram-feed')
  const [text, setText] = useState(SAMPLE_CONTENT.text)
  const [hashtags, setHashtags] = useState(SAMPLE_CONTENT.hashtags)
  const [scheduled, setScheduled] = useState<Record<Platform, boolean>>({
    'instagram-feed': false,
    'instagram-story': false,
    tiktok: false,
    twitter: false,
    linkedin: false,
    facebook: false,
  })

  const platform = PLATFORMS.find((p) => p.id === activePlatform)!
  const fullText = text + ' ' + hashtags.join(' ')
  const charCount = fullText.length

  function scheduleForPlatform(id: Platform) {
    setScheduled((prev) => ({ ...prev, [id]: true }))
  }

  function renderMockup(id: Platform) {
    switch (id) {
      case 'instagram-feed':
        return <InstagramFeedMockup text={text} hashtags={hashtags} scheduled={scheduled['instagram-feed']} />
      case 'instagram-story':
        return <InstagramStoryMockup text={text} scheduled={scheduled['instagram-story']} />
      case 'tiktok':
        return <TikTokMockup text={text} hashtags={hashtags} scheduled={scheduled.tiktok} />
      case 'twitter':
        return <TwitterMockup text={text} hashtags={hashtags} scheduled={scheduled.twitter} />
      case 'linkedin':
        return <LinkedInMockup text={text} hashtags={hashtags} scheduled={scheduled.linkedin} />
      case 'facebook':
        return <FacebookMockup text={text} hashtags={hashtags} scheduled={scheduled.facebook} />
    }
  }

  const scheduledCount = Object.values(scheduled).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Preview</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            See exactly how your content will look before posting.
          </p>
        </div>
        {scheduledCount > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-medium text-emerald-700">{scheduledCount} platform{scheduledCount > 1 ? 's' : ''} scheduled</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: content editor */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Content</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Caption</label>
                <textarea
                  className="textarea min-h-[120px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Hashtags</label>
                <input
                  type="text"
                  className="input"
                  value={hashtags.join(' ')}
                  onChange={(e) => setHashtags(e.target.value.split(' ').filter(Boolean))}
                />
              </div>
            </div>
          </div>

          {/* Character limits per platform */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Character Limits</h3>
            <div className="space-y-2.5">
              {PLATFORMS.map((p) => {
                const count = charCount
                const pct = Math.min((count / p.maxChars) * 100, 100)
                const isOver = count > p.maxChars
                const isWarning = pct > 80
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`w-full text-left transition-colors rounded-lg p-2 ${activePlatform === p.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`${isOver ? 'text-red-500' : 'text-gray-600'}`}>{p.icon}</span>
                        <span className="text-xs font-medium text-gray-700">{p.label}</span>
                        {activePlatform === p.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <CharCounter current={count} max={p.maxChars} accent={p.accentColor} />
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-purple-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: mockup preview */}
        <div className="lg:col-span-2">
          {/* Platform tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  activePlatform === p.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : scheduled[p.id]
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {p.icon}
                <span className="hidden sm:inline">{p.label.split(' ')[0]}</span>
                {scheduled[p.id] && (
                  <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
              </button>
            ))}
          </div>

          {/* Preview area */}
          <div className="card p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Platform badge */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${platform.bgColor} flex items-center justify-center text-white`}>
                  {platform.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{platform.label}</div>
                  <div className="text-xs text-gray-400">
                    {charCount <= platform.maxChars
                      ? `${platform.maxChars - charCount} chars remaining`
                      : <span className="text-red-500">{charCount - platform.maxChars} over limit</span>}
                  </div>
                </div>
              </div>

              {/* Phone frame / mockup */}
              <div className="flex justify-center">
                {renderMockup(activePlatform)}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                {scheduled[activePlatform] ? (
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Scheduled for {platform.label}
                  </div>
                ) : (
                  <button
                    onClick={() => scheduleForPlatform(activePlatform)}
                    className="flex-1 btn-primary justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Looks good — schedule it
                  </button>
                )}
                <button className="btn-secondary justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* All platforms overview */}
          <div className="mt-4 card p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">All Platforms at a Glance</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PLATFORMS.map((p) => {
                const count = charCount
                const isOver = count > p.maxChars
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      activePlatform === p.id
                        ? 'border-purple-300 bg-purple-50'
                        : isOver
                        ? 'border-red-200 bg-red-50'
                        : scheduled[p.id]
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className={`${isOver ? 'text-red-500' : scheduled[p.id] ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {p.icon}
                    </div>
                    <span className="text-xs text-gray-500 text-center leading-tight">{p.label.split(' ')[0]}</span>
                    {isOver && <span className="w-2 h-2 rounded-full bg-red-400" title="Over limit" />}
                    {!isOver && scheduled[p.id] && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Scheduled" />}
                    {!isOver && !scheduled[p.id] && <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
