'use client'

import { useState } from 'react'
import type { ContentExport } from '@/types/export'

interface ContentCardProps {
  title:       string
  type:        string
  status:      'Draft' | 'Scheduled' | 'Posted' | 'Failed'
  date:        string
  thumbnail?:  string
  /** When provided, shows an export button that opens the ExportModal */
  exportData?: ContentExport
}

const statusClasses: Record<ContentCardProps['status'], string> = {
  Draft:     'bg-gray-100 text-gray-600',
  Scheduled: 'bg-amber-50 text-amber-600',
  Posted:    'bg-emerald-50 text-emerald-600',
  Failed:    'bg-red-50 text-red-600',
}

export default function ContentCard({
  title,
  type,
  status,
  date,
  thumbnail,
  exportData,
}: ContentCardProps) {
  const [showExport, setShowExport] = useState(false)

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 mb-3 group hover:shadow-sm transition-shadow">
        {/* Thumbnail */}
        <div
          className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 bg-cover bg-center"
          style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 mb-1 truncate">{title}</div>
          <div className="text-xs text-gray-400">{type} &bull; {date}</div>
        </div>

        {/* Status badge */}
        <span className={`px-2.5 py-0.5 rounded text-xs font-bold flex-shrink-0 ${statusClasses[status]}`}>
          {status}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {exportData && (
            <button
              onClick={() => setShowExport(true)}
              title="Export content"
              className="p-2 rounded-lg text-gray-300 hover:text-purple-600 hover:bg-purple-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          <button className="p-2 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xl leading-none">
            &#8942;
          </button>
        </div>
      </div>

      {/* Export modal — lazy imported to keep the card bundle small */}
      {showExport && exportData && (
        <ExportModalLazy
          content={exportData}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  )
}

// ── Lazy wrapper to avoid pulling ExportModal into every ContentCard ────────

function ExportModalLazy({
  content,
  onClose,
}: {
  content: ContentExport
  onClose: () => void
}) {
  // Dynamic import pattern — React.lazy isn't usable inline without Suspense,
  // so we use a simple state-driven approach with direct import.
  const [Modal, setModal] = useState<React.ComponentType<{
    content: ContentExport
    onClose: () => void
  }> | null>(null)

  // Load the modal on first render of this wrapper
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
