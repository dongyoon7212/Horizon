'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import HorizonCard from '@/components/ui/HorizonCard'
import ChangeBadge from '@/components/ui/ChangeBadge'
import HorizonDivider from '@/components/ui/HorizonDivider'
import TrendLineChart from '@/components/charts/TrendLineChart'
import { formatNumber } from '@/lib/utils'
import type { HFModel } from '@/lib/types'

const TABS = ['All', 'LLM', 'Image', 'Audio', 'Multimodal'] as const
type Tab = typeof TABS[number]

// 차트는 히스토리컬 데이터가 없으므로 대표 mock 유지
const chartData = [
  { date: 'Feb 17', llama: 3200000, mistral: 2800000, sd3: 2100000, whisper: 1900000, gemma: 1500000 },
  { date: 'Feb 18', llama: 3450000, mistral: 2950000, sd3: 2200000, whisper: 1950000, gemma: 1600000 },
  { date: 'Feb 19', llama: 3700000, mistral: 3050000, sd3: 2400000, whisper: 2000000, gemma: 1650000 },
  { date: 'Feb 20', llama: 3900000, mistral: 3100000, sd3: 2600000, whisper: 2050000, gemma: 1700000 },
  { date: 'Feb 21', llama: 4200000, mistral: 3250000, sd3: 2750000, whisper: 2080000, gemma: 1780000 },
  { date: 'Feb 22', llama: 4550000, mistral: 3380000, sd3: 2900000, whisper: 2100000, gemma: 1830000 },
  { date: 'Feb 23', llama: 4820000, mistral: 3410000, sd3: 2950000, whisper: 2100000, gemma: 1870000 },
]

const chartSeries = [
  { key: 'llama',   label: 'Llama 3.2',      trend: 'rising'  as const },
  { key: 'sd3',     label: 'Stable Diff. 3', trend: 'rising'  as const },
  { key: 'mistral', label: 'Mistral 7B',     trend: 'rising'  as const },
  { key: 'gemma',   label: 'Gemma 2',        trend: 'stable'  as const },
  { key: 'whisper', label: 'Whisper v3',     trend: 'stable'  as const },
]

const categoryStyle: Record<string, { color: string; bg: string; border: string }> = {
  LLM:        { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)',   border: 'rgba(34,211,238,0.25)'  },
  Image:      { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',   border: 'rgba(56,189,248,0.25)'  },
  Audio:      { color: '#a5b4fc', bg: 'rgba(165,180,252,0.08)',  border: 'rgba(165,180,252,0.25)' },
  Multimodal: { color: '#7dd3fc', bg: 'rgba(125,211,252,0.08)',  border: 'rgba(125,211,252,0.25)' },
  Other:      { color: 'var(--text-muted)', bg: 'rgba(75,94,120,0.07)', border: 'rgba(75,94,120,0.25)' },
}

interface Props {
  models: HFModel[]
}

export default function ModelsPageClient({ models }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('All')

  const filtered = activeTab === 'All'
    ? models
    : models.filter(m => m.category === activeTab)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* 페이지 헤더 */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl font-bold gradient-text-rise mb-1">
          Model Trends
        </h1>
        <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
          Download trends from Hugging Face — updated daily
        </p>
      </motion.div>

      {/* 차트 (참고용 mock) */}
      <HorizonCard delay={0.1} className="p-5 mb-3">
        <p className="text-xs font-body mb-4" style={{ color: 'var(--text-muted)' }}>
          Top 5 models · 7-day downloads (demo)
        </p>
        <TrendLineChart data={chartData} series={chartSeries} height={240} />
      </HorizonCard>

      <HorizonDivider label="Model List" />

      {/* 탭 필터 */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-lg text-xs font-body transition-colors duration-150"
            style={{
              background: activeTab === tab ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === tab ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: activeTab === tab ? '#22d3ee' : 'var(--text-muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 모델 리스트 */}
      <div className="space-y-2">
        {filtered.map((model, i) => {
          const slashIdx = model.model_id.indexOf('/')
          const org       = slashIdx !== -1 ? model.model_id.slice(0, slashIdx) : null
          const modelName = slashIdx !== -1 ? model.model_id.slice(slashIdx + 1) : model.model_id
          const catStyle  = categoryStyle[model.category] ?? categoryStyle.Other

          return (
            <Link key={model.model_id} href={`/models/${model.model_id}`} className="block group">
              <HorizonCard
                delay={0.04 * i}
                variant={model.trend === 'falling' ? 'setting' : 'neutral'}
                className="flex items-center gap-4 px-4 py-3 transition-all duration-200 group-hover:border-cyan-500/20"
              >
                {/* 순위 */}
                <span className="font-data text-sm w-6 shrink-0 text-center tabular-nums" style={{ color: 'var(--text-dim)' }}>
                  #{model.rank}
                </span>

                {/* 모델명 + 메타 */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium truncate" style={{ color: 'var(--text-star)' }}>
                    {modelName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {org && (
                      <span className="font-data text-xs truncate max-w-[8rem]" style={{ color: 'var(--text-dim)' }}>
                        {org}
                      </span>
                    )}
                    <span
                      className="text-xs px-1.5 py-px rounded border font-data shrink-0"
                      style={{ color: catStyle.color, background: catStyle.bg, borderColor: catStyle.border }}
                    >
                      {model.category}
                    </span>
                    <span className="font-data text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatNumber(model.downloads)}
                    </span>
                  </div>
                </div>

                <ChangeBadge value={model.change_pct} />
              </HorizonCard>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
