export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getKeywordByName, getAllKeywords } from '@/lib/data'
import type { KeywordTrend } from '@/lib/types'
import ChangeBadge from '@/components/ui/ChangeBadge'

interface Props {
  params: { keyword: string }
}

function ScoreBar({ score, trend }: { score: number; trend: KeywordTrend['trend'] }) {
  const color = trend === 'rising' ? '#22d3ee' : trend === 'falling' ? '#818cf8' : '#4b5e78'
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="font-data font-bold text-3xl" style={{ color: 'var(--text-star)' }}>
          {score}
        </span>
        <span className="text-xs font-body pb-1" style={{ color: 'var(--text-dim)' }}>/ 100</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'var(--text-dim)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <p className="text-xs font-body" style={{ color: 'var(--text-dim)' }}>
        Google Trends interest score (relative, 0–100)
      </p>
    </div>
  )
}

function RelatedCard({ kw }: { kw: KeywordTrend }) {
  return (
    <Link href={`/keywords/${encodeURIComponent(kw.keyword)}`} className="block group">
      <div className="horizon-card px-4 py-3 transition-all duration-200 group-hover:border-cyan-500/20">
        <div className="flex items-center justify-between">
          <p className="font-body text-sm font-medium" style={{ color: 'var(--text-star)' }}>
            {kw.keyword}
          </p>
          <ChangeBadge value={kw.change_pct} />
        </div>
        <div className="mt-2 h-0.5 rounded-full" style={{ background: 'var(--text-dim)' }}>
          <div
            className="h-0.5 rounded-full"
            style={{
              width: `${kw.score}%`,
              background: kw.trend === 'rising' ? '#22d3ee' : '#818cf8',
            }}
          />
        </div>
      </div>
    </Link>
  )
}

export default async function KeywordDetailPage({ params }: Props) {
  const keyword = decodeURIComponent(params.keyword)
  const [kw, allKeywords] = await Promise.all([
    getKeywordByName(keyword),
    getAllKeywords(),
  ])

  if (!kw) return notFound()

  const collectedAgo = kw.collected_at
    ? Math.round((Date.now() - new Date(kw.collected_at).getTime()) / 3_600_000)
    : null

  const related = allKeywords
    .filter(k => k.keyword !== keyword && k.trend === kw.trend)
    .slice(0, 4)

  const trendLabel = kw.trend === 'rising' ? 'Rising 🌅' : kw.trend === 'falling' ? 'Setting 🌙' : 'Stable ✦'
  const trendColor = kw.trend === 'rising' ? '#22d3ee' : kw.trend === 'falling' ? '#818cf8' : '#4b5e78'

  const googleTrendsUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}`

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 mb-8 text-xs font-body" style={{ color: 'var(--text-dim)' }}>
        <Link href="/" className="hover:text-star transition-colors">Dawn</Link>
        <span>/</span>
        <Link href="/keywords" className="hover:text-star transition-colors">Keywords</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{kw.keyword}</span>
      </div>

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text-star)' }}>
            {kw.keyword}
          </h1>
          <p className="text-sm font-body" style={{ color: trendColor }}>
            {trendLabel}
          </p>
        </div>
        <ChangeBadge value={kw.change_pct} className="text-sm px-3 py-1.5" />
      </div>

      {/* 스코어 카드 */}
      <div className="horizon-card px-5 py-5 mb-6">
        <p className="text-xs font-body mb-4" style={{ color: 'var(--text-muted)' }}>
          Interest Score
        </p>
        <ScoreBar score={kw.score} trend={kw.trend} />
      </div>

      {/* 메타 스탯 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Score',    value: `${kw.score}/100` },
          { label: 'Change',   value: kw.change_pct === 0 ? '—' : `${kw.change_pct > 0 ? '+' : ''}${kw.change_pct}%` },
          { label: 'Updated',  value: collectedAgo != null ? (collectedAgo === 0 ? '< 1h' : `${collectedAgo}h ago`) : '—' },
        ].map(stat => (
          <div key={stat.label} className="horizon-card px-4 py-3 text-center">
            <p className="font-data font-bold text-base mb-0.5" style={{ color: 'var(--text-star)' }}>
              {stat.value}
            </p>
            <p className="text-xs font-body" style={{ color: 'var(--text-dim)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Previous Score */}
      {kw.score_prev != null && kw.score_prev !== kw.score && (
        <div className="horizon-card px-5 py-4 mb-6">
          <p className="text-xs font-body mb-3" style={{ color: 'var(--text-muted)' }}>
            Score Change
          </p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-data font-bold" style={{ color: 'var(--text-dim)' }}>{kw.score_prev}</p>
              <p className="text-xs font-body" style={{ color: 'var(--text-dim)' }}>Previous</p>
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--text-dim)' }} />
            <div className="text-center">
              <p className="font-data font-bold" style={{ color: 'var(--text-star)' }}>{kw.score}</p>
              <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Current</p>
            </div>
          </div>
        </div>
      )}

      {/* Google Trends 링크 */}
      <a
        href={googleTrendsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 w-full horizon-card px-5 py-3.5 mb-10 group transition-all duration-200 hover:border-indigo-500/30"
      >
        <span className="text-base">📈</span>
        <span className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          View on Google Trends
        </span>
        <span className="ml-auto text-xs font-data group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--text-dim)' }}>
          →
        </span>
      </a>

      {/* 관련 키워드 */}
      {related.length > 0 && (
        <>
          <div className="horizon-divider mb-6" />
          <p className="text-xs font-body uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>
            {kw.trend === 'rising' ? 'Also Rising' : kw.trend === 'falling' ? 'Also Setting' : 'Similar Keywords'}
          </p>
          <div className="space-y-2">
            {related.map(k => <RelatedCard key={k.keyword} kw={k} />)}
          </div>
        </>
      )}
    </div>
  )
}
