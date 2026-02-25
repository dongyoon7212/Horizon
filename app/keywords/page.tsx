'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import HorizonCard from '@/components/ui/HorizonCard'
import RisingBadge from '@/components/ui/RisingBadge'
import SettingBadge from '@/components/ui/SettingBadge'
import HorizonDivider from '@/components/ui/HorizonDivider'
import TrendLineChart from '@/components/charts/TrendLineChart'

// ─── Mock 데이터 ───────────────────────────────────────────────
const DEFAULT_KEYWORDS = ['ChatGPT', 'Claude', 'Gemini', 'Llama', 'Mistral']

const chartData = [
  { date: 'Feb 17', ChatGPT: 88, Claude: 52, Gemini: 61, Llama: 38, Mistral: 24 },
  { date: 'Feb 18', ChatGPT: 85, Claude: 55, Gemini: 63, Llama: 42, Mistral: 26 },
  { date: 'Feb 19', ChatGPT: 82, Claude: 60, Gemini: 65, Llama: 44, Mistral: 28 },
  { date: 'Feb 20', ChatGPT: 80, Claude: 64, Gemini: 67, Llama: 48, Mistral: 30 },
  { date: 'Feb 21', ChatGPT: 78, Claude: 68, Gemini: 70, Llama: 52, Mistral: 33 },
  { date: 'Feb 22', ChatGPT: 76, Claude: 72, Gemini: 72, Llama: 55, Mistral: 36 },
  { date: 'Feb 23', ChatGPT: 74, Claude: 78, Gemini: 74, Llama: 58, Mistral: 38 },
]

const seriesConfig = [
  { key: 'ChatGPT', label: 'ChatGPT', trend: 'falling' as const },
  { key: 'Claude',  label: 'Claude',  trend: 'rising'  as const },
  { key: 'Gemini',  label: 'Gemini',  trend: 'rising'  as const },
  { key: 'Llama',   label: 'Llama',   trend: 'rising'  as const },
  { key: 'Mistral', label: 'Mistral', trend: 'rising'  as const },
]

const keywordStats = [
  { keyword: 'ChatGPT',       score: 74, change: '-14%', trend: 'falling' as const, region: 'Global' },
  { keyword: 'Claude',        score: 78, change: '+50%', trend: 'rising'  as const, region: 'Global' },
  { keyword: 'Gemini',        score: 74, change: '+21%', trend: 'rising'  as const, region: 'Global' },
  { keyword: 'Llama',         score: 58, change: '+53%', trend: 'rising'  as const, region: 'Global' },
  { keyword: 'Mistral',       score: 38, change: '+58%', trend: 'rising'  as const, region: 'Global' },
  { keyword: 'Stable Diffusion', score: 30, change: '-22%', trend: 'falling' as const, region: 'Global' },
]

export default function KeywordsPage() {
  const [activeKeywords, setActiveKeywords] = useState(new Set(DEFAULT_KEYWORDS))

  const toggleKeyword = (kw: string) => {
    setActiveKeywords(prev => {
      const next = new Set(prev)
      if (next.has(kw)) {
        if (next.size > 1) next.delete(kw)
      } else {
        next.add(kw)
      }
      return next
    })
  }

  const activeSeries = seriesConfig.filter(s => activeKeywords.has(s.key))

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl font-bold gradient-text-set mb-1">
          Keyword Trends
        </h1>
        <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
          Google Trends interest over time — relative score 0–100
        </p>
      </motion.div>

      {/* 키워드 토글 */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {seriesConfig.map((s) => {
          const isActive = activeKeywords.has(s.key)
          const color = s.trend === 'rising' ? 'rgba(232,98,42,0.3)' : 'rgba(124,77,158,0.3)'
          const textColor = s.trend === 'rising' ? 'var(--horizon-fire)' : 'var(--moon-dusk)'
          return (
            <button
              key={s.key}
              onClick={() => toggleKeyword(s.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-body transition-all duration-150"
              style={{
                background: isActive ? (s.trend === 'rising' ? 'rgba(232,98,42,0.1)' : 'rgba(124,77,158,0.1)') : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.05)'}`,
                color: isActive ? textColor : 'var(--text-muted)',
                opacity: isActive ? 1 : 0.5,
              }}
            >
              {s.key}
            </button>
          )
        })}
      </div>

      {/* 차트 */}
      <HorizonCard delay={0.1} className="p-5 mb-3">
        <TrendLineChart data={chartData} series={activeSeries} height={260} />
      </HorizonCard>

      <HorizonDivider label="Keyword Stats" />

      {/* 키워드 테이블 */}
      <div className="space-y-2">
        {keywordStats.map((kw, i) => (
          <HorizonCard
            key={kw.keyword}
            delay={0.04 * i}
            variant={kw.trend === 'falling' ? 'setting' : 'neutral'}
            className="flex items-center gap-4 px-4 py-3"
          >
            {/* 인터레스트 바 */}
            <div className="w-12 h-1.5 rounded-full shrink-0" style={{ background: 'var(--text-dim)' }}>
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${kw.score}%`,
                  background: kw.trend === 'rising' ? 'var(--horizon-fire)' : 'var(--moon-dusk)',
                }}
              />
            </div>

            <span className="font-body text-sm font-semibold flex-1" style={{ color: 'var(--text-star)' }}>
              {kw.keyword}
            </span>

            <span className="font-data text-sm tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {kw.score}
            </span>

            {kw.trend === 'rising'
              ? <RisingBadge value={kw.change} />
              : <SettingBadge value={kw.change} />
            }
          </HorizonCard>
        ))}
      </div>
    </div>
  )
}
