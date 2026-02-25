'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import HorizonCard from '@/components/ui/HorizonCard'
import RisingBadge from '@/components/ui/RisingBadge'
import SettingBadge from '@/components/ui/SettingBadge'
import HorizonDivider from '@/components/ui/HorizonDivider'
import TrendLineChart from '@/components/charts/TrendLineChart'
import { formatNumber } from '@/lib/utils'

const TABS = ['All', 'LLM', 'Image', 'Audio', 'Multimodal'] as const
type Tab = typeof TABS[number]

// ─── Mock 데이터 ───────────────────────────────────────────────
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

const models = [
  { name: 'meta-llama/Llama-3.2-11B-Vision',    category: 'Multimodal', downloads: 4820000, change: '+23%', trend: 'rising'  as const },
  { name: 'mistralai/Mistral-7B-Instruct-v0.3', category: 'LLM',        downloads: 3410000, change: '+18%', trend: 'rising'  as const },
  { name: 'stabilityai/stable-diffusion-3',      category: 'Image',      downloads: 2950000, change: '+31%', trend: 'rising'  as const },
  { name: 'openai/whisper-large-v3',             category: 'Audio',      downloads: 2100000, change: '+9%',  trend: 'stable'  as const },
  { name: 'google/gemma-2-9b-it',                category: 'LLM',        downloads: 1870000, change: '+15%', trend: 'rising'  as const },
  { name: 'CompVis/stable-diffusion-v1-4',        category: 'Image',      downloads: 1200000, change: '-12%', trend: 'falling' as const },
  { name: 'gpt2',                                 category: 'LLM',        downloads:  980000, change: '-18%', trend: 'falling' as const },
  { name: 'facebook/wav2vec2-base',               category: 'Audio',      downloads:  760000, change: '-8%',  trend: 'falling' as const },
]

export default function ModelsPage() {
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
          Download trends from Hugging Face — updated every 6 hours
        </p>
      </motion.div>

      {/* 차트 */}
      <HorizonCard delay={0.1} className="p-5 mb-3">
        <p className="text-xs font-body mb-4" style={{ color: 'var(--text-muted)' }}>
          Top 5 models · 7-day downloads
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
              background: activeTab === tab ? 'rgba(232,98,42,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === tab ? 'rgba(232,98,42,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: activeTab === tab ? 'var(--horizon-fire)' : 'var(--text-muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 모델 리스트 */}
      <div className="space-y-2">
        {filtered.map((model, i) => (
          <HorizonCard
            key={model.name}
            delay={0.04 * i}
            variant={model.trend === 'falling' ? 'setting' : 'neutral'}
            className="flex items-center gap-4 px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm truncate" style={{ color: 'var(--text-star)' }}>
                {model.name}
              </p>
              <span className="text-xs font-data" style={{ color: 'var(--text-muted)' }}>
                {formatNumber(model.downloads)} downloads · {model.category}
              </span>
            </div>
            {model.trend === 'rising' || model.trend === 'stable'
              ? <RisingBadge value={model.change} />
              : <SettingBadge value={model.change} />
            }
          </HorizonCard>
        ))}
      </div>
    </div>
  )
}
