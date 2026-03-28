'use client'

/**
 * Export page — FIR-1319
 *
 * Asset gallery with multi-select, JSON export download, and n8n webhook push.
 * Shows last 5 exports at the bottom.
 */

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { AssetGallery } from '@/components/AssetGallery'
import type { AssetGalleryItem } from '@/components/AssetGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Doc } from '../../../../convex/_generated/dataModel'

// ── Data mapping ──────────────────────────────────────────────────────────────

const mapJobToAsset = (job: Doc<'generationJobs'>): AssetGalleryItem => {
  const baseAsset = {
    id: job._id,
    name: job.topic,
    model: job.model,
    createdAt: new Date(job.createdAt).toISOString(),
    generationMs: job.completedAt ? job.completedAt - job.createdAt : undefined,
  }

  // FIR-1317: `result` is a flexible `any` field.
  // We need to safely parse it based on the job type.
  const result = job.result as any

  if (job.type.startsWith('text') || job.type === 'single' || job.type === 'hashtags') {
    return {
      ...baseAsset,
      type: 'text',
      text: result?.text ?? 'No text generated',
    }
  }

  if (job.type.startsWith('image')) {
    return {
      ...baseAsset,
      type: 'image',
      url: result?.url,
      costUsd: result?.costUsd,
    }
  }

  if (job.type.startsWith('video')) {
    return {
      ...baseAsset,
      type: 'video',
      thumbnailUrl: result?.thumbnailUrl,
      durationSeconds: result?.durationSeconds,
    }
  }

  // Fallback for unknown types
  return {
    ...baseAsset,
    type: 'text',
    text: 'Unknown asset type. Check console for details.',
  }
}

interface ExportRecord {
  id: string
  assetCount: number
  format: string
  exportedAt: string
}

// ── Export page ───────────────────────────────────────────────────────────────

export default function ExportPage() {
  const { userId } = useAuth()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([])
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const generationJobs = useQuery(api.generationJobs.list, userId ? { userId } : 'skip')
  const assets = generationJobs?.map(mapJobToAsset)

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 4000)
  }

  // ── JSON export (simulated ZIP) ──────────────────────────────────────────

  const handleExportJson = () => {
    if (selectedIds.length === 0) {
      showStatus('error', 'Select at least one asset to export.')
      return
    }
    if (!assets) return

    setExporting(true)

    try {
      const selectedAssets = assets.filter((a) => selectedIds.includes(a.id))
      const manifest = {
        exportedAt: new Date().toISOString(),
        assetCount: selectedAssets.length,
        assets: selectedAssets,
      }

      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `firefly-assets-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const record: ExportRecord = {
        id: `exp_${Date.now()}`,
        assetCount: selectedAssets.length,
        format: 'json',
        exportedAt: new Date().toISOString(),
      }
      setExportHistory((prev) => [record, ...prev].slice(0, 5))
      showStatus('success', `Exported ${selectedAssets.length} asset(s) as JSON.`)
    } finally {
      setExporting(false)
    }
  }

  // ── n8n webhook ──────────────────────────────────────────────────────────

  const handleSendToN8n = async () => {
    if (selectedIds.length === 0) {
      showStatus('error', 'Select at least one asset to send.')
      return
    }

    setWebhookLoading(true)
    try {
      const res = await fetch('/api/export/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: selectedIds }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        showStatus('error', `Failed: ${(err as { error?: string }).error ?? res.statusText}`)
        return
      }

      const record: ExportRecord = {
        id: `exp_${Date.now()}`,
        assetCount: selectedIds.length,
        format: 'webhook',
        exportedAt: new Date().toISOString(),
      }
      setExportHistory((prev) => [record, ...prev].slice(0, 5))
      showStatus('success', `Sent ${selectedIds.length} asset(s) to n8n.`)
    } catch {
      showStatus('error', 'Network error while sending to n8n.')
    } finally {
      setWebhookLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (assets === undefined) {
      return <div className="text-center text-slate-500 py-16">Loading assets...</div>
    }
    if (assets.length === 0) {
      return (
        <div className="text-center text-slate-500 py-16">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Assets Generated Yet</h3>
          <p>
            Use the features in the sidebar to generate content, and it will appear here ready for
            export.
          </p>
        </div>
      )
    }
    return (
      <AssetGallery
        assets={assets}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Export Assets</h1>
        <p className="text-slate-400">
          Select generated content, download as JSON, or send directly to your n8n automation.
        </p>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300'
              : 'bg-red-900/50 border border-red-700 text-red-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          {selectedIds.length > 0 ? (
            <Badge variant="purple" className="text-sm px-3 py-1">
              {selectedIds.length} asset{selectedIds.length > 1 ? 's' : ''} selected
            </Badge>
          ) : (
            <span className="text-slate-500 text-sm">No assets selected</span>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleExportJson}
          disabled={exporting || selectedIds.length === 0}
          className="border-slate-600 text-slate-300 hover:text-white"
        >
          {exporting ? 'Exporting...' : 'Export as JSON'}
        </Button>

        <Button
          variant="default"
          onClick={handleSendToN8n}
          disabled={webhookLoading || selectedIds.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {webhookLoading ? 'Sending...' : 'Send to n8n'}
        </Button>
      </div>

      {/* Asset gallery */}
      {renderContent()}

      {/* Export history */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 text-base">Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          {exportHistory.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">
              No exports yet. Select assets above and export.
            </p>
          ) : (
            <div className="space-y-2">
              {exportHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={record.format === 'webhook' ? 'purple' : 'gray'}>
                      {record.format === 'webhook' ? 'n8n' : 'JSON'}
                    </Badge>
                    <span className="text-sm text-slate-300">
                      {record.assetCount} asset{record.assetCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(record.exportedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
