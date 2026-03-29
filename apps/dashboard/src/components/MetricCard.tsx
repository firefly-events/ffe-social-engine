export default function MetricCard({ label, value, growth, icon, isLocked }: any) {
  return (
    <div className="p-6 bg-card rounded-xl border border-border relative overflow-hidden flex flex-col gap-2">
      {isLocked && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <span className="text-2xl">🔒</span>
            <div className="text-[0.7rem] font-bold text-muted-foreground">UPGRADE TO PRO</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>

      <div className="text-3xl font-bold text-foreground">{value}</div>

      {growth && (
        <div className={`text-sm flex items-center gap-1 ${
          growth.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {growth.startsWith('+') ? '↑' : '↓'} {growth}
          <span className="text-muted-foreground/70 ml-1">this week</span>
        </div>
      )}
    </div>
  );
}
