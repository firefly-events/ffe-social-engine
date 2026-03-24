// ── ENUMS ──────────────────────────────────────────────────────────────────

/** Mirrors packages/core Platform enum — defined locally to avoid adding a dep. */
export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'pinterest'
  | 'threads'
  | 'bluesky'

export enum ExportFormat {
  Text      = 'text',
  JSON      = 'json',
  CSV       = 'csv',
  Clipboard = 'clipboard',
}

// ── INTERFACES ─────────────────────────────────────────────────────────────

/**
 * A single platform variant ready for export.
 */
export interface ExportVariant {
  platform: Platform
  /** The raw generated caption / copy */
  text: string
  hashtags: string[]
  /** Optional call-to-action appended to the text */
  callToAction?: string
}

/**
 * The full content export payload — one or many variants.
 * This is what gets passed to every export utility function.
 */
export interface ContentExport {
  /** Identifier for the source content item */
  id: string
  /** Human-readable title / prompt summary */
  title: string
  /** All platform variants included in this export */
  variants: ExportVariant[]
  /** ISO-8601 timestamp of when the content was generated */
  generatedAt: string
  /** Prompt or session context, included when includeMetadata is true */
  metadata?: {
    prompt?: string
    tone?: string
    model?: string
    tags?: string[]
  }
}

/**
 * Controls what is included in the export output.
 */
export interface ExportOptions {
  /** Which platforms to include. If empty, all variants are included. */
  includePlatforms: Platform[]
  /** Append hashtags to the exported text */
  includeHashtags: boolean
  /** Append the call-to-action field to the exported text */
  includeCTA: boolean
  /** Include generation metadata (prompt, tone, model) */
  includeMetadata: boolean
  /** Export format */
  format: ExportFormat
}

/**
 * Return type for the export utilities — a result discriminated union so
 * callers can react to success / failure without try-catch boilerplate.
 */
export type ExportResult =
  | { ok: true;  message: string }
  | { ok: false; error: string }
