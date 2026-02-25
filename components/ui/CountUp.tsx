'use client'

import { cn } from '@/lib/utils'

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  trend?: 'rising' | 'setting' | 'neutral'
  className?: string
}

export default function CountUp({
  end,
  suffix = '',
  prefix = '',
  decimals = 0,
  trend = 'neutral',
  className,
}: CountUpProps) {
  const formatted = decimals > 0
    ? end.toFixed(decimals)
    : end.toLocaleString()

  return (
    <span
      className={cn(
        'font-data font-bold tabular-nums',
        trend === 'rising'  && 'text-fire',
        trend === 'setting' && 'text-dusk',
        trend === 'neutral' && 'text-star',
        className
      )}
    >
      {prefix}{formatted}{suffix}
    </span>
  )
}
