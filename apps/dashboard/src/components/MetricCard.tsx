interface MetricCardProps {
  label: string
  value: string | number
  growth?: string
  icon?: string
  isLocked?: boolean
}

export default function MetricCard({ label, value, growth, icon, isLocked }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden p-6 bg-white rounded-xl border border-gray-200 flex flex-col gap-2">
      {isLocked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="text-center">
            <span className="text-2xl">&#128274;</span>
            <div className="text-[0.7rem] font-bold text-gray-500 mt-1">UPGRADE TO PRO</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>

      <div className="text-[1.75rem] font-bold text-gray-900">{value}</div>

      {growth && (
        <div className={`text-sm flex items-center gap-1 ${growth.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
          {growth.startsWith('+') ? '&#8593;' : '&#8595;'} {growth}
          <span className="text-gray-400 ml-1">this week</span>
        </div>
      )}
    </div>
  )
}
