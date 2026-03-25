'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeType,
  WorkflowStatus,
  NodeCategory,
  NodePaletteItem,
} from '@/lib/workflow-types'
import { SAMPLE_WORKFLOW } from '@/lib/workflow-types'

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const GRID_SIZE = 20
const NODE_WIDTH = 176
const NODE_HEIGHT = 80

// ── PALETTE DEFINITION ───────────────────────────────────────────────────────

const PALETTE_ITEMS: NodePaletteItem[] = [
  // Triggers
  {
    type: 'trigger:schedule', label: 'Schedule', description: 'Run on a cron schedule',
    category: 'trigger', color: 'blue',
    defaultConfig: { cron: '0 9 * * 1', timezone: 'UTC' },
    defaultPorts: [{ id: 'out-1', label: 'Trigger', direction: 'output' }],
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    type: 'trigger:webhook', label: 'Webhook', description: 'Triggered by HTTP POST',
    category: 'trigger', color: 'blue',
    defaultConfig: { url: '', secret: '' },
    defaultPorts: [{ id: 'out-1', label: 'Payload', direction: 'output' }],
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  {
    type: 'trigger:new-event', label: 'New Event', description: 'New event from event-api',
    category: 'trigger', color: 'blue',
    defaultConfig: { eventApiFilter: '' },
    defaultPorts: [{ id: 'out-1', label: 'Event', direction: 'output' }],
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
  {
    type: 'trigger:manual', label: 'Manual', description: 'Run on demand',
    category: 'trigger', color: 'blue',
    defaultConfig: { label: 'Run Now' },
    defaultPorts: [{ id: 'out-1', label: 'Start', direction: 'output' }],
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  // AI
  {
    type: 'ai:text', label: 'Text (Gemini)', description: 'Generate text with Gemini',
    category: 'ai', color: 'purple',
    defaultConfig: { model: 'gemini-pro', prompt: '', tone: 'professional', maxTokens: 500 },
    defaultPorts: [
      { id: 'in-1', label: 'Input', direction: 'input' },
      { id: 'out-1', label: 'Text', direction: 'output' },
    ],
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    type: 'ai:image', label: 'Image (FLUX)', description: 'Generate images with FLUX',
    category: 'ai', color: 'purple',
    defaultConfig: { model: 'flux-schnell', prompt: '', width: 1024, height: 1024 },
    defaultPorts: [
      { id: 'in-1', label: 'Prompt', direction: 'input' },
      { id: 'out-1', label: 'Image', direction: 'output' },
    ],
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    type: 'ai:voice', label: 'Voice (XTTSv2)', description: 'Generate voice with XTTSv2',
    category: 'ai', color: 'purple',
    defaultConfig: { cloneId: '', text: '', speed: 1.0 },
    defaultPorts: [
      { id: 'in-1', label: 'Text', direction: 'input' },
      { id: 'out-1', label: 'Audio', direction: 'output' },
    ],
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
  },
  {
    type: 'ai:video', label: 'Video Compose', description: 'Compose video from assets',
    category: 'ai', color: 'purple',
    defaultConfig: { templateId: '', duration: 30, resolution: '1080p' },
    defaultPorts: [
      { id: 'in-1', label: 'Assets', direction: 'input' },
      { id: 'out-1', label: 'Video', direction: 'output' },
    ],
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.263a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  },
  // Transform
  {
    type: 'transform:resize', label: 'Resize', description: 'Resize media to dimensions',
    category: 'transform', color: 'amber',
    defaultConfig: { width: 1080, height: 1080, fit: 'cover' },
    defaultPorts: [
      { id: 'in-1', label: 'Media', direction: 'input' },
      { id: 'out-1', label: 'Resized', direction: 'output' },
    ],
    icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
  },
  {
    type: 'transform:caption', label: 'Caption Overlay', description: 'Overlay text on media',
    category: 'transform', color: 'amber',
    defaultConfig: { text: '', position: 'bottom', fontSize: 32, color: '#ffffff' },
    defaultPorts: [
      { id: 'in-1', label: 'Media', direction: 'input' },
      { id: 'out-1', label: 'Output', direction: 'output' },
    ],
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
  },
  {
    type: 'transform:watermark', label: 'Watermark', description: 'Add watermark to media',
    category: 'transform', color: 'amber',
    defaultConfig: { imageUrl: '', position: 'bottom-right', opacity: 0.8 },
    defaultPorts: [
      { id: 'in-1', label: 'Media', direction: 'input' },
      { id: 'out-1', label: 'Output', direction: 'output' },
    ],
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    type: 'transform:platform-optimize', label: 'Platform Optimize', description: 'Optimize for platform',
    category: 'transform', color: 'amber',
    defaultConfig: { platform: 'instagram' },
    defaultPorts: [
      { id: 'in-1', label: 'Content', direction: 'input' },
      { id: 'out-1', label: 'Optimized', direction: 'output' },
    ],
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
  // Publish
  {
    type: 'publish:instagram', label: 'Instagram', description: 'Publish to Instagram',
    category: 'publish', color: 'pink',
    defaultConfig: { accountId: '', caption: '', hashtags: [] },
    defaultPorts: [{ id: 'in-1', label: 'Content', direction: 'input' }],
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    type: 'publish:tiktok', label: 'TikTok', description: 'Publish to TikTok',
    category: 'publish', color: 'pink',
    defaultConfig: { accountId: '', caption: '', hashtags: [] },
    defaultPorts: [{ id: 'in-1', label: 'Content', direction: 'input' }],
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    type: 'publish:linkedin', label: 'LinkedIn', description: 'Publish to LinkedIn',
    category: 'publish', color: 'pink',
    defaultConfig: { accountId: '', caption: '', hashtags: [] },
    defaultPorts: [{ id: 'in-1', label: 'Content', direction: 'input' }],
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    type: 'publish:twitter', label: 'Twitter/X', description: 'Publish to Twitter/X',
    category: 'publish', color: 'pink',
    defaultConfig: { accountId: '', caption: '', hashtags: [] },
    defaultPorts: [{ id: 'in-1', label: 'Content', direction: 'input' }],
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    type: 'publish:facebook', label: 'Facebook', description: 'Publish to Facebook',
    category: 'publish', color: 'pink',
    defaultConfig: { accountId: '', caption: '', hashtags: [] },
    defaultPorts: [{ id: 'in-1', label: 'Content', direction: 'input' }],
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    type: 'publish:youtube', label: 'YouTube', description: 'Upload to YouTube',
    category: 'publish', color: 'pink',
    defaultConfig: { accountId: '', caption: '', hashtags: [] },
    defaultPorts: [{ id: 'in-1', label: 'Video', direction: 'input' }],
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.263a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  },
  // Logic
  {
    type: 'logic:if-else', label: 'If / Else', description: 'Branch on engagement threshold',
    category: 'logic', color: 'emerald',
    defaultConfig: { metric: 'likes', operator: '>', threshold: 100 },
    defaultPorts: [
      { id: 'in-1',  label: 'Input', direction: 'input'  },
      { id: 'out-true',  label: 'True',  direction: 'output' },
      { id: 'out-false', label: 'False', direction: 'output' },
    ],
    icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    type: 'logic:split', label: 'A/B Split', description: 'Split traffic for A/B testing',
    category: 'logic', color: 'emerald',
    defaultConfig: { variants: 2, distribution: [50, 50] },
    defaultPorts: [
      { id: 'in-1',  label: 'Input', direction: 'input'  },
      { id: 'out-a', label: 'A',     direction: 'output' },
      { id: 'out-b', label: 'B',     direction: 'output' },
    ],
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  {
    type: 'logic:delay', label: 'Delay', description: 'Wait before next step',
    category: 'logic', color: 'emerald',
    defaultConfig: { duration: 1, unit: 'hours' },
    defaultPorts: [
      { id: 'in-1',  label: 'Input',  direction: 'input'  },
      { id: 'out-1', label: 'Output', direction: 'output' },
    ],
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    type: 'logic:loop', label: 'Loop', description: 'Iterate over a collection',
    category: 'logic', color: 'emerald',
    defaultConfig: { maxIterations: 10, condition: 'items.length > 0' },
    defaultPorts: [
      { id: 'in-1',  label: 'Collection', direction: 'input'  },
      { id: 'out-1', label: 'Item',        direction: 'output' },
      { id: 'out-done', label: 'Done',     direction: 'output' },
    ],
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
]

// ── COLOUR MAP ────────────────────────────────────────────────────────────────

const COLOR_CLASSES: Record<string, { bg: string; border: string; badge: string; dot: string }> = {
  blue:    { bg: 'bg-blue-900/40',    border: 'border-blue-500/50',    badge: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-400'    },
  purple:  { bg: 'bg-purple-900/40',  border: 'border-purple-500/50',  badge: 'bg-purple-500/20 text-purple-300',  dot: 'bg-purple-400'  },
  amber:   { bg: 'bg-amber-900/40',   border: 'border-amber-500/50',   badge: 'bg-amber-500/20 text-amber-300',   dot: 'bg-amber-400'   },
  pink:    { bg: 'bg-pink-900/40',    border: 'border-pink-500/50',    badge: 'bg-pink-500/20 text-pink-300',    dot: 'bg-pink-400'    },
  emerald: { bg: 'bg-emerald-900/40', border: 'border-emerald-500/50', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-400' },
}

// ── SAMPLE WORKFLOW LIST ──────────────────────────────────────────────────────

const MOCK_WORKFLOWS: Workflow[] = [
  SAMPLE_WORKFLOW,
  {
    ...SAMPLE_WORKFLOW,
    id: 'wf-002',
    name: 'Daily TikTok Clip',
    description: 'Every day at 6pm, generate a 30s TikTok from top event photos.',
    status: 'paused',
    runCount: 5,
    lastRun: '2026-03-15T18:00:00Z',
    nextRun: undefined,
    nodes: SAMPLE_WORKFLOW.nodes.slice(0, 3),
    edges: SAMPLE_WORKFLOW.edges.slice(0, 2),
  },
  {
    ...SAMPLE_WORKFLOW,
    id: 'wf-003',
    name: 'New Event Announcement',
    description: 'Webhook fires when a new event is created. Posts to all platforms instantly.',
    status: 'draft',
    runCount: 0,
    lastRun: undefined,
    nextRun: undefined,
    nodes: SAMPLE_WORKFLOW.nodes.slice(0, 2),
    edges: [],
  },
]

// ── HELPERS ───────────────────────────────────────────────────────────────────

function snap(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE
}

function paletteItemForNode(node: WorkflowNode): NodePaletteItem | undefined {
  return PALETTE_ITEMS.find((p) => p.type === node.type)
}

function categoryLabel(cat: NodeCategory): string {
  return {
    trigger:   'Triggers',
    ai:        'AI Generation',
    transform: 'Transform',
    publish:   'Publish',
    logic:     'Logic',
  }[cat]
}

const ALL_CATEGORIES: NodeCategory[] = ['trigger', 'ai', 'transform', 'publish', 'logic']

function makeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function makeEdgeId(): string {
  return `edge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// Port pixel position relative to canvas (absolute)
function portPosition(
  node: WorkflowNode,
  portId: string,
): { x: number; y: number } | null {
  const port = node.ports.find((p) => p.id === portId)
  if (!port) return null
  const outputs = node.ports.filter((p) => p.direction === 'output')
  const inputs  = node.ports.filter((p) => p.direction === 'input')

  if (port.direction === 'output') {
    const idx = outputs.indexOf(port)
    const spacing = NODE_WIDTH / (outputs.length + 1)
    return { x: node.x + spacing * (idx + 1), y: node.y + NODE_HEIGHT }
  } else {
    const idx = inputs.indexOf(port)
    const spacing = NODE_WIDTH / (inputs.length + 1)
    return { x: node.x + spacing * (idx + 1), y: node.y }
  }
}

function bezierPath(sx: number, sy: number, tx: number, ty: number): string {
  const midY = (sy + ty) / 2
  return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`
}

// ── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const cls = {
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    draft:  'bg-slate-700 text-slate-400 border-slate-600',
  }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-400 animate-pulse' : status === 'paused' ? 'bg-amber-400' : 'bg-slate-500'}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ── WORKFLOW CARD ─────────────────────────────────────────────────────────────

function WorkflowCard({
  workflow,
  onOpen,
  onToggle,
}: {
  workflow: Workflow
  onOpen: () => void
  onToggle: () => void
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-purple-500/40 hover:bg-slate-800 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate mb-1">{workflow.name}</h3>
          <p className="text-slate-400 text-xs line-clamp-2">{workflow.description}</p>
        </div>
        <StatusBadge status={workflow.status} />
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <span>{workflow.nodes.length} nodes</span>
        <span>{workflow.edges.length} connections</span>
        <span>{workflow.runCount} runs</span>
        {workflow.lastRun && (
          <span>Last: {new Date(workflow.lastRun).toLocaleDateString()}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Open Editor
        </button>
        <button
          onClick={onToggle}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors border ${
            workflow.status === 'active'
              ? 'border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
              : 'border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10'
          }`}
        >
          {workflow.status === 'active' ? 'Pause' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

// ── CANVAS NODE ───────────────────────────────────────────────────────────────

function CanvasNode({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onPortMouseDown,
  connectingFromPort,
}: {
  node: WorkflowNode
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
  onPortMouseDown: (portId: string, direction: 'input' | 'output') => void
  connectingFromPort: { nodeId: string; portId: string } | null
}) {
  const palette = paletteItemForNode(node)
  const color   = palette?.color ?? 'purple'
  const classes = COLOR_CLASSES[color]

  const inputs  = node.ports.filter((p) => p.direction === 'input')
  const outputs = node.ports.filter((p) => p.direction === 'output')

  return (
    <div
      style={{ left: node.x, top: node.y, width: NODE_WIDTH, minHeight: NODE_HEIGHT, position: 'absolute' }}
      className={`rounded-xl border ${classes.border} ${classes.bg} backdrop-blur-sm cursor-pointer select-none transition-all
        ${isSelected ? 'ring-2 ring-purple-400/60 ring-offset-1 ring-offset-slate-900 shadow-lg shadow-purple-500/20' : 'hover:ring-1 hover:ring-slate-500/60'}`}
      onMouseDown={(e) => {
        e.stopPropagation()
        onSelect()
        onDragStart(e)
      }}
    >
      {/* Input ports */}
      {inputs.length > 0 && (
        <div className="absolute -top-2 left-0 right-0 flex justify-around px-4">
          {inputs.map((port) => (
            <div
              key={port.id}
              title={port.label}
              className="w-3.5 h-3.5 rounded-full bg-slate-700 border-2 border-slate-500 hover:border-purple-400 hover:bg-purple-600/30 cursor-crosshair transition-colors z-10"
              onMouseUp={(e) => {
                e.stopPropagation()
                onPortMouseDown(port.id, 'input')
              }}
            />
          ))}
        </div>
      )}

      {/* Node body */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${classes.badge}`}>
            {palette && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={palette.icon} />
              </svg>
            )}
          </div>
          <span className="text-white text-xs font-semibold truncate">{node.label}</span>
        </div>
        <span className={`inline-block text-xs px-1.5 py-0.5 rounded ${classes.badge} font-medium`}>
          {node.type.split(':')[0]}
        </span>
      </div>

      {/* Output ports */}
      {outputs.length > 0 && (
        <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-4">
          {outputs.map((port) => (
            <div
              key={port.id}
              title={port.label}
              className={`w-3.5 h-3.5 rounded-full border-2 cursor-crosshair transition-colors z-10
                ${connectingFromPort?.nodeId === node.id && connectingFromPort.portId === port.id
                  ? 'bg-purple-500 border-purple-300'
                  : 'bg-slate-700 border-slate-500 hover:border-purple-400 hover:bg-purple-600/30'
                }`}
              onMouseDown={(e) => {
                e.stopPropagation()
                onPortMouseDown(port.id, 'output')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── CONFIG PANEL ──────────────────────────────────────────────────────────────

function ConfigPanel({
  node,
  onClose,
  onUpdate,
  onDelete,
}: {
  node: WorkflowNode
  onClose: () => void
  onUpdate: (updates: Partial<WorkflowNode>) => void
  onDelete: () => void
}) {
  const palette = paletteItemForNode(node)
  const color   = palette?.color ?? 'purple'
  const classes = COLOR_CLASSES[color]

  return (
    <div className="w-80 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className={`px-4 py-3 border-b border-slate-800 flex items-center justify-between ${classes.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${classes.badge}`}>
            {palette && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={palette.icon} />
              </svg>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{node.label}</p>
            <p className="text-slate-400 text-xs">{node.type}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Node label */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Node Label</label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Config fields based on type */}
        {node.type === 'trigger:schedule' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Cron Expression</label>
              <input
                type="text"
                value={(node.config as { cron?: string }).cron ?? ''}
                onChange={(e) => onUpdate({ config: { ...node.config, cron: e.target.value } })}
                placeholder="0 9 * * 1"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">e.g. 0 9 * * 1 = every Monday 9am</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Timezone</label>
              <select
                value={(node.config as { timezone?: string }).timezone ?? 'UTC'}
                onChange={(e) => onUpdate({ config: { ...node.config, timezone: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option>UTC</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
              </select>
            </div>
          </>
        )}

        {node.type === 'trigger:webhook' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Webhook URL</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value="https://api.socialengine.ai/hooks/xxx"
                  className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-xs font-mono focus:outline-none"
                />
                <button className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {node.type === 'ai:text' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
              <select
                value={(node.config as { model?: string }).model ?? 'gemini-pro'}
                onChange={(e) => onUpdate({ config: { ...node.config, model: e.target.value as 'gemini-pro' | 'gemini-flash' } })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-flash">Gemini Flash (faster)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Prompt</label>
              <textarea
                rows={4}
                value={(node.config as { prompt?: string }).prompt ?? ''}
                onChange={(e) => onUpdate({ config: { ...node.config, prompt: e.target.value } })}
                placeholder="Write a social post about {{input}}..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">Use {'{{variable}}'} for dynamic values</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tone</label>
              <select
                value={(node.config as { tone?: string }).tone ?? 'professional'}
                onChange={(e) => onUpdate({ config: { ...node.config, tone: e.target.value } as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option>professional</option>
                <option>casual</option>
                <option>enthusiastic</option>
                <option>informative</option>
                <option>humorous</option>
              </select>
            </div>
          </>
        )}

        {node.type === 'ai:image' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
              <select
                value={(node.config as { model?: string }).model ?? 'flux-schnell'}
                onChange={(e) => onUpdate({ config: { ...node.config, model: e.target.value as 'flux-schnell' | 'flux-dev' } })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="flux-schnell">FLUX Schnell (fast)</option>
                <option value="flux-dev">FLUX Dev (quality)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Image Prompt</label>
              <textarea
                rows={3}
                value={(node.config as { prompt?: string }).prompt ?? ''}
                onChange={(e) => onUpdate({ config: { ...node.config, prompt: e.target.value } })}
                placeholder="A vibrant concert photo, dramatic lighting..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Width</label>
                <input
                  type="number"
                  value={(node.config as { width?: number }).width ?? 1024}
                  onChange={(e) => onUpdate({ config: { ...node.config, width: +e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Height</label>
                <input
                  type="number"
                  value={(node.config as { height?: number }).height ?? 1024}
                  onChange={(e) => onUpdate({ config: { ...node.config, height: +e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </>
        )}

        {(node.type.startsWith('publish:')) && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Account</label>
              <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                <option>Connect account...</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Caption Template</label>
              <textarea
                rows={3}
                value={(node.config as { caption?: string }).caption ?? ''}
                onChange={(e) => onUpdate({ config: { ...node.config, caption: e.target.value } })}
                placeholder="{{text}} #events"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </>
        )}

        {node.type === 'logic:if-else' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Metric</label>
              <select
                value={(node.config as { metric?: string }).metric ?? 'likes'}
                onChange={(e) => onUpdate({ config: { ...node.config, metric: e.target.value as 'likes' | 'comments' | 'shares' | 'views' } })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option>likes</option>
                <option>comments</option>
                <option>shares</option>
                <option>views</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Operator</label>
                <select
                  value={(node.config as { operator?: string }).operator ?? '>'}
                  onChange={(e) => onUpdate({ config: { ...node.config, operator: e.target.value as '>' | '<' | '>=' | '<=' } })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value=">">{'>'}</option>
                  <option value="<">{'<'}</option>
                  <option value=">=">{'>='}</option>
                  <option value="<=">{'<='}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Threshold</label>
                <input
                  type="number"
                  value={(node.config as { threshold?: number }).threshold ?? 100}
                  onChange={(e) => onUpdate({ config: { ...node.config, threshold: +e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </>
        )}

        {node.type === 'logic:delay' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration</label>
              <input
                type="number"
                value={(node.config as { duration?: number }).duration ?? 1}
                onChange={(e) => onUpdate({ config: { ...node.config, duration: +e.target.value } })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Unit</label>
              <select
                value={(node.config as { unit?: string }).unit ?? 'hours'}
                onChange={(e) => onUpdate({ config: { ...node.config, unit: e.target.value as 'seconds' | 'minutes' | 'hours' | 'days' } })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option>seconds</option>
                <option>minutes</option>
                <option>hours</option>
                <option>days</option>
              </select>
            </div>
          </div>
        )}

        {/* Generic — show JSON config for unhandled types */}
        {!['trigger:schedule', 'trigger:webhook', 'ai:text', 'ai:image', 'logic:if-else', 'logic:delay'].includes(node.type)
          && !node.type.startsWith('publish:') && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Configuration (JSON)</label>
            <textarea
              rows={5}
              value={JSON.stringify(node.config, null, 2)}
              readOnly
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-xs font-mono focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Done
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 text-red-400 hover:text-red-300 text-xs font-medium rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

// ── CANVAS EDITOR ─────────────────────────────────────────────────────────────

function WorkflowCanvas({
  workflow,
  onBack,
  onSave,
}: {
  workflow: Workflow
  onBack: () => void
  onSave: (wf: Workflow) => void
}) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow.nodes)
  const [edges, setEdges] = useState<WorkflowEdge[]>(workflow.edges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(true)
  const [activeCategory, setActiveCategory] = useState<NodeCategory>('trigger')
  const [status, setStatus] = useState<WorkflowStatus>(workflow.status)
  const [saved, setSaved] = useState(false)

  // Dragging a node
  const draggingNodeRef = useRef<{ id: string; startX: number; startY: number; mouseX: number; mouseY: number } | null>(null)
  // Drawing a connection
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; portId: string } | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null

  // ── NODE DRAG ──────────────────────────────────────────────────────────────

  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    draggingNodeRef.current = { id: nodeId, startX: node.x, startY: node.y, mouseX: e.clientX, mouseY: e.clientY }
  }, [nodes])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    if (!draggingNodeRef.current) return
    const { id, startX, startY, mouseX, mouseY } = draggingNodeRef.current
    const dx = e.clientX - mouseX
    const dy = e.clientY - mouseY
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, x: snap(startX + dx), y: snap(startY + dy) }
          : n,
      ),
    )
  }, [])

  const handleCanvasMouseUp = useCallback(() => {
    draggingNodeRef.current = null
    if (connectingFrom) {
      // If mouseUp happened on canvas (not a port), cancel connection
      setConnectingFrom(null)
    }
  }, [connectingFrom])

  // ── PORT INTERACTION ───────────────────────────────────────────────────────

  const handlePortMouseDown = useCallback((nodeId: string, portId: string, direction: 'input' | 'output') => {
    if (direction === 'output') {
      setConnectingFrom({ nodeId, portId })
    } else if (connectingFrom) {
      // Complete connection
      const sourcePortPos = portPosition(nodes.find((n) => n.id === connectingFrom.nodeId)!, connectingFrom.portId)
      if (!sourcePortPos) { setConnectingFrom(null); return }
      // Prevent self-loops
      if (connectingFrom.nodeId === nodeId) { setConnectingFrom(null); return }
      // Prevent duplicate edges
      const exists = edges.some(
        (e) => e.sourceNodeId === connectingFrom.nodeId && e.sourcePortId === connectingFrom.portId
          && e.targetNodeId === nodeId && e.targetPortId === portId,
      )
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          {
            id: makeEdgeId(),
            sourceNodeId: connectingFrom.nodeId,
            sourcePortId: connectingFrom.portId,
            targetNodeId: nodeId,
            targetPortId: portId,
          },
        ])
      }
      setConnectingFrom(null)
    }
  }, [connectingFrom, edges, nodes])

  // ── DROP NODE FROM PALETTE ─────────────────────────────────────────────────

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('nodeType') as WorkflowNodeType
    if (!type) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = snap(e.clientX - rect.left - NODE_WIDTH / 2)
    const y = snap(e.clientY - rect.top - NODE_HEIGHT / 2)
    const palette = PALETTE_ITEMS.find((p) => p.type === type)
    if (!palette) return

    const newNode: WorkflowNode = {
      id:     makeId(),
      type,
      label:  palette.label,
      x,
      y,
      config: { ...palette.defaultConfig },
      ports:  palette.defaultPorts.map((p) => ({ ...p })),
    }
    setNodes((prev) => [...prev, newNode])
    setSelectedNodeId(newNode.id)
  }, [])

  // ── EDGE DELETE ────────────────────────────────────────────────────────────

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId))
  }, [])

  // ── NODE OPERATIONS ────────────────────────────────────────────────────────

  const updateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))
  }, [])

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id))
    setEdges((prev) => prev.filter((e) => e.sourceNodeId !== id && e.targetNodeId !== id))
    setSelectedNodeId(null)
  }, [])

  // ── SAVE ───────────────────────────────────────────────────────────────────

  const handleSave = () => {
    onSave({ ...workflow, nodes, edges, status, updatedAt: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ── SVG EDGES ──────────────────────────────────────────────────────────────

  const renderEdges = () => {
    return edges.map((edge) => {
      const srcNode = nodes.find((n) => n.id === edge.sourceNodeId)
      const tgtNode = nodes.find((n) => n.id === edge.targetNodeId)
      if (!srcNode || !tgtNode) return null
      const src = portPosition(srcNode, edge.sourcePortId)
      const tgt = portPosition(tgtNode, edge.targetPortId)
      if (!src || !tgt) return null
      return (
        <g key={edge.id} className="group cursor-pointer" onClick={() => deleteEdge(edge.id)}>
          <path
            d={bezierPath(src.x, src.y, tgt.x, tgt.y)}
            fill="none"
            stroke="rgba(139,92,246,0)"
            strokeWidth={12}
            className="group-hover:stroke-red-500/20"
          />
          <path
            d={bezierPath(src.x, src.y, tgt.x, tgt.y)}
            fill="none"
            stroke="rgba(139,92,246,0.5)"
            strokeWidth={2}
            strokeDasharray="none"
            className="group-hover:stroke-red-400 transition-colors"
          />
          <circle cx={tgt.x} cy={tgt.y} r={3} fill="rgb(139,92,246)" className="group-hover:fill-red-400" />
        </g>
      )
    })
  }

  const renderDraftEdge = () => {
    if (!connectingFrom) return null
    const srcNode = nodes.find((n) => n.id === connectingFrom.nodeId)
    if (!srcNode) return null
    const src = portPosition(srcNode, connectingFrom.portId)
    if (!src) return null
    return (
      <path
        d={bezierPath(src.x, src.y, mousePos.x, mousePos.y)}
        fill="none"
        stroke="rgba(139,92,246,0.7)"
        strokeWidth={2}
        strokeDasharray="6 3"
      />
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Workflows
        </button>
        <span className="text-slate-700">|</span>
        <h2 className="text-white font-semibold text-sm">{workflow.name}</h2>
        <StatusBadge status={status} />

        <div className="flex-1" />

        {/* Status toggle */}
        <button
          onClick={() => setStatus((s) => s === 'active' ? 'paused' : 'active')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            status === 'active'
              ? 'border-amber-600/50 text-amber-400 hover:bg-amber-900/20'
              : 'border-emerald-600/50 text-emerald-400 hover:bg-emerald-900/20'
          }`}
        >
          {status === 'active' ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activate
            </>
          )}
        </button>

        {/* Run once */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
          Run Once
        </button>

        {/* Palette toggle */}
        <button
          onClick={() => setPaletteOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {paletteOpen ? 'Hide Palette' : 'Show Palette'}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {saved
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            }
          </svg>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Body: palette + canvas + config panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* Node Palette */}
        {paletteOpen && (
          <div className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
            <div className="px-3 pt-3 pb-2 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Node Palette</p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-col px-2 pt-2 gap-0.5">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    activeCategory === cat
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    { trigger: 'bg-blue-400', ai: 'bg-purple-400', transform: 'bg-amber-400', publish: 'bg-pink-400', logic: 'bg-emerald-400' }[cat]
                  }`} />
                  {categoryLabel(cat)}
                </button>
              ))}
            </div>

            {/* Nodes list */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5">
              {PALETTE_ITEMS.filter((item) => item.category === activeCategory).map((item) => {
                const classes = COLOR_CLASSES[item.color]
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('nodeType', item.type)}
                    className={`flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg border ${classes.border} ${classes.bg} cursor-grab active:cursor-grabbing hover:brightness-110 transition-all`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${classes.badge}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium leading-tight">{item.label}</p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-tight">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-3 py-2 border-t border-slate-800">
              <p className="text-xs text-slate-600">Drag nodes onto canvas</p>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-slate-950 cursor-default"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)`,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onClick={() => setSelectedNodeId(null)}
        >
          {/* SVG layer for edges */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="rgba(139,92,246,0.7)" />
              </marker>
            </defs>
            <g style={{ pointerEvents: 'all' }}>
              {renderEdges()}
              {renderDraftEdge()}
            </g>
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={() => setSelectedNodeId(node.id)}
              onDragStart={(e) => handleNodeDragStart(e, node.id)}
              onPortMouseDown={(portId, direction) => handlePortMouseDown(node.id, portId, direction)}
              connectingFromPort={connectingFrom}
            />
          ))}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">Drop nodes here to build your workflow</p>
                <p className="text-slate-600 text-xs mt-1">Drag from the palette on the left</p>
              </div>
            </div>
          )}

          {/* Connection hint */}
          {connectingFrom && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-purple-600/80 backdrop-blur-sm rounded-full text-white text-xs font-medium pointer-events-none">
              Click an input port to connect — Escape to cancel
            </div>
          )}
        </div>

        {/* Config Panel */}
        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
            onDelete={() => deleteNode(selectedNode.id)}
          />
        )}
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const [workflows, setWorkflows]   = useState<Workflow[]>(MOCK_WORKFLOWS)
  const [activeWorkflow, setActive] = useState<Workflow | null>(null)
  const [showNew, setShowNew]       = useState(false)
  const [newName, setNewName]       = useState('')
  const [newDesc, setNewDesc]       = useState('')

  // Escape key to cancel connection in canvas
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeWorkflow) {
        // Canvas handles its own Escape — nothing needed here
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeWorkflow])

  const handleSave = (updated: Workflow) => {
    setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
    setActive(updated)
  }

  const handleToggle = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === 'active' ? 'paused' : ('active' as WorkflowStatus) }
          : w,
      ),
    )
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    const wf: Workflow = {
      id:          makeId(),
      name:        newName.trim(),
      description: newDesc.trim() || 'New automation workflow',
      status:      'draft',
      nodes:       [],
      edges:       [],
      config:      {},
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      runCount:    0,
    }
    setWorkflows((prev) => [wf, ...prev])
    setNewName('')
    setNewDesc('')
    setShowNew(false)
    setActive(wf)
  }

  // Full-screen canvas mode
  if (activeWorkflow) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
        <WorkflowCanvas
          workflow={activeWorkflow}
          onBack={() => setActive(null)}
          onSave={handleSave}
        />
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Workflows</h1>
          <p className="text-slate-400 text-sm">
            Visual automation pipelines — connect triggers, AI, transforms, and publishers.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-purple-600/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Workflow
        </button>
      </div>

      {/* New workflow dialog */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-4">New Workflow</h3>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Workflow Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g. Daily Instagram Recap"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (optional)</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What does this workflow do?"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNew(false); setNewName(''); setNewDesc('') }}
                className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
              >
                Create & Open Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Workflows', value: workflows.length.toString(), sub: `${workflows.filter((w) => w.status === 'active').length} active` },
          { label: 'Total Runs', value: workflows.reduce((sum, w) => sum + w.runCount, 0).toString(), sub: 'this month' },
          { label: 'Node Types', value: '21', sub: 'trigger, AI, transform, publish, logic' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
            <p className="text-sm font-medium text-slate-300">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Workflow grid */}
      {workflows.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No workflows yet</p>
          <p className="text-slate-600 text-sm mt-1">Create your first automation pipeline above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onOpen={() => setActive(wf)}
              onToggle={() => handleToggle(wf.id)}
            />
          ))}
        </div>
      )}

      {/* Node type reference */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-sm font-semibold text-white">Available Node Types</h2>
        </div>
        <div className="p-5 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {ALL_CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                { trigger: 'text-blue-400', ai: 'text-purple-400', transform: 'text-amber-400', publish: 'text-pink-400', logic: 'text-emerald-400' }[cat]
              }`}>
                {categoryLabel(cat)}
              </p>
              <div className="space-y-1">
                {PALETTE_ITEMS.filter((p) => p.category === cat).map((item) => (
                  <p key={item.type} className="text-slate-400 text-xs">{item.label}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
