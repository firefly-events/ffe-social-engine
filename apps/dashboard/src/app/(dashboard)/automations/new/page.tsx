'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

const TRIGGER_TYPES = [
  { value: 'event_created', label: 'Event Created' },
  { value: 'event_updated', label: 'Event Updated' },
  { value: 'weekly_digest', label: 'Weekly Digest' },
  { value: 'analytics_threshold', label: 'Analytics Threshold' },
] as const

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
] as const

const ACTIONS = [
  { value: 'generate_post', label: 'Generate Post' },
  { value: 'send_newsletter', label: 'Send Newsletter' },
  { value: 'publish_post', label: 'Publish Post' },
] as const

type TriggerType = (typeof TRIGGER_TYPES)[number]['value']
type ActionValue = (typeof ACTIONS)[number]['value']

export default function NewAutomationPage() {
  const router = useRouter()
  const { user } = useUser()
  const createRule = useMutation(api.automations.createRule)

  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState<TriggerType>('event_created')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [actions, setActions] = useState<ActionValue[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlatformToggle = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handleActionToggle = (action: ActionValue) => {
    setActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user?.id) {
      setError('You must be signed in to create a rule.')
      return
    }
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (platforms.length === 0) {
      setError('Select at least one platform.')
      return
    }
    if (actions.length === 0) {
      setError('Select at least one action.')
      return
    }

    setSubmitting(true)
    try {
      await createRule({
        userId: user.id,
        name: name.trim(),
        triggerType,
        platforms,
        actions,
      })
      router.push('/automations')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create rule.'
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">New Automation Rule</h2>
        <p className="text-gray-500 mt-0.5 text-sm">
          Configure a new automated content rule
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-2xl">
        {/* Name */}
        <div>
          <label
            htmlFor="rule-name"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Rule Name
          </label>
          <input
            id="rule-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Auto-post new events"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Trigger Type */}
        <div>
          <label
            htmlFor="trigger-type"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Trigger Type
          </label>
          <select
            id="trigger-type"
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {TRIGGER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Platforms */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Platforms
          </legend>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => {
              const checked = platforms.includes(p.value)
              return (
                <label
                  key={p.value}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handlePlatformToggle(p.value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      checked
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {checked && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {p.label}
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* Actions */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Actions
          </legend>
          <div className="flex flex-wrap gap-3">
            {ACTIONS.map((a) => {
              const checked = actions.includes(a.value)
              return (
                <label
                  key={a.value}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleActionToggle(a.value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      checked
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {checked && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {a.label}
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Rule'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/automations')}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
