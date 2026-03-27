'use client'

/**
 * Export page — FIR-1319
 *
 * Asset gallery with multi-select, JSON export download, and n8n webhook push.
 * Shows last 5 exports at the bottom.
 */

import { useState } from 'react'
import { AssetGallery } from '@/components/AssetGallery'
import type { AssetGalleryItem } from '@/components/AssetGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ASSETS: AssetGalleryItem[] = [
  {
    id: 'txt-1',
    type: 'text',
    name: 'Summer Festival Caption',
    text: 'Get ready for the biggest event of the summer! Tickets drop this Friday. #FireflyEvents #SummerFest',
    model: 'gemini-1.5-flash',
    generationMs: 840,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txt-2',
    type: 'text',
    name: 'Speaker Announcement Copy',
    text: 'We are thrilled to announce our headline speaker for Firefly 2025 — an industry legend you won\'t want to miss.',
    model: 'gemini-1.5-pro',
    generationMs: 1240,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'img-1',
    type: 'image',
    name: 'Speaker Announcement',
    url: undefined,
    model: 'flux-schnell',
    costUsd: 0.003,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'img-2',
    type: 'image',
    name: 'Event Banner',
    url: undefined,
    model: 'flux-dev',
    costUsd: 0.012,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-1',
    type: 'video',
    name: 'Summer Festival Teaser',
    thumbnailUrl: undefined,
    durationSeconds: 30,
    model: 'runway-gen3',
    generationMs: 45000,
    createdAt: new Date().toISOString(),
  },
]

interface ExportRecord {
  id: string
  assetCount: number
  format: string
  exportedAt: string
}

// ── Export page ───────────────────────────────────────────────────────────────

export default function ExportPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([])
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

    setExporting(true)

    try {
      const selectedAssets = MOCK_ASSETS.filter((a) => selectedIds.includes(a.id))
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
      <AssetGallery
        assets={MOCK_ASSETS}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

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
