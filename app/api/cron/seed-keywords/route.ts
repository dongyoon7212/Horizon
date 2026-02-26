import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// 2026년 2월 기준 실제 트렌딩 AI 키워드 (Google Trends 수집 전 초기값)
const SEED_KEYWORDS = [
  // ── Rising ───────────────────────────────────────────────────────
  { keyword: 'DeepSeek R1',      score: 43, change_pct:  59, trend: 'rising'  as const },
  { keyword: 'DeepSeek V3',      score: 85, change_pct:  98, trend: 'rising'  as const },
  { keyword: 'Grok 3',           score: 58, change_pct:  23, trend: 'rising'  as const },
  { keyword: 'Claude 3.7',       score: 51, change_pct:  42, trend: 'rising'  as const },
  { keyword: 'Gemini 2.0',       score: 47, change_pct:  21, trend: 'rising'  as const },
  { keyword: 'GPT o3',           score: 34, change_pct:  26, trend: 'rising'  as const },
  { keyword: 'Phi-4',            score: 31, change_pct:  24, trend: 'rising'  as const },
  { keyword: 'Llama 3.3',        score: 31, change_pct:  19, trend: 'rising'  as const },
  { keyword: 'AI Agent',         score: 76, change_pct:  36, trend: 'rising'  as const },
  { keyword: 'Cursor AI',        score: 71, change_pct:  22, trend: 'rising'  as const },
  // ── Falling ──────────────────────────────────────────────────────
  { keyword: 'GPT-3',            score: 34, change_pct: -55, trend: 'falling' as const },
  { keyword: 'DALL-E 3',         score: 38, change_pct:  -3, trend: 'falling' as const },
  { keyword: 'Bard',             score: 20, change_pct: -30, trend: 'falling' as const },
  // ── Stable ───────────────────────────────────────────────────────
  { keyword: 'ChatGPT',          score: 94, change_pct:  21, trend: 'stable'  as const },
  { keyword: 'Qwen 2.5',         score: 73, change_pct:   6, trend: 'stable'  as const },
  { keyword: 'Sora',             score: 75, change_pct:   6, trend: 'stable'  as const },
  { keyword: 'Midjourney',       score: 66, change_pct:  10, trend: 'stable'  as const },
  { keyword: 'Stable Diffusion', score: 53, change_pct:  15, trend: 'stable'  as const },
  { keyword: 'GPT-4',            score: 39, change_pct:  11, trend: 'stable'  as const },
  { keyword: 'Whisper',          score: 83, change_pct:   0, trend: 'stable'  as const },
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
