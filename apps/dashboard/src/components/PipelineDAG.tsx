'use client'

/**
 * PipelineDAG.tsx — Visual DAG showing the content generation pipeline.
 *
 * FIR-1317: Shows Text / Image / Video generation branches with real-time
 * status updates via Convex useQuery subscription.
 */

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Badge } from '@/components/ui/badge'

export type PipelineNodeType = 'text' | 'image' | 'video'

export type PipelineStatus = 'pending' | 'processing' | 'success' | 'error'

export interface PipelineDAGProps {
  sessionId: string
  /** Clerk user ID — required for Convex query */
  userId: string
  /** Called when user clicks a branch node. */
  onNodeClick?: (type: PipelineNodeType) => void
}

// ── Status helpers ────────────────────────────────────────────────────────────

function convexStatusToPipeline(status: string | undefined): PipelineStatus {
  if (!status) return 'pending'
  if (status === 'pending') return 'pending'
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'error'
  return 'processing'
}

const STATUS_COLORS: Record<PipelineStatus, string> = {
  pending: 'bg-slate-600 border-slate-500 text-slate-300',
  processing: 'bg-blue-900 border-blue-500 text-blue-300 animate-pulse',
  success: 'bg-emerald-900 border-emerald-500 text-emerald-300',
  error: 'bg-red-900 border-red-500 text-red-300',
}

const STATUS_DOT: Record<PipelineStatus, string> = {
  pending: 'bg-slate-500',
  processing: 'bg-blue-500 animate-pulse',
  success: 'bg-emerald-500',
  error: 'bg-red-500',
}

const STATUS_BADGE_VARIANT = {
  pending: 'gray',
  processing: 'info',
  success: 'success',
  error: 'destructive',
} as const

const BRANCH_LABELS: Record<PipelineNodeType, string> = {
  text: 'Text Generation',
  image: 'Image Generation',
  video: 'Video Generation',
}

const BRANCH_ICONS: Record<PipelineNodeType, string> = {
  text: 'T',
  image: '🖼',
  video: '🎬',
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface NodeCardProps {
  label: string
  icon: string
  status: PipelineStatus
  onClick?: () => void
}

function NodeCard({ label, icon, status, onClick }: NodeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 rounded-xl border px-6 py-4
        transition-all duration-200 cursor-pointer hover:scale-105 w-44 text-center
        ${STATUS_COLORS[status]}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      aria-label={`${label}: ${status}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
        <Badge variant={STATUS_BADGE_VARIANT[status]} className="capitalize text-xs">
          {status}
        </Badge>
      </div>
    </button>
  )
}

// Vertical SVG arrow from top center to bottom center of a vertical connector
function VerticalArrow({ x }: { x: number }) {
  return (
    <svg
      className="absolute"
      style={{ left: x - 1, top: 0 }}
      width={2}
      height={48}
      overflow="visible"
    >
      <line x1={1} y1={0} x2={1} y2={40} stroke="#475569" strokeWidth={2} />
      <polygon points="1,48 -4,36 6,36" fill="#475569" />
    </svg>
  )
}


// ── Main component ────────────────────────────────────────────────────────────

export function PipelineDAG({ sessionId, userId, onNodeClick }: PipelineDAGProps) {
  // Real-time subscription — jobs where topic === sessionId
  const jobs = useQuery(api.generationJobs.list, {
    userId,
    sessionId,
  })

  // Build a status map by job type
  const statusMap: Record<PipelineNodeType, PipelineStatus> = {
    text: 'pending',
    image: 'pending',
    video: 'pending',
  }

  if (jobs) {
    for (const job of jobs) {
      const t = job.type as string
      if (t === 'text' || t === 'image' || t === 'video') {
        statusMap[t as PipelineNodeType] = convexStatusToPipeline(job.status)
      }
    }
  }

  const branches: PipelineNodeType[] = ['text', 'image', 'video']

  return (
    <div className="w-full bg-slate-950 rounded-2xl p-6 select-none">
      {/* Source node */}
      <div className="flex justify-center mb-0">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-purple-500 bg-purple-900 px-8 py-4 text-purple-200 shadow-lg">
          <span className="text-xl">📥</span>
          <span className="text-sm font-bold">Input Content</span>
        </div>
      </div>

      {/* Desktop: horizontal branches; Mobile: vertical stack */}
      {/* Connector lines from source to branches */}
      <div className="hidden md:flex justify-center mt-6 gap-0">
        {/* Horizontal layout */}
        <div className="flex flex-col items-center">
          {/* Fan-out SVG */}
          <svg
            width={560}
            height={48}
            viewBox="0 0 560 48"
            className="overflow-visible"
          >
            {/* Vertical stem from source */}
            <line x1={280} y1={0} x2={280} y2={20} stroke="#475569" strokeWidth={2} />
            {/* Horizontal bar */}
            <line x1={100} y1={20} x2={460} y2={20} stroke="#475569" strokeWidth={2} />
            {/* Drops to each branch */}
            <line x1={100} y1={20} x2={100} y2={40} stroke="#475569" strokeWidth={2} />
            <polygon points="100,48 95,36 105,36" fill="#475569" />
            <line x1={280} y1={20} x2={280} y2={40} stroke="#475569" strokeWidth={2} />
            <polygon points="280,48 275,36 285,36" fill="#475569" />
            <line x1={460} y1={20} x2={460} y2={40} stroke="#475569" strokeWidth={2} />
            <polygon points="460,48 455,36 465,36" fill="#475569" />
          </svg>

          {/* Branch nodes */}
          <div className="flex gap-8">
            {branches.map((type) => (
              <NodeCard
                key={type}
                label={BRANCH_LABELS[type]}
                icon={BRANCH_ICONS[type]}
                status={statusMap[type]}
                onClick={() => onNodeClick?.(type)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex md:hidden flex-col items-center gap-4 mt-4">
        {branches.map((type, i) => (
          <div key={type} className="flex flex-col items-center gap-4">
            {i === 0 && (
              <div className="relative h-12 w-px">
                <VerticalArrow x={1} />
              </div>
            )}
            <NodeCard
              label={BRANCH_LABELS[type]}
              icon={BRANCH_ICONS[type]}
              status={statusMap[type]}
              onClick={() => onNodeClick?.(type)}
            />
            {i < branches.length - 1 && (
              <div className="relative h-12 w-px">
                <VerticalArrow x={1} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {(Object.keys(STATUS_DOT) as PipelineStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_DOT[s]}`} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default PipelineDAG
