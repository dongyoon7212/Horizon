'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import HorizonCard from '@/components/ui/HorizonCard'
import ChangeBadge from '@/components/ui/ChangeBadge'
import { formatNumber } from '@/lib/utils'
import type { HFModel } from '@/lib/types'

interface Props {
  models: HFModel[]
}

const rankColor = ['var(--horizon-gold)', 'var(--moon-silver)', 'var(--text-muted)']

const categoryStyle: Record<string, React.CSSProperties> = {
  LLM:        { color: '#22d3ee', borderColor: 'rgba(34,211,238,0.25)',  background: 'rgba(34,211,238,0.08)' },
  Image:      { color: '#38bdf8', borderColor: 'rgba(56,189,248,0.25)',  background: 'rgba(56,189,248,0.08)' },
  Audio:      { color: '#a5b4fc', borderColor: 'rgba(165,180,252,0.25)', background: 'rgba(165,180,252,0.08)' },
  Multimodal: { color: '#7dd3fc', borderColor: 'rgba(125,211,252,0.25)', background: 'rgba(125,211,252,0.08)' },
  Other:      { color: 'var(--text-muted)', borderColor: 'rgba(75,94,120,0.25)', background: 'rgba(75,94,120,0.07)' },
}

export default function TopModels({ models }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <div className="space-y-2">
        {models.map((model, i) => {
          // "org/model-name" 분리
          const slashIdx = model.model_id.indexOf('/')
          const org       = slashIdx !== -1 ? model.model_id.slice(0, slashIdx) : null
          const modelName = slashIdx !== -1 ? model.model_id.slice(slashIdx + 1) : model.model_id

          return (
            <Link key={model.model_id} href={`/models/${model.model_id}`} className="block group">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <HorizonCard className="flex items-center gap-4 px-4 py-3 transition-all duration-200 group-hover:border-cyan-500/20">
                  {/* 순위 */}
                  <span
                    className="font-data font-bold text-xl w-6 shrink-0 text-center tabular-nums"
                    style={{ color: rankColor[i] ?? 'var(--text-dim)' }}
                  >
                    {model.rank}
                  </span>

                  {/* 모델명 + 메타 */}
                  <div className="flex-1 min-w-0">
                    {/* 모델 이름 */}
                    <p className="font-body text-sm font-medium truncate" style={{ color: 'var(--text-star)' }}>
                      {modelName}
                    </p>
                    {/* org + 카테고리 + 다운로드 */}
                    <div className="flex items-center gap-2 mt-0.5 min-w-0">
                      {org && (
                        <span
                          className="font-data text-xs truncate shrink-0 max-w-[9rem]"
                          style={{ color: 'var(--text-dim)' }}
                        >
                          {org}
                        </span>
                      )}
                      <span
                        className="text-xs px-1.5 py-px rounded border font-data shrink-0"
                        style={categoryStyle[model.category] ?? categoryStyle.Other}
                      >
                        {model.category}
                      </span>
                      <span className="text-xs font-data shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatNumber(model.downloads)}
                      </span>
                    </div>
                  </div>

                  {/* 변화율 배지 */}
                  <ChangeBadge value={model.change_pct} />
                </HorizonCard>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
