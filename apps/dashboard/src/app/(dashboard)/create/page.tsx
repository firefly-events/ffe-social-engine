'use client'

import { useState } from 'react'

type TabId = 'chat' | 'wizard' | 'pipeline'

const TABS: { id: TabId; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'chat',
    label: 'Chat Mode',
    description: 'Describe what you want in plain language',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'wizard',
    label: 'Wizard Mode',
    description: 'Step-by-step guided content creation',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'pipeline',
    label: 'Pipeline Mode',
    description: 'Automate a full content campaign',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
]

const WIZARD_TEMPLATES = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Announce a new feature or product with high-impact copy',
    platforms: ['Instagram', 'LinkedIn', 'Twitter/X'],
    estimatedTime: '5 min',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    description: 'Show your team, process, and culture authentically',
    platforms: ['Instagram', 'TikTok'],
    estimatedTime: '3 min',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'tutorial',
    name: 'Tutorial / How-To',
    description: 'Teach your audience a skill or concept',
    platforms: ['YouTube', 'TikTok', 'LinkedIn'],
    estimatedTime: '8 min',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'event-promo',
    name: 'Event Promotion',
    description: 'Drive ticket sales and event awareness',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    estimatedTime: '4 min',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'testimonial',
    name: 'Customer Story',
    description: 'Share a success story or testimonial',
    platforms: ['LinkedIn', 'Instagram', 'Twitter/X'],
    estimatedTime: '4 min',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'trending',
    name: 'Trending Topic',
    description: 'Join a viral conversation in your niche',
    platforms: ['Twitter/X', 'TikTok', 'Instagram'],
    estimatedTime: '2 min',
    gradient: 'from-violet-500 to-purple-700',
  },
]

const PIPELINE_TEMPLATES = [
  {
    id: 'event-launch',
    name: 'Event Launch Campaign',
    steps: ['Announcement post', 'Countdown series (7 days)', 'Day-of content', 'Post-event recap'],
    posts: 12,
    duration: '2 weeks',
    badge: 'Most used',
  },
  {
    id: 'product-series',
    name: 'Product Feature Series',
    steps: ['Teaser', '3x feature spotlights', 'Social proof', 'CTA post'],
    posts: 6,
    duration: '1 week',
    badge: null,
  },
  {
    id: 'weekly-brand',
    name: 'Weekly Brand Presence',
    steps: ['Monday motivation', 'Mid-week value post', 'Friday engagement'],
    posts: 3,
    duration: '1 week',
    badge: 'Recurring',
  },
]

function ChatModePanel() {
  const [message, setMessage] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram'])
  const [tone, setTone] = useState('professional')
  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Twitter/X', 'Facebook', 'YouTube']

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat input */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-1">What do you want to create?</h3>
          <p className="text-sm text-gray-500 mb-4">
            Describe your content idea in plain language. The more detail, the better.
          </p>
          <textarea
            className="textarea h-36"
            placeholder="e.g. Write a LinkedIn post about how AI is changing event marketing. Professional tone, include 3 key insights, end with a question to drive comments. 250 words max."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{message.length} / 500 characters</span>
            <button
              disabled={!message.trim()}
              className="btn-primary disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Content
            </button>
          </div>
        </div>

        {/* AI output placeholder */}
        <div className="card p-6 border-dashed border-2 border-purple-200 bg-purple-50/30">
          <div className="flex items-center gap-3 text-purple-400 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-purple-600">AI Output</span>
          </div>
          <div className="space-y-2">
            {[80, 65, 90, 70, 45].map((w, i) => (
              <div key={i} className="h-3 bg-purple-100 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
          <p className="text-xs text-purple-400 mt-4 text-center">
            Describe your content above and click Generate
          </p>
        </div>
      </div>

      {/* Options panel */}
      <div className="space-y-4">
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Target Platforms</h4>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedPlatforms.includes(p)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Tone of Voice</h4>
          <div className="space-y-2">
            {['professional', 'casual', 'inspiring', 'witty', 'educational'].map((t) => (
              <label key={t} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  value={t}
                  checked={tone === t}
                  onChange={() => setTone(t)}
                  className="accent-purple-600"
                />
                <span className="text-sm text-gray-700 capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Content Format</h4>
          <div className="space-y-2">
            {['Short post (< 100 words)', 'Medium post (100–250 words)', 'Long-form (250+ words)', 'Caption only', 'Thread / carousel'].map((f) => (
              <label key={f} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="format" defaultChecked={f === 'Medium post (100–250 words)'} className="accent-purple-600" />
                <span className="text-sm text-gray-700">{f}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WizardModePanel() {
  const [selected, setSelected] = useState<string | null>(null)

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="btn-secondary text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h3 className="font-semibold text-gray-900">
            {WIZARD_TEMPLATES.find((t) => t.id === selected)?.name}
          </h3>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {['Topic', 'Audience', 'Key Points', 'Tone', 'Generate'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-xs ${i === 0 ? 'text-purple-700 font-medium' : 'text-gray-400'} hidden sm:block`}>{step}</span>
              {i < 4 && <div className="w-6 h-px bg-gray-200 hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is the main topic?
            </label>
            <input className="input" placeholder="e.g. The future of event ticketing in 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who is your target audience?
            </label>
            <input className="input" placeholder="e.g. Event organizers and venue managers" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any specific points to include? (optional)
            </label>
            <textarea className="textarea h-24" placeholder="e.g. AI-driven personalization, mobile-first purchasing, real-time inventory..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1">Save Draft</button>
            <button className="btn-primary flex-1">
              Next Step
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-gray-900">Choose a Template</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Templates provide a proven structure — AI fills in the details.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WIZARD_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelected(template.id)}
            className="card p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.gradient} mb-4 flex items-center justify-center shadow-sm`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
              {template.name}
            </h4>
            <p className="text-xs text-gray-500 mb-3">{template.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {template.platforms.slice(0, 2).map((p) => (
                  <span key={p} className="badge-gray text-xs">{p}</span>
                ))}
                {template.platforms.length > 2 && (
                  <span className="badge-gray text-xs">+{template.platforms.length - 2}</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{template.estimatedTime}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PipelineModePanel() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="card p-5 border-amber-200 bg-amber-50/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">Pro Feature</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Pipelines automate entire content campaigns. You&apos;re on the Free plan — upgrade to unlock full pipeline execution.{' '}
              <a href="/settings#billing" className="underline font-medium">Upgrade now</a>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Content Pipelines</h3>
        <p className="text-sm text-gray-500">
          Select a pipeline template to auto-generate a full content campaign.
        </p>
      </div>

      <div className="space-y-4">
        {PIPELINE_TEMPLATES.map((pipeline) => (
          <div
            key={pipeline.id}
            className={`card p-5 cursor-pointer transition-all duration-150 hover:shadow-md ${
              selected === pipeline.id ? 'ring-2 ring-purple-500 border-transparent' : ''
            }`}
            onClick={() => setSelected(selected === pipeline.id ? null : pipeline.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{pipeline.name}</h4>
                  {pipeline.badge && (
                    <span className="badge-purple text-xs">{pipeline.badge}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span>{pipeline.posts} posts</span>
                  <span>{pipeline.duration}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pipeline.steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-xs text-gray-600">{step}</span>
                      {i < pipeline.steps.length - 1 && (
                        <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-colors ${
                  selected === pipeline.id
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300'
                }`}
              >
                {selected === pipeline.id && (
                  <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">Configure Pipeline</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Campaign topic / product
            </label>
            <input className="input" placeholder="e.g. SxSW 2026 ticket launch" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {['Instagram', 'TikTok', 'LinkedIn', 'Twitter/X'].map((p) => (
                <button key={p} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full justify-center opacity-60 cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Run Pipeline (Pro only)
          </button>
        </div>
      )}
    </div>
  )
}

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<TabId>('chat')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Content</h2>
        <p className="text-gray-500 mt-0.5 text-sm">
          Choose your creation mode and let AI do the heavy lifting.
        </p>
      </div>

      {/* Tab bar */}
      <div className="card p-1.5 inline-flex gap-1 bg-gray-100 border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-purple-600' : ''}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-sm text-gray-500 -mt-3">
        {TABS.find((t) => t.id === activeTab)?.description}
      </p>

      {/* Panel */}
      <div>
        {activeTab === 'chat' && <ChatModePanel />}
        {activeTab === 'wizard' && <WizardModePanel />}
        {activeTab === 'pipeline' && <PipelineModePanel />}
      </div>
    </div>
  )
}
