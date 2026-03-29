'use client'

/**
 * SavedVariants.tsx — Browse and manage saved asset variants.
 *
 * FIR-1320: Shows saved variants organized by type, with favorite toggle,
 * deletion, history timeline, and cost display.
 */

import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ── Types ────────────────────────────────────────────────────────────────────

interface SavedVariantsProps {
  userId: string
  parentJobId?: Id<'generationJobs'>
  sessionId?: string
}

type VariantType = 'text' | 'image' | 'video'

interface ParsedVariant {
  _id: Id<'assetVariants'>
  userId: string
  sessionId?: string
  parentJobId: Id<'generationJobs'>
  type: VariantType
  result: string
  model?: string
  costUsd?: number
  savedAt: number
  label?: string
  isFavorite?: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseResult(result: string): Record<string, unknown> {
  try {
    return JSON.parse(result)
  } catch {
    return { raw: result }
  }
}

function typeLabel(type: VariantType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// ── Variant Card ─────────────────────────────────────────────────────────────

function VariantCard({
  variant,
  onDelete,
  onToggleFavorite,
}: {
  variant: ParsedVariant
  onDelete: () => void
  onToggleFavorite: () => void
}) {
  const parsed = parseResult(variant.result)

  const previewText =
    variant.type === 'text' && typeof parsed.text === 'string'
      ? parsed.text
      : variant.type === 'text' && typeof parsed.raw === 'string'
      ? parsed.raw
      : null

  const previewUrl =
    (variant.type === 'image' || variant.type === 'video') && typeof parsed.url === 'string'
      ? parsed.url
      : null

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Type + time */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="gray" className="text-xs">
                {typeLabel(variant.type)}
              </Badge>
              {variant.isFavorite && (
                <Badge variant="purple" className="text-xs">Favorite</Badge>
              )}
              <span className="text-xs text-slate-500">{formatTimestamp(variant.savedAt)}</span>
            </div>

            {/* Label */}
            {variant.label && (
              <p className="text-sm font-medium text-slate-200 mb-1">{variant.label}</p>
            )}

            {/* Preview */}
            {previewText && (
              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{previewText}</p>
            )}
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="variant preview"
                className="mt-2 w-24 h-24 object-cover rounded-lg border border-slate-700"
              />
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {variant.model && (
                <Badge variant="gray" className="text-xs">{variant.model}</Badge>
              )}
              {variant.costUsd != null && (
                <Badge variant="gray" className="text-xs">${variant.costUsd.toFixed(4)}</Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className={`text-xs px-2 h-7 ${
                variant.isFavorite
                  ? 'text-purple-400 hover:text-slate-300'
                  : 'text-slate-500 hover:text-purple-400'
              }`}
              title={variant.isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              {variant.isFavorite ? '★' : '☆'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-xs px-2 h-7 text-slate-500 hover:text-red-400"
              title="Delete variant"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SavedVariants({ userId, parentJobId, sessionId }: SavedVariantsProps) {
  const variants = useQuery(api.variants.listVariants, {
    userId,
    parentJobId,
    sessionId,
  }) as ParsedVariant[] | undefined

  const deleteVariant = useMutation(api.variants.deleteVariant)
  const toggleFavorite = useMutation(api.variants.toggleFavorite)

  if (!variants) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500 text-sm">Loading saved variants...</p>
      </div>
    )
  }

  if (variants.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500 text-sm">No saved variants yet. Use &quot;Save Variant&quot; on any asset.</p>
      </div>
    )
  }

  // Group by type
  const textVariants = variants.filter((v) => v.type === 'text')
  const imageVariants = variants.filter((v) => v.type === 'image')
  const videoVariants = variants.filter((v) => v.type === 'video')

  const groups: Array<{ label: string; items: ParsedVariant[] }> = [
    { label: 'Text', items: textVariants },
    { label: 'Images', items: imageVariants },
    { label: 'Videos', items: videoVariants },
  ].filter((g) => g.items.length > 0)

  const totalCost = variants.reduce((sum, v) => sum + (v.costUsd ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {variants.length} saved variant{variants.length !== 1 ? 's' : ''}
        </p>
        {totalCost > 0 && (
          <Badge variant="gray" className="text-xs">
            Total cost: ${totalCost.toFixed(4)}
          </Badge>
        )}
      </div>

      {/* Grouped sections */}
      {groups.map(({ label, items }) => (
        <div key={label}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {label} ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((variant) => (
              <VariantCard
                key={variant._id}
                variant={variant}
                onDelete={() => deleteVariant({ id: variant._id, userId })}
                onToggleFavorite={() => toggleFavorite({ id: variant._id, userId })}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SavedVariants
