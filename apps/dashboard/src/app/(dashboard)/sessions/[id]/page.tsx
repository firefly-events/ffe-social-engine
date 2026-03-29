'use client'

import { useState, useRef, useCallback, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ALL_SESSIONS, flattenNodes } from '@/lib/session-mock-data'
import type { ContentNode, NodeStatus } from '@/lib/session-types'

// ─── Constants ─────────────────────────────────────────────────────────────────
const NODE_W = 200
const NODE_H = 110
const H_GAP = 60   // horizontal gap between depths
const V_GAP = 24   // vertical gap between sibling tracks

const PLATFORM_COLORS: Record<string, { dot: string; ring: string; badge: string }> = {
  Instagram: { dot: 'bg-gradient-to-br from-purple-500 to-pink-500', ring: 'ring-purple-400', badge: 'bg-purple-900/40 text-purple-300' },
  Twitter:   { dot: 'bg-gradient-to-br from-sky-400 to-blue-500',    ring: 'ring-sky-400',    badge: 'bg-sky-900/40 text-sky-300' },
  LinkedIn:  { dot: 'bg-blue-600',                                   ring: 'ring-blue-500',   badge: 'bg-blue-900/40 text-blue-300' },
  TikTok:    { dot: 'bg-slate-800',                                  ring: 'ring-slate-500',  badge: 'bg-slate-700 text-slate-300' },
}

const STATUS_CONFIG: Record<NodeStatus, { bg: string; text: string; label: string }> = {
  draft:    { bg: 'bg-slate-700',       text: 'text-slate-300',  label: 'Draft' },
  approved: { bg: 'bg-emerald-900/50',  text: 'text-emerald-400', label: 'Approved' },
  posted:   { bg: 'bg-purple-900/50',   text: 'text-purple-300', label: 'Posted' },
  archived: { bg: 'bg-slate-800',       text: 'text-slate-500',  label: 'Archived' },
}

// ─── Layout engine ─────────────────────────────────────────────────────────────
interface LayoutNode {
  node: ContentNode
  x: number // center-x of the node card
  y: number // center-y of the node card
  depth: number
  track: number // vertical track index (0 = trunk)
}

function buildLayout(root: ContentNode): LayoutNode[] {
  const result: LayoutNode[] = []
  let nextTrack = 0

  // Assign tracks bottom-up so trunk is always track=0
  function assignTracks(node: ContentNode): number {
    if (node.children.length === 0) {
      const t = nextTrack++
      return t
    }

    const trunkChild = node.children.find((c) => c.isTrunk)
    const branchChildren = node.children.filter((c) => !c.isTrunk)

    const childTracks: number[] = []

    // Branches first (above trunk) — odd indices above, even below for aesthetics
    const aboveBranches = branchChildren.filter((_, i) => i % 2 === 0)
    const belowBranches = branchChildren.filter((_, i) => i % 2 !== 0)

    aboveBranches.forEach((child) => {
      childTracks.push(assignTracks(child))
    })

    // Trunk child in the middle
    const trunkTrack = trunkChild ? assignTracks(trunkChild) : nextTrack++
    childTracks.push(trunkTrack)

    belowBranches.forEach((child) => {
      childTracks.push(assignTracks(child))
    })

    return trunkTrack
  }

  const rootTrack = assignTracks(root)

  function place(node: ContentNode, depth: number, track: number) {
    const x = depth * (NODE_W + H_GAP) + NODE_W / 2
    const y = track * (NODE_H + V_GAP) + NODE_H / 2
    result.push({ node, x, y, depth, track })

    const trunkChild = node.children.find((c) => c.isTrunk)
    const branchChildren = node.children.filter((c) => !c.isTrunk)

    // Re-derive track assignments for placement — use stored result
    node.children.forEach((child) => {
      const entry = result.find((r) => r.node.id === child.id)
      // Not placed yet — recurse
    })

    // We need to do a second walk since tracks were already assigned
    const trunkChildTrack = trunkChild
      ? (result.find((r) => r.node.id === trunkChild.id)?.track ?? track)
      : track

    if (trunkChild && !result.find((r) => r.node.id === trunkChild.id)) {
      place(trunkChild, depth + 1, trunkChildTrack)
    }

    const aboveBranches = branchChildren.filter((_, i) => i % 2 === 0)
    const belowBranches = branchChildren.filter((_, i) => i % 2 !== 0)

    aboveBranches.forEach((child) => {
      if (!result.find((r) => r.node.id === child.id)) {
        // assign a new unique track above
        const t = Math.min(...result.map((r) => r.track)) - 1
        place(child, depth + 1, t)
      }
    })
    belowBranches.forEach((child) => {
      if (!result.find((r) => r.node.id === child.id)) {
        const t = Math.max(...result.map((r) => r.track)) + 1
        place(child, depth + 1, t)
      }
    })
  }

  // Simpler clean placement pass
  result.length = 0
  const trackMap = new Map<string, number>()
  let trackCounter = 0

  function simplePlaceTrack(node: ContentNode): number {
    const trunkChild = node.children.find((c) => c.isTrunk)
    const branchChildren = node.children.filter((c) => !c.isTrunk)

    if (node.children.length === 0) {
      const t = trackCounter++
      trackMap.set(node.id, t)
      return t
    }

    // Place above-branches first
    const aboveBranches = branchChildren.filter((_, i) => i % 2 === 0)
    aboveBranches.forEach((child) => simplePlaceTrack(child))

    // Place trunk child (inherits parent track)
    const trunkTrack = trunkChild ? simplePlaceTrack(trunkChild) : trackCounter++

    // Place below-branches after
    const belowBranches = branchChildren.filter((_, i) => i % 2 !== 0)
    belowBranches.forEach((child) => simplePlaceTrack(child))

    trackMap.set(node.id, trunkTrack)
    return trunkTrack
  }

  simplePlaceTrack(root)

  // Normalize so minimum track = 0
  const minTrack = Math.min(...Array.from(trackMap.values()))

  function buildResult(node: ContentNode, depth: number) {
    const track = (trackMap.get(node.id) ?? 0) - minTrack
    const x = depth * (NODE_W + H_GAP) + NODE_W / 2
    const y = track * (NODE_H + V_GAP) + NODE_H / 2
    result.push({ node, x, y, depth, track })
    node.children.forEach((child) => buildResult(child, depth + 1))
  }

  buildResult(root, 0)
  return result
}

// ─── SVG edge helpers ──────────────────────────────────────────────────────────
function EdgePath({
  from,
  to,
  isTrunk,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  isTrunk: boolean
}) {
  // Cubic bezier: horizontal entry/exit
  const cpx1 = from.x + (to.x - from.x) * 0.5
  const cpx2 = from.x + (to.x - from.x) * 0.5
  const d = `M${from.x},${from.y} C${cpx1},${from.y} ${cpx2},${to.y} ${to.x},${to.y}`
  return (
    <path
      d={d}
      fill="none"
      stroke={isTrunk ? '#6366f1' : '#475569'}
      strokeWidth={isTrunk ? 2 : 1.5}
      strokeDasharray={isTrunk ? undefined : '5,3'}
      strokeLinecap="round"
    />
  )
}

// ─── Node card ─────────────────────────────────────────────────────────────────
function NodeCard({
  layoutNode,
  selected,
  comparing,
  onSelect,
  onFork,
  onCompareToggle,
  compareMode,
}: {
  layoutNode: LayoutNode
  selected: boolean
  comparing: boolean
  onSelect: (node: ContentNode) => void
  onFork: (node: ContentNode) => void
  onCompareToggle: (node: ContentNode) => void
  compareMode: boolean
}) {
  const { node } = layoutNode
  const pc = PLATFORM_COLORS[node.metadata.platform] ?? {
    dot: 'bg-slate-600',
    ring: 'ring-slate-500',
    badge: 'bg-slate-700 text-slate-300',
  }
  const sc = STATUS_CONFIG[node.status]

  const x = layoutNode.x - NODE_W / 2
  const y = layoutNode.y - NODE_H / 2

  const formattedDate = node.metadata.generatedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <foreignObject x={x} y={y} width={NODE_W} height={NODE_H} overflow="visible">
      <div
        // @ts-expect-error — xmlns required for foreignObject in SVG
        xmlns="http://www.w3.org/1999/xhtml"
        onClick={() => onSelect(node)}
        className={`w-full h-full bg-slate-800 border rounded-xl cursor-pointer transition-all duration-150 flex flex-col p-3 gap-1.5 select-none
          ${selected ? `border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20` : comparing ? `border-sky-500 ring-2 ring-sky-500/40` : 'border-slate-700 hover:border-slate-500'}
        `}
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pc.dot}`} />
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${pc.badge}`}>
              {node.metadata.platform}
            </span>
          </div>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${sc.bg} ${sc.text}`}>
            {sc.label}
          </span>
        </div>

        {/* Content preview */}
        <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 flex-1">
          {node.content.text}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
          <span className="text-slate-500 text-xs">{node.metadata.aiModel}</span>
          <span className="text-slate-600 text-xs">{formattedDate}</span>
        </div>
      </div>
    </foreignObject>
  )
}

// ─── Content preview panel ─────────────────────────────────────────────────────
function PreviewPanel({
  node,
  onFork,
  onClose,
  onCompare,
  compareCount,
}: {
  node: ContentNode
  onFork: (node: ContentNode) => void
  onClose: () => void
  onCompare: (node: ContentNode) => void
  compareCount: number
}) {
  const pc = PLATFORM_COLORS[node.metadata.platform] ?? {
    dot: 'bg-slate-600',
    ring: 'ring-slate-500',
    badge: 'bg-slate-700 text-slate-300',
  }
  const sc = STATUS_CONFIG[node.status]

  return (
    <div className="w-80 flex-shrink-0 bg-slate-900 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <span className="text-sm font-semibold text-slate-200">Version preview</span>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          aria-label="Close preview"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Platform + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded ${pc.badge}`}>
            <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
            {node.metadata.platform}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${sc.bg} ${sc.text}`}>
            {sc.label}
          </span>
          {node.isTrunk && (
            <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-900/50 text-indigo-300">
              Main branch
            </span>
          )}
        </div>

        {/* Full text */}
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Content</p>
          <div className="bg-slate-800 rounded-lg p-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap border border-slate-700">
            {node.content.text}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Metadata</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">AI Model</span>
              <span className="text-slate-300 font-medium">{node.metadata.aiModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Generated</span>
              <span className="text-slate-300">
                {node.metadata.generatedAt.toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Prompt</span>
              <p className="text-slate-400 mt-1 bg-slate-800/60 rounded p-2 leading-relaxed">
                {node.metadata.prompt}
              </p>
            </div>
          </div>
        </div>

        {/* Engagement placeholder */}
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
            Predicted engagement
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Reach', value: '4.2K' },
              { label: 'Likes', value: '~184' },
              { label: 'Shares', value: '~32' },
            ].map((m) => (
              <div key={m.label} className="bg-slate-800 rounded-lg p-2 text-center border border-slate-700/60">
                <div className="text-sm font-bold text-slate-200">{m.value}</div>
                <div className="text-xs text-slate-500">{m.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-1.5 text-center">AI predictions — not real data</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-slate-700 space-y-2">
        <button
          onClick={() => onFork(node)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Fork from here
        </button>
        <button
          onClick={() => onCompare(node)}
          disabled={compareCount >= 2}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 border text-sm font-medium rounded-lg transition-colors
            ${compareCount >= 2
              ? 'border-slate-700 text-slate-600 cursor-not-allowed'
              : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Add to compare {compareCount > 0 ? `(${compareCount}/2)` : ''}
        </button>
        {!node.isTrunk && (
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-emerald-700/50 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-900/30 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Merge to main
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Fork dialog ───────────────────────────────────────────────────────────────
const FORK_CHANGE_TYPES = [
  {
    id: 'prompt' as const,
    label: 'Different prompt',
    description: 'Rewrite with new instructions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'model' as const,
    label: 'Different AI model',
    description: 'Try GPT, Claude, Gemini...',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'platform' as const,
    label: 'Different platform',
    description: 'Adapt for Instagram, Twitter...',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'style' as const,
    label: 'Different tone/style',
    description: 'Professional, casual, witty...',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
]

const MODEL_OPTIONS = ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'GPT-4o mini']
const PLATFORM_OPTIONS = ['Instagram', 'Twitter', 'LinkedIn', 'TikTok']
const STYLE_OPTIONS = ['Professional', 'Casual & friendly', 'Witty & humorous', 'Bold & direct', 'Inspirational']

function ForkDialog({
  sourceNode,
  onClose,
}: {
  sourceNode: ContentNode
  onClose: () => void
}) {
  const [changeType, setChangeType] = useState<'prompt' | 'model' | 'platform' | 'style'>('prompt')
  const [value, setValue] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<string | null>(null)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      // Simulated fork generation
      const variations: Record<string, string> = {
        prompt: `${sourceNode.content.text.split('.')[0]}. ${value || 'New angle applied.'}`,
        model: `[Generated by ${value || MODEL_OPTIONS[1]}] ${sourceNode.content.text}`,
        platform: `Adapted for ${value || 'Twitter'}: ${sourceNode.content.text.slice(0, 120)}...`,
        style: `[${value || 'Casual'} tone] ${sourceNode.content.text.toLowerCase().replace(/\./g, '!')}`,
      }
      setGenerated(variations[changeType] ?? sourceNode.content.text)
      setGenerating(false)
    }, 1400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Fork this version</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore a variation without losing the original</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Original */}
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Original</p>
            <div className="bg-slate-800 rounded-lg p-3 text-slate-300 text-sm leading-relaxed border border-slate-700 line-clamp-3">
              {sourceNode.content.text}
            </div>
          </div>

          {/* Change type selector */}
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">What to change</p>
            <div className="grid grid-cols-2 gap-2">
              {FORK_CHANGE_TYPES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => { setChangeType(ct.id); setValue(''); setGenerated(null) }}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    changeType === ct.id
                      ? 'border-purple-500 bg-purple-900/30 text-slate-100'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className={changeType === ct.id ? 'text-purple-400 mt-0.5' : 'text-slate-600 mt-0.5'}>
                    {ct.icon}
                  </span>
                  <span>
                    <span className="block text-xs font-semibold">{ct.label}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{ct.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Value input */}
          <div>
            {changeType === 'prompt' && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">New instructions</label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. Use a POV format, add urgency, target Gen Z..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            )}
            {changeType === 'model' && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">AI Model</label>
                <div className="grid grid-cols-2 gap-2">
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setValue(m)}
                      className={`px-3 py-2 rounded-lg text-sm border text-left transition-all ${
                        value === m
                          ? 'border-purple-500 bg-purple-900/30 text-purple-200'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {changeType === 'platform' && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Target platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORM_OPTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setValue(p)}
                      className={`px-3 py-2 rounded-lg text-sm border text-left transition-all ${
                        value === p
                          ? 'border-purple-500 bg-purple-900/30 text-purple-200'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {changeType === 'style' && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Tone / style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setValue(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        value === s
                          ? 'border-purple-500 bg-purple-900/40 text-purple-200'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Generated result */}
          {generated && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                Generated variation
              </p>
              <div className="bg-slate-800 rounded-lg p-3 text-slate-200 text-sm leading-relaxed border border-emerald-700/40 relative">
                <span className="absolute -top-2 right-3 px-2 py-0.5 bg-emerald-900/60 text-emerald-400 text-xs font-semibold rounded">
                  New
                </span>
                {generated}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          {!generated ? (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {generating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate variation'
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Save branch
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Compare view ──────────────────────────────────────────────────────────────
function CompareView({
  nodeA,
  nodeB,
  onClose,
}: {
  nodeA: ContentNode
  nodeB: ContentNode
  onClose: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)

  const pc = (p: string) => PLATFORM_COLORS[p] ?? { dot: 'bg-slate-600', badge: 'bg-slate-700 text-slate-300' }
  const sc = (s: NodeStatus) => STATUS_CONFIG[s]

  // Simple word-level diff highlight
  function highlightDiff(textA: string, textB: string, own: 'a' | 'b') {
    const wordsA = textA.split(' ')
    const wordsB = textB.split(' ')
    const setA = new Set(wordsA)
    const setB = new Set(wordsB)
    const words = own === 'a' ? wordsA : wordsB
    const other = own === 'a' ? setB : setA

    return words.map((word, i) => {
      const isUnique = !other.has(word)
      return (
        <span
          key={i}
          className={isUnique ? 'bg-purple-500/25 rounded px-0.5' : ''}
        >
          {word}{' '}
        </span>
      )
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Comparing versions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Highlighted words appear in one version only
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 divide-x divide-slate-700">
            {[nodeA, nodeB].map((node, idx) => {
              const isPicked = picked === node.id
              const other = idx === 0 ? nodeB : nodeA
              const pcfg = pc(node.metadata.platform)
              const scfg = sc(node.status)

              return (
                <div key={node.id} className={`p-6 space-y-4 ${isPicked ? 'bg-emerald-950/20' : ''}`}>
                  {/* Platform + status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded ${pcfg.badge}`}>
                      <span className={`w-2 h-2 rounded-full ${pcfg.dot}`} />
                      {node.metadata.platform}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${scfg.bg} ${scfg.text}`}>
                      {scfg.label}
                    </span>
                    {node.isTrunk && (
                      <span className="text-xs px-2 py-1 rounded bg-indigo-900/40 text-indigo-400 font-semibold">
                        Main
                      </span>
                    )}
                  </div>

                  {/* Text with diff */}
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Content</p>
                    <div className="bg-slate-800 rounded-lg p-3 text-slate-200 text-sm leading-relaxed border border-slate-700 min-h-[120px]">
                      {highlightDiff(nodeA.content.text, nodeB.content.text, idx === 0 ? 'a' : 'b')}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
                      <p className="text-slate-500 mb-0.5">AI Model</p>
                      <p className="text-slate-200 font-medium">{node.metadata.aiModel}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60">
                      <p className="text-slate-500 mb-0.5">Generated</p>
                      <p className="text-slate-200 font-medium">
                        {node.metadata.generatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Engagement prediction */}
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Predicted engagement</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Reach', value: idx === 0 ? '4.2K' : '3.8K' },
                        { label: 'Likes', value: idx === 0 ? '~184' : '~210' },
                        { label: 'Shares', value: idx === 0 ? '~32' : '~48' },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="bg-slate-800 rounded-lg p-2 text-center border border-slate-700/60"
                        >
                          <div className="text-sm font-bold text-slate-200">{m.value}</div>
                          <div className="text-xs text-slate-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 text-center">Placeholder predictions</p>
                  </div>

                  {/* Pick button */}
                  <button
                    onClick={() => setPicked(isPicked ? null : node.id)}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      isPicked
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {isPicked ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Selected
                      </span>
                    ) : (
                      'Pick this one'
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 flex-shrink-0">
          <p className="text-xs text-slate-500">
            {picked
              ? 'This version will be promoted to the main branch'
              : 'Select a version to promote it'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!picked}
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Promote to main
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const session = ALL_SESSIONS.find((s) => s.id === id)
  if (!session) notFound()

  const nodeMap = flattenNodes(session)
  const layout = buildLayout(session.rootNode)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [forkNode, setForkNode] = useState<ContentNode | null>(null)
  const [compareNodes, setCompareNodes] = useState<ContentNode[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [zoom, setZoom] = useState(1)

  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) ?? null : null

  const handleCompareToggle = useCallback((node: ContentNode) => {
    setCompareNodes((prev) => {
      const exists = prev.find((n) => n.id === node.id)
      if (exists) return prev.filter((n) => n.id !== node.id)
      if (prev.length >= 2) return prev
      return [...prev, node]
    })
  }, [])

  // Calculate SVG canvas size
  const padding = 40
  const maxX = Math.max(...layout.map((l) => l.x)) + NODE_W / 2 + padding
  const maxY = Math.max(...layout.map((l) => l.y)) + NODE_H / 2 + padding
  const svgW = Math.max(maxX, 600)
  const svgH = Math.max(maxY, 300)

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 md:px-6 py-3 bg-background border-b border-border flex-shrink-0">
        <Link
          href="/sessions"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Sessions
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">{session.title}</h1>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Compare action */}
          {compareNodes.length === 2 && (
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Compare 2 versions
            </button>
          )}
          {compareNodes.length === 1 && (
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
              Select 1 more to compare
            </span>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              aria-label="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="text-xs font-medium text-muted-foreground w-9 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              aria-label="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-1.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors text-xs font-medium"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden bg-slate-950">
        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto cursor-default"
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: svgW,
              height: svgH,
              padding,
            }}
          >
            <svg
              ref={svgRef}
              width={svgW}
              height={svgH}
              className="overflow-visible"
            >
              {/* Grid dots */}
              <defs>
                <pattern id="grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.8" fill="#1e293b" />
                </pattern>
              </defs>
              <rect width={svgW} height={svgH} fill="url(#grid)" />

              {/* Edges */}
              {layout.map((lNode) => {
                if (!lNode.node.parentId) return null
                const parentLayout = layout.find((l) => l.node.id === lNode.node.parentId)
                if (!parentLayout) return null
                return (
                  <EdgePath
                    key={`edge-${lNode.node.id}`}
                    from={{ x: parentLayout.x + NODE_W / 2, y: parentLayout.y }}
                    to={{ x: lNode.x - NODE_W / 2, y: lNode.y }}
                    isTrunk={lNode.node.isTrunk}
                  />
                )
              })}

              {/* Nodes */}
              {layout.map((lNode) => (
                <NodeCard
                  key={lNode.node.id}
                  layoutNode={lNode}
                  selected={selectedNodeId === lNode.node.id}
                  comparing={compareNodes.some((n) => n.id === lNode.node.id)}
                  compareMode={compareNodes.length > 0}
                  onSelect={(node) =>
                    setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
                  }
                  onFork={(node) => setForkNode(node)}
                  onCompareToggle={handleCompareToggle}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Right panel */}
        {selectedNode && (
          <PreviewPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onFork={(node) => { setForkNode(node); setSelectedNodeId(null) }}
            onCompare={handleCompareToggle}
            compareCount={compareNodes.length}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-2 bg-slate-900 border-t border-slate-800 flex-shrink-0">
        <span className="text-xs text-slate-600 font-medium">Legend:</span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg className="w-4 h-3" viewBox="0 0 16 4">
            <line x1="0" y1="2" x2="16" y2="2" stroke="#6366f1" strokeWidth="2" />
          </svg>
          Main branch
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg className="w-4 h-3" viewBox="0 0 16 4">
            <line x1="0" y1="2" x2="16" y2="2" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,2" />
          </svg>
          Fork
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
          Posted
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Approved
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
          Draft
        </span>
        <span className="ml-auto text-xs text-slate-600">
          Click a node to preview · Scroll / zoom to navigate
        </span>
      </div>

      {/* Fork dialog */}
      {forkNode && (
        <ForkDialog sourceNode={forkNode} onClose={() => setForkNode(null)} />
      )}

      {/* Compare view */}
      {showCompare && compareNodes.length === 2 && (
        <CompareView
          nodeA={compareNodes[0]}
          nodeB={compareNodes[1]}
          onClose={() => { setShowCompare(false); setCompareNodes([]) }}
        />
      )}
    </div>
  )
}
