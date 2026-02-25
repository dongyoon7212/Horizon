import { cn } from '@/lib/utils'

interface HorizonDividerProps {
  className?: string
  label?: string
}

export default function HorizonDivider({ className, label }: HorizonDividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4 my-8', className)}>
        <div className="flex-1 horizon-divider" />
        <span className="text-xs font-display text-muted uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 horizon-divider" />
      </div>
    )
  }

  return <div className={cn('horizon-divider my-8', className)} />
}
