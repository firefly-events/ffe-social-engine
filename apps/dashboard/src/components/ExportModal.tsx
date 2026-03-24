'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ContentExport, ExportOptions, Platform } from '@/types/export'
import { ExportFormat } from '@/types/export'
import {
  copyToClipboard,
  downloadAsText,
  downloadAsJSON,
  downloadAsCSV,
  buildTextOutput,
  formatForPlatform,
} from '@/lib/export'
import { Toast, useToast } from '@/components/Toast'

// ── PLATFORM META ──────────────────────────────────────────────────────────

const PLATFORM_META: Record<
  Platform,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  instagram: {
    label: 'Instagram',
    color: 'text-pink-600',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  tiktok: {
    label: 'TikTok',
    color: 'text-gray-900',
    bgColor: 'bg-black',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
      </svg>
    ),
  },
  twitter: {
    label: 'Twitter / X',
    color: 'text-gray-900',
    bgColor: 'bg-gray-900',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.735-8.843L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
      </svg>
    ),
  },
  linkedin: {
    label: 'LinkedIn',
    color: 'text-blue-700',
    bgColor: 'bg-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  facebook: {
    label: 'Facebook',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  youtube: {
    label: 'YouTube',
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  threads: {
    label: 'Threads',
    color: 'text-gray-900',
    bgColor: 'bg-gray-900',
    icon: (
      <svg viewBox="0 0 192 192" className="w-4 h-4" fill="currentColor">
        <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.861 14.05-7.346-1.247-15.278-1.631-23.745-1.14-23.893 1.374-39.249 15.391-38.271 34.597.495 9.726 5.353 18.124 13.679 23.673 6.988 4.757 15.98 7.071 25.313 6.531 12.32-.709 21.986-5.327 28.729-13.728 5.176-6.484 8.452-14.895 9.907-25.542 5.938 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.206 17.11 97.015 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.28 0h-.36C69.073.195 47.473 9.64 32.157 28.085 18.628 44.482 11.525 67.3 11.304 96c.221 28.7 7.324 51.518 20.853 67.915 15.316 18.445 36.916 27.89 64.243 28.085h.36c24.101-.17 40.498-6.478 54.3-20.558 18.74-18.963 18.047-42.71 11.948-57.23-4.286-10.006-12.483-18.165-22.471-23.224zM96.145 135.21c-10.47.594-21.371-4.104-21.939-14.225-.439-7.893 5.654-16.695 24.09-17.733 2.109-.12 4.17-.176 6.18-.176 6.088 0 11.784.586 16.99 1.693-1.928 24.077-14.481 29.81-25.321 30.44z"/>
      </svg>
    ),
  },
  bluesky: {
    label: 'Bluesky',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500',
    icon: (
      <svg viewBox="0 0 360 320" className="w-4 h-4" fill="currentColor">
        <path d="M180 142c-16.3-31.7-60.7-90.8-102-120C38.5-8 0 6 0 60c0 13 2.5 25.6 9.5 34 15 18.3 31.4 29.6 48.4 33.5C26.6 124.5 12.5 131.6 12.5 152c0 20.4 19.2 31.1 36 42.5 11.5 7.8 29.7 20.4 51 30.9 35.8 17.3 75.5 32 80 32s44.2-14.7 80-32c21.3-10.5 39.5-23.1 51-30.9 16.8-11.4 36-22.1 36-42.5 0-20.4-14.1-27.5-45.4-24.5 17-3.9 33.4-15.2 48.4-33.5 7-8.4 9.5-21 9.5-34C360 6 321.5-8 282 22c-41.3 29.2-85.7 88.3-102 120z"/>
      </svg>
    ),
  },
  pinterest: {
    label: 'Pinterest',
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
      </svg>
    ),
  },
}

const ALL_PLATFORMS = Object.keys(PLATFORM_META) as Platform[]

// ── DEFAULT OPTIONS ─────────────────────────────────────────────────────────

function defaultOptions(content: ContentExport): ExportOptions {
  return {
    includePlatforms: content.variants.map((v) => v.platform),
    includeHashtags:  true,
    includeCTA:       true,
    includeMetadata:  false,
    format:           ExportFormat.Clipboard,
  }
}

// ── FORMAT OPTIONS ──────────────────────────────────────────────────────────

interface FormatOption {
  format:      ExportFormat
  label:       string
  description: string
  icon:        React.ReactNode
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format:      ExportFormat.Clipboard,
    label:       'Copy to Clipboard',
    description: 'Copy all selected content as formatted text',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
    ),
  },
  {
    format:      ExportFormat.Text,
    label:       'Download as Text',
    description: 'Plain .txt file with platform headers',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    format:      ExportFormat.JSON,
    label:       'Download as JSON',
    description: 'Structured JSON for developer integrations',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    format:      ExportFormat.CSV,
    label:       'Download as CSV',
    description: 'Spreadsheet for Buffer, Hootsuite, Later',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
]

// ── TOGGLE HELPER ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked:     boolean
  onChange:    (v: boolean) => void
  label:       string
  description?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors ${
            checked ? 'bg-purple-600' : 'bg-gray-200'
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  )
}

// ── PREVIEW ────────────────────────────────────────────────────────────────

function PreviewPanel({
  content,
  options,
}: {
  content: ContentExport
  options: ExportOptions
}) {
  const text = buildTextOutput(content, options)

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Preview
        </span>
        <span className="text-xs text-gray-400">{text.length} chars</span>
      </div>
      <div className="p-4 max-h-48 overflow-y-auto">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
          {text}
        </pre>
      </div>
    </div>
  )
}

// ── PLATFORM SELECTOR ──────────────────────────────────────────────────────

function PlatformSelector({
  availablePlatforms,
  selected,
  onChange,
}: {
  availablePlatforms: Platform[]
  selected:           Platform[]
  onChange:           (platforms: Platform[]) => void
}) {
  const toggle = (p: Platform) => {
    onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p])
  }

  const selectAll  = () => onChange([...availablePlatforms])
  const clearAll   = () => onChange([])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">Platforms</p>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            All
          </button>
          <span className="text-gray-300">·</span>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            None
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {availablePlatforms.map((p) => {
          const meta    = PLATFORM_META[p]
          const checked = selected.includes(p)
          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                checked
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className={`flex-shrink-0 ${checked ? '' : 'opacity-50'}`}>
                <span className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${meta.bgColor}`}>
                  {meta.icon}
                </span>
              </span>
              {meta.label}
              {checked && (
                <svg className="w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-amber-600">Select at least one platform to export.</p>
      )}
    </div>
  )
}

// ── MAIN MODAL ─────────────────────────────────────────────────────────────

interface ExportModalProps {
  content:  ContentExport
  onClose:  () => void
}

export default function ExportModal({ content, onClose }: ExportModalProps) {
  const [options, setOptions]       = useState<ExportOptions>(() => defaultOptions(content))
  const [isExporting, setIsExporting] = useState(false)
  const { toast, showToast }        = useToast()

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Ctrl/Cmd + C → copy to clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (options.includePlatforms.length > 0) {
          handleExport(ExportFormat.Clipboard)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────

  const setOpt = <K extends keyof ExportOptions>(key: K, val: ExportOptions[K]) =>
    setOptions((prev) => ({ ...prev, [key]: val }))

  // ── Export action ────────────────────────────────────────────────────────

  const handleExport = async (overrideFormat?: ExportFormat) => {
    const fmt = overrideFormat ?? options.format

    if (options.includePlatforms.length === 0) {
      showToast('Select at least one platform first.', 'error')
      return
    }

    setIsExporting(true)

    try {
      switch (fmt) {
        case ExportFormat.Clipboard: {
          const { buildTextOutput: build } = await import('@/lib/export')
          const text = build(content, options)
          const ok   = await copyToClipboard(text)
          showToast(ok ? 'Copied to clipboard!' : 'Copy failed — please try again.', ok ? 'success' : 'error')
          break
        }
        case ExportFormat.Text:
          downloadAsText(content, options)
          showToast('Text file downloaded.', 'success')
          break
        case ExportFormat.JSON:
          downloadAsJSON(content, options)
          showToast('JSON file downloaded.', 'success')
          break
        case ExportFormat.CSV:
          downloadAsCSV(content, options)
          showToast('CSV file downloaded.', 'success')
          break
      }
    } catch (err) {
      console.error('[ExportModal] export error', err)
      showToast('Export failed. Please try again.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // ── Individual-platform copy ─────────────────────────────────────────────

  const copyPlatform = async (platform: Platform) => {
    const variant = content.variants.find((v) => v.platform === platform)
    if (!variant) return

    const text = formatForPlatform(
      variant.text,
      options.includeHashtags ? variant.hashtags : [],
      platform,
    )
    const ok = await copyToClipboard(text)
    showToast(
      ok
        ? `${PLATFORM_META[platform].label} caption copied!`
        : 'Copy failed — please try again.',
      ok ? 'success' : 'error',
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const availablePlatforms = content.variants.map((v) => v.platform)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        aria-modal="true"
        role="dialog"
        aria-label="Export content"
      >
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Export Content</h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm">{content.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Format selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Export Format</p>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.format}
                    onClick={() => {
                      setOpt('format', opt.format)
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      options.format === opt.format
                        ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-400'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex-shrink-0 mt-0.5 ${options.format === opt.format ? 'text-purple-600' : 'text-gray-400'}`}>
                      {opt.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${options.format === opt.format ? 'text-purple-900' : 'text-gray-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform selector */}
            <div className="card p-4">
              <PlatformSelector
                availablePlatforms={availablePlatforms}
                selected={options.includePlatforms}
                onChange={(platforms) => setOpt('includePlatforms', platforms)}
              />
            </div>

            {/* Content options */}
            <div className="card p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-900">Content Options</p>
              <Toggle
                checked={options.includeHashtags}
                onChange={(v) => setOpt('includeHashtags', v)}
                label="Include Hashtags"
                description="Append relevant hashtags to each platform's content"
              />
              <Toggle
                checked={options.includeCTA}
                onChange={(v) => setOpt('includeCTA', v)}
                label="Include Call-to-Action"
                description="Append the CTA at the end of each post"
              />
              <Toggle
                checked={options.includeMetadata}
                onChange={(v) => setOpt('includeMetadata', v)}
                label="Include Metadata"
                description="Add prompt, tone, and model info (useful for JSON/text exports)"
              />
            </div>

            {/* Per-platform quick copy */}
            {availablePlatforms.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Quick Copy per Platform</p>
                <div className="grid grid-cols-2 gap-2">
                  {availablePlatforms.map((p) => {
                    const meta = PLATFORM_META[p]
                    return (
                      <button
                        key={p}
                        onClick={() => copyPlatform(p)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors text-left group"
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs ${meta.bgColor} flex-shrink-0`}>
                          {meta.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700">{meta.label}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {content.variants.find((v) => v.platform === p)?.text.slice(0, 35)}…
                          </p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Preview */}
            <PreviewPanel content={content} options={options} />

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              {options.format === ExportFormat.Clipboard
                ? 'Tip: Ctrl+C copies selected content'
                : 'File will download automatically'}
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleExport()}
                disabled={isExporting || options.includePlatforms.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : options.format === ExportFormat.Clipboard ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                {isExporting
                  ? 'Exporting…'
                  : options.format === ExportFormat.Clipboard
                  ? 'Copy'
                  : 'Download'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Toast — rendered outside modal so it overlays everything */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  )
}
