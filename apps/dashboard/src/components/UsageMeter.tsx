interface UsageMeterProps {
  label: string
  used: number
  limit: number
  color?: string
}

export default function UsageMeter({ label, used, limit, color = 'bg-purple-600' }: UsageMeterProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)
  const displayLimit = isUnlimited ? '\u221e' : String(limit)

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">
          {used} / {displayLimit}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
