'use client'

import { useState } from 'react'

type TabId = 'accounts' | 'billing' | 'content'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'accounts',
    label: 'Connected Accounts',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: 'content',
    label: 'Content Rules',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
]

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    connected: true,
    handle: '@fireflyevents',
    scopes: ['Post', 'Stories', 'Reels', 'Analytics'],
    connectedAt: 'Jan 15, 2026',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: 'bg-black',
    connected: true,
    handle: '@fireflyevents',
    scopes: ['Post', 'Analytics'],
    connectedAt: 'Feb 2, 2026',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: 'bg-blue-600',
    connected: true,
    handle: 'Firefly Events Inc.',
    scopes: ['Post', 'Articles', 'Analytics'],
    connectedAt: 'Jan 20, 2026',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    color: 'bg-gray-900',
    connected: false,
    handle: null,
    scopes: ['Post', 'Threads', 'Analytics'],
    connectedAt: null,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: 'bg-blue-700',
    connected: false,
    handle: null,
    scopes: ['Post', 'Stories', 'Reels', 'Analytics'],
    connectedAt: null,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: 'bg-red-600',
    connected: false,
    handle: null,
    scopes: ['Upload', 'Shorts', 'Analytics'],
    connectedAt: null,
  },
]

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    current: true,
    features: [
      '50 AI credits / month',
      '3 connected platforms',
      'Chat mode',
      'Basic templates',
      'Cards view',
    ],
    limits: ['No pipelines', 'No advanced analytics', 'No team seats'],
    cta: 'Current plan',
    color: 'border-gray-200',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: 'per month',
    current: false,
    features: [
      '500 AI credits / month',
      'All platforms',
      'All creation modes',
      'Pipeline automation',
      'Full analytics',
      '3 team seats',
    ],
    limits: [],
    cta: 'Upgrade to Pro',
    color: 'border-purple-400',
    badge: 'Most popular',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$199',
    period: 'per month',
    current: false,
    features: [
      'Unlimited AI credits',
      'White-label output',
      'Unlimited pipelines',
      'Advanced analytics',
      '20 team seats',
      'Priority support',
      'Custom brand voice',
    ],
    limits: [],
    cta: 'Talk to sales',
    color: 'border-gray-200',
  },
]

const CONTENT_RULES_DEFAULTS = {
  tone: 'professional',
  hashtagCount: '5',
  emojiLevel: 'moderate',
  avoidTopics: 'politics, competitors, personal beliefs',
  brandKeywords: 'Firefly Events, FFE, SocialEngine',
  ctaStyle: 'soft',
  maxLength: '250',
}

function ConnectedAccountsTab() {
  const [platforms, setPlatforms] = useState(SOCIAL_PLATFORMS)

  const disconnect = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: false, handle: null, connectedAt: null } : p))
    )
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Social Media Platforms</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Connect accounts to publish and analyze content directly.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center gap-4 p-5">
              <div className={`w-10 h-10 rounded-xl ${platform.color} flex-shrink-0 flex items-center justify-center text-white text-sm font-bold`}>
                {platform.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{platform.name}</span>
                  {platform.connected && (
                    <span className="badge-green">Connected</span>
                  )}
                </div>
                {platform.connected ? (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {platform.handle} · Connected {platform.connectedAt} · {platform.scopes?.join(', ')}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mt-0.5">
                    Permissions: {platform.scopes?.join(', ')}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {platform.connected ? (
                  <button
                    onClick={() => disconnect(platform.id)}
                    className="btn-secondary text-xs text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button className="btn-primary text-xs">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 border-blue-100 bg-blue-50/50">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">About permissions</p>
            <p className="text-sm text-blue-700 mt-0.5">
              SocialEngine only requests the minimum permissions required to post and read analytics.
              We never store your passwords or access messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Current plan summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Current Plan</h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">Free</span>
              <span className="text-gray-400 text-sm">forever</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">AI Credits Used</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">3 / 50</div>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '6%' }} />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Credits reset on April 1, 2026</span>
          <span>3 platforms connected of 3</span>
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <h3 className="section-header mb-4">Upgrade Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card p-6 relative ${plan.current ? 'opacity-75' : ''} ${plan.id === 'pro' ? 'ring-2 ring-purple-500' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 text-lg">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                {plan.limits.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {l}
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <button disabled className="w-full py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                  Current plan
                </button>
              ) : (
                <button className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  plan.id === 'pro'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice history */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Billing History</h3>
        </div>
        <div className="p-10 text-center text-gray-400">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No invoices yet — you&apos;re on the Free plan.</p>
        </div>
      </div>
    </div>
  )
}

function ContentRulesTab() {
  const [rules, setRules] = useState(CONTENT_RULES_DEFAULTS)

  const update = (key: string, value: string) =>
    setRules((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-6">
      <div className="card p-5 border-purple-100 bg-purple-50/40">
        <p className="text-sm text-purple-800">
          Content rules train the AI to match your brand voice. These settings apply to all AI-generated content by default.
        </p>
      </div>

      <div className="card overflow-hidden divide-y divide-gray-100">
        {/* Tone */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Default Tone of Voice</label>
          <p className="text-xs text-gray-400 mb-3">How the AI sounds when writing for your brand</p>
          <div className="flex flex-wrap gap-2">
            {['professional', 'casual', 'inspiring', 'witty', 'educational', 'bold'].map((t) => (
              <button
                key={t}
                onClick={() => update('tone', t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  rules.tone === t
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtag count */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Hashtag Count
          </label>
          <p className="text-xs text-gray-400 mb-3">How many hashtags to include per post</p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="30"
              value={rules.hashtagCount}
              onChange={(e) => update('hashtagCount', e.target.value)}
              className="flex-1 accent-purple-600"
            />
            <span className="w-8 text-center text-sm font-semibold text-gray-900">
              {rules.hashtagCount}
            </span>
          </div>
        </div>

        {/* Emoji usage */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Emoji Usage</label>
          <p className="text-xs text-gray-400 mb-3">How liberally to use emojis in content</p>
          <div className="flex gap-2">
            {['none', 'minimal', 'moderate', 'heavy'].map((level) => (
              <button
                key={level}
                onClick={() => update('emojiLevel', level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  rules.emojiLevel === level
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Brand keywords */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Brand Keywords</label>
          <p className="text-xs text-gray-400 mb-3">
            Terms and phrases that represent your brand — AI will naturally include these
          </p>
          <input
            className="input"
            value={rules.brandKeywords}
            onChange={(e) => update('brandKeywords', e.target.value)}
            placeholder="e.g. Firefly Events, unforgettable experiences, community"
          />
        </div>

        {/* Avoid topics */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Avoid Topics</label>
          <p className="text-xs text-gray-400 mb-3">
            Topics the AI should never mention or engage with
          </p>
          <textarea
            className="textarea h-20"
            value={rules.avoidTopics}
            onChange={(e) => update('avoidTopics', e.target.value)}
            placeholder="e.g. competitors, politics, religious content"
          />
        </div>

        {/* CTA style */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Call-to-Action Style</label>
          <p className="text-xs text-gray-400 mb-3">How direct the AI should be with CTAs</p>
          <div className="flex gap-2">
            {['none', 'soft', 'direct', 'urgent'].map((style) => (
              <button
                key={style}
                onClick={() => update('ctaStyle', style)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  rules.ctaStyle === style
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Max length */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Default Max Post Length
          </label>
          <p className="text-xs text-gray-400 mb-3">Word limit for generated posts (0 = no limit)</p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={rules.maxLength}
              onChange={(e) => update('maxLength', e.target.value)}
              className="flex-1 accent-purple-600"
            />
            <span className="w-16 text-sm font-semibold text-gray-900">
              {rules.maxLength === '0' ? 'No limit' : `${rules.maxLength}w`}
            </span>
          </div>
        </div>

        <div className="p-5 flex gap-3">
          <button className="btn-primary">Save Rules</button>
          <button className="btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('accounts')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-0.5 text-sm">
          Manage your connections, subscription, and AI content preferences.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 bg-gray-100 rounded-xl p-1.5 w-fit flex-wrap gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'accounts' && <ConnectedAccountsTab />}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'content' && <ContentRulesTab />}
    </div>
  )
}
