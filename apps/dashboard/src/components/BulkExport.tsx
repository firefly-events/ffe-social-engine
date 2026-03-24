'use client'

import { useState, useCallback } from 'react'
import type { ContentExport, ExportOptions, Platform } from '@/types/export'
import { ExportFormat } from '@/types/export'
import {
  downloadBulkAsCSV,
  downloadBulkAsText,
} from '@/lib/export'
import { Toast, useToast } from '@/components/Toast'

// ── TYPES ──────────────────────────────────────────────────────────────────

interface BulkExportProps {
  /** All available content items */
  items:    ContentExport[]
  /** Called when the panel is dismissed */
  onClose?: () => void
}

// ── PLATFORM META (minimal — labels only) ──────────────────────────────────

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok:    'TikTok',
  twitter:   'Twitter / X',
  linkedin:  'LinkedIn',
  facebook:  'Facebook',
  youtube:   'YouTube',
  threads:   'Threads',
  bluesky:   'Bluesky',
  pinterest: 'Pinterest',
}

// ── BULK FORMAT OPTIONS ────────────────────────────────────────────────────

type BulkFormat = 'csv' | 'text' | 'json-zip'

interface BulkFormatOption {
  id:          BulkFormat
  label:       string
  description: string
  badge?:      string
  icon:        React.ReactNode
}

const BULK_FORMAT_OPTIONS: BulkFormatOption[] = [
  {
    id:          'csv',
    label:       'Content Calendar CSV',
    description: 'One row per platform variant — import into Buffer, Hootsuite, Later, or Notion',
    badge:       'Most popular',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    id:          'text',
    label:       'Combined Text Document',
    description: 'All content in a single readable .txt file, separated by platform headers',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id:          'json-zip',
    label:       'JSON Archive (coming soon)',
    description: 'Individual JSON files for each content item, packed as a .zip',
    badge:       'Coming soon',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
]

// ── CONTENT ITEM SELECTION ROW ─────────────────────────────────────────────

function ContentRow({
  item,
  selected,
  onToggle,
}: {
  item:     ContentExport
  selected: boolean
  onToggle: () => void
}) {
  const platforms = item.variants.map((v) => PLATFORM_LABELS[v.platform]).join(', ')
  const date      = new Date(item.generatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day:   'numeric',
  })

  return (
    <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-gray-50 group">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="w-4 h-4 accent-purple-600 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {platforms} &bull; {date} &bull; {item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}
        </p>
      </div>
      {selected && (
        <span className="badge-purple text-xs flex-shrink-0">Selected</span>
      )}
    </label>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function BulkExport({ items, onClose }: BulkExportProps) {
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set(items.map((i) => i.id)))
  const [format, setFormat]             = useState<BulkFormat>('csv')
  const [includeHashtags, setHashtags]  = useState(true)
  const [includeCTA, setCTA]            = useState(true)
  const [includeMeta, setMeta]          = useState(false)
  const [filterPlatform, setFilter]     = useState<Platform | 'all'>('all')
  const [isExporting, setIsExporting]   = useState(false)
  const { toast, showToast }            = useToast()

  const selectedItems = items.filter((i) => selectedIds.has(i.id))

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else              next.add(id)
      return next
    })
  }

  const selectAll  = () => setSelectedIds(new Set(items.map((i) => i.id)))
  const clearAll   = () => setSelectedIds(new Set())

  // Collect all unique platforms across all items
  const allPlatforms = Array.from(
    new Set(items.flatMap((i) => i.variants.map((v) => v.platform))),
  ) as Platform[]

  // Build export options
  const buildOptions = useCallback((): ExportOptions => ({
    includePlatforms: filterPlatform === 'all' ? [] : [filterPlatform],
    includeHashtags,
    includeCTA,
    includeMetadata: includeMeta,
    format:          ExportFormat.CSV, // only used as a carrier; bulk fns use their own format
  }), [filterPlatform, includeHashtags, includeCTA, includeMeta])

  const handleExport = async () => {
    if (selectedItems.length === 0) {
      showToast('Select at least one item to export.', 'error')
      return
    }

    if (format === 'json-zip') {
      showToast('JSON archive export is coming soon.', 'info')
      return
    }

    setIsExporting(true)

    try {
      const opts = buildOptions()
      if (format === 'csv') {
        downloadBulkAsCSV(selectedItems, opts, 'content-calendar.csv')
        showToast(`${selectedItems.length} items exported as CSV.`, 'success')
      } else if (format === 'text') {
        downloadBulkAsText(selectedItems, opts, 'content-export.txt')
        showToast(`${selectedItems.length} items exported as text.`, 'success')
      }
    } catch (err) {
      console.error('[BulkExport] export error', err)
      showToast('Export failed. Please try again.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // ── Variant count display ────────────────────────────────────────────────

  const totalVariants = selectedItems.reduce(
    (acc, i) =>
      acc +
      (filterPlatform === 'all'
        ? i.variants.length
        : i.variants.filter((v) => v.platform === filterPlatform).length),
    0,
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Export</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Export multiple items as a single file or content calendar.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Format selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Export Format</p>
          <div className="space-y-2">
            {BULK_FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFormat(opt.id)}
                disabled={opt.id === 'json-zip'}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  format === opt.id
                    ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-400'
                    : opt.id === 'json-zip'
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className={`flex-shrink-0 mt-0.5 ${format === opt.id ? 'text-purple-600' : 'text-gray-400'}`}>
                  {opt.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${format === opt.id ? 'text-purple-900' : 'text-gray-700'}`}>
                      {opt.label}
                    </p>
                    {opt.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        opt.badge === 'Coming soon'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                </div>
                {format === opt.id && (
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Platform filter */}
        {allPlatforms.length > 1 && (
          <div className="card p-4 space-y-2">
            <p className="text-sm font-medium text-gray-900">Filter by Platform</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filterPlatform === 'all'
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                All Platforms
              </button>
              {allPlatforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    filterPlatform === p
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content options */}
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Options</p>
          {[
            { label: 'Include Hashtags', value: includeHashtags, setter: setHashtags },
            { label: 'Include CTA',      value: includeCTA,      setter: setCTA      },
            { label: 'Include Metadata', value: includeMeta,     setter: setMeta     },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={opt.value}
                onChange={(e) => opt.setter(e.target.checked)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Item selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              Select Items
              <span className="ml-2 text-gray-400 font-normal">
                ({selectedIds.size} of {items.length} selected)
              </span>
            </p>
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

          {items.length === 0 ? (
            <div className="card p-6 text-center text-gray-400 text-sm">
              No content items available to export.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <ContentRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Export summary + action */}
        <div className="card p-4 bg-gray-50 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} &bull; {totalVariants} row{totalVariants !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {format === 'csv'
                ? 'Content calendar CSV — ready for scheduling tools'
                : 'Combined text document'}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedIds.size === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </>
            )}
          </button>
        </div>

      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  )
}
