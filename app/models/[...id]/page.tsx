export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getModelById, getAllModels } from '@/lib/data'
import { formatNumber } from '@/lib/utils'
import type { HFModel } from '@/lib/types'
import ChangeBadge from '@/components/ui/ChangeBadge'

interface Props {
  params: { id: string[] }
}

const categoryColor: Record<string, string> = {
  LLM:        '#22d3ee',
  Image:      '#38bdf8',
  Audio:      '#a5b4fc',
  Multimodal: '#7dd3fc',
  Other:      '#4b5e78',
}

const categoryBg: Record<string, string> = {
  LLM:        'rgba(34,211,238,0.08)',
  Image:      'rgba(56,189,248,0.08)',
  Audio:      'rgba(165,180,252,0.08)',
  Multimodal: 'rgba(125,211,252,0.08)',
  Other:      'rgba(75,94,120,0.07)',
}

function TrendBar({ model }: { model: HFModel }) {
  const pct = model.change_pct
  const isRising  = pct > 0
  const isFalling = pct < 0
  const barColor  = isRising ? '#22d3ee' : isFalling ? '#818cf8' : '#253047'
  const fillPct   = Math.min(Math.abs(pct), 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
          {isRising ? 'Growing' : isFalling ? 'Declining' : 'Stable'}
        </span>
        <ChangeBadge value={pct} />
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'var(--text-dim)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${fillPct}%`, background: barColor }}
        />
      </div>
    </div>
  )
}

function RelatedCard({ model }: { model: HFModel }) {
  const slash = model.model_id.indexOf('/')
  const name  = slash !== -1 ? model.model_id.slice(slash + 1) : model.model_id
  const org   = slash !== -1 ? model.model_id.slice(0, slash) : null
  return (
    <Link href={`/models/${model.model_id}`} className="block group">
      <div
        className="horizon-card px-4 py-3 transition-all duration-200 group-hover:border-cyan-500/30"
      >
        <p
          className="font-body text-sm font-medium truncate mb-0.5"
          style={{ color: 'var(--text-star)' }}
        >
          {name}
        </p>
        <div className="flex items-center gap-2">
          {org && (
            <span className="font-data text-xs" style={{ color: 'var(--text-dim)' }}>
              {org}
            </span>
          )}
          <span
            className="text-xs px-1.5 py-px rounded border font-data"
            style={{
              color: categoryColor[model.category] ?? categoryColor.Other,
              background: categoryBg[model.category] ?? categoryBg.Other,
              borderColor: (categoryColor[model.category] ?? '#4b5e78') + '40',
            }}
          >
            {model.category}
          </span>
          <span className="font-data text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
            {formatNumber(model.downloads)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function ModelDetailPage({ params }: Props) {
  const modelId = params.id.join('/')
  const [model, allModels] = await Promise.all([
    getModelById(modelId),
    getAllModels(),
  ])

  if (!model) return notFound()

  const slash     = model.model_id.indexOf('/')
  const org       = slash !== -1 ? model.model_id.slice(0, slash) : null
  const modelName = slash !== -1 ? model.model_id.slice(slash + 1) : model.model_id

  const related = allModels
    .filter(m => m.model_id !== model.model_id && m.category === model.category)
    .slice(0, 3)

  const collectedAgo = model.collected_at
    ? Math.round((Date.now() - new Date(model.collected_at).getTime()) / 3_600_000)
    : null

  const hfUrl = `https://huggingface.co/${model.model_id}`

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 mb-8 text-xs font-body" style={{ color: 'var(--text-dim)' }}>
        <Link href="/" className="hover:text-star transition-colors">Dawn</Link>
        <span>/</span>
        <Link href="/models" className="hover:text-star transition-colors">Models</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-muted)' }} className="truncate max-w-[200px]">{modelName}</span>
      </div>

      {/* 헤더 */}
      <div className="mb-8">
        {org && (
          <p className="font-data text-sm mb-1" style={{ color: 'var(--text-dim)' }}>
            {org}
          </p>
        )}
        <div className="flex items-start gap-3 flex-wrap">
          <h1
            className="font-display text-2xl sm:text-3xl font-bold break-all"
            style={{ color: 'var(--text-star)' }}
          >
            {modelName}
          </h1>
          <span
            className="shrink-0 mt-1 text-sm px-2 py-0.5 rounded border font-data"
            style={{
              color: categoryColor[model.category] ?? categoryColor.Other,
              background: categoryBg[model.category] ?? categoryBg.Other,
              borderColor: (categoryColor[model.category] ?? '#4b5e78') + '40',
            }}
          >
            {model.category}
          </span>
        </div>
      </div>

      {/* 핵심 스탯 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Downloads',   value: formatNumber(model.downloads), icon: '📥' },
          { label: 'Rank',        value: `#${model.rank}`,              icon: '🏆' },
          { label: 'Change',      value: model.change_pct === 0 ? '—' : `${model.change_pct > 0 ? '+' : ''}${model.change_pct}%`, icon: '📊' },
          { label: 'Updated',     value: collectedAgo != null ? (collectedAgo === 0 ? '< 1h' : `${collectedAgo}h ago`) : '—', icon: '⏱' },
        ].map(stat => (
          <div
            key={stat.label}
            className="horizon-card px-4 py-3 text-center"
          >
            <p className="text-lg mb-0.5">{stat.icon}</p>
            <p className="font-data font-bold text-base" style={{ color: 'var(--text-star)' }}>
              {stat.value}
            </p>
            <p className="text-xs font-body" style={{ color: 'var(--text-dim)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* 트렌드 바 */}
      <div className="horizon-card px-5 py-4 mb-6">
        <p className="text-xs font-body mb-3" style={{ color: 'var(--text-muted)' }}>
          Download Trend
        </p>
        <TrendBar model={model} />
        {model.downloads_prev && model.downloads_prev !== model.downloads && (
          <p className="text-xs font-data mt-2" style={{ color: 'var(--text-dim)' }}>
            Previous: {formatNumber(model.downloads_prev)} → Current: {formatNumber(model.downloads)}
          </p>
        )}
      </div>

      {/* HuggingFace 링크 */}
      <a
        href={hfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 w-full horizon-card px-5 py-3.5 mb-10 group transition-all duration-200 hover:border-cyan-500/30"
      >
        <span className="text-base">🤗</span>
        <span className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          View on Hugging Face
        </span>
        <span className="ml-auto text-xs font-data group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--text-dim)' }}>
          →
        </span>
      </a>

      {/* 관련 모델 */}
      {related.length > 0 && (
        <>
          <div className="horizon-divider mb-6" />
          <p className="text-xs font-body uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>
            Related · {model.category}
          </p>
          <div className="space-y-2">
            {related.map(m => <RelatedCard key={m.model_id} model={m} />)}
          </div>
        </>
      )}
    </div>
  )
}
