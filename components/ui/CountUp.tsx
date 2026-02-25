'use client'

import { useState, useEffect } from 'react'
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

const spanClass = (trend: string, className?: string) =>
  cn(
    'font-data font-bold tabular-nums',
    trend === 'rising'  && 'text-fire',
    trend === 'setting' && 'text-dusk',
    trend === 'neutral' && 'text-star',
    className
  )

export default function CountUp({
  end,
  start = 0,
  duration = 2,
  suffix = '',
  prefix = '',
  decimals = 0,
  trend = 'neutral',
  className,
}: CountUpProps) {
  // hydration 전에는 실제 값을 바로 표시 (SSR 빈 span 방지)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <span className={spanClass(trend, className)}>
        {prefix}{end.toLocaleString()}{suffix}
      </span>
    )
  }

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
          className={spanClass(trend, className)}
        />
      )}
    </ReactCountUp>
  )
}
