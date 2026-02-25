'use client'

import { motion } from 'framer-motion'
import HorizonCard from '@/components/ui/HorizonCard'
import RisingBadge from '@/components/ui/RisingBadge'
import type { KeywordTrend } from '@/lib/types'

interface Props {
  topics: KeywordTrend[]
}

export default function RisingTopics({ topics }: Props) {
  return (
    <section className="pb-10">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 mb-4"
      >
        <span className="text-lg">🌅</span>
        <h2 className="font-display text-base font-semibold gradient-text-rise">Rising</h2>
        <span className="text-xs font-body ml-1" style={{ color: 'var(--text-muted)' }}>
          top {topics.length} this week
        </span>
      </motion.div>

      <div className="space-y-2">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.keyword}
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: 0.06 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <HorizonCard className="flex items-center gap-3 px-4 py-3">
              {/* 순위 */}
              <span
                className="font-data text-lg w-5 shrink-0 text-center tabular-nums"
                style={{ color: 'var(--text-dim)' }}
              >
                {i + 1}
              </span>

              {/* 키워드 + 바 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-body text-sm font-semibold" style={{ color: 'var(--text-star)' }}>
                    {topic.keyword}
                  </span>
                  <RisingBadge value={`+${topic.change_pct}%`} />
                </div>
                {/* 진행 바 */}
                <div className="h-px rounded-full" style={{ background: 'var(--text-dim)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${topic.score}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                    className="h-px rounded-full"
                    style={{ background: 'var(--horizon-fire)' }}
                  />
                </div>
              </div>
            </HorizonCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
