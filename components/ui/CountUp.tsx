'use client'

import ReactCountUp from 'react-countup'
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
  start = 0,
  duration = 2,
  suffix,
  prefix,
  decimals = 0,
  trend = 'neutral',
  className,
}: CountUpProps) {
  return (
    <ReactCountUp
      start={start}
      end={end}
      duration={duration}
      suffix={suffix}
      prefix={prefix}
      decimals={decimals}
      separator=","
    >
      {({ countUpRef }) => (
        <span
          ref={countUpRef}
          className={cn(
            'font-data font-bold tabular-nums',
            trend === 'rising'  && 'text-fire',
            trend === 'setting' && 'text-dusk',
            trend === 'neutral' && 'text-star',
            className
          )}
        />
      )}
    </ReactCountUp>
  )
}
