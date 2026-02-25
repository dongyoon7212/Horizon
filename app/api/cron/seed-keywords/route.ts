import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// HF 모델 다운로드 수 기반으로 키워드 트렌드를 추정해 seed
// (Google Trends API 미연결 시 초기 데이터 구성용)
const SEED_KEYWORDS = [
  // Rising
  { keyword: 'Claude 3.5',         score: 98, change_pct: 234, trend: 'rising'  as const },
  { keyword: 'Gemini Flash',        score: 91, change_pct: 187, trend: 'rising'  as const },
  { keyword: 'Llama 3.2',           score: 85, change_pct: 142, trend: 'rising'  as const },
  { keyword: 'Stable Diffusion 3',  score: 79, change_pct:  98, trend: 'rising'  as const },
  { keyword: 'Mistral Large',       score: 72, change_pct:  76, trend: 'rising'  as const },
  { keyword: 'DeepSeek R1',         score: 88, change_pct: 312, trend: 'rising'  as const },
  { keyword: 'Qwen 2.5',            score: 75, change_pct: 124, trend: 'rising'  as const },
  { keyword: 'Phi-3',               score: 68, change_pct:  89, trend: 'rising'  as const },
  // Falling
  { keyword: 'GPT-3',    score: 62, change_pct: -45, trend: 'falling' as const },
  { keyword: 'DALL-E 2', score: 50, change_pct: -38, trend: 'falling' as const },
  { keyword: 'PaLM 2',   score: 40, change_pct: -29, trend: 'falling' as const },
  { keyword: 'BERT',     score: 55, change_pct: -22, trend: 'falling' as const },
  // Stable
  { keyword: 'Whisper',  score: 65, change_pct:   3, trend: 'stable'  as const },
  { keyword: 'CLIP',     score: 58, change_pct:  -2, trend: 'stable'  as const },
]

export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV === 'development'
  const secret = req.headers.get('x-cron-secret')
  if (!isDev && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  if (!db) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const rows = SEED_KEYWORDS.map((k) => ({
    ...k,
    score_prev:  k.score,
    week_start:  new Date().toISOString().split('T')[0],
    collected_at: new Date().toISOString(),
  }))

  const { data: upserted, error } = await db
    .from('keyword_trends')
    .upsert(rows, { onConflict: 'keyword' })
    .select('keyword')

  if (error) return NextResponse.json({ error: error.message, detail: error }, { status: 500 })

  // 실제 DB에서 카운트 확인
  const { count } = await db
    .from('keyword_trends')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ ok: true, inserted: upserted?.length ?? 0, dbCount: count })
}
