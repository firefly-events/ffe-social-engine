'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── ICON COMPONENTS ──────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function IconSparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  )
}

// ── TIER DATA ─────────────────────────────────────────────────────────────────

interface Tier {
  id: string
  name: string
  tagline: string
  monthlyPrice: number | null
  annualPrice: number | null
  priceLabel?: string
  color: string
  accentBg: string
  accentBorder: string
  popular?: boolean
  cta: string
  ctaStyle: 'ghost' | 'outline' | 'primary' | 'enterprise'
  features: string[]
  limits: {
    captions: string
    videos: string
    posts: string
    platforms: string
  }
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try before you commit',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'text-slate-400',
    accentBg: 'bg-slate-500/10',
    accentBorder: 'border-slate-500/25',
    cta: 'Start for Free',
    ctaStyle: 'ghost',
    features: [
      '5 AI captions / month',
      '1 AI video / month',
      'Export-only (no direct posting)',
      'Basic templates',
      'API access (100 req/day)',
      'Community support',
    ],
    limits: { captions: '5 / mo', videos: '1 / mo', posts: 'Export only', platforms: '—' },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'The obvious buy — replaces a $229/mo stack',
    monthlyPrice: 29.99,
    annualPrice: 23.99,
    color: 'text-purple-300',
    accentBg: 'bg-purple-500/12',
    accentBorder: 'border-purple-500/40',
    popular: true,
    cta: 'Get Pro',
    ctaStyle: 'primary',
    features: [
      '500 AI captions / month',
      '25 AI videos / month',
      '100 direct posts / month',
      '5 platforms connected',
      '5 voice clones',
      'Automation workflows (visual DAG)',
      'Advanced analytics & insights',
      'Full API + webhooks',
      'Priority email support',
    ],
    limits: { captions: '500 / mo', videos: '25 / mo', posts: '100 / mo', platforms: '5' },
  },
  {
    id: 'agency',
    name: 'Agency',
    tagline: 'Multi-tenant, teams & white-label',
    monthlyPrice: 99,
    annualPrice: 82,
    color: 'text-violet-400',
    accentBg: 'bg-violet-500/8',
    accentBorder: 'border-violet-500/25',
    cta: 'Get Agency',
    ctaStyle: 'outline',
    features: [
      'Unlimited AI captions',
      '250 AI videos / month',
      'Unlimited direct posts',
      'All 14+ platforms',
      '50 voice clones',
      'Multi-tenant sub-users (5 seats)',
      'White-label interface',
      'Custom brand profiles',
      'API + MCP server access',
      'Dedicated support + onboarding call',
    ],
    limits: { captions: 'Unlimited', videos: '250 / mo', posts: 'Unlimited', platforms: 'All 14+' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Custom scale & SLA',
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: '$499+',
    color: 'text-amber-400',
    accentBg: 'bg-amber-500/8',
    accentBorder: 'border-amber-500/20',
    cta: 'Talk to Us',
    ctaStyle: 'enterprise',
    features: [
      'Unlimited everything',
      'All 14+ platforms',
      'Unlimited voice clones',
      'SSO / SAML integration',
      'Full API + priority rate limits (10K req/min)',
      'Custom AI model fine-tuning',
      'Dedicated account manager',
      'Custom SLA & uptime guarantee',
      'SOC 2 compliance docs',
    ],
    limits: { captions: 'Unlimited', videos: 'Unlimited', posts: 'Unlimited', platforms: 'All + custom' },
  },
]

const FAQ_ITEMS = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrades take effect immediately (prorated). Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'What counts as a post?',
    a: 'A post is one piece of content published to one platform. Posting the same caption to Instagram and TikTok counts as 2 posts.',
  },
  {
    q: 'How does voice cloning work?',
    a: 'Upload 5–10 minutes of clean audio of your voice. Our AI creates a high-fidelity voice model you can use in all generated videos.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'The Free plan is forever free. Paid plans include a 14-day money-back guarantee — no risk.',
  },
  {
    q: 'What platforms are supported?',
    a: 'Instagram, TikTok, YouTube Shorts, X/Twitter, LinkedIn, Facebook, Pinterest, Threads, Snapchat, Reddit, Mastodon, Bluesky, Tumblr, and Telegram Channels.',
  },
  {
    q: 'Can I use Social Engine for multiple brands?',
    a: 'Agency and Enterprise plans support multiple brand profiles with separate voice tones, audiences, and platform connections.',
  },
]

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')

  const isAnnual = billingInterval === 'annual'

  const handleSelectTier = (tierId: string) => {
    if (tierId === 'enterprise') {
      window.location.href = 'mailto:sales@socialengine.ai?subject=Enterprise%20Inquiry'
      return
    }
    if (!user) {
      router.push('/sign-up')
      return
    }
    if (tierId === 'free') {
      router.push('/dashboard')
      return
    }
    // Clerk Billing: redirect to billing portal or upgrade flow
    // Handles 'pro', 'agency', and any future paid tiers
    router.push('/settings?upgrade=' + tierId)
  }

  const getDisplayPrice = (tier: Tier): string => {
    if (tier.priceLabel) return tier.priceLabel
    if (tier.monthlyPrice === 0) return '$0'
    const price = isAnnual ? tier.annualPrice! : tier.monthlyPrice!
    return `$${price % 1 === 0 ? price : price.toFixed(2)}`
  }

  const getAnnualNote = (tier: Tier): string => {
    if (!isAnnual || tier.monthlyPrice === 0 || tier.priceLabel) return ''
    const savings = Math.round((tier.monthlyPrice! - tier.annualPrice!) * 12)
    return `Save $${savings}/yr`
  }

  const ctaClasses: Record<Tier['ctaStyle'], string> = {
    primary:
      'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ' +
      'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] ' +
      'hover:opacity-90 hover:-translate-y-px transition-all cursor-pointer border-none',
    outline:
      'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ' +
      'bg-transparent text-slate-300 border border-white/12 ' +
      'hover:bg-white/6 hover:border-white/22 hover:-translate-y-px transition-all cursor-pointer',
    ghost:
      'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ' +
      'bg-transparent text-slate-400 border border-white/[0.07] ' +
      'hover:bg-white/4 hover:text-slate-300 transition-all cursor-pointer',
    enterprise:
      'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ' +
      'bg-amber-500/15 text-amber-300 border border-amber-500/30 ' +
      'hover:bg-amber-500/20 hover:border-amber-500/50 hover:-translate-y-px transition-all cursor-pointer',
  }

  return (
    <div className="max-w-[1380px] mx-auto px-8 pt-20 pb-24">

      {/* ── HERO ── */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase border border-purple-500/35 bg-purple-500/10 text-purple-300 mb-5">
          <IconSparkle /> Transparent Pricing
        </div>
        <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-slate-100 leading-tight mb-4">
          Simple pricing,<br />
          <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
            serious results
          </span>
        </h1>
        <p className="text-[1.05rem] text-slate-400 leading-relaxed max-w-[520px] mx-auto">
          Start free and scale as you grow. Every paid plan includes a 14-day money-back guarantee.
        </p>

        {/* Billing toggle */}
        <div className="flex justify-center mt-8 items-center">
          <button
            onClick={() => setBillingInterval(p => p === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-[210px] h-[42px] rounded-full bg-white/5 border border-white/10 flex items-center cursor-pointer p-[3px] select-none"
            aria-label="Toggle billing interval"
          >
            <div
              className="absolute top-[3px] h-[calc(100%-6px)] w-[48%] rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_12px_rgba(139,92,246,0.35)] transition-[left] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ left: isAnnual ? 'calc(52% - 3px)' : '3px' }}
            />
            <span className={`relative z-10 flex-1 text-center text-sm font-semibold transition-colors ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>
              Monthly
            </span>
            <span className={`relative z-10 flex-1 text-center text-sm font-semibold transition-colors ${isAnnual ? 'text-white' : 'text-slate-500'}`}>
              Annual
            </span>
          </button>
          {isAnnual && (
            <span className="ml-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              20% off
            </span>
          )}
        </div>
      </div>

      {/* Annual savings banner */}
      {isAnnual && (
        <div className="mt-0 mb-6 py-3.5 px-6 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 flex items-center justify-center gap-2.5 text-sm text-emerald-300 font-medium">
          <span className="text-emerald-400"><IconCheck /></span>
          Annual billing saves you up to $84/year on Pro and $204/year on Agency. All prices shown as monthly equivalent.
        </div>
      )}

      {/* ── TIER CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10 items-start">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-[18px] bg-[#0f1221] border p-6 flex flex-col overflow-hidden transition-all duration-[250ms] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
              tier.popular
                ? 'border-purple-500/50 bg-[linear-gradient(160deg,#13162a_0%,#0f1221_100%)] shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_20px_60px_rgba(139,92,246,0.15)]'
                : 'border-white/[0.07]'
            }`}
          >
            {tier.popular && (
              <div className="inline-flex items-center gap-1.5 self-start mb-4 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                <IconSparkle /> Most Popular
              </div>
            )}

            <div className={`text-base font-bold mb-0.5 ${tier.popular ? 'text-violet-200' : 'text-slate-100'}`}>
              {tier.name}
            </div>
            <div className="text-xs text-slate-500 mb-5 font-medium">{tier.tagline}</div>

            <div className="flex items-end gap-1 mb-0.5">
              <span className={`text-[2rem] font-extrabold tracking-tight leading-none ${
                tier.popular ? 'text-purple-300' : tier.id === 'enterprise' ? 'text-amber-300' : 'text-slate-100'
              }`}>
                {getDisplayPrice(tier)}
              </span>
              <span className="text-xs text-slate-500 mb-0.5 font-medium">/ mo</span>
            </div>

            <div className="text-xs text-emerald-400 mb-5 min-h-[1.1rem] font-medium">
              {isAnnual && tier.monthlyPrice && tier.monthlyPrice > 0 && !tier.priceLabel
                ? getAnnualNote(tier)
                : tier.id === 'enterprise'
                ? 'Custom contract'
                : isAnnual && tier.monthlyPrice === 0
                ? 'Always free'
                : '\u00a0'}
            </div>

            <div className="h-px bg-white/[0.06] mb-5" />

            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-400 leading-snug">
                  <span className={`flex-shrink-0 mt-px ${tier.popular ? 'text-violet-400' : tier.color}`}>
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={ctaClasses[tier.ctaStyle]}
              onClick={() => handleSelectTier(tier.id)}
            >
              {tier.id === 'enterprise' ? (
                <><IconPhone />{tier.cta}</>
              ) : tier.ctaStyle === 'ghost' ? (
                tier.cta
              ) : (
                <>{tier.cta} <IconArrowRight /></>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* ── COMPARISON TABLE ── */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center tracking-tight">
          Compare plans at a glance
        </h3>
        <div className="overflow-x-auto rounded-[14px] border border-white/[0.06]">
          <table className="w-full border-collapse text-sm min-w-[700px]">
            <thead>
              <tr>
                <th className="w-44 px-3 py-4 text-left text-xs font-bold text-slate-400 border-b border-white/[0.07] bg-[#0f1221]">
                  Feature
                </th>
                {TIERS.map((t) => (
                  <th
                    key={t.id}
                    className={`px-3 py-4 text-center text-xs font-bold border-b border-white/[0.07] bg-[#0f1221] ${
                      t.popular ? 'bg-purple-500/[0.04] text-purple-300' : 'text-slate-400'
                    }`}
                  >
                    {t.name}
                    {t.popular && (
                      <div className="text-[0.62rem] text-purple-500 font-bold uppercase tracking-wider mt-0.5">
                        ★ Popular
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'AI Captions', key: 'captions' as const },
                { label: 'AI Videos', key: 'videos' as const },
                { label: 'Direct Posts', key: 'posts' as const },
                { label: 'Platforms', key: 'platforms' as const },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-left text-slate-300 font-medium border-b border-white/[0.04]">
                    {row.label}
                  </td>
                  {TIERS.map((t) => (
                    <td
                      key={t.id}
                      className={`px-3 py-2.5 text-center border-b border-white/[0.04] ${
                        t.popular ? 'bg-purple-500/[0.04] text-purple-300' : 'text-slate-400'
                      }`}
                    >
                      {t.limits[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {[
                { label: 'Direct Posting',   values: [false, true,  true,  true] },
                { label: 'Voice Cloning',    values: [false, true,  true,  true] },
                { label: 'Analytics',        values: [false, true,  true,  true] },
                { label: 'Workflow Builder', values: [false, true,  true,  true] },
                { label: 'White-label',      values: [false, false, true,  true] },
                { label: 'Multi-tenant',     values: [false, false, true,  true] },
                { label: 'API Access',       values: ['100 req/day', 'Full', 'Full + MCP', 'Priority 10K/min'] },
                { label: 'Custom SLA',       values: [false, false, false, true] },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-left text-slate-300 font-medium border-b border-white/[0.04]">
                    {row.label}
                  </td>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-3 py-2.5 text-center border-b border-white/[0.04] ${
                        TIERS[i]?.popular ? 'bg-purple-500/[0.04] text-purple-300' : 'text-slate-400'
                      }`}
                    >
                      {v === true
                        ? <span className="text-emerald-400">&#10003;</span>
                        : v === false
                        ? <span className="text-slate-700">&mdash;</span>
                        : <span>{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-slate-100 mb-8 text-center tracking-tight">
          Frequently asked questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="p-6 rounded-xl bg-[#0f1221] border border-white/[0.06]">
              <div className="text-sm font-semibold text-slate-100 mb-2">{item.q}</div>
              <div className="text-[0.83rem] text-slate-400 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="mt-20 relative overflow-hidden rounded-[20px] bg-gradient-to-br from-purple-500/10 to-cyan-500/[0.06] border border-purple-500/20 px-8 py-16 text-center">
        <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold text-slate-100 tracking-tight mb-3">
            Still not sure? Start free.
          </h2>
          <p className="text-base text-slate-400 max-w-[460px] mx-auto mb-8 leading-relaxed">
            No credit card. No commitment. Upgrade whenever you are ready.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[0.975rem] text-white no-underline bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_28px_rgba(139,92,246,0.3)] hover:opacity-90 transition-opacity"
            >
              Create Free Account <IconArrowRight />
            </Link>
            <a
              href="mailto:sales@socialengine.ai?subject=Enterprise%20Inquiry"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[0.975rem] text-slate-300 no-underline bg-white/[0.06] border border-white/12 hover:bg-white/10 transition-colors"
            >
              <IconPhone /> Talk to Sales
            </a>
          </div>
          <div className="mt-6 flex gap-6 justify-center flex-wrap">
            {['Free forever plan available', '14-day money-back guarantee', 'Cancel any time'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                <span className="text-emerald-400"><IconCheck /></span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
