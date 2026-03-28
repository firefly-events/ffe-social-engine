'use client'

/**
 * AssetGallery.tsx — Tabbed gallery for text, image, and video assets.
 *
 * FIR-1318: Multi-select, copy-to-clipboard, hover previews, dark theme.
 */

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, ArrowUpDown } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

export type AssetType = 'text' | 'image' | 'video'

export interface AssetGalleryItem {
  id: string
  type: AssetType
  /** Display name / title */
  name: string
  /** Text content (type === 'text') */
  text?: string
  /** URL for image/video/thumbnail */
  url?: string
  /** Thumbnail URL for videos */
  thumbnailUrl?: string
  /** Duration in seconds (type === 'video') */
  durationSeconds?: number
  /** AI model that produced this asset */
  model?: string
  /** Generation time in ms */
  generationMs?: number
  /** Rough cost estimate in USD */
  costUsd?: number
  createdAt?: string
}

export interface AssetGalleryProps {
  assets: AssetGalleryItem[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

type SortOption = 'newest' | 'oldest' | 'cost-high' | 'cost-low'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-label'?: string
}

function Checkbox({ checked, onChange, 'aria-label': ariaLabel }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={ariaLabel || "Select item"}
      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
      onClick={(e) => e.stopPropagation()}
    />
  )
}

// ── Text Tab ─────────────────────────────────────────────────────────────────

function TextTab({
  items,
  selectedIds,
  onSelectionChange,
}: {
  items: AssetGalleryItem[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (item: AssetGalleryItem) => {
    const text = item.text ?? item.name
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  if (items.length === 0) {
    return <EmptyState message="No matching text assets found." />
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const selected = selectedIds.includes(item.id)
        return (
          <Card
            key={item.id}
            className={`bg-slate-800 border-slate-700 transition-colors ${
              selected ? 'ring-1 ring-purple-500' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selected}
                  onChange={() => toggleSelect(item.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    {item.createdAt && (
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {item.text}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.model && (
                      <Badge variant="gray" className="text-xs">{item.model}</Badge>
                    )}
                    {item.generationMs != null && (
                      <Badge variant="gray" className="text-xs">
                        {formatMs(item.generationMs)}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(item)}
                  className="shrink-0 border-slate-600 text-slate-300 hover:text-white"
                >
                  {copiedId === item.id ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ── Images Tab ───────────────────────────────────────────────────────────────

function ImagesTab({
  items,
  selectedIds,
  onSelectionChange,
}: {
  items: AssetGalleryItem[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}) {
  const [previewId, setPreviewId] = useState<string | null>(null)

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  if (items.length === 0) {
    return <EmptyState message="No matching image assets found." />
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const selected = selectedIds.includes(item.id)
          return (
            <div
              key={item.id}
              className={`relative rounded-xl overflow-hidden border bg-slate-800 cursor-pointer group transition-all ${
                selected ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-700'
              }`}
              onClick={() => setPreviewId(item.id === previewId ? null : item.id)}
            >
              {/* Image or placeholder */}
              <div className="aspect-square bg-slate-700 flex items-center justify-center">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🖼</span>
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Click to preview</span>
              </div>

              {/* Checkbox */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={(e) => { e.stopPropagation(); toggleSelect(item.id) }}
              >
                <Checkbox checked={selected} onChange={() => toggleSelect(item.id)} />
              </div>

              {/* Meta */}
              <div className="p-2">
                <p className="text-xs text-slate-300 font-medium truncate">{item.name}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {item.model && (
                    <Badge variant="gray" className="text-xs">{item.model}</Badge>
                  )}
                  {item.costUsd != null && (
                    <Badge variant="gray" className="text-xs">
                      ${item.costUsd.toFixed(3)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enlarged preview modal */}
      {previewId && (() => {
        const item = items.find((i) => i.id === previewId)
        if (!item) return null
        return (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreviewId(null)}
          >
            <div
              className="max-w-2xl w-full bg-slate-800 rounded-2xl overflow-hidden border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-slate-700 flex items-center justify-center">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-6xl">🖼</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-slate-200 font-semibold">{item.name}</p>
                <div className="flex gap-2 mt-2">
                  {item.model && <Badge variant="gray">{item.model}</Badge>}
                  {item.costUsd != null && <Badge variant="gray">${item.costUsd.toFixed(3)}</Badge>}
                  {item.createdAt && (
                    <span className="text-xs text-slate-500 self-center ml-auto">
                      Generated on {new Date(item.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}

// ── Videos Tab ───────────────────────────────────────────────────────────────

function VideosTab({
  items,
  selectedIds,
  onSelectionChange,
}: {
  items: AssetGalleryItem[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}) {
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  if (items.length === 0) {
    return <EmptyState message="No matching video assets found." />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const selected = selectedIds.includes(item.id)
        return (
          <Card
            key={item.id}
            className={`bg-slate-800 border-slate-700 overflow-hidden transition-all ${
              selected ? 'ring-1 ring-purple-500 border-purple-500' : ''
            }`}
          >
            {/* Thumbnail with play overlay */}
            <div className="relative aspect-video bg-slate-700 flex items-center justify-center">
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">🎬</span>
              )}
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-white/30">
                  <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Duration badge */}
              {item.durationSeconds != null && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant="gray" className="bg-black/70 text-white border-0">
                    {formatDuration(item.durationSeconds)}
                  </Badge>
                </div>
              )}
              {/* Checkbox */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={(e) => { e.stopPropagation(); toggleSelect(item.id) }}
              >
                <Checkbox checked={selected} onChange={() => toggleSelect(item.id)} />
              </div>
            </div>

            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                {item.createdAt && (
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-1 flex-wrap">
                {item.model && <Badge variant="gray" className="text-xs">{item.model}</Badge>}
                {item.generationMs != null && (
                  <Badge variant="gray" className="text-xs">{formatMs(item.generationMs)}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

type TabKey = 'text' | 'images' | 'videos'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'text', label: 'Text' },
  { key: 'images', label: 'Images' },
  { key: 'videos', label: 'Videos' },
]

export function AssetGallery({ assets, selectedIds, onSelectionChange }: AssetGalleryProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('text')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    const searchLower = search.toLowerCase()
    const result = assets.filter((asset) => {
      if (!searchLower) return true
      const matchSearch =
        asset.name.toLowerCase().includes(searchLower) ||
        (asset.model || '').toLowerCase().includes(searchLower) ||
        (asset.text || '').toLowerCase().includes(searchLower)
      
      return matchSearch
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime())
      }
      if (sortBy === 'oldest') {
        return (new Date(a.createdAt || 0).getTime()) - (new Date(b.createdAt || 0).getTime())
      }
      if (sortBy === 'cost-high') {
        return (b.costUsd || 0) - (a.costUsd || 0)
      }
      if (sortBy === 'cost-low') {
        return (a.costUsd || 0) - (b.costUsd || 0)
      }
      return 0
    })

    return result
  }, [assets, search, sortBy])

  const textItems   = filteredAssets.filter((a) => a.type === 'text')
  const imageItems  = filteredAssets.filter((a) => a.type === 'image')
  const videoItems  = filteredAssets.filter((a) => a.type === 'video')

  const counts: Record<TabKey, number> = {
    text:   textItems.length,
    images: imageItems.length,
    videos: videoItems.length,
  }

  const currentItems =
    activeTab === 'text'   ? textItems
    : activeTab === 'images' ? imageItems
    : videoItems

  const allCurrentIds = currentItems.map((a) => a.id)
  const allSelected = allCurrentIds.length > 0 && allCurrentIds.every((id) => selectedIds.includes(id))

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect only items in current tab
      onSelectionChange(selectedIds.filter((id) => !allCurrentIds.includes(id)))
    } else {
      // Add all current tab items to selection
      const newIds = [...new Set([...selectedIds, ...allCurrentIds])]
      onSelectionChange(newIds)
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Search & Sort Bar */}
      <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            aria-label="Search assets"
            placeholder="Search name, model, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <select
              aria-label="Sort assets"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-800">Newest First</option>
              <option value="oldest" className="bg-slate-800">Oldest First</option>
              <option value="cost-high" className="bg-slate-800">Highest Cost</option>
              <option value="cost-low" className="bg-slate-800">Lowest Cost</option>
            </select>
          </div>
          
          <div className="h-8 w-[1px] bg-slate-700 mx-1 hidden md:block" />

          {/* Selection summary & controls */}
          <div className="flex items-center gap-3 ml-auto md:ml-0">
            {selectedIds.length > 0 && (
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {selectedIds.length} selected
              </span>
            )}
            {currentItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-slate-400 hover:text-slate-200 text-xs h-9"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab header */}
      <div className="flex items-center border-b border-slate-700 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2
              ${activeTab === tab.key
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <Badge variant="gray" className="text-xs px-1.5 py-0">
                {counts[tab.key]}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 min-h-[300px]">
        {activeTab === 'text' && (
          <TextTab
            items={textItems}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
          />
        )}
        {activeTab === 'images' && (
          <ImagesTab
            items={imageItems}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
          />
        )}
        {activeTab === 'videos' && (
          <VideosTab
            items={videoItems}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
          />
        )}
      </div>
    </div>
  )
}

export default AssetGallery
