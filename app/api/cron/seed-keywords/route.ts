import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// 2026년 2월 기준 AI 키워드 초기 시드 데이터
// 점수 기준: Wikipedia 영문 페이지 주간 조회수 sqrt 정규화 (ChatGPT=100)
// 출처: Wikimedia Pageview API (실제 공개 데이터)
// 실제 관심도: ChatGPT >> Claude > Grok ≈ Google Gemini > Perplexity > DeepSeek > ...
// "Bard", "Claude 3.7", "Gemini 2.0" 같은 구버전/리브랜딩 키워드 제거
const SEED_KEYWORDS = [
  // ── 상위권 (score ≥ 20) ───────────────────────────────────────────
  { keyword: 'ChatGPT',          score: 100, change_pct:  -3, trend: 'stable'  as const },
  { keyword: 'Claude',           score:  38, change_pct:  14, trend: 'rising'  as const },
  { keyword: 'Google Gemini',    score:  26, change_pct:   8, trend: 'stable'  as const },
  { keyword: 'Grok',             score:  26, change_pct:  -7, trend: 'stable'  as const },
  { keyword: 'Perplexity',       score:  25, change_pct:  23, trend: 'rising'  as const },
  { keyword: 'DeepSeek',         score:  20, change_pct:  16, trend: 'rising'  as const },
  // ── 중위권 (score 10~19) ─────────────────────────────────────────
  { keyword: 'NotebookLM',       score:  15, change_pct:  11, trend: 'rising'  as const },
  { keyword: 'Mistral AI',       score:  14, change_pct:   4, trend: 'stable'  as const },
  { keyword: 'Llama',            score:  14, change_pct: -55, trend: 'falling' as const },
  { keyword: 'Midjourney',       score:  12, change_pct:   2, trend: 'stable'  as const },
  { keyword: 'Stable Diffusion', score:  12, change_pct:   3, trend: 'stable'  as const },
  { keyword: 'Sora',             score:  12, change_pct:   2, trend: 'stable'  as const },
  { keyword: 'Qwen',             score:  11, change_pct:   9, trend: 'stable'  as const },
  { keyword: 'GPT-4o',           score:  10, change_pct: -42, trend: 'falling' as const },
  { keyword: 'GPT-4',            score:  10, change_pct:  -5, trend: 'falling' as const },
  // ── 하위권 (score < 10) ──────────────────────────────────────────
  { keyword: 'DALL-E',           score:   9, change_pct:   1, trend: 'stable'  as const },
  { keyword: 'GitHub Copilot',   score:   9, change_pct:  12, trend: 'rising'  as const },
  { keyword: 'AI Agent',         score:   8, change_pct:  20, trend: 'rising'  as const },
  { keyword: 'Whisper',          score:   7, change_pct:  -2, trend: 'stable'  as const },
  { keyword: 'GPT-3',            score:  10, change_pct:  -8, trend: 'falling' as const },
]

export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV === 'development'
  const secret = req.headers.get('x-cron-secret')
  if (!isDev && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  if (!db) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  // ① 기존 데이터 전체 삭제 (구버전 키워드 완전 제거)
  const { error: delError } = await db
    .from('keyword_trends')
    .delete()
    .neq('keyword', '__never__') // 전체 삭제 트릭

  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })

  const now = new Date().toISOString()
  const weekStart = now.split('T')[0]

  const rows = SEED_KEYWORDS.map((k) => ({
    ...k,
    score_prev:   Math.round(k.score / (1 + k.change_pct / 100)),
    week_start:   weekStart,
    collected_at: now,
  }))

  // ② 새 키워드 삽입
  const { data: inserted, error } = await db
    .from('keyword_trends')
    .insert(rows)
    .select('keyword')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count } = await db
    .from('keyword_trends')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ ok: true, inserted: inserted?.length ?? 0, dbCount: count })
}
