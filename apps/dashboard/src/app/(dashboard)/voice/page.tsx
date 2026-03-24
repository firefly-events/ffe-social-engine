'use client'

import { useState, useRef, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CloneStatus = 'idle' | 'processing' | 'ready' | 'error'

interface VoiceClone {
  id: string
  name: string
  createdAt: string
  duration: number // seconds of training audio
  status: CloneStatus
  sampleText?: string
}

interface UploadState {
  file: File | null
  name: string
  duration: number | null
  waveformBars: number[]
  dragOver: boolean
}

interface GenerateState {
  text: string
  cloneId: string | null
  isGenerating: boolean
  audioUrl: string | null
  error: string | null
}

// ---------------------------------------------------------------------------
// Mock data — replace with real API calls once XTTSv2 service is wired
// ---------------------------------------------------------------------------

const MOCK_CLONES: VoiceClone[] = [
  {
    id: 'clone-001',
    name: 'My Voice (Default)',
    createdAt: '2026-03-20',
    duration: 42,
    status: 'ready',
    sampleText: 'Welcome to SocialEngine — your AI-powered content creation platform.',
  },
  {
    id: 'clone-002',
    name: 'Promo Voice',
    createdAt: '2026-03-22',
    duration: 87,
    status: 'ready',
    sampleText: 'Get tickets now before they sell out.',
  },
]

// ---------------------------------------------------------------------------
// Helper: generate fake waveform bars from a file
// ---------------------------------------------------------------------------

function generateWaveform(length = 60): number[] {
  return Array.from({ length }, (_, i) => {
    const base = 0.3 + Math.random() * 0.5
    const envelope = Math.sin((i / length) * Math.PI) * 0.4
    return Math.min(1, Math.max(0.05, base + envelope))
  })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WaveformBars({ bars, color = 'purple' }: { bars: number[]; color?: 'purple' | 'green' }) {
  const colorClass = color === 'green' ? 'bg-emerald-400' : 'bg-purple-400'
  const colorClassDim = color === 'green' ? 'bg-emerald-200' : 'bg-purple-200'
  return (
    <div className="flex items-center gap-px h-12 w-full">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full ${i % 3 === 0 ? colorClass : colorClassDim}`}
          style={{ height: `${Math.round(h * 100)}%`, minHeight: 2 }}
        />
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: CloneStatus }) {
  if (status === 'ready') return <span className="badge-green">Ready</span>
  if (status === 'processing')
    return (
      <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Processing
      </span>
    )
  if (status === 'error') return <span className="badge bg-red-100 text-red-700">Error</span>
  return <span className="badge-gray">Idle</span>
}

function PlayButton({
  onClick,
  playing,
  disabled,
}: {
  onClick: () => void
  playing: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
      title={playing ? 'Pause' : 'Play'}
    >
      {playing ? (
        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function VoicePage() {
  // --- Upload state ---
  const [upload, setUpload] = useState<UploadState>({
    file: null,
    name: '',
    duration: null,
    waveformBars: [],
    dragOver: false,
  })
  const [cloneStatus, setCloneStatus] = useState<CloneStatus>('idle')
  const [clones, setClones] = useState<VoiceClone[]>(MOCK_CLONES)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Generate state ---
  const [generate, setGenerate] = useState<GenerateState>({
    text: '',
    cloneId: MOCK_CLONES[0]?.id ?? null,
    isGenerating: false,
    audioUrl: null,
    error: null,
  })
  const [playingId, setPlayingId] = useState<string | null>(null)

  // --- Drag & drop handlers ---
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) acceptFile(file)
    setUpload((prev) => ({ ...prev, dragOver: false }))
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setUpload((prev) => ({ ...prev, dragOver: true }))
  }

  const handleDragLeave = () => {
    setUpload((prev) => ({ ...prev, dragOver: false }))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) acceptFile(file)
  }

  function acceptFile(file: File) {
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file (MP3, WAV, M4A, etc.)')
      return
    }
    const bars = generateWaveform(60)
    // Get audio duration via AudioContext
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      setUpload((prev) => ({
        ...prev,
        file,
        name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        duration: Math.round(audio.duration),
        waveformBars: bars,
      }))
      URL.revokeObjectURL(url)
    })
    audio.addEventListener('error', () => {
      setUpload((prev) => ({
        ...prev,
        file,
        name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        duration: null,
        waveformBars: bars,
      }))
    })
  }

  // --- Clone voice ---
  async function handleClone() {
    if (!upload.file) return
    setCloneStatus('processing')

    // Simulate XTTSv2 API call — replace with real fetch to /api/voice/clone
    await new Promise((r) => setTimeout(r, 2800))

    const newClone: VoiceClone = {
      id: `clone-${Date.now()}`,
      name: upload.name || 'New Clone',
      createdAt: new Date().toISOString().split('T')[0],
      duration: upload.duration ?? 0,
      status: 'ready',
    }
    setClones((prev) => [newClone, ...prev])
    setCloneStatus('ready')
    setUpload({ file: null, name: '', duration: null, waveformBars: [], dragOver: false })
    // Auto-select the new clone for generation
    setGenerate((prev) => ({ ...prev, cloneId: newClone.id }))
  }

  // --- Generate preview ---
  async function handleGenerate() {
    if (!generate.text.trim() || !generate.cloneId) return
    setGenerate((prev) => ({ ...prev, isGenerating: true, audioUrl: null, error: null }))

    try {
      // Placeholder — replace with real POST to /api/voice/generate
      // const res = await fetch('/api/voice/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cloneId: generate.cloneId, text: generate.text }),
      // })
      // const data = await res.json()
      // setGenerate(prev => ({ ...prev, isGenerating: false, audioUrl: data.audioUrl }))

      await new Promise((r) => setTimeout(r, 2200))
      // Simulate a generated audio URL (use a real URL in production)
      setGenerate((prev) => ({
        ...prev,
        isGenerating: false,
        audioUrl: '#generated-audio-placeholder',
      }))
    } catch {
      setGenerate((prev) => ({
        ...prev,
        isGenerating: false,
        error: 'Generation failed. Check API connection.',
      }))
    }
  }

  // --- Delete clone ---
  function handleDelete(id: string) {
    setClones((prev) => prev.filter((c) => c.id !== id))
    if (generate.cloneId === id) {
      setGenerate((prev) => ({ ...prev, cloneId: clones.find((c) => c.id !== id)?.id ?? null }))
    }
  }

  // --- Toggle play (simulated) ---
  function handlePlay(id: string) {
    setPlayingId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Voice Cloning</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            Clone any voice from a short audio sample. Generate narration, ads, and voiceovers in
            your brand voice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by XTTSv2
          </span>
          <span className="badge-gray">{clones.length} clone{clones.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* === LEFT: Upload + Clone === */}
        <div className="space-y-4">
          <h3 className="section-header">Upload Voice Sample</h3>
          <p className="text-sm text-gray-500 -mt-2">
            Upload at least 10–30 seconds of clean speech for best results. MP3, WAV, M4A, FLAC
            supported.
          </p>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !upload.file && fileInputRef.current?.click()}
            className={`relative card p-6 transition-all cursor-pointer ${
              upload.dragOver
                ? 'border-purple-400 bg-purple-50 shadow-md'
                : upload.file
                ? 'border-emerald-300 bg-emerald-50 cursor-default'
                : 'border-dashed border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileInput}
            />

            {!upload.file ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {upload.dragOver ? 'Drop your audio file here' : 'Drop audio file or click to browse'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A, FLAC · Max 50 MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File info row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{upload.file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(upload.file.size / 1024 / 1024).toFixed(1)} MB
                      {upload.duration ? ` · ${upload.duration}s` : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setUpload({ file: null, name: '', duration: null, waveformBars: [], dragOver: false })
                      setCloneStatus('idle')
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Waveform visualization */}
                {upload.waveformBars.length > 0 && (
                  <div className="px-1">
                    <WaveformBars bars={upload.waveformBars} />
                  </div>
                )}

                {/* Duration quality indicator */}
                {upload.duration !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    {upload.duration < 10 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-amber-600">
                          {upload.duration}s — add more audio for better quality (10s+ recommended)
                        </span>
                      </>
                    ) : upload.duration < 30 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-emerald-600">
                          {upload.duration}s — good quality clone
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-600">
                          {upload.duration}s — excellent quality clone
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clone name input */}
          {upload.file && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Clone Name
              </label>
              <input
                type="text"
                value={upload.name}
                onChange={(e) => setUpload((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. My Brand Voice, Promo Voice"
                className="input"
              />
            </div>
          )}

          {/* Clone button */}
          <button
            onClick={handleClone}
            disabled={!upload.file || cloneStatus === 'processing' || !upload.name.trim()}
            className="btn-primary w-full justify-center"
          >
            {cloneStatus === 'processing' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Training clone…
              </>
            ) : cloneStatus === 'ready' ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Clone created!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Clone Voice
              </>
            )}
          </button>

          {/* Info callout */}
          <div className="card p-4 bg-purple-50 border-purple-200">
            <div className="flex gap-3">
              <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-purple-700 space-y-1">
                <p className="font-medium">XTTSv2 Integration</p>
                <p>
                  Clone training runs on your dedicated GPU via the self-hosted XTTSv2 service.
                  Longer, cleaner samples produce more accurate voice reproduction.
                </p>
                <p className="text-purple-500">
                  API endpoint: <code className="font-mono bg-purple-100 px-1 rounded">POST /api/voice/clone</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT: Generate Sample === */}
        <div className="space-y-4">
          <h3 className="section-header">Generate Sample</h3>
          <p className="text-sm text-gray-500 -mt-2">
            Select a voice clone and enter text to hear how it sounds. Use for voiceovers,
            ads, and social content.
          </p>

          {/* Voice selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Voice Clone
            </label>
            {clones.filter((c) => c.status === 'ready').length === 0 ? (
              <div className="card p-4 text-sm text-gray-500 text-center border-dashed">
                No clones yet — upload a sample to create your first clone.
              </div>
            ) : (
              <div className="space-y-2">
                {clones
                  .filter((c) => c.status === 'ready')
                  .map((clone) => (
                    <label
                      key={clone.id}
                      className={`flex items-center gap-3 card p-3.5 cursor-pointer transition-all ${
                        generate.cloneId === clone.id
                          ? 'border-purple-400 bg-purple-50 shadow-sm'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="clone-select"
                        value={clone.id}
                        checked={generate.cloneId === clone.id}
                        onChange={() => setGenerate((prev) => ({ ...prev, cloneId: clone.id }))}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{clone.name}</p>
                        <p className="text-xs text-gray-400">
                          {clone.duration}s sample · Created {clone.createdAt}
                        </p>
                      </div>
                      <StatusBadge status={clone.status} />
                    </label>
                  ))}
              </div>
            )}
          </div>

          {/* Text input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Text to Speak
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({generate.text.length} / 500 chars)
              </span>
            </label>
            <textarea
              value={generate.text}
              onChange={(e) =>
                setGenerate((prev) => ({
                  ...prev,
                  text: e.target.value.slice(0, 500),
                }))
              }
              placeholder="Enter the text you want the voice clone to speak…"
              rows={4}
              className="textarea"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={
              !generate.text.trim() ||
              !generate.cloneId ||
              generate.isGenerating ||
              clones.filter((c) => c.status === 'ready').length === 0
            }
            className="btn-primary w-full justify-center"
          >
            {generate.isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating audio…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generate Sample
              </>
            )}
          </button>

          {/* Generated audio result */}
          {generate.audioUrl && !generate.isGenerating && (
            <div className="card p-4 border-emerald-200 bg-emerald-50 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-emerald-700">Audio generated</span>
              </div>
              <WaveformBars bars={generateWaveform(48)} color="green" />
              <div className="flex items-center gap-3">
                <PlayButton
                  onClick={() => handlePlay('generated')}
                  playing={playingId === 'generated'}
                />
                <div className="flex-1 text-xs text-emerald-700 truncate">
                  {generate.text.slice(0, 60)}{generate.text.length > 60 ? '…' : ''}
                </div>
                <a
                  href={generate.audioUrl}
                  download="voice-sample.mp3"
                  className="btn-secondary text-xs px-3 py-1.5"
                  onClick={(e) => {
                    // Placeholder: real download when audioUrl is a blob URL
                    if (generate.audioUrl === '#generated-audio-placeholder') {
                      e.preventDefault()
                      alert('Download ready once connected to XTTSv2 API.')
                    }
                  }}
                >
                  Download
                </a>
              </div>
            </div>
          )}

          {/* Error state */}
          {generate.error && (
            <div className="card p-4 border-red-200 bg-red-50">
              <p className="text-sm text-red-700">{generate.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* === Voice Clone Library === */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header">My Voice Clones</h3>
          <span className="text-sm text-gray-400">
            {clones.filter((c) => c.status === 'ready').length} ready ·{' '}
            {clones.filter((c) => c.status === 'processing').length} processing
          </span>
        </div>

        {clones.length === 0 ? (
          <div className="card p-10 text-center border-dashed">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">No voice clones yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload an audio sample above to create your first voice clone.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clones.map((clone) => {
              const fakeWave = generateWaveform(40)
              return (
                <div key={clone.id} className="card p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        clone.status === 'ready'
                          ? 'bg-purple-100'
                          : clone.status === 'processing'
                          ? 'bg-amber-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          clone.status === 'ready'
                            ? 'text-purple-600'
                            : clone.status === 'processing'
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{clone.name}</p>
                        <StatusBadge status={clone.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {clone.duration}s training audio · Created {clone.createdAt}
                      </p>

                      {/* Mini waveform */}
                      {clone.status === 'ready' && (
                        <div className="mt-3 h-8">
                          <WaveformBars bars={fakeWave} />
                        </div>
                      )}

                      {/* Sample text */}
                      {clone.sampleText && clone.status === 'ready' && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          &ldquo;{clone.sampleText}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {clone.status === 'ready' && (
                        <PlayButton
                          onClick={() => handlePlay(clone.id)}
                          playing={playingId === clone.id}
                        />
                      )}
                      {clone.status === 'processing' && (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(clone.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete clone"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* API Integration Guide */}
      <div className="card p-6 bg-slate-900 border-slate-700">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-200 mb-3">XTTSv2 API Endpoints</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 flex-shrink-0">POST</span>
                <span className="text-slate-300">/api/voice/clone</span>
                <span className="text-slate-500 ml-auto hidden sm:block">Upload sample, train clone</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 flex-shrink-0">POST</span>
                <span className="text-slate-300">/api/voice/generate</span>
                <span className="text-slate-500 ml-auto hidden sm:block">Generate speech from text</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 flex-shrink-0">GET</span>
                <span className="text-slate-300">/api/voice/clones</span>
                <span className="text-slate-500 ml-auto hidden sm:block">List all voice clones</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400 flex-shrink-0">DEL</span>
                <span className="text-slate-300">/api/voice/clones/:id</span>
                <span className="text-slate-500 ml-auto hidden sm:block">Delete a clone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
