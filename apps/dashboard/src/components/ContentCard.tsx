interface ContentCardProps {
  title: string
  type: string
  status: 'Draft' | 'Scheduled' | 'Posted' | 'Failed'
  date: string
  thumbnail?: string
}

const statusClasses: Record<ContentCardProps['status'], string> = {
  Draft:     'bg-gray-100 text-gray-600',
  Scheduled: 'bg-amber-50 text-amber-600',
  Posted:    'bg-emerald-50 text-emerald-600',
  Failed:    'bg-red-50 text-red-600',
}

export default function ContentCard({ title, type, status, date, thumbnail }: ContentCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 mb-3">
      <div
        className="w-15 h-15 rounded-lg bg-gray-100 flex-shrink-0 bg-cover bg-center"
        style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 mb-1 truncate">{title}</div>
        <div className="text-xs text-gray-400">{type} &bull; {date}</div>
      </div>
      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${statusClasses[status]}`}>
        {status}
      </span>
      <button className="bg-transparent border-none cursor-pointer text-xl text-gray-300 hover:text-gray-500 transition-colors p-2">
        &#8942;
      </button>
    </div>
  )
}
