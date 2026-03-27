interface ContentCardProps {
  title: string;
  type: string;
  status: string;
  date: string;
  thumbnail?: string;
}

export default function ContentCard({ title, type, status, date, thumbnail }: ContentCardProps) {
  const statusClasses: Record<string, string> = {
    'Draft': 'bg-muted text-muted-foreground',
    'Scheduled': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Posted': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Failed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Archived': 'bg-muted text-muted-foreground',
  };

  const statusClass = statusClasses[status] || statusClasses.Draft;

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg mb-3">
      <div
        className="w-15 h-15 rounded-md bg-muted flex-shrink-0"
        style={{
          width: '60px',
          height: '60px',
          backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground mb-1 truncate">{title}</div>
        <div className="text-xs text-muted-foreground">{type} • {date}</div>
      </div>

      <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusClass}`}>
        {status}
      </span>

      <button
        type="button"
        aria-label="More options"
        className="text-muted-foreground hover:text-foreground p-2 bg-transparent border-none cursor-pointer text-lg"
      >
        ⋮
      </button>
    </div>
  );
}
