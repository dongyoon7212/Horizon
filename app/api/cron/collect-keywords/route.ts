import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
// @ts-ignore
import googleTrends from 'google-trends-api'

// 추적할 AI 키워드 목록
const KEYWORDS = [
  'DeepSeek R1', 'DeepSeek V3', 'Grok 3', 'Claude 3.7',
  'Gemini 2.0', 'GPT o3', 'Phi-4', 'Qwen 2.5',
  'Llama 3.3', 'AI Agent', 'Cursor AI', 'Sora',
  'GPT-4', 'ChatGPT', 'Stable Diffusion', 'DALL-E 3',
  'Midjourney', 'Whisper', 'Bard', 'GPT-3',
]

// Google Trends에서 단일 키워드 점수 조회
async function fetchTrend(keyword: string): Promise<{ score: number; scorePrev: number } | null> {
  try {
    const endTime   = new Date()
    const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30일

    const raw = await googleTrends.interestOverTime({ keyword, startTime, endTime })
    const parsed = JSON.parse(raw)
    const timeline: { value: number[] }[] = parsed?.default?.timelineData ?? []

    if (timeline.length < 2) return null

    const score     = timeline[timeline.length - 1]?.value[0] ?? 0
    const scorePrev = timeline[timeline.length - 8]?.value[0]  // ~1주 전
                   ?? timeline[0]?.value[0]
                   ?? score

    return { score, scorePrev }
  } catch {
    return null
  }
}

// 퍼센타일 기반 트렌드 분류 — 전체 키워드 중 상대적 위치로 결정
// (AI 붐 시기에는 모두 rising이 되는 문제를 방지)
function assignTrends(rows: any[]): any[] {
  if (rows.length === 0) return rows

  // change_pct 기준 오름차순 정렬
  const sorted = [...rows].sort((a, b) => a.change_pct - b.change_pct)
  const n = sorted.length

  // 하위 25% → falling, 상위 40% → rising, 나머지 → stable
  const fallingCutoff = Math.ceil(n * 0.25)   // ~5개
  const risingCutoff  = Math.floor(n * 0.60)  // index 12~ → rising

  sorted.forEach((row, i) => {
    row.trend = i < fallingCutoff ? 'falling'
              : i >= risingCutoff ? 'rising'
              : 'stable'
  })

  return sorted
}

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
  const results: { keyword: string; status: string }[] = []
  const rawRows: any[] = []

  // 순차 처리 (Google Trends rate limit 대응)
  for (const keyword of KEYWORDS) {
    await new Promise(r => setTimeout(r, 1200)) // 1.2초 간격

    const trend = await fetchTrend(keyword)

    if (!trend) {
      results.push({ keyword, status: 'skipped' })
      continue
    }

    const { score, scorePrev } = trend
    const changePct = scorePrev > 0
      ? Math.round(((score - scorePrev) / scorePrev) * 100)
      : 0

    rawRows.push({
      keyword,
      score,
      score_prev:   scorePrev,
      change_pct:   changePct,
      trend:        'stable', // 아래에서 재계산
      week_start:   weekStart,
      collected_at: now,
    })

    results.push({ keyword, status: `${score} (${changePct > 0 ? '+' : ''}${changePct}%)` })
  }

  if (rawRows.length === 0) {
    return NextResponse.json({ ok: false, error: 'All Google Trends requests failed', results })
  }

  // 퍼센타일 기반 트렌드 재분류
  const rows = assignTrends(rawRows)

  const { error } = await db
    .from('keyword_trends')
    .upsert(rows, { onConflict: 'keyword' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 분류 결과 요약
  const summary = rows.reduce((acc: any, r: any) => {
    acc[r.trend] = (acc[r.trend] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    ok: true,
    collected: rows.length,
    skipped: KEYWORDS.length - rows.length,
    distribution: summary,
    results: rows
      .sort((a: any, b: any) => b.change_pct - a.change_pct)
      .map((r: any) => ({ keyword: r.keyword, trend: r.trend, status: `${r.score} (${r.change_pct > 0 ? '+' : ''}${r.change_pct}%)` })),
  })
}
