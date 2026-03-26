export default function QuickAction({ title, icon, color = '#333', onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="flex-1 p-5 bg-slate-900/50 rounded-xl border border-white/[0.07] cursor-pointer flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="font-semibold text-sm text-slate-200">{title}</div>
    </div>
  );
}
