'use client'

import HorizonCard from '@/components/ui/HorizonCard'
import CountUp from '@/components/ui/CountUp'
import type { DashboardStats } from '@/lib/types'

interface Props {
  stats: DashboardStats
}

export default function StatsBar({ stats }: Props) {
  const items = [
    { label: 'Models Tracked',   value: stats.risingModels,     suffix: '',  trend: 'rising'  as const },
    { label: 'Keywords Tracked', value: stats.keywordsTracked,  suffix: '',  trend: 'neutral' as const },
    { label: 'Last Updated',     value: stats.lastUpdatedHours, suffix: 'h', trend: 'neutral' as const },
    { label: 'Weekly Papers',    value: stats.weeklyPapers,     suffix: '',  trend: 'rising'  as const },
  ]

  return (
    <section className="max-w-6xl mx-auto px-6 py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <HorizonCard key={item.label} delay={i * 0.08} className="px-5 py-4"
            style={{ background: 'rgba(12,21,37,0.65)', backdropFilter: 'blur(20px)' } as React.CSSProperties}
          >
            {/* Last Updated = 0h → "< 1h" 텍스트 처리 */}
            {item.label === 'Last Updated' && item.value === 0 ? (
              <span
                className="font-data font-bold text-2xl block mb-1"
                style={{ color: 'var(--text-star)' }}
              >
                &lt;&nbsp;1h
              </span>
            ) : (
              <CountUp
                end={item.value}
                suffix={item.suffix}
                trend={item.trend}
                className="text-2xl block mb-1"
              />
            )}
            <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
              {item.label}
            </p>
          </HorizonCard>
        ))}
      </div>
    </section>
  )
}
