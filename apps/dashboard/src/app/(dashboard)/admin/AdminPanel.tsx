'use client'

import { useState } from 'react'

type TabId = 'overview' | 'tiers' | 'users' | 'system'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tiers', label: 'Tier Config' },
  { id: 'users', label: 'User Management' },
  { id: 'system', label: 'System' },
]

const MOCK_USERS = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah@example.com', plan: 'Pro', posts: 84, joined: 'Jan 10', status: 'active' },
  { id: 'u2', name: 'James Okafor', email: 'james@agency.io', plan: 'Agency', posts: 312, joined: 'Dec 15', status: 'active' },
  { id: 'u3', name: 'Maria Santos', email: 'maria@brand.co', plan: 'Free', posts: 7, joined: 'Mar 20', status: 'active' },
  { id: 'u4', name: 'Alex Kim', email: 'alex@startup.ai', plan: 'Pro', posts: 42, joined: 'Feb 8', status: 'inactive' },
  { id: 'u5', name: 'Robin Taylor', email: 'robin@events.com', plan: 'Free', posts: 3, joined: 'Mar 22', status: 'active' },
]

const TIER_CONFIG = {
  free: { credits: 50, platforms: 3, seats: 1, pipelines: false, analytics: 'basic' },
  pro: { credits: 500, platforms: 10, seats: 3, pipelines: true, analytics: 'full' },
  agency: { credits: 9999, platforms: 99, seats: 20, pipelines: true, analytics: 'full' },
}

const SYSTEM_STATS = [
  { label: 'Total Users', value: '1,284', delta: '+28 this week' },
  { label: 'Active Subscriptions', value: '342', delta: '26.6% conversion' },
  { label: 'AI Calls Today', value: '8,420', delta: '↑ 12% vs yesterday' },
  { label: 'MRR', value: '$16,850', delta: '+$1,200 this month' },
  { label: 'Posts Generated', value: '42,180', delta: 'all time' },
  { label: 'Error Rate', value: '0.3%', delta: 'last 24h' },
]

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {SYSTEM_STATS.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.delta}</div>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Plan Distribution</h3>
        <div className="space-y-3">
          {[
            { plan: 'Free', count: 942, pct: 73 },
            { plan: 'Pro', count: 284, pct: 22 },
            { plan: 'Agency', count: 58, pct: 5 },
          ].map((row) => (
            <div key={row.plan}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{row.plan}</span>
                <span className="text-sm font-medium text-gray-900">{row.count} users ({row.pct}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    row.plan === 'Agency' ? 'bg-amber-500' : row.plan === 'Pro' ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TierConfigTab() {
  const [config, setConfig] = useState(TIER_CONFIG)

  const update = (tier: keyof typeof TIER_CONFIG, key: string, value: string | boolean | number) => {
    setConfig((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [key]: value },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 border-amber-200 bg-amber-50/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-amber-800">
            Changes to tier config take effect immediately for new sessions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(Object.entries(config) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG.free][]).map(([tier, cfg]) => (
          <div key={tier} className="card overflow-hidden">
            <div className={`px-5 py-4 border-b border-gray-100 ${
              tier === 'agency' ? 'bg-amber-50' : tier === 'pro' ? 'bg-purple-50' : 'bg-gray-50'
            }`}>
              <h4 className="font-bold text-gray-900 capitalize text-lg">{tier}</h4>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">AI Credits / Month</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={cfg.credits}
                  onChange={(e) => update(tier, 'credits', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max Platforms</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={cfg.platforms}
                  onChange={(e) => update(tier, 'platforms', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Team Seats</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={cfg.seats}
                  onChange={(e) => update(tier, 'seats', Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">Pipelines</label>
                <button
                  onClick={() => update(tier, 'pipelines', !cfg.pipelines)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${cfg.pipelines ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.pipelines ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Analytics Level</label>
                <select
                  className="input text-sm"
                  value={cfg.analytics}
                  onChange={(e) => update(tier, 'analytics', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="basic">Basic</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-primary">Save Changes</button>
        <button className="btn-secondary">Reset to Defaults</button>
      </div>
    </div>
  )
}

function UsersTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [impersonating, setImpersonating] = useState<string | null>(null)

  const filtered = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (impersonating) {
    const user = MOCK_USERS.find((u) => u.id === impersonating)
    return (
      <div className="space-y-4">
        <div className="card p-4 border-amber-300 bg-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">Impersonating: {user?.name}</p>
                <p className="text-xs text-amber-700">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setImpersonating(null)}
              className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg transition-colors"
            >
              Exit Impersonation
            </button>
          </div>
        </div>
        <div className="card p-10 text-center text-gray-400">
          <p className="text-sm">You are viewing the dashboard as {user?.name}.</p>
          <p className="text-xs mt-1">All actions here would be performed as this user.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          className="input flex-1"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn-secondary text-sm">Export CSV</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Posts</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${
                    user.plan === 'Agency' ? 'bg-amber-100 text-amber-700' :
                    user.plan === 'Pro' ? 'bg-purple-100 text-purple-700' :
                    'badge-gray'
                  }`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{user.posts}</td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{user.joined}</td>
                <td className="px-4 py-3">
                  <span className={user.status === 'active' ? 'badge-green' : 'badge-gray'}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setImpersonating(user.id)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Impersonate
                    </button>
                    <button className="text-xs text-gray-400 hover:text-gray-600">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            No users match &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  )
}

function SystemTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'API Gateway', status: 'operational', latency: '48ms', uptime: '99.98%' },
          { label: 'AI Generation Service', status: 'operational', latency: '1.2s avg', uptime: '99.95%' },
          { label: 'Database (MongoDB)', status: 'operational', latency: '12ms', uptime: '100%' },
          { label: 'Queue (Upstash)', status: 'degraded', latency: '380ms', uptime: '99.1%' },
          { label: 'Clerk Auth', status: 'operational', latency: '95ms', uptime: '100%' },
          { label: 'Stripe Webhooks', status: 'operational', latency: '220ms', uptime: '99.99%' },
        ].map((svc) => (
          <div key={svc.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{svc.label}</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  svc.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`} />
                <span className={`text-xs font-medium ${
                  svc.status === 'operational' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {svc.status}
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Latency: {svc.latency}</span>
              <span>Uptime: {svc.uptime}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Environment Flags</h3>
        <div className="space-y-3">
          {[
            { key: 'MAINTENANCE_MODE', value: 'false', description: 'Show maintenance banner' },
            { key: 'AI_PIPELINE_ENABLED', value: 'true', description: 'Enable pipeline feature' },
            { key: 'NEW_ANALYTICS_UI', value: 'true', description: 'Beta analytics dashboard' },
            { key: 'FREE_TIER_LIMIT_ENFORCED', value: 'true', description: 'Enforce credit limits' },
          ].map((flag) => (
            <div key={flag.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {flag.key}
                </code>
                <p className="text-xs text-gray-400 mt-0.5">{flag.description}</p>
              </div>
              <span className={`badge ${flag.value === 'true' ? 'badge-green' : 'badge-gray'}`}>
                {flag.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel({ adminEmail }: { adminEmail: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-5 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-amber-700 mt-0.5">
              Signed in as <strong>{adminEmail}</strong> · All actions are logged.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'tiers' && <TierConfigTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'system' && <SystemTab />}
    </div>
  )
}
