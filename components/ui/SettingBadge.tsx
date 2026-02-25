import { cn } from '@/lib/utils'

interface SettingBadgeProps {
  value: string | number
  label?: string
  className?: string
}

export default function SettingBadge({ value, label, className }: SettingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-data font-semibold badge-setting',
        className
      )}
    >
      <span className="text-dusk">▼</span>
      <span>{value}</span>
      {label && <span className="text-silver/70">{label}</span>}
    </span>
  )
}
