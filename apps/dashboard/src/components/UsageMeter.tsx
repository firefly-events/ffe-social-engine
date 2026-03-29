export default function UsageMeter({ label, used, limit, color = '#8e44ad' }: any) {
  const percentage = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
  const displayLimit = limit === -1 ? '∞' : limit;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-200">{used} / {displayLimit}</span>
      </div>
      <div className="h-2 bg-white/10 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
