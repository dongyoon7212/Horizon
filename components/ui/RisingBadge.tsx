import { cn } from '@/lib/utils'

interface RisingBadgeProps {
  value: string | number
  label?: string
  className?: string
}

export default function RisingBadge({ value, label, className }: RisingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-data font-semibold badge-rising',
        className
      )}
    >
      <span className="text-fire">▲</span>
      <span>{value}</span>
      {label && <span className="text-peach/70">{label}</span>}
    </span>
  )
}
