const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Draft: { bg: 'bg-muted', text: 'text-muted-foreground' },
  Scheduled: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  Posted: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  Failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

export default function ContentCard({ title, type, status, date, thumbnail }: any) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Draft;

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border mb-3">
      <div
        className="w-[60px] h-[60px] rounded-md bg-muted flex-shrink-0 bg-cover bg-center"
        style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
      />

      <div className="flex-grow">
        <div className="font-semibold text-foreground mb-1">{title}</div>
        <div className="text-sm text-muted-foreground">{type} &bull; {date}</div>
      </div>

      <div className={`px-2.5 py-1 rounded text-xs font-bold ${style.bg} ${style.text}`}>
        {status}
      </div>

      <button className="bg-transparent border-none cursor-pointer text-xl text-muted-foreground/50 hover:text-muted-foreground p-2">
        &#x22EE;
      </button>
    </div>
  );
}
