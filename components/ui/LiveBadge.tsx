import { cn } from '@/lib/utils'

interface LiveBadgeProps {
  className?: string
}

export default function LiveBadge({ className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold',
        'bg-fire/10 border border-fire/30 text-fire',
        className
      )}
    >
      {/* ripple dot */}
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inset-0 rounded-full bg-fire"
          style={{ animation: 'live-pulse 1.8s ease-out infinite' }}
        />
        <span className="relative rounded-full h-2 w-2 bg-fire" />
      </span>
      LIVE
    </span>
  )
}
