/**
 * api-types.ts — Shared request/response types for all Social Engine API routes.
 */

import type { Platform } from '@/types/export'
import type { WorkflowNodeType } from '@/lib/workflow-types'

// ── COMMON ────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  /** Opaque cursor for the next page. Null when there are no more results. */
  nextCursor: string | null
  total: number
}

// ── CONTENT ───────────────────────────────────────────────────────────────────

export type ContentStatus = 'draft' | 'scheduled' | 'posted' | 'archived'

/** Stored content item — maps to `content` collection. */
export interface ContentItem {
  id: string
  userId: string
  /** The main text body of the post. */
  text: string
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  /** Which platforms this content targets. */
  platforms: Platform[]
  status: ContentStatus
  /** Which AI model produced this content (e.g. "gemini-1.5-flash"). */
  aiModel?: string
  /** The prompt that was used to generate this content. */
  prompt?: string
  createdAt: string   // ISO-8601
  updatedAt: string   // ISO-8601
}

// GET /api/content query params
export interface ListContentParams {
  platform?: Platform
  status?: ContentStatus
  /** ISO-8601 date string — only return content created after this date. */
  after?: string
  /** ISO-8601 date string — only return content created before this date. */
  before?: string
  /** Pagination cursor (opaque string from a previous response). */
  cursor?: string
  /** Maximum items per page. Defaults to 20, max 100. */
  limit?: number
}

// POST /api/content body
export interface CreateContentBody {
  text: string
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  platforms: Platform[]
  status?: ContentStatus
  aiModel?: string
  prompt?: string
}

// PATCH /api/content/[id] body — all fields optional
export type UpdateContentBody = Partial<Omit<CreateContentBody, 'platforms'> & {
  platforms: Platform[]
  status: ContentStatus
}>

// ── SCHEDULE ─────────────────────────────────────────────────────────────────

export type ScheduleStatus = 'pending' | 'processing' | 'posted' | 'failed' | 'cancelled'

/** Scheduled publish record — maps to `schedules` collection. */
export interface ScheduleItem {
  id: string
  contentId: string
  userId: string
  platform: Platform
  scheduledAt: string   // ISO-8601
  status: ScheduleStatus
  /** Actual time the post was published (set by the posting worker). */
  postedAt?: string     // ISO-8601
  /** Error message if status is "failed". */
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

// POST /api/schedule body
export interface CreateScheduleBody {
  contentId: string
  platform: Platform
  scheduledAt: string   // ISO-8601
}

// PATCH /api/schedule/[id] body
export interface UpdateScheduleBody {
  scheduledAt?: string
  status?: ScheduleStatus
}

// ── VOICE ─────────────────────────────────────────────────────────────────────

export type VoiceCloneStatus = 'processing' | 'ready' | 'failed'

/** Voice clone record — maps to `voice_clones` collection. */
export interface VoiceClone {
  id: string
  userId: string
  name: string
  /** Public URL of the uploaded audio sample. */
  sampleUrl: string
  status: VoiceCloneStatus
  /** Duration of the sample in seconds. */
  durationSeconds?: number
  /** Error message if status is "failed". */
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

// POST /api/voice/clone body
export interface CreateVoiceCloneBody {
  name: string
  /** Base64-encoded audio sample OR a publicly accessible URL. */
  audioData: string
  /** MIME type of the audio, e.g. "audio/wav", "audio/mp3". */
  mimeType: string
}

// POST /api/voice/generate body
export interface GenerateVoiceBody {
  cloneId: string
  text: string
  /** Playback speed multiplier. 1.0 = normal. */
  speed?: number
  /** Output format. Defaults to "mp3". */
  format?: 'mp3' | 'wav' | 'ogg'
}

export interface GenerateVoiceResult {
  /** URL pointing to the generated audio file. */
  audioUrl: string
  durationSeconds: number
  format: string
}

// ── WORKFLOWS ─────────────────────────────────────────────────────────────────

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived'
export type WorkflowRunStatus = 'running' | 'completed' | 'failed' | 'cancelled'

export interface WorkflowNodeData {
  id: string
  type: WorkflowNodeType
  label: string
  x: number
  y: number
  config: Record<string, unknown>
  ports: Array<{ id: string; label: string; direction: 'input' | 'output' }>
}

export interface WorkflowEdgeData {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

/** Workflow definition — maps to `workflows` collection. */
export interface WorkflowItem {
  id: string
  userId: string
  name: string
  description?: string
  status: WorkflowStatus
  /** Serialised DAG — nodes and edges. */
  nodes: WorkflowNodeData[]
  edges: WorkflowEdgeData[]
  /** Arbitrary config blob (e.g. global variables, timeout settings). */
  config: Record<string, unknown>
  /** Total number of times this workflow has been executed. */
  runCount: number
  lastRunAt?: string   // ISO-8601
  createdAt: string
  updatedAt: string
}

/** Single workflow execution record — maps to `workflow_runs` collection. */
export interface WorkflowRun {
  id: string
  workflowId: string
  userId: string
  status: WorkflowRunStatus
  /** Snapshot of the workflow nodes/edges at run time. */
  snapshot: {
    nodes: WorkflowNodeData[]
    edges: WorkflowEdgeData[]
  }
  startedAt: string
  completedAt?: string
  /** Error detail if status is "failed". */
  error?: string
  /** Arbitrary output produced by the last node in the graph. */
  output?: Record<string, unknown>
}

// POST /api/workflows body
export interface CreateWorkflowBody {
  name: string
  description?: string
  nodes?: WorkflowNodeData[]
  edges?: WorkflowEdgeData[]
  config?: Record<string, unknown>
}

// PATCH /api/workflows/[id] body — all fields optional
export type UpdateWorkflowBody = Partial<
  Omit<CreateWorkflowBody, 'name'> & {
    name: string
    status: WorkflowStatus
  }
>

// ── ANALYTICS ─────────────────────────────────────────────────────────────────

export type AnalyticsDateRange = '7d' | '30d' | '90d' | 'custom'
export type AnalyticsContentType = 'image' | 'video' | 'text' | 'audio'

/** One data point on a time-series chart. */
export interface TimeSeriesPoint {
  /** ISO-8601 date (day-level granularity). */
  date: string
  impressions: number
  engagements: number
  clicks: number
  followers: number
}

export interface PlatformBreakdown {
  platform: Platform
  impressions: number
  engagements: number
  engagementRate: number
  posts: number
  followerGrowth: number
}

export interface PostPerformance {
  contentId: string
  platform: Platform
  text: string
  scheduledAt: string
  postedAt?: string
  impressions: number
  likes: number
  comments: number
  shares: number
  engagementRate: number
}

export interface AnalyticsResponse {
  dateRange: AnalyticsDateRange
  startDate: string    // ISO-8601
  endDate: string      // ISO-8601
  /** Aggregate totals across all platforms and content types. */
  totals: {
    impressions: number
    engagements: number
    clicks: number
    followerGrowth: number
    postsPublished: number
    avgEngagementRate: number
  }
  timeSeries: TimeSeriesPoint[]
  platformBreakdown: PlatformBreakdown[]
  topPosts: PostPerformance[]
}

// ── COMPOSE ───────────────────────────────────────────────────────────────────

export type ComposeFormat = '16:9' | '1:1' | '9:16'

export interface ComposeRequest {
  videoUrl: string
  platform: string
  format: ComposeFormat
  textOverlay?: string
}

export interface ComposeJob {
  id: string
  status: 'processing' | 'ready' | 'error'
  resultUrl?: string
  error?: string
}