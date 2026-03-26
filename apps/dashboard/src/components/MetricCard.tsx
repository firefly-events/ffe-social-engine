export default function MetricCard({ label, value, growth, icon, isLocked }: any) {
  return (
    <div className="relative overflow-hidden p-6 bg-slate-900/50 rounded-xl border border-white/[0.07] flex flex-col gap-2">
      {isLocked && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <span className="text-2xl">🔒</span>
            <div className="text-xs font-bold text-slate-400 mt-1">UPGRADE TO PRO</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>

      <div className="text-3xl font-bold text-slate-100">{value}</div>

      {growth && (
        <div className={`text-xs flex items-center gap-1 ${growth.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
          {growth.startsWith('+') ? '↑' : '↓'} {growth}
          <span className="text-slate-500 ml-1">this week</span>
        </div>
      )}
    </div>
  );
}
