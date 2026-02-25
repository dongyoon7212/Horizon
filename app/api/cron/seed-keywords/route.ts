import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// 2025-2026 실제 트렌드 반영 키워드 (Google Trends 수집 전 초기값)
const SEED_KEYWORDS = [
  // ── Rising ───────────────────────────────────────────────────────
  { keyword: 'DeepSeek R1',      score: 97, change_pct: 890, trend: 'rising'  as const },
  { keyword: 'DeepSeek V3',      score: 91, change_pct: 620, trend: 'rising'  as const },
  { keyword: 'Grok 3',           score: 88, change_pct: 440, trend: 'rising'  as const },
  { keyword: 'Claude 3.7',       score: 85, change_pct: 310, trend: 'rising'  as const },
  { keyword: 'Gemini 2.0',       score: 82, change_pct: 260, trend: 'rising'  as const },
  { keyword: 'GPT o3',           score: 79, change_pct: 185, trend: 'rising'  as const },
  { keyword: 'Phi-4',            score: 74, change_pct: 142, trend: 'rising'  as const },
  { keyword: 'Qwen 2.5',         score: 71, change_pct: 118, trend: 'rising'  as const },
  { keyword: 'Llama 3.3',        score: 68, change_pct:  96, trend: 'rising'  as const },
  { keyword: 'AI Agent',         score: 86, change_pct: 230, trend: 'rising'  as const },
  { keyword: 'Cursor AI',        score: 76, change_pct: 198, trend: 'rising'  as const },
  { keyword: 'Sora',             score: 65, change_pct:  88, trend: 'rising'  as const },
  // ── Falling ──────────────────────────────────────────────────────
  { keyword: 'GPT-4',            score: 58, change_pct: -32, trend: 'falling' as const },
  { keyword: 'Stable Diffusion', score: 48, change_pct: -28, trend: 'falling' as const },
  { keyword: 'DALL-E 3',         score: 44, change_pct: -24, trend: 'falling' as const },
  { keyword: 'Bard',             score: 20, change_pct: -71, trend: 'falling' as const },
  { keyword: 'GPT-3',            score: 30, change_pct: -55, trend: 'falling' as const },
  // ── Stable ───────────────────────────────────────────────────────
  { keyword: 'ChatGPT',          score: 92, change_pct:   4, trend: 'stable'  as const },
  { keyword: 'Midjourney',       score: 62, change_pct:  -3, trend: 'stable'  as const },
  { keyword: 'Whisper',          score: 55, change_pct:   2, trend: 'stable'  as const },
]

export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV === 'development'
  const secret = req.headers.get('x-cron-secret')
  if (!isDev && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  if (!db) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const now = new Date().toISOString()
  const weekStart = now.split('T')[0]

  const rows = SEED_KEYWORDS.map((k) => ({
    ...k,
    score_prev:   Math.round(k.score * (1 - k.change_pct / 100 / 5)), // 추정 이전값
    week_start:   weekStart,
    collected_at: now,
  }))

  const { data: upserted, error } = await db
    .from('keyword_trends')
    .upsert(rows, { onConflict: 'keyword' })
    .select('keyword')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count } = await db
    .from('keyword_trends')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ ok: true, inserted: upserted?.length ?? 0, dbCount: count })
}
