export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-4 p-8">
      <div className="h-8 bg-muted rounded-lg w-1/3" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="space-y-3 mt-6">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}
