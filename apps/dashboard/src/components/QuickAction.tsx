export default function QuickAction({ title, icon, color = '#333', onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex-1 p-5 bg-card rounded-xl border border-border cursor-pointer flex items-center gap-4 transition-all duration-100 hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-md"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="font-semibold text-[0.95rem] text-foreground">{title}</div>
    </button>
  );
}
