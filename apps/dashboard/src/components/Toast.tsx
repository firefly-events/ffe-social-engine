'use client'

import { useState, useEffect, useCallback } from 'react'

// ── TYPES ──────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  message: string
  type:    ToastType
}

// ── TOAST DISPLAY COMPONENT ────────────────────────────────────────────────

export function Toast({ message, type }: ToastData) {
  const styles: Record<ToastType, { container: string; icon: React.ReactNode }> = {
    success: {
      container: 'bg-emerald-600 text-white',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      container: 'bg-red-600 text-white',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    info: {
      container: 'bg-slate-800 text-white',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }

  const style = styles[type]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-none animate-in fade-in slide-in-from-bottom-4 ${style.container}`}
    >
      {style.icon}
      {message}
    </div>
  )
}

// ── HOOK ───────────────────────────────────────────────────────────────────

/**
 * useToast — manages a single auto-dismissing toast notification.
 *
 * Usage:
 *   const { toast, showToast } = useToast()
 *   showToast('Copied!', 'success')
 *   // render: {toast && <Toast {...toast} />}
 */
export function useToast(durationMs = 3000) {
  const [toast, setToast] = useState<ToastData | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), durationMs)
    return () => clearTimeout(id)
  }, [toast, durationMs])

  return { toast, showToast }
}
