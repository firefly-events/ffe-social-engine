export default function MetricCard({ label, value, growth, icon, isLocked }: any) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl relative overflow-hidden flex flex-col gap-2">
      {isLocked && (
        <div className="absolute inset-0 bg-card/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <div className="text-center">
            <span className="text-2xl">🔒</span>
            <div className="text-xs font-bold text-muted-foreground mt-1">UPGRADE TO PRO</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>

      <div className="text-3xl font-bold text-foreground">{value}</div>

      {growth && (
        <div className={`text-sm flex items-center gap-1 ${growth.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {growth.startsWith('+') ? '↑' : '↓'} {growth}
          <span className="text-muted-foreground ml-1">this week</span>
        </div>
      )}
    </div>
  );
}
