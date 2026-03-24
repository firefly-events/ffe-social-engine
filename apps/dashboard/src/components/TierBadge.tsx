type Tier = 'FREE' | 'STARTER' | 'BASIC' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'

interface TierBadgeProps {
  tier: Tier | string
}

const tierClasses: Record<string, string> = {
  FREE:       'bg-gray-100 text-gray-600',
  STARTER:    'bg-emerald-100 text-emerald-700',
  BASIC:      'bg-sky-100 text-sky-700',
  PRO:        'bg-purple-100 text-purple-700',
  BUSINESS:   'bg-amber-100 text-amber-700',
  ENTERPRISE: 'bg-red-100 text-red-700',
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const classes = tierClasses[tier] ?? tierClasses.FREE

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-bold uppercase tracking-wide ${classes}`}>
      {tier}
    </span>
  )
}
