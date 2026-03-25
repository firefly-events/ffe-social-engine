/**
 * api-store.ts — In-memory data stores for all API routes.
 *
 * TODO(migration): Replace every Map with the appropriate Convex mutation/query
 * or a MongoDB collection call. Each store is labelled with the intended target.
 *
 * ⚠  These stores are process-local and reset on every cold start.
 *    They are intentionally NOT shared across Next.js edge workers.
 *    Do NOT use this in production — swap for persistent storage first.
 */

import type {
  ContentItem,
  ScheduleItem,
  VoiceClone,
  WorkflowItem,
  WorkflowRun,
} from '@/lib/api-types'

// TODO(migration): Convex table: "content" | MongoDB collection: "content"
export const contentStore = new Map<string, ContentItem>()

// TODO(migration): Convex table: "schedules" | MongoDB collection: "schedules"
export const scheduleStore = new Map<string, ScheduleItem>()

// TODO(migration): Convex table: "voice_clones" | MongoDB collection: "voice_clones"
export const voiceCloneStore = new Map<string, VoiceClone>()

// TODO(migration): Convex table: "workflows" | MongoDB collection: "workflows"
export const workflowStore = new Map<string, WorkflowItem>()

// TODO(migration): Convex table: "workflow_runs" | MongoDB collection: "workflow_runs"
export const workflowRunStore = new Map<string, WorkflowRun>()
