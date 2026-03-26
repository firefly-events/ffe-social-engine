export default function ContentCard({ title, type, status, date, thumbnail }: any) {
  const statusConfig: Record<string, { className: string }> = {
    Draft: { className: 'bg-slate-700 text-slate-300' },
    Scheduled: { className: 'bg-amber-500/20 text-amber-400' },
    Posted: { className: 'bg-emerald-500/20 text-emerald-400' },
    Failed: { className: 'bg-red-500/20 text-red-400' },
  };

  const statusStyle = statusConfig[status] || statusConfig.Draft;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-white/[0.07] mb-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div
        className="w-15 h-15 rounded-md bg-slate-800 flex-shrink-0 bg-cover bg-center"
        style={{
          width: '60px',
          height: '60px',
          backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
        }}
      />

      <div className="flex-1">
        <div className="font-semibold text-slate-100 mb-0.5">{title}</div>
        <div className="text-xs text-slate-500">{type} • {date}</div>
      </div>

      <div className={`px-2 py-0.5 rounded text-xs font-bold ${statusStyle.className}`}>
        {status}
      </div>

      <button className="bg-transparent border-none cursor-pointer text-xl text-slate-600 hover:text-slate-400 p-2 transition-colors">
        ⋮
      </button>
    </div>
  );
}
