export function SkeletonLoader({ variant = 'list' }) {
  if (variant === 'banner') {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-800/60 h-20 w-full" />
    )
  }

  if (variant === 'summary') {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-800/60 h-20" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-slate-800/60 h-16" />
      ))}
    </div>
  )
}

