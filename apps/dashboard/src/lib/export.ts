/**
 * export.ts — core export utilities for Social Engine
 *
 * Each function is pure (no React imports) so it can be used in tests
 * and in any rendering environment.
 */

import type { ContentExport, ExportOptions, ExportVariant, Platform } from '@/types/export'

// ── PLATFORM FORMATTING ────────────────────────────────────────────────────

/** Character limits per platform */
const PLATFORM_LIMITS: Partial<Record<Platform, number>> = {
  twitter:   280,
  linkedin: 3000,
  instagram: 2200,
  tiktok:    2200,
  facebook:  63206,
  youtube:   5000,
  threads:   500,
  bluesky:   300,
  pinterest: 500,
}

/**
 * Format a caption for a specific platform.
 * Respects character limits (truncates with ellipsis) and appends
 * hashtags in the platform-idiomatic way.
 */
export function formatForPlatform(
  caption: string,
  hashtags: string[],
  platform: Platform,
): string {
  const tagBlock = hashtags.length
    ? '\n\n' + hashtags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ')
    : ''

  const full  = caption + tagBlock
  const limit = PLATFORM_LIMITS[platform]

  if (limit && full.length > limit) {
    // Reserve space for tags + ellipsis
    const ellipsis = '...'
    const maxBody  = limit - tagBlock.length - ellipsis.length
    return caption.slice(0, Math.max(0, maxBody)) + ellipsis + tagBlock
  }

  return full
}

// ── VARIANT FILTERING ──────────────────────────────────────────────────────

function filterVariants(
  content: ContentExport,
  options: Pick<ExportOptions, 'includePlatforms'>,
): ExportVariant[] {
  if (!options.includePlatforms.length) return content.variants
  return content.variants.filter((v) =>
    options.includePlatforms.includes(v.platform),
  )
}

function assembleVariantText(variant: ExportVariant, options: ExportOptions): string {
  let text = variant.text

  if (options.includeHashtags && variant.hashtags.length) {
    text +=
      '\n\n' +
      variant.hashtags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ')
  }

  if (options.includeCTA && variant.callToAction) {
    text += `\n\n${variant.callToAction}`
  }

  return text.trim()
}

// ── CLIPBOARD ──────────────────────────────────────────────────────────────

/**
 * Copy text to clipboard.
 * Falls back to the legacy `execCommand` API for older browsers / iframes.
 *
 * @returns true if the copy succeeded, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Modern async Clipboard API (requires secure context)
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to legacy path
    }
  }

  // Legacy fallback — creates a temporary textarea
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

// ── FILE DOWNLOAD HELPER ────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke after the browser has had time to initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
}

// ── PLAIN TEXT EXPORT ──────────────────────────────────────────────────────

/**
 * Build a plain-text string from content — used for both clipboard and file.
 */
export function buildTextOutput(
  content: ContentExport,
  options: ExportOptions,
): string {
  const variants = filterVariants(content, options)
  const lines: string[] = []

  lines.push(`# ${content.title}`)
  lines.push(`Generated: ${new Date(content.generatedAt).toLocaleString()}`)

  if (options.includeMetadata && content.metadata) {
    lines.push('')
    lines.push('## Generation Details')
    if (content.metadata.prompt) lines.push(`Prompt: ${content.metadata.prompt}`)
    if (content.metadata.tone)   lines.push(`Tone: ${content.metadata.tone}`)
    if (content.metadata.model)  lines.push(`Model: ${content.metadata.model}`)
  }

  lines.push('')
  lines.push('─'.repeat(60))

  for (const variant of variants) {
    lines.push('')
    lines.push(`## ${variant.platform.toUpperCase()}`)
    lines.push('')
    lines.push(assembleVariantText(variant, options))
    lines.push('')
    lines.push('─'.repeat(60))
  }

  return lines.join('\n')
}

/**
 * Download content as a formatted plain-text (.txt) file.
 */
export function downloadAsText(
  content: ContentExport,
  options: ExportOptions,
  filename?: string,
): void {
  const text = buildTextOutput(content, options)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const name = filename ?? `${sanitizeFilename(content.title)}.txt`
  triggerDownload(blob, name)
}

// ── JSON EXPORT ─────────────────────────────────────────────────────────────

/**
 * Build a structured JSON payload from content.
 */
export function buildJSONOutput(
  content: ContentExport,
  options: ExportOptions,
): object {
  const variants = filterVariants(content, options)

  const exportedVariants = variants.map((v) => {
    const base: Record<string, unknown> = {
      platform: v.platform,
      text:     assembleVariantText(v, options),
    }
    if (options.includeHashtags) base.hashtags = v.hashtags
    if (options.includeCTA && v.callToAction) base.callToAction = v.callToAction
    return base
  })

  const payload: Record<string, unknown> = {
    id:          content.id,
    title:       content.title,
    generatedAt: content.generatedAt,
    variants:    exportedVariants,
  }

  if (options.includeMetadata && content.metadata) {
    payload.metadata = content.metadata
  }

  return payload
}

/**
 * Download content as a structured JSON file.
 */
export function downloadAsJSON(
  content: ContentExport,
  options: ExportOptions,
  filename?: string,
): void {
  const payload = buildJSONOutput(content, options)
  const json    = JSON.stringify(payload, null, 2)
  const blob    = new Blob([json], { type: 'application/json;charset=utf-8' })
  const name    = filename ?? `${sanitizeFilename(content.title)}.json`
  triggerDownload(blob, name)
}

// ── CSV EXPORT ──────────────────────────────────────────────────────────────

function escapeCSV(value: string): string {
  // Wrap in quotes and escape internal quotes
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

/**
 * Build a CSV string from content.
 * Columns: id, title, platform, text, hashtags, cta, generatedAt
 * Compatible with Buffer, Hootsuite, and most social scheduling tools.
 */
export function buildCSVOutput(
  content: ContentExport,
  options: ExportOptions,
): string {
  const variants = filterVariants(content, options)

  const headers = [
    'id',
    'title',
    'platform',
    'caption',
    ...(options.includeHashtags ? ['hashtags'] : []),
    ...(options.includeCTA ? ['call_to_action'] : []),
    'generated_at',
    ...(options.includeMetadata ? ['prompt', 'tone', 'model'] : []),
  ]

  const rows = variants.map((v) => {
    const cells = [
      escapeCSV(content.id),
      escapeCSV(content.title),
      escapeCSV(v.platform),
      escapeCSV(v.text),
      ...(options.includeHashtags ? [escapeCSV(v.hashtags.join(' '))] : []),
      ...(options.includeCTA ? [escapeCSV(v.callToAction ?? '')] : []),
      escapeCSV(content.generatedAt),
      ...(options.includeMetadata
        ? [
            escapeCSV(content.metadata?.prompt ?? ''),
            escapeCSV(content.metadata?.tone   ?? ''),
            escapeCSV(content.metadata?.model  ?? ''),
          ]
        : []),
    ]
    return cells.join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * Download content as a CSV file for spreadsheet import.
 * Designed for import into Buffer, Hootsuite, Later, etc.
 */
export function downloadAsCSV(
  content: ContentExport,
  options: ExportOptions,
  filename?: string,
): void {
  const csv  = buildCSVOutput(content, options)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const name = filename ?? `${sanitizeFilename(content.title)}.csv`
  triggerDownload(blob, name)
}

// ── BULK / MULTI-ITEM HELPERS ───────────────────────────────────────────────

/**
 * Merge multiple ContentExport items into a single CSV — useful for
 * calendar exports across many pieces of content.
 */
export function buildBulkCSVOutput(
  items: ContentExport[],
  options: ExportOptions,
): string {
  if (!items.length) return ''

  const headers = [
    'id',
    'title',
    'platform',
    'caption',
    ...(options.includeHashtags ? ['hashtags'] : []),
    ...(options.includeCTA ? ['call_to_action'] : []),
    'generated_at',
    ...(options.includeMetadata ? ['prompt', 'tone', 'model'] : []),
  ]

  const rows: string[] = []

  for (const content of items) {
    const variants = filterVariants(content, options)
    for (const v of variants) {
      const cells = [
        escapeCSV(content.id),
        escapeCSV(content.title),
        escapeCSV(v.platform),
        escapeCSV(v.text),
        ...(options.includeHashtags ? [escapeCSV(v.hashtags.join(' '))] : []),
        ...(options.includeCTA ? [escapeCSV(v.callToAction ?? '')] : []),
        escapeCSV(content.generatedAt),
        ...(options.includeMetadata
          ? [
              escapeCSV(content.metadata?.prompt ?? ''),
              escapeCSV(content.metadata?.tone   ?? ''),
              escapeCSV(content.metadata?.model  ?? ''),
            ]
          : []),
      ]
      rows.push(cells.join(','))
    }
  }

  return [headers.join(','), ...rows].join('\n')
}

export function downloadBulkAsCSV(
  items: ContentExport[],
  options: ExportOptions,
  filename?: string,
): void {
  const csv  = buildBulkCSVOutput(items, options)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const name = filename ?? 'content-calendar.csv'
  triggerDownload(blob, name)
}

/**
 * Merge multiple items into a combined plain-text document.
 */
export function downloadBulkAsText(
  items: ContentExport[],
  options: ExportOptions,
  filename?: string,
): void {
  const sections = items.map((c) => buildTextOutput(c, options))
  const full     = sections.join('\n\n' + '═'.repeat(60) + '\n\n')
  const blob     = new Blob([full], { type: 'text/plain;charset=utf-8' })
  const name     = filename ?? 'content-export.txt'
  triggerDownload(blob, name)
}
