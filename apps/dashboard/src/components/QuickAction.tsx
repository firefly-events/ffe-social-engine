export default function QuickAction({ title, icon, color = '#333', onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="flex-1 p-5 bg-card text-card-foreground rounded-xl border border-border cursor-pointer flex items-center gap-4 transition-transform hover:-translate-y-0.5"
      style={{ '--hover-border-color': color } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="font-semibold text-sm text-foreground">{title}</div>
    </div>
  );
}
