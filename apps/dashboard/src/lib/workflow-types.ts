/**
 * workflow-types.ts — Core type definitions for the visual workflow builder.
 *
 * A workflow is a directed acyclic graph (DAG) of nodes connected by edges.
 * It is serialised as plain JSON so it can be stored in Convex / the API.
 */

// ── NODE CATEGORIES ─────────────────────────────────────────────────────────

export type NodeCategory = 'trigger' | 'ai' | 'transform' | 'publish' | 'logic'

// ── NODE TYPES ───────────────────────────────────────────────────────────────

export type TriggerNodeType = 'trigger:schedule' | 'trigger:webhook' | 'trigger:new-event' | 'trigger:manual'
export type AINodeType      = 'ai:text' | 'ai:image' | 'ai:voice' | 'ai:video'
export type TransformNodeType = 'transform:resize' | 'transform:caption' | 'transform:watermark' | 'transform:platform-optimize'
export type PublishNodeType   = 'publish:instagram' | 'publish:tiktok' | 'publish:linkedin' | 'publish:twitter' | 'publish:facebook' | 'publish:youtube'
export type LogicNodeType     = 'logic:if-else' | 'logic:split' | 'logic:delay' | 'logic:loop'

export type WorkflowNodeType =
  | TriggerNodeType
  | AINodeType
  | TransformNodeType
  | PublishNodeType
  | LogicNodeType

// ── NODE CONFIGS (per-type) ──────────────────────────────────────────────────

export interface ScheduleConfig  { cron: string; timezone: string }
export interface WebhookConfig   { url: string; secret: string }
export interface NewEventConfig  { eventApiFilter: string }
export interface ManualConfig    { label: string }

export interface TextGenConfig   { model: 'gemini-pro' | 'gemini-flash'; prompt: string; tone: string; maxTokens: number }
export interface ImageGenConfig  { model: 'flux-schnell' | 'flux-dev'; prompt: string; width: number; height: number }
export interface VoiceGenConfig  { cloneId: string; text: string; speed: number }
export interface VideoComposeConfig { templateId: string; duration: number; resolution: '1080p' | '720p' | '4k' }

export interface ResizeConfig    { width: number; height: number; fit: 'cover' | 'contain' | 'fill' }
export interface CaptionConfig   { text: string; position: 'top' | 'bottom' | 'center'; fontSize: number; color: string }
export interface WatermarkConfig { imageUrl: string; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; opacity: number }
export interface PlatformOptimizeConfig { platform: PublishPlatform }

export interface PublishConfig   { accountId: string; caption: string; hashtags: string[]; scheduleAt?: string }
export interface IfElseConfig    { metric: 'likes' | 'comments' | 'shares' | 'views'; operator: '>' | '<' | '>=' | '<='; threshold: number }
export interface SplitConfig     { variants: number; distribution: number[] }
export interface DelayConfig     { duration: number; unit: 'seconds' | 'minutes' | 'hours' | 'days' }
export interface LoopConfig      { maxIterations: number; condition: string }

export type PublishPlatform = 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook' | 'youtube'

export type WorkflowNodeConfig =
  | ScheduleConfig | WebhookConfig | NewEventConfig | ManualConfig
  | TextGenConfig  | ImageGenConfig | VoiceGenConfig | VideoComposeConfig
  | ResizeConfig   | CaptionConfig  | WatermarkConfig | PlatformOptimizeConfig
  | PublishConfig
  | IfElseConfig   | SplitConfig    | DelayConfig      | LoopConfig

// ── PORTS ────────────────────────────────────────────────────────────────────

export interface WorkflowPort {
  id: string
  label: string
  /** 'input' = top of node, 'output' = bottom */
  direction: 'input' | 'output'
}

// ── NODE ─────────────────────────────────────────────────────────────────────

export interface WorkflowNode {
  id: string
  type: WorkflowNodeType
  label: string
  /** Canvas position (px) */
  x: number
  y: number
  config: Partial<WorkflowNodeConfig>
  ports: WorkflowPort[]
}

// ── EDGE ─────────────────────────────────────────────────────────────────────

export interface WorkflowEdge {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

// ── WORKFLOW ─────────────────────────────────────────────────────────────────

export type WorkflowStatus = 'active' | 'paused' | 'draft'

export interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
  lastRun?: string
  nextRun?: string
  runCount: number
}

// ── NODE PALETTE METADATA ────────────────────────────────────────────────────

export interface NodePaletteItem {
  type: WorkflowNodeType
  label: string
  description: string
  category: NodeCategory
  defaultConfig: Partial<WorkflowNodeConfig>
  defaultPorts: WorkflowPort[]
  color: string   // Tailwind bg class prefix, e.g. 'purple'
  icon: string    // inline SVG path data
}

// ── SAMPLE WORKFLOW ──────────────────────────────────────────────────────────

export const SAMPLE_WORKFLOW: Workflow = {
  id:          'wf-sample-001',
  name:        'Weekly Event Recap',
  description: 'Every Monday, pull top events from event-api, generate a text recap with Gemini, and publish to Instagram and LinkedIn.',
  status:      'active',
  runCount:    12,
  createdAt:   '2026-03-01T00:00:00Z',
  updatedAt:   '2026-03-20T10:15:00Z',
  lastRun:     '2026-03-18T09:00:00Z',
  nextRun:     '2026-03-25T09:00:00Z',
  config:      {},
  nodes: [
    {
      id:     'node-1',
      type:   'trigger:schedule',
      label:  'Every Monday 9am',
      x:      300,
      y:      80,
      config: { cron: '0 9 * * 1', timezone: 'America/New_York' } as ScheduleConfig,
      ports:  [{ id: 'out-1', label: 'Trigger', direction: 'output' }],
    },
    {
      id:     'node-2',
      type:   'trigger:new-event',
      label:  'New Event (API)',
      x:      600,
      y:      80,
      config: { eventApiFilter: 'category:music' } as NewEventConfig,
      ports:  [{ id: 'out-1', label: 'Event', direction: 'output' }],
    },
    {
      id:     'node-3',
      type:   'ai:text',
      label:  'Gemini Recap',
      x:      450,
      y:      240,
      config: { model: 'gemini-pro', prompt: 'Write a weekly recap for these events: {{events}}', tone: 'enthusiastic', maxTokens: 500 } as TextGenConfig,
      ports:  [
        { id: 'in-1',  label: 'Input',  direction: 'input'  },
        { id: 'out-1', label: 'Text',   direction: 'output' },
      ],
    },
    {
      id:     'node-4',
      type:   'transform:platform-optimize',
      label:  'Optimize for Instagram',
      x:      240,
      y:      400,
      config: { platform: 'instagram' } as PlatformOptimizeConfig,
      ports:  [
        { id: 'in-1',  label: 'Input',   direction: 'input'  },
        { id: 'out-1', label: 'Content', direction: 'output' },
      ],
    },
    {
      id:     'node-5',
      type:   'transform:platform-optimize',
      label:  'Optimize for LinkedIn',
      x:      660,
      y:      400,
      config: { platform: 'linkedin' } as PlatformOptimizeConfig,
      ports:  [
        { id: 'in-1',  label: 'Input',   direction: 'input'  },
        { id: 'out-1', label: 'Content', direction: 'output' },
      ],
    },
    {
      id:     'node-6',
      type:   'publish:instagram',
      label:  'Post to Instagram',
      x:      240,
      y:      560,
      config: { accountId: 'acct-ig-001', caption: '{{text}}', hashtags: ['#events', '#local'] } as PublishConfig,
      ports:  [{ id: 'in-1', label: 'Content', direction: 'input' }],
    },
    {
      id:     'node-7',
      type:   'publish:linkedin',
      label:  'Post to LinkedIn',
      x:      660,
      y:      560,
      config: { accountId: 'acct-li-001', caption: '{{text}}', hashtags: ['#events'] } as PublishConfig,
      ports:  [{ id: 'in-1', label: 'Content', direction: 'input' }],
    },
  ],
  edges: [
    { id: 'e-1', sourceNodeId: 'node-1', sourcePortId: 'out-1', targetNodeId: 'node-3', targetPortId: 'in-1' },
    { id: 'e-2', sourceNodeId: 'node-2', sourcePortId: 'out-1', targetNodeId: 'node-3', targetPortId: 'in-1' },
    { id: 'e-3', sourceNodeId: 'node-3', sourcePortId: 'out-1', targetNodeId: 'node-4', targetPortId: 'in-1' },
    { id: 'e-4', sourceNodeId: 'node-3', sourcePortId: 'out-1', targetNodeId: 'node-5', targetPortId: 'in-1' },
    { id: 'e-5', sourceNodeId: 'node-4', sourcePortId: 'out-1', targetNodeId: 'node-6', targetPortId: 'in-1' },
    { id: 'e-6', sourceNodeId: 'node-5', sourcePortId: 'out-1', targetNodeId: 'node-7', targetPortId: 'in-1' },
  ],
}
