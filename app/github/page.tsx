'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import HorizonCard from '@/components/ui/HorizonCard'
import RisingBadge from '@/components/ui/RisingBadge'
import HorizonDivider from '@/components/ui/HorizonDivider'
import TrendLineChart from '@/components/charts/TrendLineChart'

// ─── Mock 데이터 ───────────────────────────────────────────────
const LANGUAGES = ['All', 'Python', 'TypeScript', 'Rust', 'C++'] as const
type Lang = typeof LANGUAGES[number]

const chartData = [
  { date: 'Feb 17', ollama: 42000, langchain: 88000, vllm: 21000, litellm: 12000 },
  { date: 'Feb 18', ollama: 44000, langchain: 89000, vllm: 22500, litellm: 12800 },
  { date: 'Feb 19', ollama: 47000, langchain: 90500, vllm: 24000, litellm: 13500 },
  { date: 'Feb 20', ollama: 50000, langchain: 92000, vllm: 25800, litellm: 14200 },
  { date: 'Feb 21', ollama: 54000, langchain: 93500, vllm: 27500, litellm: 15100 },
  { date: 'Feb 22', ollama: 57500, langchain: 95000, vllm: 29000, litellm: 16000 },
  { date: 'Feb 23', ollama: 61000, langchain: 96500, vllm: 31000, litellm: 17000 },
]

const chartSeries = [
  { key: 'langchain', label: 'LangChain', trend: 'rising' as const },
  { key: 'ollama',    label: 'Ollama',    trend: 'rising' as const },
  { key: 'vllm',      label: 'vLLM',      trend: 'rising' as const },
  { key: 'litellm',   label: 'LiteLLM',   trend: 'rising' as const },
]

const repos = [
  { name: 'langchain-ai/langchain',  stars: 96500,  delta: 1500, lang: 'Python',     desc: 'Build LLM-powered applications' },
  { name: 'ollama/ollama',           stars: 61000,  delta: 3500, lang: 'TypeScript',  desc: 'Get up and running with LLMs locally' },
  { name: 'vllm-project/vllm',       stars: 31000,  delta: 2000, lang: 'Python',      desc: 'High-throughput LLM inference' },
  { name: 'BerriAI/litellm',         stars: 17000,  delta: 1000, lang: 'Python',      desc: 'Call 100+ LLMs with unified API' },
  { name: 'ggerganov/llama.cpp',     stars: 68000,  delta:  800, lang: 'C++',         desc: 'LLM inference in pure C/C++' },
  { name: 'huggingface/transformers',stars: 132000, delta:  500, lang: 'Python',      desc: 'State-of-the-art ML library' },
  { name: 'microsoft/autogen',       stars: 37000,  delta: 1200, lang: 'Python',      desc: 'Multi-agent conversation framework' },
  { name: 'vercel/ai',               stars: 14000,  delta:  900, lang: 'TypeScript',  desc: 'AI SDK for TypeScript and React' },
]

const langDotColor: Record<string, string> = {
  Python:     '#3b82f6',
  TypeScript: '#f59e0b',
  Rust:       '#ef4444',
  'C++':      '#8b5cf6',
}

export default function GitHubPage() {
  const [activeLang, setActiveLang] = useState<Lang>('All')

  const filtered = activeLang === 'All'
    ? repos
    : repos.filter(r => r.lang === activeLang)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--moon-silver)' }}>
          GitHub Trends
        </h1>
        <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
          AI-related repositories trending this week
        </p>
      </motion.div>

      {/* 차트 */}
      <HorizonCard delay={0.1} className="p-5 mb-3">
        <p className="text-xs font-body mb-4" style={{ color: 'var(--text-muted)' }}>
          Top repos · cumulative stars
        </p>
        <TrendLineChart data={chartData} series={chartSeries} height={240} />
      </HorizonCard>

      <HorizonDivider label="Trending Repos" />

      {/* 언어 필터 */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className="px-3 py-1.5 rounded-lg text-xs font-body transition-colors duration-150"
            style={{
              background: activeLang === lang ? 'rgba(124,77,158,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeLang === lang ? 'rgba(124,77,158,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: activeLang === lang ? 'var(--moon-silver)' : 'var(--text-muted)',
            }}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* 레포 리스트 */}
      <div className="space-y-2">
        {filtered.map((repo, i) => (
          <HorizonCard key={repo.name} delay={0.04 * i} className="flex items-center gap-4 px-4 py-3">
            {/* 언어 점 */}
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: langDotColor[repo.lang] ?? '#60547a' }}
            />

            {/* 레포 정보 */}
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold truncate" style={{ color: 'var(--text-star)' }}>
                {repo.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {repo.desc}
              </p>
            </div>

            {/* 스타 수 */}
            <div className="text-right shrink-0">
              <p className="font-data text-sm tabular-nums" style={{ color: 'var(--text-star)' }}>
                ★ {repo.stars.toLocaleString()}
              </p>
              <RisingBadge value={`+${repo.delta.toLocaleString()}`} />
            </div>
          </HorizonCard>
        ))}
      </div>
    </div>
  )
}
