'use client'

import { cn } from '@/lib/utils'

interface ChangeBadgeProps {
  value: number   // change_pct 숫자값
  className?: string
}

/**
 * 변화율 배지 — 양수: 시안 상승 ▲, 음수: 인디고 하락 ▼, 0: 중립 —
 */
export default function ChangeBadge({ value, className }: ChangeBadgeProps) {
  // 0% — 중립
  if (value === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-data font-semibold',
          className
        )}
        style={{
          background: 'rgba(37,48,71,0.5)',
          border: '1px solid rgba(37,48,71,0.8)',
          color: 'var(--text-muted)',
        }}
      >
        —
      </span>
    )
  }

  // 양수 — rising
  if (value > 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-data font-semibold badge-rising',
          className
        )}
      >
        <span className="text-fire">▲</span>
        <span>+{value}%</span>
      </span>
    )
  }

  // 음수 — setting
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-data font-semibold badge-setting',
        className
      )}
    >
      <span className="text-dusk">▼</span>
      <span>{value}%</span>
    </span>
  )
}
